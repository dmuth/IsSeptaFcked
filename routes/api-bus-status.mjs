/**
* This module provides our external API functionality.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/


import { getData as septa_bus_getData } from "../lib/septa/bus/main.mjs";


/**
* This function is our main entry point.
*/
export function go(request, response) {

	let retval = "";

	septa_bus_getData().then( (data) => {
		delete data["data"];
		delete data["suspended"];
		delete data["status"]["css_class"];
		delete data["status"]["suspended"];
		delete data["status"]["message"];
		data["_comment"] = "Bus data processed by us";

		retval += JSON.stringify(data, null, 4);

		//
		// As per RFC 4627, this should application/json so that apps can consume it.
		//
		response.header("Content-Type", "application/json");

		response.send(retval);

	}).catch(function(error) {
		console.log("ERROR: api-bus-status.js: go(): " + error);

	});

} // End of go()




