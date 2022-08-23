<script lang="ts">
	import { scrollToId } from '$lib/util/scrollToId';

	export let id: string;

	let content: HTMLElement;
	let returnRef: HTMLElement;

	let refMoved = false;

	$: if (content && returnRef) {
		// Find the p element in content move the return link to the end of that p element
		const p = content.querySelector('p');
		if (p) {
			p.appendChild(returnRef);
			refMoved = true;
		}
	}
</script>

<div data-footnote class="flex gap-2 prose-p:my-0">
	<p>{id}.</p>
	<span bind:this={content} class="">
		<slot />
	</span>
</div>

<span bind:this={returnRef} class="ml-1 {refMoved ? 'inline' : 'hidden'}"
	><a
		on:click|preventDefault={() => scrollToId(`footnote-ref-${id}`)}
		id="footnote-{id}"
		href="#footnote-ref-{id}"
		class="no-underline">⮥</a
	></span
>
