import 'dotenv/config'

function validateEnv(): void {
  const missing: string[] = []

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    missing.push('TELEGRAM_BOT_TOKEN')
  }
  if (!process.env.SUPABASE_URL) {
    missing.push('SUPABASE_URL')
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    missing.push('SUPABASE_SERVICE_ROLE_KEY')
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n` +
        missing.map((v) => `  - ${v}`).join('\n') +
        '\n\nPlease copy .env.example to .env and fill in the values.'
    )
  }
}

validateEnv()

export const config = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN!,
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
} as const

export type Config = typeof config
