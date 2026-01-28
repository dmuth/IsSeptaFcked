/**
* This module provides our external API functionality.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/

import { production } from "../lib/config.mjs";

import util from "util";

import { getData as septa_rr_getData } from "../lib/septa/rr/main.mjs";
import { getData as septa_bus_getData } from "../lib/septa/bus/main.mjs";


/**
* This function is our main entry point.
*/
export function go(request, response) {

	var retval = "";
	var bus_data;

	septa_bus_getData(this).then( (data) => {

		delete data["data"];
		delete data["suspended"];
		delete data["status"]["css_class"];
		delete data["status"]["suspended"];
		delete data["status"]["message"];
		bus_data = data;

		return(septa_rr_getData(this));

	}).then( (data) => {

		delete data["data"];
		delete data["late"];
		delete data["status"]["css_class"];
		delete data["status"]["late"];
		delete data["status"]["message"];
		let rr_data = data;

		data = {}
		data["time"] = rr_data["time"];
		data["time_t"] = rr_data["time_t"];
		data["status"] = {};
		data["status"]["rr"] = rr_data["status"];
		data["status"]["bus"] = bus_data["status"];
		data["summary"] = util.format("Regional rail is %s! Buses are %s! %s %s",
			data["status"]["rr"]["status"],
			data["status"]["bus"]["status"],
			data["status"]["rr"]["summary"],
			data["status"]["bus"]["summary"]
			);
		data["summary_bus"] = util.format("Buses are %s! %s",
			data["status"]["bus"]["status"],
			data["status"]["bus"]["summary"]
			);
		data["summary_rr"] = util.format("Regional Rail is %s! %s",
			data["status"]["rr"]["status"],
			data["status"]["rr"]["summary"]
			);

		retval += JSON.stringify(data, null, 4);

		//
		// As per RFC 4627, this should application/json so that apps can consume it.
		//
		response.header("Content-Type", "application/json");

		response.send(retval);

	}).catch(function(error) {
		console.log("ERROR: api-status.js: go(): " + error);

	});

} // End of go()




