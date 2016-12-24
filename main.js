'use strict';

require('dotenv').load();

let Wit = require('node-wit').Wit;
let interactive = require('node-wit').interactive;
let rp = require('request-promise');

const accessToken = process.env.ACCESS_TOKEN;

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
    return new Promise(function(resolve, reject) {
      console.log('user said...', request.text);
      console.log('sending...', JSON.stringify(response));
      return resolve();
    });
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

const client = new Wit({accessToken, actions});
interactive(client);
