export function scrollToId(id: string) {
	document.querySelector(`#${id}`)?.scrollIntoView();

	// scroll 65px down to avoid the navbar
	window.scrollBy(0, -65);
}
