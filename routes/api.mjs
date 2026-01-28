/**
* This module handles rendering of our API page.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/

import { production } from "../lib/config.mjs";

import {
	is_sfw as sfw_is_sfw, 
	filter as sfw_filter
} from "../lib/sfw.mjs";

export function go(request, response) {

	var is_sfw = sfw_is_sfw(request);

	var title_home = "Is SEPTA Fucked?";
	var title = "API - " + title_home;
	if (is_sfw) {
		title = sfw_filter(title);
	}

	response.render("api.pug", {
		"title_home": title_home,
		"title": title,
		"production": production,
		"is_sfw": is_sfw,
		"uri": request["url"],
		});

} // End of go()
