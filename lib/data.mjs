

let _data = {};

/**
 * Return a key or drill down into nested keys.
 * Note that we're not freezing the data, because the caller might do things like update trains, etc.
 * @param {...string} keys - One or more keys to traverse
 */
export function get(...keys) {
	let value = _data;
	for (const key of keys) {
		if (value === undefined || value === null) {
			return undefined;
		}
		value = value[key];
	}
	return value;
}

export function set(...args) {
	// Last argument is the value, everything else are keys
	const value = args.pop();
	const keys = args;
	
	let current = _data;
	for (let i = 0; i < keys.length - 1; i++) {
		if (current[keys[i]] === undefined) {
			current[keys[i]] = {};
		}
		current = current[keys[i]];
	}
	current[keys[keys.length - 1]] = value;
}

export function del(...keys) {
	if (keys.length === 0) return;
	
	let current = _data;
	for (let i = 0; i < keys.length - 1; i++) {
		if (current[keys[i]] === undefined) {
			return; // Path doesn't exist, nothing to delete
		}
		current = current[keys[i]];
	}
	delete current[keys[keys.length - 1]];
}

export function getAll() {
	return _data;
}
