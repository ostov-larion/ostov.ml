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

app.input('/:cgi', (req, res) => {
    try {
        execFileSync(`./${req.params.cgi}`, [req.query.replace(/\n/g,'\\n')])
    }
    catch(e) {
        console.log('INPUT ERROR: CGI error.')
        res.error(52, "This route not found.")
        return
    }
    res.redirect(`gemini://${flags.domain}/${req.params.cgi}.gmi`)
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
