const isSubMap = (a, b) => {
	return a instanceof Object && b instanceof Object && Object.keys(a).every((k) => a[k] == b[k]);
};

function getAtPath(thing, path: Array<string | number | object>, defaultTo = []) {
	let t = thing;
	// TODO: handle framed vs unframed
	for (let i = 0; i < path.length; i++) {
		const p = path[i];
		if (p == '*') {
			if (t instanceof Array) {
				return t.flatMap((o) => getAtPath(o, path.slice(i + 1), []));
			} else if (t instanceof Object) {
				return Object.values(t).flatMap((o) => getAtPath(o, path.slice(i + 1), []));
			} else {
				return defaultTo;
			}
		} else if (typeof p == 'string' || typeof p == 'number') {
			try {
				t = t[p];
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
			} catch (e) {
				t = defaultTo;
			}
		} else if (p instanceof Object) {
			if (t instanceof Array) {
				return t.filter((o) => isSubMap(p, o)).flatMap((o) => getAtPath(o, path.slice(i + 1), []));
			} else if (isSubMap(p, t)) {
				continue;
			} else {
				return defaultTo;
			}
		}
	}
	return t;
}

export default getAtPath;
