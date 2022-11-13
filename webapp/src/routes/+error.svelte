<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="prose max-w-2xl prose-zinc dark:prose-invert">
	{#if $page.status === 404}
		<h1>404: No note found 🕵️</h1>
		<p class="prose-xl">No note was found at this link. Are you from the future?</p>
	{:else if $page.status === 410}
		<h1>📝💨 This note is no longer here!</h1>
		<p class="prose-xl">
			Notes are stored for a limited amount of time. The note at this link was either set to expire,
			or deleted due to inactivity. Sorry!
		</p>
	{/if}

	<div class="not-prose w-full flex justify-center mt-16">
		{#if $page.status === 404 || $page.status === 410}
			<img src="/expired_note.svg" alt="encrypted-art" class="w-80" />
		{/if}
	</div>
</div>
