<script lang="ts">
	import { onMount } from 'svelte';
	import { decrypt } from '$lib/crypto/decrypt';
	import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';
	import LogoMarkdown from 'svelte-icons/io/IoLogoMarkdown.svelte';
	import IconEncrypted from 'svelte-icons/md/MdLockOutline.svelte';
	import { browser } from '$app/environment';
	import RawRenderer from '$lib/components/RawRenderer.svelte';
	import LogoDocument from 'svelte-icons/md/MdUndo.svelte';
	import Dismissable from '$lib/components/Dismissable.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	let { note } = data;

	let plaintext: string;
	let timeString: string;
	let decryptFailed = false;
	let showRaw = false;
	let fileTitle: string | undefined;

	function toggleRaw() {
		showRaw = !showRaw;
	}

	function msToString(ms: number): string {
		const minutes = ms / 1000 / 60;
		if (minutes < 60) {
			return `${Math.floor(minutes)} minute${minutes >= 2 ? 's' : ''}`;
		}
		const hours = minutes / 60;
		if (hours < 24) {
			return `${Math.floor(hours)} hour${hours >= 2 ? 's' : ''}`;
		}
		const days = hours / 24;
		if (days < 30.42) {
			return `${Math.floor(days)} day${days >= 2 ? 's' : ''}`;
		}
		const months = days / 30.42;
		return `${Math.floor(months)} month${months >= 2 ? 's' : ''}`;
	}

	function parsePayload(payload: string): { body: string; title?: string } {
		try {
			const parsed = JSON.parse(payload);
			return { body: parsed?.body, title: parsed?.title };
		} catch (e) {
			return { body: payload, title: undefined };
		}
	}

	onMount(() => {
		if (browser && note) {
			const key = location.hash.slice(1);
			decrypt({ ...note, key }, note.crypto_version)
				.then((value) => {
					const { body, title } = parsePayload(value);
					plaintext = body;
					fileTitle = title;
				})
				.catch(() => (decryptFailed = true));
		}
	});

	$: if (note?.insert_time) {
		const diff_ms = new Date().valueOf() - new Date(note.insert_time).valueOf();
		timeString = msToString(diff_ms);
	}
</script>

<svelte:head>
	<title>{import.meta.env.VITE_BRANDING} | Shared note</title>
	{#if decryptFailed}
		<title>{import.meta.env.VITE_BRANDING} | Error decrypting note</title>
	{/if}
</svelte:head>

{#if plaintext}
	<div class="max-w-2xl mx-auto">
		<Dismissable />

		<p
			class="mb-4 text-sm flex gap-2 flex-col md:gap-0 md:flex-row justify-between text-zinc-500 dark:text-zinc-400"
		>
			<span class="flex gap-1.5 items-center uppercase">
				<span class="inline-block w-5 h-5"><IconEncrypted /></span>
				<span>e2e encrypted | <span>Shared {timeString} ago</span></span>
			</span>
			<button
				on:click={toggleRaw}
				class="flex flex-row-reverse justify-end md:flex-row underline md:no-underline gap-1.5 uppercase items-center hover:underline"
			>
				{#if showRaw}
					<span class="w-6 h-6 inline-block"><LogoDocument /> </span>
					<span>Render Document</span>
				{:else}
					<span>Raw Markdown</span>
					<span class="w-6 h-6 inline-block"><LogoMarkdown /> </span>
				{/if}
			</button>
		</p>
		{#if showRaw}
			<RawRenderer>{plaintext}</RawRenderer>
		{:else}
			<MarkdownRenderer {plaintext} {fileTitle} />
		{/if}
	</div>
{/if}

{#if decryptFailed}
	<div class="prose max-w-2xl prose-zinc dark:prose-invert">
		<h1>Error: Cannot decrypt file 🔒</h1>
		<p class="prose-xl">This note could not be decrypted with this link.</p>
		<p class="prose-xl">
			If you think this is an error, please double check that you copied the entire URL.
		</p>
	</div>
{/if}
