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

	var retval = "";

	try {
		const data = await septa_rr_getData();

		data["_comment"] = "Regional Rail data processed by us";

		response.set("Content-Type", "application/json");
		response.send(JSON.stringify(data, null, 4));

	} catch(error) {
		console.log("ERROR: api-status-rr.js: go(): " + error);
		response.status(502).json({ error: 
			`Ah jeez, I got an error.  Please report this to the site owner, thanks!  The error is as follows: ${error.toString()}` }
			);

	}

} // End of go()




