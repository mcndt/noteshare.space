<script>
	import Tile from '$lib/components/index/tile.svelte';
</script>

<svelte:head>
	<title>{import.meta.env.VITE_BRANDING} — Securely share your Obsidian notes with one click.</title
	>
</svelte:head>

<article class="mx-auto max-w-4xl text-zinc-900 dark:text-zinc-100">
	<div class="space-y-6 pt-20 pb-16 md:pb-24 px-4 md:px-0">
		<h1 id="title" class="font-extrabold text-4xl md:text-5xl text-center">
			Securely share your <span class="text-[#705dcf]">Obsidian</span> notes with one click.
		</h1>
		<p id="tagline" class="prose-xl md:prose-2xl text-center text-zinc-700 dark:text-zinc-300">
			Zero configuration. End-to-end encrypted. <br />No account needed.
		</p>
		<div id="install-button" class="text-center pt-8">
			<a href="/install">
				<button
					class="py-1.5 px-4 rounded-lg border-2 border-[#705dcf] text-[#705dcf] font-semibold hover:bg-[#705dcf] hover:text-white transition-colors"
					>Install plugin</button
				>
			</a>
			<p class="mt-2.5 italic text-sm text-zinc-500 dark:text-zinc-400">
				Now on the Obsidian <br /> community plugin marketplace!
			</p>
		</div>
	</div>

	<hr class="border-zinc-200 dark:border-zinc-700 transition-colors" />

	<div class="space-y-8 py-12 md:pt-24 md:pb-16">
		<div class="flex flex-row gap-4 mx-auto justify-center">
			<Tile>
				<h2 slot="title">End-to-end encrypted</h2>
				<p slot="text">
					Your notes are stored securely using strong <strong class="whitespace-nowrap"
						>AES-256-CBC encryption</strong
					>. The decryption key is never sent to the server, so not even the server can open your
					notes.
				</p>
			</Tile>
			<img src="/encrypted.svg" alt="encrypted-art" class="w-80 hidden md:block" />
		</div>

		<div class="flex flex-row gap-4 mx-auto justify-center flex-row-reverse">
			<Tile>
				<h2 slot="title">Zero configuration</h2>
				<p slot="text">
					Other plugins require integration with GitHub Gist or Notion using your API keys.
					Noteshare.space is a <strong class="whitespace-nowrap">dedicated service</strong> for sharing
					your Markdown notes. No account is needed to use our service.
				</p>
			</Tile>
			<img src="/zeroconfig.svg" alt="encrypted-art" class="w-80 hidden md:block" />
		</div>

		<div class="flex flex-row gap-4 mx-auto justify-center">
			<Tile>
				<h2 slot="title">Open source</h2>
				<p slot="text">
					Want to verify the security of the encryption mechanism? Or host your own instance?
					Noteshare.space is completely <strong class="whitespace-nowrap"
						><a class="underline" href="https://github.com/mcndt/Noteshare.space">open-source</a
						></strong
					> under the MIT license.
				</p>
			</Tile>
			<img src="/opensource.svg" alt="encrypted-art" class="w-80 hidden md:block" />
		</div>
	</div>

	<hr class="border-zinc-200 dark:border-zinc-700 transition-colors" />

	<div class="mt-12 mb-16 md:px-20">
		<h2 class="text-2xl font-bold mb-8">Get in touch!</h2>
		<div class="md:grid grid-cols-3 w-full gap-4">
			<div class="dark:prose-invert w-full prose mb-4 md:mb-0 text-zinc-700 dark:text-zinc-300">
				<h3 class="text-lg font-bold mb-4">Discord</h3>
				<p class="">
					Join the
					<a href="https://discord.gg/y3HqyGeABK">Discord server</a> to discuss bugs and feature requests,
					or just to say hi!
				</p>
			</div>
			<div class="dark:prose-invert w-full prose mb-4 md:mb-0 text-zinc-700 dark:text-zinc-300">
				<h3 class="text-lg font-bold mb-4">Bug reports</h3>
				<p class="">
					The preferred way to report bugs or request new features for the web app or the Obsidian
					plugin is via the
					<a class="underline" href="https://github.com/mcndt/obsidian-quickshare/issues"
						>GitHub issues page</a
					>.
				</p>
			</div>
			<div class="dark:prose-invert w-full prose mb-4 md:mb-0 text-zinc-700 dark:text-zinc-300">
				<h3 class="text-lg font-bold mb-4">Inquiries</h3>
				<p class="">
					For questions and inquiries about Noteshare.space, please contact me via <a
						href="mailto:contact@noteshare.space">contact@noteshare.space</a
					>.
				</p>
			</div>
		</div>
	</div>
</article>
