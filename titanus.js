#!/usr/bin/env node

let gemini = require("gemini-server").default
let { execFileSync } = require('child_process')
let { readFileSync } = require('fs')
let args = require('args')

let flags = {
    cert   : process.argv[2],
    key    : process.argv[3],
    domain : process.argv[4]
}

console.log(flags)

let options = {
    cert: readFileSync(flags.cert || "cert.pem"),
    key: readFileSync(flags.key   || "key.pem"),
    titanEnabled: true
}

let app = gemini(options)

app.on('/:cgi', (req, res) => {
    if(req.query) {
      try {
          execFileSync(`./${req.params.cgi}`, [decodeURIComponent(req.query).replace(/\n/g,'\\n')])
      }
      catch(e) {
          console.log(`INPUT ERROR: CGI error. ${e}`)
          res.error(52, "This route not found.")
          return
      }
      res.redirect(`gemini://${flags.domain}/${req.params.cgi}.gmi`)
    }
    else res.input("Type something")
})

app.on('/~ipfs.pub/:cgi', (req, res) => {
    if(req.query) {
      try {
          execFileSync(`./~ipfs.pub/${req.params.cgi}`, [decodeURIComponent(req.query).replace(/\n/g,'\\n')])
      }
      catch(e) {
          console.log(`INPUT ERROR: CGI error. ${e}`)
          res.error(52, "This route not found.")
          return
      }
      res.redirect(`gemini://${flags.domain}/~ipfs.pub/${req.params.cgi}.gmi`)
    }
    else res.input("Type something")
})

app.titan('/:cgi', (req, res) => {
    try {
        execFileSync(`./${req.params.cgi}`, [req.data.toString('utf8').replace(/\n/g,'\\n')])
    }
    catch(e) {
        console.log('TITAN ERROR: CGI error.')
        res.error(52, "This route not found.")
        return
    }
    res.redirect(`gemini://${flags.domain}/${req.params.cgi}.gmi`)
})

app.listen(1917)
