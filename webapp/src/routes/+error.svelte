<script lang="ts">
	import { page } from '$app/stores';

	console.log($page);
</script>

<div class="prose max-w-2xl prose-zinc dark:prose-invert">
	{#if $page.status === 404}
		<h1>404: No note found 🕵️</h1>
		<p class="prose-xl">No note was found at this link. Are you from the future?</p>
	{:else if $page.status === 410 && $page.error?.message === 'Note expired'}
		<h1>📝💨 This note is no longer here!</h1>
		<p class="prose-xl">
			Notes are stored for a limited amount of time. The note at this link was either set to expire,
			or deleted due to inactivity. Sorry!
		</p>
	{:else if $page.status === 410 && $page.error?.message === 'Note deleted'}
		<h1>📝🗑 This note has been deleted.</h1>
		<p class="prose-xl">The note at this link has been deleted by the user who shared it. Sorry!</p>
	{:else}
		<h1>Something went wrong 🤔</h1>
		<p class="prose-xl">
			{#if import.meta.env.DEV}
				<pre class="prose-xl">{JSON.stringify($page.error, null, 2)}</pre>
			{:else}
				<p class="prose-xl">An error occurred while loading this page. Please try again later.</p>
			{/if}
		</p>
	{/if}

	<div class="not-prose w-full flex justify-center mt-16">
		{#if $page.status === 404 || ($page.status === 410 && $page.error?.message === 'Note expired')}
			<img src="/expired_note.svg" alt="encrypted-art" class="w-80" />
		{:else if $page.status === 410 && $page.error?.message === 'Note deleted'}
			<img src="/deleted_note.svg" alt="encrypted-art" class="w-80" />
		{/if}
	</div>
</div>
