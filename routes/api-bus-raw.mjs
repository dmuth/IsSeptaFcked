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
export async function go(request, response) {

	try {
		const in_data = await septa_bus_getData();

		let data = {};
		data["data"] = in_data;
		data["_comment"] = "Raw bus data from SEPTA";

		response.header("Content-Type", "application/json");
		response.send(JSON.stringify(data, null, 4));

	} catch (error) {
		console.log("ERROR: api-bus-raw.js: go(): " + error);
		response.status(502).json({ error: 
			`Ah jeez, I got an error.  Please report this to the site owner, thanks!  The error is as follows: ${error.toString()}` }
			);

	}

} // End of go()




