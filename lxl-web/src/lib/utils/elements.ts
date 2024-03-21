export function getNextElementSiblingWithSelector(element: HTMLElement | null, selector: string) {
	if (!element) {
		return null;
	}

	let sibling = element.nextElementSibling;

	while (sibling) {
		if (sibling.matches(selector)) return sibling;
		sibling = sibling.nextElementSibling;
	}
}

export function getPreviousElementSiblingWithSelector(
	element: HTMLElement | null,
	selector: string
) {
	if (!element) {
		return null;
	}

	let sibling = element.previousElementSibling;

	while (sibling) {
		if (sibling.matches(selector)) return sibling;
		sibling = sibling.previousElementSibling;
	}
}
