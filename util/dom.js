const $ = {};
for (const el of document.querySelectorAll('[id]'))
	$[camel(el.id)] = el;

export default $;

function camel(str) {
	return str.replace(/-(.)/g, (_, x) => x.toUpperCase());
}
