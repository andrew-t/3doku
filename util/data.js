export default function namespace(namespace, defaults) {
	function wrapKey(key) {
		return `${namespace}_${key}`;
	}
	const data = {
		clear() {
			for (const key in defaults)
				localStorage.removeItem(wrapKey(key));
		},
		export(except, transforms) {
			const j = {};
			for (const key in defaults) if (!except.includes(key))
				j[key] = transforms[key] ? transforms[key](data[key]) : data[key];
			return btoa(JSON.stringify(j));
		},
		import(b64, transforms) {
			const j = JSON.parse(atob(b64));
			for (const key in j)
				data[key] = transforms[key] ? transforms[key](j[key]) : j[key];
		}
	};
	for (const key in defaults)
		Object.defineProperty(data, key, {
			get: () => JSON.parse(localStorage.getItem(wrapKey(key))) ?? defaults[key],
			set: value => localStorage.setItem(wrapKey(key), JSON.stringify(value ?? null))
		});
	return data;
}
