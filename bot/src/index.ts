import { createBot } from './bot'
import './config'

async function main() {
  const bot = createBot()

  if (!bot) {
    process.exit(1)
  }

  bot.launch().catch((err: any) => {
    console.error('Failed to start bot:', err)
    if (err?.response) {
      console.error('Telegram API error:', JSON.stringify(err.response, null, 2))
    }
    process.exit(1)
  })

  console.log('✓ Telegram Bot Connected')

  process.on('SIGINT', () => {
    console.log('\nShutting down bot...')
    bot.stop('SIGINT')
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    console.log('\nShutting down bot...')
    bot.stop('SIGTERM')
    process.exit(0)
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
