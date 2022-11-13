export const prerender = true;

// @ts-expect-error - Markdown files are not recognized by Svelte
import { html } from '../funding.md';

export function load() {
	return { html };
}
