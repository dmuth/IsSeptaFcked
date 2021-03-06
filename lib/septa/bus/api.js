/**
* This module is actually responsible for fetching from SEPTA's Bus APi.
*
*/


var request = require("request");
var util = require("util");
var xdate = require("xdate");


/**
* Get our data from the specified URL.
*/
function requestData(url) {
	return(new Promise((resolve, reject) => {

		request(url, (err, response, body) => {

			if(err) {
				reject(err);
			} else {
				resolve([response, body]);
			}

		});

	}));
} // End of requestData()


/**
* Process our response and do some basic sanity checking.
*/
function processData(url, time_t_start, response, body) {
	return(new Promise((resolve, reject) => {

		var status = response.statusCode;
		//status = 599; // Debugging - Uncomment this to break the fetch
		//body = undefined; // Debugging - Uncomment this to break the fetch

		//
		// Body not defined?  That's an error!
		//
		if (!body) {
			var error = util.format(
				"Body was null/undefined!  Status: %s", status);
			reject("bus/api.js: processData(): " + error);
			return(null);
		}

		//
		// Non-200 status?  That's an error!
		//
		if (status != "200") {
			var error = util.format(
				"Status was %s, expecting 200!",
				status);
			reject("bus/api.js: processData(): " + error);
			return(null);
		}

		var time_t = new Date().getTime() / 1000;
		var diff = time_t - time_t_start;
		diff = Math.round(diff * 1000) / 1000;
		var message = util.format("%d bytes read from %s in %d seconds",
			body.length, url, diff);
		console.log("bus/api.js: go(): " + message);

		//body = "this will break JSON.parse"; // Debugging - Uncomment this to break JSON

		try {
			var data = JSON.parse(body);

		} catch (e) {
			var error = util.format("Unable to parse JSON: '%s', Error: %s",
				body, util.inspect(e));
			reject("bus/api.js: processData(): " + error);

		}

		resolve(data);

	}));
} // End of processData()


/**
* Our main entry point.  This fetches stats from SEPTA's Bus
* API and then transforms them into a format that we can actually 
* use elsewhere.
*/
exports.go = function(cb) {
	return(new Promise( (resolve, reject) => {

	var url = "http://www3.septa.org/hackathon/Alerts/";
	var time_t_start = new Date().getTime() / 1000;

	var message = "bus/api.js: Fetching Bus data from API...";
	console.log(message);

	requestData(url).then( ([response, body]) => {
		return(processData(url, time_t_start, response, body));

	}).then(function(data) {
		return(transformData(data, this));

	}).then(function(data) {
		resolve(data);

	}).catch(function(error) {
		reject("bus/api.js: go(): " + util.inspect(error));

	});


	}));
} // End of go()


/**
* Transform the data that we got from SEPTA into something I can 
* actually use.
*/
function transformData(data, cb) {
	return(new Promise( (resolve, reject) => {

	var retval = {};
	retval["data"] = {};
	retval["num"] = 0;
	retval["num_suspended"] = 0;
	retval["suspended"] = [];

	var count = 0;
	for (var k in data) {
		var row = data[k];

		var route_id = row["route_id"];
		var mode = row["mode"];

		//
		// Seriously, SEPTA?  You misspelled the *suspend*?
		//
		var is_suspended = row["issuppend"];

		//
		// We only want busses.
		//
		if (mode != "Bus") {
			continue;
		}
		
		/**
		* Debug code. Uncomment this to fake suspended busses!
		*
		//var chance = 5; // Our 1-in-n chance of suspending a bus
		//var chance = 10; // Our 1-in-n chance of suspending a bus
		//var chance = 20; // Our 1-in-n chance of suspending a bus
		//var chance = 50; // Our 1-in-n chance of suspending a bus
		//is_suspended = "N"; // Added thanks to mass suspensions of COVID-19
		//var chance = 5000; // Our 1-in-n chance of suspending a bus
		var result = Math.floor(Math.random() * chance);
		if (result == 0) {
			var message = "DEBUG: Making bus " + route_id + " suspended!";
			console.log(message);
			is_suspended = "Y";
		}
		*/

		var row_out = {
			"route": route_id,
			"is_suspended": is_suspended,
			};
		retval["data"][route_id] = row_out;

		//
		// Note that as of this writing, I don't actually *know* what a 
		// "suspended" bus looks like in the API.  So I'm taking an 
		// educated guess here! I may need to revisit this in the future.
		//
		if (is_suspended == "Y") {
			retval["num_suspended"] += 1;
			retval["suspended"].push(route_id);
		}

		count++;

	}

	//
	// How many busses in total?
	//
	retval["num"] = count;

	//
	// Store a timestamp so we know when this data was fetched.
	//
	var date = new xdate();
	retval["time"] = date.toString("ddd MMM dS, yyyy hh:mm:ss TT");
	retval["time_t"] = Math.round(date.getTime() / 1000);

	//
	// Store the raw data we got.
	//
	retval["raw_data"] = data;

	//retval["num_suspended"] = 0; // Debugging - Uncomment to force a number of suspended busses 
	//retval["num_suspended"] = 1; // Debugging
	//retval["num_suspended"] = 6; // Debugging

	resolve(retval);

	}));
} // End of transformData()


