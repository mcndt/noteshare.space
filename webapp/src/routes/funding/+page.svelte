<script context="module" lang="ts">
	export const prerender = true;

	// @ts-expect-error - Markdown files are not recognized by Svelte
	import { toc, html } from './funding.md';
</script>

<div class="md:py-8 prose prose-md max-w-3xl dark:prose-invert">
	{@html html}
</div>
