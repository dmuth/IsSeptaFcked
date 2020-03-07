/**
* This module is actually responsible for fetching from SEPTA's API.
*
* @author Douglas Muth <http://www.dmuth.org/>
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
		//status = 599; // Debugging - Uncomment this to break the API fetch.

		var time_t = new Date().getTime() / 1000;
		var diff = time_t - time_t_start;
		diff = Math.round(diff * 1000) / 1000;

		if (!body) {
			body = "";
		}

		var message = util.format("%d bytes read from %s in %d seconds",
			body.length, url, diff);
		console.log("api.js: go(): " + message);

		if (status != "200") {
			var error = util.format("Status was %s, expecting 200!",
				status);
			reject("api.js: go(): " + error);
		}

		//body = "this will break JSON.parse"; // Debugging - Uncomment this to break JSON parsing.

		try {
			var data = JSON.parse(body);

		} catch (e) {
			var error = util.format("Unable to parse JSON: '%s', Error: %s",
				body, util.inspect(e));
			reject("api.js: go(): " + error);

		}

		resolve(data);

	}));
} // End of processData()


/**
* Our main entry point.  This fetches stats from SEPTA's Trainview 
* API and then transforms them into a format that we can actually 
* use elsewhere.
*/
exports.go = function(cb) {

	var url = "http://www3.septa.org/hackathon/TrainView/";
	var time_t_start = new Date().getTime() / 1000;

	requestData(url).then( ([response, body]) => {
		return(processData(url, time_t_start, response, body));

	}).then(function(data) {
		return(transformData(data, this));

	}).then(function(data) {
		cb(null, data);

	}).catch(function(error) {
		cb("api.js: go(): " + util.inspect(error));

	});


} // End of go()


/**
* Transform the data that we got from SEPTA into something I can 
* actually use.
*/
function transformData(data, cb) {
	return(new Promise( (resolve, reject) => {

	var retval = {};
	retval["data"] = {};

	var count = 0;
	for (var k in data) {
		var row = data[k];

		var train_num = row["trainno"];
		var source = row["SOURCE"];
		var dest = row["dest"];
		var late = row["late"];

		//
		// Some trains show up as 999 minutes late.  Probably a train that's
		// taken out of service or something.  Either way, we can ignore those trains.
		//
		if (late == 999) {
			continue;
		}


		//late = 0; // Debugging - make trains on time (Not fucked)
		//late = 15 // Debugging - makes trains all 15 minutes late (A Little Fucked)
		//late = 35 // Debugging - makes trains all 35 minutes late (Turbo Fucked)
		//late += (count * .1); // Debugging - make trains "late"
		//late += (count * 1); // Debugging - make trains "late"
		//late += (count * 5); // Debugging - make trains "late"
		//console.log("Debug late:", train_num, late);

		//
		// We're assuming that the train numbers are unique here.
		// (Maybe I'm assumming too much...?)
		//
		retval["data"][train_num] = {
			"number": train_num,
			"from": source,
			"to": dest,
			"late": late,
			};

		count++;

	}

	//retval["data"][Object.keys(retval["data"])[0]]["late"] = 31; // Debugging - Make a single train 31 minutes late (Fucked)

	//
	// How many trains in total?
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

	resolve(retval);

	}));
} // End of transformData()


