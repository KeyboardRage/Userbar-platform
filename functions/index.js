const functions = require('firebase-functions'),
	express = require("express"),
	cookieParser = require("cookie-parser"),
	authn = require("./routes/authn"),
	utils = require('./helpers/utils'),
	app = express();

// Set up Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(functions.config().secrets.cookie || 'development_cookie'));
app.use(authn.authn_middleware);
app.engine("html", require("ejs").renderFile);
app.set("view engine", "html");

// Set up routes
app.use('/api/authn', authn.router);


// All good to go here
app.get("/", (req,res) => {
	if(res.locals.IsAuthd) {
		res.send(`Hey ${JSON.stringify(res.locals.User)}`).end("OK");
	} else {
		res.render(__dirname + '/views/login.html', {oauthUrl: utils.getDiscordOauthUrl(req.get("host"))});
	}
});

exports.app = functions.https.onRequest(app);
