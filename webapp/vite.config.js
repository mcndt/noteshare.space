import { sveltekit } from '@sveltejs/kit/vite';
import { plugin as markdown } from 'vite-plugin-markdown';
import { searchForWorkspaceRoot } from 'vite';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit(), markdown({ mode: ['html', 'toc'] })],
	optimizeDeps: {
		include: ['highlight.js', 'highlight.js/lib/core']
	},
	test: {
		globals: true,
		environment: 'happy-dom',
		setupFiles: ['setupTest.js']
	},
	server: {
		fs: {
			// Allow serving CHANGELOG.md file
			allow: [searchForWorkspaceRoot(process.cwd()), '/CHANGELOG.md']
		}
	}
};

export default config;
