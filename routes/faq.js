/**
* This module handles rendering of our front page.
*
* @author Douglas Muth <http://www.dmuth.org/>
*
*/

var seq = require("seq");
var util = require("util");
var septa = require("../lib/septa/main.js");


var production = false;


/**
* This function is called when the module is first loaded.
*
* @param boolean in_production Are we currently in production mode?
*/
module.exports = function(in_production) {

	var retval = {};

	production = in_production;

	retval["go"] = go;

	return(retval);

} // End of exports()


function go(request, response) {

	response.render("faq.jade", {
		"title": "Is SEPTA Fucked?",
		"production": production,
		});

} // End of go()


