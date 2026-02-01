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

		data["_comment"] = "Bus data processed by us";

		retval += JSON.stringify(data, null, 4);

		response.header("Content-Type", "application/json");
		response.send(retval);

	}).catch(function(error) {
		console.log("ERROR: api-rr.js: go(): " + error);
		response.status(502).json({ error: 
			`Ah jeez, I got an error.  Please report this to the site owner, thanks!  The error is as follows: ${error.toString()}` }
			);

	});

} // End of go()




