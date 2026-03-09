/**
* This module is our handler for echo functionality.
*
* @author Douglas Muth <http://www.dmuth.org/>
*/

import { getAll as data_getAll } from "../lib/data.mjs";

/**
* This function is our main entry point.
*/
export function go(request, response) {

	let retval = data_getAll();

	response.header("Content-Type", "application/json");
	response.send(JSON.stringify(retval, null, 2));

} // End of go()
