export default function query() {
	return Object.fromEntries(location.search.substr(1).split('&').map(str => {
		const i = str.indexOf('=');
		if (i < 0) return [str, null];
		return [str.substring(0, i), str.substring(i + 1) ]
			.map(decodeURIComponent);
	}));
}

export const initQuery = query();
