import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import dotenv from 'dotenv'

const mode = process.argv[2]
const validModes = new Set(['local', 'staging', 'prod'])

if (!validModes.has(mode)) {
  console.error('Usage: node scripts/run-migration-env.mjs <local|staging|prod>')
  process.exit(1)
}

const repoRoot = process.cwd()

const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing env file: ${filePath}`)
  }

  return dotenv.parse(fs.readFileSync(filePath))
}

const isLocalHost = (value) => {
  try {
    const parsed = new URL(value)
    return ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname.trim().toLowerCase())
  } catch {
    return false
  }
}

const pickFirst = (env, keys) => {
  for (const key of keys) {
    const value = env[key]?.trim()
    if (value) return value
  }

  return null
}

const loadModeEnv = () => {
  if (mode === 'local') {
    const envFile = path.join(repoRoot, '.env')
    const parsed = parseEnvFile(envFile)
    const localUrl = pickFirst(parsed, [
      'LOCAL_DATABASE_URL',
      'DEV_DATABASE_URL',
      'DATABASE_URL',
      'POSTGRES_URL',
      'POSTGRES_URL_NON_POOLING',
      'POSTGRES_PRISMA_URL',
    ])

    if (!localUrl || !isLocalHost(localUrl)) {
      throw new Error('Local migrations require a localhost database URL from .env.')
    }

    return {
      ...parsed,
      APP_ENV: 'local',
      LOCAL_DATABASE_URL: localUrl,
    }
  }

  const vercelFile =
    mode === 'staging'
      ? path.join(repoRoot, '.vercel', '.env.preview.local')
      : path.join(repoRoot, '.vercel', '.env.production.local')
  const parsed = parseEnvFile(vercelFile)
  const dbUrl = pickFirst(parsed, [
    mode === 'staging' ? 'STG_POSTGRES_URL' : 'PROD_POSTGRES_URL',
    mode === 'staging' ? 'STG_DATABASE_URL' : 'PROD_DATABASE_URL',
    'DATABASE_URL',
    'POSTGRES_URL',
  ])

  if (!dbUrl) {
    throw new Error(`${mode} migrations require a database URL in ${vercelFile}.`)
  }

  if (isLocalHost(dbUrl)) {
    throw new Error(`${mode} migrations refused: Vercel env resolves to a local database host.`)
  }

  return {
    ...parsed,
    APP_ENV: mode === 'prod' ? 'production' : 'staging',
    VERCEL_ENV: mode === 'prod' ? 'production' : 'preview',
    [mode === 'staging' ? 'STG_POSTGRES_URL' : 'PROD_POSTGRES_URL']: dbUrl,
  }
}

const migrationEnv = {
  ...process.env,
  ...loadModeEnv(),
  NODE_OPTIONS: '--no-deprecation',
}

const child = spawn('pnpm', ['payload', 'migrate'], {
  cwd: repoRoot,
  env: migrationEnv,
  stdio: 'inherit',
})

child.on('exit', (code) => {
  process.exit(code ?? 1)
})
