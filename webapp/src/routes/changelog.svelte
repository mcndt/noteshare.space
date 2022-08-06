<script context="module" lang="ts">
	export const prerender = true;

	import { toc, html } from '/CHANGELOG.md';
</script>

<div class="md:py-8 prose prose-md max-w-3xl dark:prose-invert">
	{@html html}
</div>
