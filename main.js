'use strict';

if (process.env.NODE_ENV !== 'production'){
  require('dotenv').load()
}

let rp = require('request-promise');
const http = require('http');
const FbBot = require('messenger-bot');
const movie = require('./movie');

const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;
const FB_APP_SECRET = process.env.FB_APP_SECRET;

const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

let bot = new FbBot({
  token: FB_PAGE_TOKEN,
  verify: FB_VERIFY_TOKEN,
  app_secret: FB_APP_SECRET
});

bot.on('error', (err) => {
  console.log(err.message);
});

bot.on('message', (payload, reply) => {
  let text = payload.message.text;

  bot.getProfile(payload.sender.id, (err, profile) => {
    if (err) throw err;

    reply({ text }, (err) => {
      if (err) throw err;

      console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`);
    })
  })
});

// server setup
const PORT = process.env.PORT || 8080;

http.createServer(bot.middleware()).listen(PORT, () => {
  console.log(`Echo bot server running at port ${PORT}.`);
});
