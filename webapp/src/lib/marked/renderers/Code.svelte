<script lang="ts">
	import { browser } from '$app/env';

	import { onMount } from 'svelte';

	import hljs from 'highlight.js/lib/common';
	import 'highlight.js/styles/stackoverflow-dark.css';

	export let lang: string;
	export let text: string;

	let highlighted: string;

	onMount(() => {
		if (browser) {
			highlighted = hljs.highlight(text, { language: lang }).value;
		}
	});
</script>

<svelte:head>
	<!-- <link
		rel="stylesheet"
		href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.6.0/styles/github-dark.min.css"
	/> -->
</svelte:head>

<div class="">
	<!-- <pre class="language-{lang}"><code>{text}</code></pre> -->

	<pre class="language-{lang}"><code>{@html highlighted}</code></pre>
</div>
