import fs from 'fs'
import path from 'path'

export default async function echo() {
  fs.writeFileSync(path.resolve(process.cwd(), 'Docs/payload-run-echo.log'), new Date().toISOString())
}
