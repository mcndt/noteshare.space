<script lang="ts">
	// @ts-expect-error - Markdown files are not recognized by Vite
	import { html } from '/CHANGELOG.md';
</script>

<div class="md:py-8 prose prose-md max-w-3xl dark:prose-invert">
	{@html html}
</div>
