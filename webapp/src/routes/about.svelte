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
		The encryption mechanism is based on services such as Firefox Send. The basic operation is as
		follows:
	</p>

	<ol>
		<li>
			The Obsidian plugin encrypts your note with AES-256-CBC, using a cryptographically secure,
			single-use key.
		</li>
		<li>
			The encrypted note is sent to the server for storage. The decryption key never leaves your
			device. The server will store your note for 31 days.
		</li>
		<li>
			The decryption key is added to the share link using a hash symbol: <code
				>https://noteshare.space/note/[NOTE_ID]#[DECRYPTION_KEY]</code
			>. Hash values indicate to the browser where to focus on the page and are never sent to the
			server.
		</li>
		<li>
			When opening the note link, the browser retrieves the encrypted note from the server and
			decrypts it with the key in the URL.
		</li>
	</ol>

	<p>
		If you want to learn more about end-to-end encryption on the Web, I highly recommend <a
			href="https://youtu.be/mffWMMVMMLs">this talk</a
		> by Thomas Konrad. In the future, I'll write a longer report about the cryptography used in this
		project.
	</p>
</div>
