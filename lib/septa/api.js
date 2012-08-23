/**
* This module is actually responsible for fetching from SEPTA's API.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/


var seq = require("seq");
var request = require("request");
var util = require("util");


/**
* Our main entry point.  This fetches stats from SEPTA's Trainview 
* API and then transforms them into a format that we can actually 
* use elsewhere.
*/
exports.go = function(cb) {

	var url = "http://www3.septa.org/hackathon/TrainView/";
	var time_t_start = new Date().getTime() / 1000;

	seq().seq(function() {
		request(url, this);

	}).seq(function(response, body) {
		var status = response.statusCode;
		//status = 599; // Debugging

		var time_t = new Date().getTime() / 1000;
		var diff = time_t - time_t_start;
		diff = Math.round(diff * 1000) / 1000;
		var message = util.format("%d bytes read from %s in %d seconds",
			body.length, url, diff);
		console.log("api.js: go(): " + message);

		if (status != "200") {
			var error = util.format("Status was %s, expecting 200!",
				status);
			cb("api.js: go(): " + error);
			return(null);
		}

		//body = "this will break JSON.parse"; // Debugging

		try {
			var data = JSON.parse(body);

		} catch (e) {
			var error = util.format("Unable to parse JSON: '%s', Error: %s",
				body, util.inspect(e));
			cb("api.js: go(): " + error);

		}

		transformData(data, this);

	}).seq(function(data) {
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

	var retval = {};
	retval["data"] = {};

	for (var k in data) {
		var row = data[k];

		var train_num = row["trainno"];
		var source = row["SOURCE"];
		var dest = row["dest"];
		var late = row["late"];

		//
		// We're assuming that the train numbers are unique here.
		// (Maybe I'm assumming too much...?)
		//
		retval["data"][train_num] = {
			"source": source,
			"dest": dest,
			"late": late,
			};

	}

	retval["raw_data"] = data;

	cb(null, retval);

} // End of transformData()


