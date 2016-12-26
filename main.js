'use strict';

if (process.env.NODE_ENV !== 'production'){
  require('dotenv').load()
}

let Wit = require('node-wit').Wit;
let interactive = require('node-wit').interactive;
let rp = require('request-promise');
let express = require('express');

const FB_PAGE_TOKEN = process.env.FB_PAGE_TOKEN;
const FB_APP_SECRET = process.env.FB_APP_SECRET;

const accessToken = process.env.ACCESS_TOKEN;
const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;

function getMovieData(movie) {
  let queryString = `http://www.omdbapi.com/?t=${escape(movie)}&y=&plot=full&r=json`;

  return rp(queryString);
}

function formatAnswer(movieData, intent) {

  switch (intent) {
    case 'relase_date':
      return `The movie was relased ${movieData.Released}`
    break;

    case 'rating':
      return `The movie has a imdb rating of ${movieData.imdbRating}`
    break;

    default:
      return `Doesn't seem like anything to me`
  }
}

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};


const actions = {
  send(request, response) {

    const {sessionId, context, entities} = request;
    const {text, quickreplies} = response;
    console.log('sending...', JSON.stringify(response));
  },
  getResponse({context, entities}) {
    return new Promise(function(resolve, reject) {

      const movie = firstEntityValue(entities, "movie");

      if(movie) {
        getMovieData(movie)
        .then(data => {

          let movieData = JSON.parse(data);

          let intent = null;

          if(entities.intent[0]) {
            intent = entities.intent[0].value;
          }

          context.response  = formatAnswer(movieData, intent);

          return resolve(context);
        })
        .catch(err => {

          return resolve(context);
        })
      } else {
        return resolve(context);
      }

    });
  }
};

// server setup
const PORT = process.env.PORT || 8080;

const app = express();


app.get('/', (req, res) => {
  res.send("Hello this is your friendly bot, definitely not trying to kill all humans");
});



const client = new Wit({accessToken, actions});
interactive(client);
