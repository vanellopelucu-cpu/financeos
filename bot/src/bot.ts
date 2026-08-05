import { Telegraf } from 'telegraf'
import { config } from './config'

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
      'Available commands\n\n/start\n/help\n\nFor now, any text message will be echoed back.'
    )
  })

  bot.on('text', (ctx) => {
    const message = ctx.message.text
    ctx.reply(`You said:\n\n${message}`)
  })

  bot.catch((err, ctx) => {
    console.error(`Bot error for ${ctx?.update?.update_id}:`, err)
  })

  return bot
}
