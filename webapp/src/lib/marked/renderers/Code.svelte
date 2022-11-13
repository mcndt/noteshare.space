<script lang="ts">
	import { onMount } from 'svelte';

	import hljs from 'highlight.js/lib/common';
	import 'highlight.js/styles/stackoverflow-dark.css';

	export let lang: string;
	export let text: string;

	let highlighted: string;

	onMount(() => {
		try {
			if (hljs.getLanguage(lang) !== undefined) {
				highlighted = hljs.highlight(text, { language: lang }).value;
			} else {
				highlighted = text;
			}
		} catch {
			highlighted = text;
		}
	});
</script>

<div class="">
	<pre class="language-{lang}"><code>{@html highlighted}</code></pre>
</div>
