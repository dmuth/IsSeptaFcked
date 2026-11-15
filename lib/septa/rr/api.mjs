/**
* This module is actually responsible for fetching from SEPTA's API.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/


import util from "util";
import xdate from "xdate";
import { fetchUrl } from "../../util.mjs";


/**
* Process our response and do some basic sanity checking.
*/
async function processData(url, time_t_start, status, body) {

	status = process.env.SEPTA_RR_API_STATUS ?? status;

	let time_t = new Date().getTime() / 1000;
	let diff = time_t - time_t_start;
	diff = Math.round(diff * 1000) / 1000;

	if (!body) {
		body = "";
	}

	let message = util.format("%d bytes read from %s in %d seconds",
		body.length, url, diff);
	console.log("api.js: go(): " + message);

	if (status != "200") {
		let error = util.format("Status was %s, expecting 200!",
			status);
		throw new Error("api.js: go(): " + error);
	}

	body = process.env.SEPTA_RR_BAD_JSON !== undefined ? "this will break JSON.parse" : body;

	try {
		var data = JSON.parse(body);

	} catch (e) {
		let error = util.format("Unable to parse JSON: '%s', Error: %s",
			body, util.inspect(e));
		throw new Error("api.js: go(): " + error);

	}

	return(data);

} // End of processData()


/**
* Our main entry point.  This fetches stats from SEPTA's Trainview 
* API and then transforms them into a format that we can actually 
* use elsewhere.
*/
export async function go() {

	let url = "https://www3.septa.org/hackathon/TrainView/";
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
async function transformData(data) {

	let retval = {};
	retval["data"] = {};

	let count = 0;
	for (let k in data) {
		let row = data[k];

		let train_num = row["trainno"];
		let source = row["SOURCE"];
		let dest = row["dest"];
		let late = row["late"];

		//
		// Some trains show up as 999 minutes late.  Probably a train that's
		// taken out of service or something.  Either way, we can ignore those trains.
		//
		if (late == 999) {
			continue;
		}

		// Starting at 0, increment each train's late time by this amount.
		if (process.env.SEPTA_RR_API_LATE !== undefined) {
			late = (count * process.env.SEPTA_RR_API_LATE);
		}

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

	//
	// How many trains in total?
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
