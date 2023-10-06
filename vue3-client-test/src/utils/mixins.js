import * as LayoutUtil from '@/utils/layout';

export const getKeybindText = (eventName) => {
	return LayoutUtil.getKeybindingText(eventName);
};

export const copyText = (text) => {
	function fallbackCopyTextToClipboard(text) {
		var textArea = document.createElement("textarea");
		textArea.value = text;
		
		// Avoid scrolling to bottom
		textArea.style.top = "0";
		textArea.style.left = "0";
		textArea.style.position = "fixed";

		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		var successful = false;

		try {
			successful = document.execCommand('copy');
			console.log('Fallback: Copying text command was ' + text);
		} catch (err) {
			console.error('Fallback: Oops, unable to copy', err);
		}

		document.body.removeChild(textArea);
		return successful;
	}

	if (!navigator.clipboard) {
		return new Promise((resolve, reject) => {
			const response = fallbackCopyTextToClipboard(text);
			if (response) {
				resolve(1);
				return;
			}

			reject(0);
		});
	}

	return navigator.clipboard.writeText(text);
};