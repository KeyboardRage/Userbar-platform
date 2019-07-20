const express = require('express'),
      router = express.Router(),
      jwt = require('jsonwebtoken'),
      firebase = require('firebase-functions'),
      request = require('request');

const DISCORD_CLIENT_SECRET = firebase.config().discord.client_secret;
const DISCORD_CLIENT_ID = firebase.config().discord.client_id;
const DISCORD_REDIRECT_URI = firebase.config().discord.redirect_uri;
const JWT_SIGN_SECRET = firebase.config().secrets.jwt || 'development_jwt';

// GET /login
//  The Redirect URI for Discord's OAuth link which creates
//  a user's JWT used for our authentication
router.get('/login', (req, res, next) => {
  const formData = {
    grant_type: "authorization_code",
    code: req.query.code,
    redirect_uri: DISCORD_REDIRECT_URI,
    client_id: DISCORD_CLIENT_ID,
    client_secret: DISCORD_CLIENT_SECRET,
    scope: "identify"
  }
  const discordExchangeUrl = "https://discordapp.com/api/oauth2/token";

  if(req.cookies.__session) {
	  res.clearCookie("__session");
  }

  // Get a user's discord oauth token
  request.post(discordExchangeUrl, {form: formData}, (httpErr, httpResp, httpBody) => {
	if(httpErr || httpResp.statusCode !== 200) {
		res.redirect("/");
	} else {
		let discordExchangeJson = JSON.parse(httpBody);

		// Get a user's discord data using their token
		request.get("https://discordapp.com/api/users/@me", {
			headers: {
				authorization: `Bearer ${discordExchangeJson.access_token}`
			}
		}, (httpErr, httpResp, httpBody) => {
			if(httpErr || httpResp.statusCode !== 200) {
				res.redirect("/");
			} else {
				// Set user's cookie with their auth and user data
				let discordUserJson = JSON.parse(httpBody);
				let jwtAuthPayload = {
					jwt: jwt.sign({
						auth: discordExchangeJson, 
						user: discordUserJson
					}, JWT_SIGN_SECRET)
				};

				res.cookie("__session", JSON.stringify(jwtAuthPayload), {maxAge: 604800 * 1000});
				res.redirect('/');
			}
		});
	}
  });
});


// Authentication Middleware
//  Check if a user has valid JWTs which prove they have been authenticated
//  set res.local variables to necessary info to check if the 
//  user is authenticated easily in other routes.
function authnMiddleware(req, res, next) {
	sessionCookie = req.cookies.__session;

	if(!sessionCookie) {
		res.locals.IsAuthd = false;
		return next();
	}

	sessionCookieJson = JSON.parse(sessionCookie);

	if(!sessionCookieJson.jwt) {
		res.locals.IsAuthd = false;
		return next();
	}

	let authJson = jwt.verify(sessionCookieJson.jwt, JWT_SIGN_SECRET);
	if(!authJson) {
		res.locals.IsAuthd = false;
		return next();
	}

	res.locals.IsAuthd = true;
	res.locals.User = authJson.user;
	return next();

}

module.exports.router = router;
module.exports.authn_middleware = authnMiddleware;
