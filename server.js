const fs = require('fs')
const path = require('path')
const express = require('express')
const shortid = require('shortid')
const is = require('is_js')

const PORT = 4213

const server = express()

const validId = id => is.alphaNumeric(id) && id.length < 100

// send a new unique id
server.get('/id', (req, res) => res.status(200).send(shortid.generate()))

// get whole history for id
server.get('/history/:id', (req, res) => {
  const { id } = req.params
  if (!validId(id)) { return res.sendStatus(400) }
  const filePath = path.resolve(__dirname, 'db', id)
  fs.exists(filePath, (exists) => {
    if (!exists) {
      return res.status(200).send({})
    }
    fs.readFile(filePath, { encoding: 'utf8' }, (err, content) => {
      if (err) { return res.sendStatus(500) }
      const all = content.split('\n').filter(el => !!el)
      const out = {}
      all.forEach(k => out[k] = true)
      res.status(200).send(out)
    })
  })
})

// set history for id
server.post('/history/:id/:mediaId', (req, res) => {
  const { id, mediaId } = req.params
  if (!validId(id) || !validId(mediaId)) {
    return res.sendStatus(400)
  }
  const filePath = path.resolve(__dirname, 'db', id)
  fs.appendFile(filePath, `${mediaId}\n`, (err) => {
    if (err) { return res.sendStatus(500) }
    res.sendStatus(201)
  })
})

server.listen(PORT, () => console.log(`server listening on port ${PORT}`))
