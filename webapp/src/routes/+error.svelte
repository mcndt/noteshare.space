<script context="module" lang="ts">
	import type { Load } from '@sveltejs/kit';

	export const load: Load = ({ error, status }) => {
		let explainText = '';
		let title = '';

		if (status == 404) {
			title = `404: No note found 🕵️`;
			explainText = `No note was found at this link. Are you from the future?`;
		}

		if (status == 410) {
			title = '📝💨 This note is no longer here! ';
			explainText = `Notes are stored for a limited amount of time. The note at this link was either set to expire, or deleted due to inactivity. Sorry!`;
		}

		return {
			props: {
				status: status,
				title: title,
				explainText: explainText
			}
		};
	};
</script>

<script lang="ts">
	export let status: number;
	export let title: string;
	export let explainText: string;
</script>

<div class="prose max-w-2xl prose-zinc dark:prose-invert">
	<h1>{title}</h1>
	<p class="prose-xl">{explainText}</p>

	<div class="not-prose w-full flex justify-center mt-16">
		{#if status == 404 || status == 410}
			<img src="/expired_note.svg" alt="encrypted-art" class="w-80" />
		{/if}
	</div>
</div>
