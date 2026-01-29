import fs from 'fs'
fs.writeFileSync('/tmp/payload-run-side-effect.log', new Date().toISOString())
