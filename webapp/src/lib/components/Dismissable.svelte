<script lang="ts">
	import { browser } from '$app/environment';

	import { onMount } from 'svelte';
	import Callout from './Callout.svelte';

	const localStorageKey = 'shared-note-notification';
	// Increase this value to show the notification again to existing users.
	const messageId = 3;
	// Use this to show the notification to new users only if the notification is younger than this date.
	const expire_time = new Date('2022-09-10');
	let show = false;

	onMount(() => {
		if (!browser) return;
		const serializedId = localStorage.getItem(localStorageKey);
		const id = serializedId ? parseInt(serializedId) : -1;
		if (id < messageId && new Date() < expire_time) {
			show = true;
		}
	});

	function onDismiss() {
		show = false;
		localStorage.setItem(localStorageKey, messageId.toString());
	}
</script>

{#if show}
	<!-- <div class="mb-5 px-4 py-4 bg-blue-100 rounded-lg"> -->
	<div
		class="prose prose-zinc dark:prose-invert max-w-none prose-li:my-0 prose-ul:mt-0 prose-ol:mt-0 leading-7
  prose-strong:font-bold prose-a:font-normal prose-blockquote:font-normal prose-blockquote:not-italic
  prose-blockquote:first:before:content-[''] prose-hr:transition-colors mb-5"
	>
		<Callout type="info" title="Obsidian QuickShare 1.0.0 launched 🚀">
			<p>
				Obsidian QuickShare and Noteshare.space are now out of beta 🚀 You can now find the plugin
				in the Obsidian community plugin marketplace (see <a href="/install">instructions</a>).
				Check out the roadmap for upcoming features <a href="/roadmap">here</a>.
			</p>
			<div class="mt-1.5">
				<button
					on:click={onDismiss}
					class="px-1.5 py-0.5 text-[.9em] hover:bg-neutral-200 dark:hover:bg-neutral-700 font-semibold text-red-700 dark:text-red-500 underline hover:text-grey-500"
					>Don't show again</button
				>
			</div>
		</Callout>
	</div>
{/if}
