/**
* This module handles rendering of our front page.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/

import { production } from "../lib/config.mjs";

import util from "util";

import { getData as septa_rr_getData } from "../lib/septa/rr/main.mjs";
import { getStatusClass as text_rr_getStatusClass } from "../lib/septa/rr/text.mjs";
import { getData as septa_bus_getData } from "../lib/septa/bus/main.mjs";
import { getStatusClass as text_bus_getStatusClass } from "../lib/septa/bus/text.mjs";

import {
	is_sfw as sfw_is_sfw, 
	filter as sfw_filter
} from "../lib/sfw.mjs";

/**
* Bring together all of the data that we're going to send to our response
*/
function responseRender(is_sfw, time_t, data, request, response) {

	return(new Promise( (resolve, reject) => {

		//
		// If in SFW mode, turn our array into a string, 
		// filter it, and turn it back into an object
		//
		if (is_sfw) {
			data = JSON.stringify(data);
			data = sfw_filter(data);
			data = JSON.parse(data);
		}

		var data_rr = data["rr"];
		var rr_status = getStatusFromRrData(time_t, data_rr);

		var data_bus = data["bus"];
		var bus_status = getStatusFromBusData(time_t, data_bus);

		//
		// Jade documentation can be found at:
		// https://github.com/visionmedia/jade
		//
		var title = "Is SEPTA Fucked?";
		if (is_sfw) {
			title = sfw_filter(title);
		}

		response.render("index.pug", {
				"title": title,

				//
				// Regional Rail data
				//
				"rr_status": rr_status["status"],
				"rr_status_class": rr_status["css_class"],
				"rr_status_time": data_rr["time"],
				"rr_late": rr_status["late"],
				"rr_message": rr_status["message"],

				//
				// Bus data
				//
				"bus_status": bus_status["status"],
				"bus_status_class": bus_status["css_class"],
				"bus_status_time": data_bus["time"],
				"bus_suspended": bus_status["suspended"],
				"bus_message": bus_status["message"],

				"is_sfw": is_sfw,
				"production": production,
				"refresh": 300,
				"uri": request["url"],

			}, function(err, html) {
				if (err) {
					reject(err);
				} else {
					resolve(html);
				}
			});

	}));

} // End of responseRender()


/**
* Do some final filtering and then send out our response!
*/
function responseSend(is_sfw, html, response) {
	return(new Promise( (resolve, reject) => {

		//
		// Send our response
		//
		if (is_sfw) {
			html = sfw_filter(html);
		}
		response.send(html);

		resolve();

	}));
} // End of responseSend()


/**
* Our main entry point.
*/
export function go(request, response) {

	var is_sfw = sfw_is_sfw(request);
	//is_sfw = true; // Debugging
	var data = {};

	var time_t = new Date().getTime() / 1000;

	septa_rr_getData(this).then( (in_data) => {
		//
		// We now have Regional Rail data.
		//
		data["rr"] = in_data;

		return(septa_bus_getData(this));

	}).then( (in_data) => {
		//
		// We now have bus data.
		//
		data["bus"] = in_data;

		return(responseRender(is_sfw, time_t, data, request, response));

	}).then( (html) => {
		//
		// We've got HTML, we just need to send it out!
		//
		return(responseSend(is_sfw, html, response));
	
	}).then( () => {
		//
		// Now calculate how long it took to load and render 
		// our text, and print that out.
		//
		var time_t_after = new Date().getTime() / 1000;
		var diff = Math.round((time_t_after - time_t) * 1000) / 1000;
		var message = util.format("web.js: /: Page rendered in %d seconds", diff);
		console.log(message);

	}).catch(function(error) {
  		let stack = error?.stack || String(error);
  		let url = "https://github.com/dmuth/IsSeptaFcked/issues"
  		let message = `Ah jeez, we have an uncaught error. Please go to ${url} and report the issue so I can fix it.  Here's the error, BTW:\n${stack}`;

		console.log("ERROR: web.js: /: " + stack);
		response.status(500).send(message);

	});

} // End of go()


/**
* Grab our status data and check it for age.
*/
function getStatusFromRrData(time_t, data) {

	var retval = data["status"];

	var age = Math.round(time_t) - data["time_t"];
	var max_age = 60 * 10;
	//var max_age = 1; // Debugging

	//
	// If our data is too old, then we're going to ignore it.
	//
	if (age > max_age) {
		retval["status"] = "(unknown)";
		retval["late"] = [];
		retval["css_class"] = text_rr_getStatusClass(retval["status"]);
	}

	return(retval);

} // End of getStatusFromRrData()


/**
* Grab our status data and check it for age.
*/
function getStatusFromBusData(time_t, data) {

	var retval = data["status"];

	var age = Math.round(time_t) - data["time_t"];
	var max_age = 60 * 10;
	//var max_age = 1; // Debugging

	//
	// If our data is too old, then we're going to ignore it.
	//
	if (age > max_age) {
		retval["status"] = "(unknown)";
		retval["suspended"] = [];
		retval["css_class"] = text_bus_getStatusClass(retval["status"]);
	}

	return(retval);

} // End of getStatusFromBusData()


