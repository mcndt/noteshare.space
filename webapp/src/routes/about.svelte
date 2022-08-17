<script context="module">
	export const prerender = true;
</script>

<svelte:head>
	<title>About | {import.meta.env.VITE_BRANDING}</title>
</svelte:head>

<div class="md:py-8 prose max-w-3xl dark:prose-invert">
	<h1>About</h1>

	<p>
		I created this service largely for my own use, as I was tired of relying on third-party services
		to quickly share some Markdown notes I wrote in Obsidian. Because I believe that others may find
		this useful, I chose to make it available as a public service.
	</p>

	<h2>How it works</h2>

	<p>
		I have written a <a href="https://mcndt.dev/posts/how-to-e2e-encryption/">detailed blog post</a>
		about how this service works. You can read it if you want to know more.
	</p>

	<p>
		If you want to learn further about end-to-end encrypted data transfers on the Web, I highly
		recommend <a href="https://youtu.be/mffWMMVMMLs">this talk</a> by Thomas Konrad.
	</p>
</div>
