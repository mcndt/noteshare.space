<script lang="ts">
	import { scrollToId } from '$lib/util/scrollToId';

	export let id: string;
</script>

<sup
	><a
		on:click|preventDefault={() => scrollToId(`footnote-${id}`)}
		id="footnote-ref-{id}"
		href="#footnote-{id}">[{id}]</a
	></sup
>
