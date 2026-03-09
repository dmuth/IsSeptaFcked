/**
* This module provides our external API functionality.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/

import util from "util";

import { getData as septa_rr_getData } from "../lib/septa/rr/main.mjs";
import { getData as septa_bus_getData } from "../lib/septa/bus/main.mjs";


/**
* This function is our main entry point.
*/
export async function go(request, response) {

	try {

		const bus_result = await septa_bus_getData(this);

		let bus_data = {};
		bus_data["status"] = {}
		bus_data["status"]["status"] = bus_result["status"]["status"];
		bus_data["status"]["summary"] = bus_result["status"]["summary"];

		const rr_result = await septa_rr_getData();

		let rr_data = {};
		rr_data["status"] = {};
		rr_data["status"]["status"] = rr_result["status"]["status"];
		rr_data["status"]["summary"] = rr_result["status"]["summary"];

		var data = {};
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

		response.header("Content-Type", "application/json");
		response.send(JSON.stringify(data, null, 4));

	} catch(error) {
		console.log("ERROR: api-status.js: go(): " + error);
		response.status(502).json({ error: 
			`Ah jeez, I got an error.  Please report this to the site owner, thanks!  The error is as follows: ${error.toString()}` }
			);

	}

} // End of go()




