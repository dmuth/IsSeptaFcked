/**
* This module is actually responsible for fetching from SEPTA's Bus APi.
*
*/


import util from "util";
import xdate from "xdate";
import { fetchUrl } from "../../util.mjs";


/**
* Process our response and do some basic sanity checking.
*/
async function processData(url, time_t_start, status, body) {

	status = process.env.SEPTA_BUS_API_STATUS ?? status;

	//
	// Body not defined?  That's an error!
	//
	if (!body) {
		let error = util.format(
			"Body was null/undefined!  Status: %s", status);
		throw new Error("bus/api.js: processData(): " + error);
	}

	//
	// Non-200 status?  That's an error!
	//
	if (status != "200") {
		let error = util.format(
			"Status was %s, expecting 200!",
			status);
		throw new Error("bus/api.js: processData(): " + error);
	}

	let time_t = new Date().getTime() / 1000;
	let diff = time_t - time_t_start;
	diff = Math.round(diff * 1000) / 1000;
	let message = util.format("%d bytes read from %s in %d seconds",
		body.length, url, diff);
	console.log("bus/api.js: go(): " + message);

	body = process.env.SEPTA_BUS_API_BAD_JSON !== undefined ? "this will break JSON.parse" : body;

	try {
		var data = JSON.parse(body);

	} catch (e) {
		let error = util.format("Unable to parse JSON: '%s', Error: %s",
			body, util.inspect(e));
		throw new Error("bus/api.js: processData(): " + error);

	}

	return(data);

} // End of processData()


/**
* Our main entry point.  This fetches stats from SEPTA's Bus
* API and then transforms them into a format that we can actually 
* use elsewhere.
*/
export async function go() {

	let message = "bus/api.js: Fetching Bus data from API...";
	console.log(message);

	let url = "https://www3.septa.org/hackathon/Alerts/";
	let time_t_start = new Date().getTime() / 1000;
	let [status, body] = await fetchUrl(url);
	let data = await processData(url, time_t_start, status, body);
	let retval = await transformData(data);
	return(retval);

} // End of go()


/**
* Transform the data that we got from SEPTA into something I can 
* actually use.
*/
async function transformData(data, cb) {

	let retval = {};
	retval["data"] = {};
	retval["num"] = 0;
	retval["num_suspended"] = 0;
	retval["suspended"] = [];

	let count = 0;
	for (let k in data) {
		let row = data[k];

		let route_id = row["route_id"];
		let mode = row["mode"];

		//
		// Seriously, SEPTA?  You misspelled the *suspend*?
		//
		let is_suspended = row["issuppend"];

		//
		// We only want busses.
		//
		if (mode != "Bus") {
			continue;
		}
		
		if (process.env.SEPTA_RR_BUS_LATE_CHANCE !== undefined) {
			let chance = process.env.SEPTA_RR_BUS_LATE_CHANCE;
			let result = Math.floor(Math.random() * chance);
			if (result == 0) {
				let message = "DEBUG: Making bus " + route_id + " suspended!";
				console.log(message);
				is_suspended = "Y";
			}
		}

		let row_out = {
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
	let date = new xdate();
	retval["time"] = date.toString("ddd MMM dS, yyyy hh:mm:ss TT");
	retval["time_t"] = Math.round(date.getTime() / 1000);

	//
	// Store the raw data we got.
	//
	retval["raw_data"] = data;

	return(retval);

} // End of transformData()


export default { go };
