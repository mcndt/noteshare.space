<svelte:head>
	<title>Roadmap | {import.meta.env.VITE_BRANDING}</title>
</svelte:head>

<div class="md:py-8 prose max-w-3xl dark:prose-invert">
	<h1>Roadmap</h1>

	<p>
		Here you can find the current roadmap for the plugin. If you have any suggestions for the web
		app or the Obsidian plugin is via the <a
			href="https://github.com/mcndt/obsidian-quickshare/issues"
		>
			GitHub issues page
		</a>. For a more detailed overview of open issues and bugs on this open source project, check
		out the <a href="https://github.com/users/mcndt/projects/1/views/5">GitHub project page</a>.
	</p>

	<div class="md:grid md:grid-cols-3 gap-x-2 w-full">
		<div>
			<h2>⚙️ In progress</h2>
			<ul>
				<li>Adding embedded images to shared note.</li>
			</ul>
		</div>
		<div>
			<h2>🗓️ Planned</h2>
			<ul>
				<li>Deleting previously shared notes.</li>
				<li>Manually setting an expire time.</li>
			</ul>
		</div>
		<div>
			<h2>💭 Potential features</h2>
			<ul>
				<li>Rendering DataView codeblocks before sharing.</li>
				<li>Rendering Excalidraw embeds before sharing.</li>
				<li>Rendering Mermaid diagrams in the web app.</li>
			</ul>
		</div>
	</div>
</div>
