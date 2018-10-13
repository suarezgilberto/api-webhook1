/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

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

'use strict';
require('dotenv').config()

// import dependencies
const bodyParser = require('body-parser'),
  express = require('express'),
  app = express();

// import helper libs
const sendQuickReply = require('./utils/quick-reply'),
  HandoverProtocol = require('./utils/handover-protocol')
// env = require('./env');

// webhook setup
app.listen(process.env.PORT || 3000, () => console.log('webhook is listening'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

function Middleware (req, res, next) {
  console.log('middleware propio')
  console.log(JSON.stringify(req.body))
  next()
}



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


// webhook
app.post('/webhook', (req, res) => {

  // parse messaging array

  const webhook_events = req.body.entry[0];

  // initialize quick reply properties
  let text, title, payload;

  // Secondary Receiver is in control - listen on standby channel
  if (webhook_events.standby) {
    console.log('estoy standby')
    // iterate webhook events from standby channel
    webhook_events.standby.forEach(event => {

      const psid = event.sender.id;
      const message = event.message;
      console.log('event.length ' + event.length + '   ' + JSON.stringify(event.message) + '  ' + event.pass_thread_control)

      if (message && message.quick_reply && message.quick_reply.payload == 'take_from_inbox') {
        /*  // quick reply to take from Page inbox was clicked          
         text = 'The Primary Receiver is taking control back. \n\n Tap "Pass to Inbox" to pass thread control to the Page Inbox.';
         title = 'Pass to Inbox';
         payload = 'pass_to_inbox';
 
         sendQuickReply(psid, text, title, payload);
         HandoverProtocol.takeThreadControl(psid); */
      }

    });
  } else {
    
    // Bot is in control - listen for messages 
    if (webhook_events.messaging) {

      // iterate webhook events
      webhook_events.messaging.forEach(event => {
        // parse sender PSID and message
        console.log('messaging = ' + JSON.stringify(event))
        const psid = event.sender.id;
        const message = event.message;
        if (message) console.log('message.text=  ' + message.text)

        if (message && message.text == 'Salir') {
          console.log('pasando el control al bot')
          let page_inbox_app_id = 1103936553097691
          HandoverProtocol.passThreadControl(psid, page_inbox_app_id);

        } else if (event.pass_thread_control) {

          console.log('retornando control al bot, ejecutivo pulso Listo')
          /* HandoverProtocol.takeThreadControl(psid); */
        } else if (message && !message.is_echo) {


        }

      });


      // respond to all webhook events with 200 OK
      res.sendStatus(200);
    }
  }
});

