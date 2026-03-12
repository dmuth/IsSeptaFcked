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
export async function go(request, response) {

	try {
		const data = await septa_rr_getData();

		let retval = {};
		retval["num"] = data["num"];
		retval["time"] = data["time"];
		retval["time_t"] = data["time_t"];
		retval["late_average"] = data["late_average"];
		retval["status"] = {};
		retval["status"]["status"] = data["status"]["status"];
		retval["status"]["summary"] = data["status"]["summary"];
		retval["_comment"] = "Regional Rail data processed by us";

		response.header("Content-Type", "application/json");
		response.send(JSON.stringify(retval, null, 4));

	} catch(error) {
		console.log("ERROR: api-rr-status.js: go(): " + error);
		response.status(502).json({ error: 
			`Ah jeez, I got an error.  Please report this to the site owner, thanks!  The error is as follows: ${error.toString()}` }
			);

	}

} // End of go()




