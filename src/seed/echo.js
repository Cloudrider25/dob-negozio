const fs = require('fs')

module.exports = async function echo() {
  fs.writeFileSync('/tmp/payload-run-echo.log', new Date().toISOString())
}
