
/**
 * Fetch a URL with a timeout and return status and body.
 */
export async function fetchUrl(url, timeout_ms = 10000) {

	//timeout_ms = 1; // Uncomment to force a timeout
  	const controller = new AbortController();
  	const t = setTimeout(() => controller.abort(), timeout_ms);

  	try {
    	const res = await fetch(url, { signal: controller.signal });
		let retval = await res.text();
		console.log(`Fetched URL: ${url}, Status: ${res.status}, Bytes: ${retval.length}`);
		return([res.status, retval]);

  	} catch (e) {

		if (e.name === "AbortError") {
  			throw new Error(`fetchUrl timeout after ${timeout_ms}ms: ${url}`, { cause: e });
		}
		throw(e);

  	} finally {
    	clearTimeout(t);

  	}

} // End of fetchUrl()


/**
 * Return true if TRUST_PROXY is set to a truthy value.
 */
export function isTrustProxyEnabled() {

	const value = process.env["TRUST_PROXY"];
  	if (value == null) {
		return false;
	}

  	return ["1", "true", "yes", "on"].includes(value.toLowerCase());

}	
