/**
* This module handles rendering of our front page.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/

var seq = require("seq");
var sfw = require("../lib/sfw.js");
var util = require("util");
var septa_rr = require("../lib/septa/rr/main.js");
var septa_bus = require("../lib/septa/bus/main.js");


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


/**
* Our main entry point.
*/
function go(request, response) {

	var is_sfw = sfw.is_sfw(request);
	var data = {};

	var time_t = new Date().getTime() / 1000;
	seq().seq(function() {
		septa_rr.getData(this);

	}).seq(function(in_data) {
		data["rr"] = in_data;
		septa_bus.getData(this);

	}).seq(function(in_data) {
		data["bus"] = in_data;

		//
		// If in SFW mode, turn our array into a string, 
		// filter it, and turn it back into an object
		//
		if (is_sfw) {
			data = JSON.stringify(data);
			data = sfw.filter(data);
			data = JSON.parse(data);
		}

		var data_rr = data["rr"];

		var rr_status = data_rr["status"];

		var message = "";

		var rr_age = Math.round(time_t) - data_rr["time_t"];
		var rr_max_age = 60 * 10;
		//var max_age = 1; // Debugging

		//
		// If our data is too old, then we're going to ignore it.
		//
		if (rr_age > rr_max_age) {
			rr_status["status"] = "(unknown)";
			rr_status["late"] = [];
		}

		//
		// Jade documentation can be found at:
		// https://github.com/visionmedia/jade
		//
		var title = "Is SEPTA Fucked?";
		if (is_sfw) {
			title = sfw.filter(title);
		}

		response.render("index.jade", {
				"title": title,
				"rr_status": rr_status["status"],
				"rr_status_time": data_rr["time"],

				"rr_message": rr_status["message"],
				"rr_late": rr_status["late"],
				"rr_status_class": rr_status["css_class"],

				"is_sfw": is_sfw,
				"production": production,
				"refresh": 300,
				"uri": request["url"],

			}, this);

	}).seq(function(html) {
		//
		// Send our response
		//
		if (is_sfw) {
			html = sfw.filter(html);
		}
		response.send(html);

		//
		// Now calculate how long it took to load and render 
		// our text, and print that out.
		//
		var time_t_after = new Date().getTime() / 1000;
		var diff = Math.round((time_t_after - time_t) * 1000) / 1000;
		var message = util.format("Page rendered in %d seconds", diff);
		console.log(message);

	}).catch(function(error) {
		console.log("ERROR: web.js: /: " + error);

	});

} // End of go()


