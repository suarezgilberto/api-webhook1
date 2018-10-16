/*
MyBot (Pagina) 
IdPagina = 266403627315593
tokenPagina = EAAPsBkIaGdsBABfOZCprTnywza23ZAhwLL2Yzh7NnToO8HQFgNVO9kKYXgx25pxGX3vPpe4uz2pshTETi1jMmhkGkN2KlHOZAaOcByQbZAsgsbnXTgG2jDqfhLQbRX1ZBI9HTcnQyG4a1UMKYgiUasyDsOkJB7fJ4F3aDluYSoQZDZD

MyBot (App)
IdApp = 1103936553097691
SecretoApp = cd8e224f5159518606e130e56a0528c5


PaulaAtencion (Pagina)
IdPagina = 1054859491363285
tokenPagina = EAACiGnZAtTEgBAOtDAzbkKU6lJvKXQLYI6WOfr54fm3PgvUbty7NynZATEbZA5LXntjMonsZBQm8aIg4736JGzl4GU5HFt8Yde6W25ZBzNMbXqRliCimjvaZAzVsFn3yL0Cdjbjjg5jxegNqiQKgL5mkLbFZBlG2vwKObnmsttEQAZDZD

BotHumano (App)
IdApp = 178234539723848
SecretoApp = 73a904eeda498c6f8b9d854b215b2bf4

*/

require('dotenv').config()

const bodyParser = require('body-parser'),
  express = require('express'),
  app = express()

let myBotAppId = 1103936553097691

const sendQuickReply = require('./utils/quick-reply'),
  HandoverProtocol = require('./utils/handover-protocol'),
  sendMessage = require('./utils/send-message')


// webhook setup
app.listen(process.env.PORT || 3000, () => console.log('webhook is listening'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// webhook verification
app.get('/webhook', (req, res) => {
  var cadena = req._parsedUrl.query.replace(/=/g, "&")

  var arreglo = cadena.split("&")
  let mode = arreglo[1]
  let challenge = arreglo[3]
  let token = arreglo[5]

  console.log(req._parsedUrl)
  console.log('\ntoken =' + token + '  ' + process.env.VERIFY_TOKEN)
  if (token === process.env.VERIFY_TOKEN) {
    res.send(challenge);
  } else {
    res.send('Acceso denegado Webhook1')
  }
});


app.post('/webhook', (req, res) => {

  const webhook_events = req.body.entry[0]

  let text, title, payload
  
  if (webhook_events.standby) {
    console.log('standby ' + JSON.stringify(req.body.entry[0]))

    webhook_events.standby.forEach(event => {

      const psid = event.sender.id
      const message = event.message

      if (message && !message.is_echo) {
        console.log('estoy standby')
        console.log(JSON.stringify(event.message))
      }

    })
  } else {

    if (webhook_events.messaging) {

      webhook_events.messaging.forEach(event => {

        let psid = event.sender.id
        const message = event.message
        if (message) {
          console.log('messaging = ' + JSON.stringify(event))
          console.log('message.text=  ' + message.text)
        }

        if (message && message.text.toLowerCase() == '#vuelve') {
          console.log('Cliente pidiendo retornar control al bot')
          let page_inbox_app_id = myBotAppId
          text = 'Hola soy Paula. En que puedo seguir antendiendote.'
          title = 'Continuar'
          payload = psid + 'control_bot'

          sendQuickReply(psid, text, title, payload)
          HandoverProtocol.passThreadControl(psid, page_inbox_app_id)

        } else if (message && message.is_echo && message.text == '#retornar') {

          console.log('Humano retornando control al bot')

          let page_inbox_app_id = myBotAppId
          psid = event.recipient.id

          text = 'Hola soy Paula. En que puedo seguir antendiendote.'
          title = 'Continuar'
          payload = psid + 'control_bot'

          sendQuickReply(psid, text, title, payload);
          HandoverProtocol.passThreadControl(psid, page_inbox_app_id)
        }

      });

      res.sendStatus(200)
    }
  }
})

/* } else if (event.pass_thread_control) {

          console.log('retornando control al bot, ejecutivo pulso Listo')
          HandoverProtocol.takeThreadControl(psid);  */