import { Telegraf } from 'telegraf'
import { config } from './config'
import { getSupabaseClient } from './database/supabase'
import { parseTransaction } from './services/transactionParser'
import { formatCurrency } from './utils/format'

const DEFAULT_POCKETS = [
  { key: 'pendidikan', name: 'Pendidikan' },
  { key: 'dana darurat', name: 'Dana Darurat' },
  { key: 'liburan', name: 'Liburan' },
  { key: 'tabungan rumah', name: 'Tabungan Rumah' },
]

function parsePocketAllocation(message: string): { workspace: 'indonesia' | 'srilanka'; currency: 'IDR' | 'LKR'; pocketName: string; amount: number } | null {
  const trimmed = message.trim().toLowerCase()
  if (!trimmed.startsWith('pocket ')) return null

  const withoutPrefix = trimmed.slice(7).trim()

  let workspace: 'indonesia' | 'srilanka'
  let currency: 'IDR' | 'LKR'
  let amount: number

  const idrMatch = withoutPrefix.match(/(?:^|\s)(\+?idr)(\d+)/i)
  const lkrMatch = withoutPrefix.match(/(?:^|\s)(\+?lkr)(\d+)/i)

  if (idrMatch) {
    workspace = 'indonesia'
    currency = 'IDR'
    amount = parseInt(idrMatch[2], 10)
  } else if (lkrMatch) {
    workspace = 'srilanka'
    currency = 'LKR'
    amount = parseInt(lkrMatch[2], 10)
  } else {
    return null
  }

  const afterAmount = withoutPrefix
    .replace(new RegExp(`(?:^|\\s)(?:\\+?idr|\\+?lkr)\\d+`, 'i'), '')
    .trim()
    .replace(/\s+/g, ' ')

  const matchedPocket = DEFAULT_POCKETS.find((p) => afterAmount === p.key)
  if (!matchedPocket) return null

  return { workspace, currency, pocketName: matchedPocket.name, amount }
}

export function createBot(): Telegraf | null {
  if (!config.telegramBotToken) {
    console.warn('⚠️  TELEGRAM_BOT_TOKEN is not set')
    return null
  }

  const bot = new Telegraf(config.telegramBotToken)

  bot.start((ctx) => {
    ctx.reply(
      '👋 Welcome to FinanceOS Bot\n\nYou can record transactions and manage your finances.\n\nType /help to see available commands.'
    )
  })

  bot.command('help', (ctx) => {
    ctx.reply(
      'Available commands\n\n/start\n/help\n\nSend a transaction message.\n\nExample:\nmakan idr25000 bakso\ngaji idr5000000\nminum lkr400\n\nPocket allocation:\npocket pendidikan idr500000\npocket liburan idr1000000'
    )
  })

  bot.on('text', async (ctx) => {
    const message = ctx.message.text
    const pocketAllocation = parsePocketAllocation(message)

    if (pocketAllocation) {
      const { workspace, currency, pocketName, amount } = pocketAllocation
      const supabase = getSupabaseClient()

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('available_balance')
        .eq('workspace', workspace)
        .single()

      if (profileError || !profileData) {
        console.error('Failed to fetch profile balance:', profileError)
        ctx.reply('❌ Failed to check balance.')
        return
      }

      const currentBalance = Number(profileData.available_balance)

      if (currentBalance < amount) {
        ctx.reply('❌ Not enough available balance.')
        return
      }

      const { data: existingPocket, error: pocketError } = await supabase
        .from('pockets')
        .select('id, balance')
        .eq('workspace', workspace)
        .eq('name', pocketName)
        .single()

      let newPocketBalance = amount
      if (existingPocket && !pocketError) {
        newPocketBalance = Number(existingPocket.balance) + amount
      }

      const { error: upsertError } = existingPocket && !pocketError
        ? await supabase
            .from('pockets')
            .update({ balance: newPocketBalance })
            .eq('id', existingPocket.id)
        : await supabase
            .from('pockets')
            .insert({
              workspace,
              name: pocketName,
              balance: newPocketBalance,
            })

      if (upsertError) {
        console.error('Failed to update pocket:', upsertError)
        ctx.reply('❌ Failed to update pocket.')
        return
      }

      const newBalance = currentBalance - amount

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ available_balance: newBalance })
        .eq('workspace', workspace)

      if (updateError) {
        console.error('Failed to update profile balance:', updateError)
        ctx.reply('❌ Failed to update balance.')
        return
      }

    ctx.reply(
      `✅ Pocket Updated\n\nPocket:\n${pocketName}\n\nAllocated:\n${formatCurrency(amount, currency as 'IDR' | 'LKR')}\n\nAvailable Balance:\n${formatCurrency(newBalance, currency as 'IDR' | 'LKR')}`
    )
    return
    }

    const parsed = parseTransaction(message)

    if (!parsed) {
      ctx.reply(
        "I couldn't understand that transaction.\n\nExample:\nmakan idr25000 bakso\ngaji idr5000000\nminum lkr400\n\nPocket allocation:\npocket pendidikan idr500000"
      )
      return
    }

    const today = new Date().toISOString().split('T')[0]
    const amount = parsed.amount

    console.log('Type:', parsed.type)
    console.log('Amount:', amount)
    const category = parsed.type === 'income' ? 'Income' : 'General'
    const icon = parsed.type === 'income' ? '💰' : '💸'

    const supabase = getSupabaseClient()

    const { error } = await supabase
      .from('transactions')
      .insert({
        workspace: parsed.workspace,
        description: parsed.description,
        amount,
        date: today,
        category,
        icon,
      })

    if (error) {
      console.error('Supabase insert error:', error)
      ctx.reply('❌ Failed to save transaction.')
      return
    }

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('available_balance')
      .eq('workspace', parsed.workspace)
      .single()

    if (profileError) {
      console.error('Failed to fetch profile balance:', profileError)
    } else {
      const currentBalance = Number(profileData.available_balance)
      const newBalance = currentBalance + amount

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ available_balance: newBalance })
        .eq('workspace', parsed.workspace)

      if (updateError) {
        console.error('Failed to update profile balance:', updateError)
      }
    }

    ctx.reply(
      `✅ Saved\n\nDescription: ${parsed.description}\nAmount: ${Math.abs(amount)}\nWorkspace: ${parsed.workspace}`
    )
  })

  bot.catch((err, ctx) => {
    console.error(`Bot error for ${ctx?.update?.update_id}:`, err)
  })

  return bot
}
