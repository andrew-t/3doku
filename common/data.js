import storageNamespace from "../util/data.js";
import { namespace, defaults, noExport, exportTransforms, importTransforms } from "../config.js";
import $ from "../util/dom.js";
import { openModal, closeModal, confirm } from "../util/modal.js";
import { initQuery } from "../util/query.js";

const storage = storageNamespace(namespace, defaults);

if (initQuery.data) {
	storage.import(initQuery.data, importTransforms);
	location.search = '';
}

$.exportButton.addEventListener('click', () => {
	const url = `${location.origin}${location.pathname}?data=${storage.export(noExport, exportTransforms)}`;
	$.exportLink.setAttribute('href', url);
	$.exportQrContainer.innerHTML = '';
	try {
		new QRCode($.exportQrContainer, url);
		$.codeWorked.classList.remove('hidden');
	} catch (e) {
		console.error(e);
		console.log('Too much data for QR code');
		$.codeWorked.classList.add('hidden');
	}
	openModal('export-modal');
});

$.closeExport.addEventListener('click', () => closeModal());

$.deleteData.addEventListener('click', async () => {
	if (await confirm('Delete all your data? This cannot be undone.', 'Delete')) {
		storage.clear();
		location.reload();
	}
});

export default storage;
