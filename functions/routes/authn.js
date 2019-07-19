const express = require('express'),
      router = express.Router(),
      jwt = require('jsonwebtoken'),
      firebase = require('firebase-functions'),
      utils = require('../helpers/utils'),
      request = require('request');

const DISCORD_CLIENT_SECRET = firebase.config().discord.client_secret;
const DISCORD_CLIENT_ID = firebase.config().discord.client_id;
const JWT_SIGN_SECRET = firebase.config().secrets.jwt || 'development_jwt';

// GET /login
//  The Redirect URI for Discord's OAuth link which creates
//  a user's JWT used for our authentication
router.get('/login', (req, res, next) => {
  const formData = {
    grant_type: "authorization_code",
    code: req.query.code,
    redirect_uri: utils.getDiscordRedirectUri(req.get("host")),
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    scope: "identify"
  }
  const discordExchangeUrl = "https://discordapp.com/api/oauth2/token";

  request.post(discordExchangeUrl, {form: formData}, (err, httpResp, body) => {
    if(err) {
      res.sendStatus(500).end();
    }
    else if(httpResp.statusCode === 200) {
      if(req.cookies.user) res.clearCookie('user');
      res.cookie('auth', jwt.sign(body, JWT_SIGN_SECRET), {maxAge: 604800 * 1000})
      res.redirect('/');
    } else {
      res.redirect('/');
    }
  });

});


// Authentication Middleware
//  Check if a user has valid JWTs which prove their authenticated
//  set a res.locals.IsAuthd variable accordingly so in further requests
//  we can check if the user is authenticated easily.
function authnMiddleware(req, res, next) {

  if(!req.cookies.auth) {
    if(req.cookies.user) {
      res.clearCookie('user');
    }
    res.locals.IsAuthd = false;

    next();
  } else {
    // Check if the user has a verified auth JWT from us
    let authToken = jwt.verify(req.cookies.auth, JWT_SIGN_SECRET);
    if(authToken) {
      if(req.cookies.user) {
        // Check if the user has verified user data from us 
        let userData = jwt.verify(req.cookies.user, JWT_SIGN_SECRET);
        if(userData) {
          res.locals.IsAuthd = true;
          res.locals.User = userData;

          next();
        } else {
          // If the user has an unverified user token make them re-verify their authentication token
          res.clearCookie("auth");
          res.clearCookie("user");
          res.locals.IsAuthd = false;

          next();
        }
      } else {
        // Create and sign the user data cookie
        request.get('https://discordapp.com/api/users/@me', {headers: {authorization: `Bearer ${authToken.access_token}`}}, (err, httpResp, body) => {
          let bodyJson = JSON.parse(body);
          let jwtPayload = {username: bodyJson.username, id: bodyJson.id, avatar: bodyJson.avatar};
          
          res.cookie('user', jwt.sign(jwtPayload, JWT_SIGN_SECRET));
          res.locals.IsAuthd = true;
          res.locals.User = jwtPayload;

          next();
        });
      }
    } else {
      res.locals.IsAuthd = false;

      next();
    }
  }
}

module.exports.router = router;
module.exports.authn_middleware = authnMiddleware;
