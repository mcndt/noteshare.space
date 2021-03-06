<script lang="ts">
	import SvelteMarkdown from 'svelte-markdown';
	import Heading from '$lib/marked/renderers/Heading.svelte';
	import List from '$lib/marked/renderers/List.svelte';
	import InternalLink from '$lib/marked/renderers/InternalLink.svelte';
	import { marked } from 'marked';
	import extensions from '$lib/marked/extensions';
	import Link from '$lib/marked/renderers/Link.svelte';
	import Tag from '$lib/marked/renderers/Tag.svelte';
	import Highlight from '$lib/marked/renderers/Highlight.svelte';
	import InternalEmbed from '$lib/marked/renderers/InternalEmbed.svelte';
	import Blockquote from '$lib/marked/renderers/Blockquote.svelte';
	import MathInline from '$lib/marked/renderers/MathInline.svelte';
	import MathBlock from '$lib/marked/renderers/MathBlock.svelte';
	import ListItem from '$lib/marked/renderers/ListItem.svelte';

	export let plaintext: string;
	let ref: HTMLDivElement;

	// @ts-ignore: typing mismatch
	marked.use({ extensions: extensions });

	const options = { ...marked.defaults, breaks: true };

	/**
	 * Searches for the first major header in the document to use as page title.
	 */
	function setTitle() {
		const tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
		for (const tag of tags) {
			const element: HTMLHeadingElement | null = ref.querySelector(tag);
			if (element && element.innerText.trim().length > 0) {
				document.title = element.innerText.trim();
				break;
			}
		}
	}
</script>

<div
	bind:this={ref}
	id="md-box"
	class="prose prose-zinc dark:prose-invert max-w-none prose-li:my-0 prose-ul:mt-0 prose-ol:mt-0 leading-7
prose-strong:font-bold prose-a:font-normal prose-blockquote:font-normal prose-blockquote:not-italic
prose-blockquote:first:before:content-[''] prose-hr:transition-colors"
>
	<SvelteMarkdown
		on:parsed={setTitle}
		renderers={{
			heading: Heading,
			list: List,
			listitem: ListItem,
			link: Link,
			'internal-link': InternalLink,
			'internal-embed': InternalEmbed,
			tag: Tag,
			highlight: Highlight,
			blockquote: Blockquote,
			'math-inline': MathInline,
			'math-block': MathBlock
		}}
		source={plaintext}
		{options}
	/>
</div>
