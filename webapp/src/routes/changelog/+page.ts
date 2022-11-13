export const prerender = true;

// @ts-expect-error - Markdown files are not recognized by Vite
import { html } from '/CHANGELOG.md';

export function load() {
	return { html };
}
