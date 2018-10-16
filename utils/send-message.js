'use strict';

//import API helper
const api = require('./api');

// Send message
function sendMessage(psid, text) {
  
  console.log('SENDING MESSAGE ' + text);
  
  let payload = {};
  
  payload.recipient = {
    id: psid
  }

  payload.message = {
    text: text,   
  }

  api.call('/messages', payload, () => {});
}

module.exports = sendMessage;