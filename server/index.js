const translate = require('@vitalets/google-translate-api');
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = 3000;
app.use(bodyParser.json({ limit: '1mb' }))
app.use(bodyParser.urlencoded({ extended: true }))

app.all('*', (_, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
  next()
})

app.get('/', async (req, res) => {
  const {
    language,
    value
  } = req.query;
  try {
    console.log('req.query', req.query);

    const result = await translate(value, { to: language });
    res.send({
      'language': result.from.language.iso,
      'text': result.text
    })
  } catch (error) {
    res.send({
      'messgae': error
    })
  }
})

console.log(`server listen on port ${port}`)
app.listen(port)
