/**
* This module provides our external API functionality.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/

import { getData as septa_rr_getData } from "../lib/septa/rr/main.mjs";


/**
* This function is our main entry point.
*/
export function go(request, response) {

	var retval = "";

	septa_rr_getData().then( (in_data) => {

		let data = {};
		data["data"] = in_data;
		data["_comment"] = "Raw Regional Rail data from SEPTA";

		retval += JSON.stringify(data, null, 4);

		//
		// As per RFC 4627, this should application/json so that apps can consume it.
		//
		response.header("Content-Type", "application/json");

		response.send(retval);

	}).catch(function(error) {
		console.log("ERROR: api-rr-raw.js: go(): " + error);

	});

} // End of go()




