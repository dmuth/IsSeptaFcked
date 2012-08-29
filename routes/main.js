/**
* This module handles rendering of our front page.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/

var seq = require("seq");
var util = require("util");
var septa = require("../lib/septa/main.js");


var production = false;


/**
* This function is called when the module is first loaded.
*
* @param boolean in_production Are we currently in production mode?
*/
module.exports = function(in_production) {

	var retval = {};

	production = in_production;

	retval["go"] = go;

	return(retval);

} // End of exports()


function go(request, response) {

	seq().seq(function() {
		septa.getData(this);

	}).seq(function(data) {
		var status = data["trains"]["status"];

		var message = "";

		var time_t = Math.round(new Date().getTime() / 1000);
		var age = time_t - data["trains"]["time_t"];
		var max_age = 60 * 10;
		//var max_age = 1; // Debugging

		//
		// If our data is too old, then we're going to ignore it.
		//
		if (age > max_age) {
			status["status"] = "(unknown)";
			status["late"] = [];
		}

		//
		// Jade documentation can be found at:
		// https://github.com/visionmedia/jade
		//
		response.render("index.jade", {
				"title": "Is SEPTA Fucked?",
				"train_status": status["status"],
				"status_class": status["css_class"],
				"late": status["late"],
				"message": status["message"],
				"production": production,
			});

	}).catch(function(error) {
		console.log("ERROR: web.js: /: " + error);

	});

} // End of go()


