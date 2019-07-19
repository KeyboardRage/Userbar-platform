const functions = require('firebase-functions'),
	express = require("express"),
	app = express();

// All good to go here
app.get("/", (req,res) => {
	res.end("OK");
});

exports.app = functions.https.onRequest(app);
