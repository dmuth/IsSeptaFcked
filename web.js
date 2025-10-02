
var express = require('express');
var morgan = require("morgan");
var septa_rr = require("./lib/septa/rr/main.js");
var septa_bus = require("./lib/septa/bus/main.js");

var util = require("util");

var app = express();
//
// Trust the proxy to provide the proper source IP as per:
//
// https://stackoverflow.com/questions/27588434/logging-with-morgan-only-shows-127-0-0-1-for-remote-addr-in-nodejs
//
app.enable("trust proxy");
app.use(morgan(':remote-addr :method :url :status :res[content-length] - :response-time ms'));


app.set('view options', {
  layout: true
  });

//
// Are we running in production
//
var production = false;

//
// Check our environment.
//
if (app.get("env") != "production") {
	console.log("Running in development mode!");
	//production = true; // Debugging
};

if (app.get("env") == "production") {
	console.log("Running in PRODUCTION mode!");
	production = true;
};


//
// Associative array for all of our routes
//
var routes = {};
routes["main"] = require("./routes/main.js")(production);
routes["api"] = require("./routes/api.js")(production);
routes["api/status"] = require("./routes/api-status.js");
routes["api/rr"] = require("./routes/api-rr.js");
routes["api/rr/status"] = require("./routes/api-rr-status.js");
routes["api/rr/raw_data"] = require("./routes/api-rr-raw.js");
routes["api/bus"] = require("./routes/api-bus.js");
routes["api/bus/status"] = require("./routes/api-bus-status.js");
routes["api/bus/raw_data"] = require("./routes/api-bus-raw.js");
routes["echo"] = require("./routes/echo.js");
routes["faq"] = require("./routes/faq.js")(production);


//
// If hitting the API, include CORS headers.
//
app.use(function(req, res, next) {

	var url = req.originalUrl;
	if (url.match(/^\/api/)) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Methods", "GET");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	}

	next();

});


app.get("/", routes["main"].go);
app.get("/api", routes["api"].go);
app.get("/api/status", routes["api/status"].go);
app.get("/api/rr", routes["api/rr"].go);
app.get("/api/rr/status", routes["api/rr/status"].go);
app.get("/api/rr/raw_data", routes["api/rr/raw_data"].go);
app.get("/api/bus", routes["api/bus"].go);
app.get("/api/bus/status", routes["api/bus/status"].go);
app.get("/api/bus/raw_data", routes["api/bus/raw_data"].go);
app.get("/echo", routes["echo"].go);
app.get("/faq", routes["faq"].go);


// Load Swagger API documentation
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


//
// Set this up, mostly for our favicon.
//
app.use(express.static(__dirname + '/public'));

//
// Set our Views directory for Jade.
//
app.set("views", __dirname + "/views");

//
// Don't minify the HTML.
//
app.set('view options', {pretty: true}); 

//
// Start up the SEPTA sub-system, specifically fetching from the API.
//
septa_rr.boot();
septa_bus.boot();


//
// Actually start listening.
//
var port = process.env.PORT || 5001;
app.listen(port, function() {
	console.log("Listening on " + port);
});


