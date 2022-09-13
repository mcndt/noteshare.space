<script lang="ts">
	import EmbedIcon from 'svelte-icons/md/MdAttachment.svelte';
	import FaRegQuestionCircle from 'svelte-icons/fa/FaRegQuestionCircle.svelte';
	import { EmbedType, getEmbedType, getMimeType } from '$lib/util/embeds';
	import { onMount } from 'svelte';
	import { getEmbedId } from '$lib/crypto/embedId';
	import type { EncryptedEmbed } from '$lib/model/EncryptedEmbed';
	import { decryptBuffer_v2 } from '$lib/crypto/decrypt';

	export let text: string;
	let image: HTMLImageElement;
	let imageUrl: string;

	onMount(async () => {
		if (getEmbedType(text) === EmbedType.IMAGE) {
			const encryptedEmbed = await fetchEmbed(text);
			const embedBuffer = await decryptEmbed(encryptedEmbed);
			console.log(embedBuffer);
			imageUrl = renderImage(embedBuffer, text);
			return () => {
				URL.revokeObjectURL(imageUrl);
			};
		}
	});

	function renderImage(buffer: ArrayBuffer, filename: string): string {
		// const bufferView = new Uint8Array(buffer);
		const blob = new Blob([buffer], { type: getMimeType(filename) });
		const url = URL.createObjectURL(blob);
		return url;
	}

	async function decryptEmbed(embed: EncryptedEmbed): Promise<ArrayBuffer> {
		const key = location.hash.slice(1);
		const data = await decryptBuffer_v2({ ...embed, key });
		return data;
	}

	async function fetchEmbed(filename: string): Promise<EncryptedEmbed> {
		const embedId = await getEmbedId(filename);
		const response = await fetch(`${location.pathname}/embeds/${embedId}`);
		if (response.ok) {
			return (await response.json()) as EncryptedEmbed;
		}
		throw new Error(`Failed to fetch embed: ${response.statusText}`);
	}
</script>

{#if imageUrl}
	<img bind:this={image} src={imageUrl} alt={text} />
{:else}
	<div>
		<dfn class="not-italic" title="Interal embeds are not shared currently.">
			<div
				class="px-4 py-12 border border-zinc-300 dark:border-zinc-600 inline-flex flex-col items-center justify-center"
			>
				<span class="h-8 text-zinc-400 ml-0.5 inline-flex items-center whitespace-nowrap gap-1"
					><span class="w-8 h-8 inline-block">
						<EmbedIcon />
					</span>
					<span>Internal embed</span>
				</span>
				<span class="underline cursor-not-allowed inline-flex items-center">
					<span class="text-[#705dcf] opacity-50">{text}</span>
					<span class="inline-block w-3 h-3 mb-2 text-zinc-400 ml-0.5"><FaRegQuestionCircle /></span
					>
				</span>
			</div>
		</dfn>
	</div>
{/if}
