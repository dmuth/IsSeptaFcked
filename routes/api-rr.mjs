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

	septa_rr_getData(this).then( (data) => {

		data["_comment"] = "Regional Rail data processed by us";

		retval += JSON.stringify(data, null, 4);

		//
		// As per RFC 4627, this should application/json so that apps can consume it.
		//
		response.header("Content-Type", "application/json");

		response.send(retval);

	}).catch(function(error) {
		console.log("ERROR: api-status-rr.js: go(): " + error);

	});

} // End of go()




