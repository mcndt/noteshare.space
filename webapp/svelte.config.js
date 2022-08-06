// import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';
import { plugin as markdown } from 'vite-plugin-markdown';
import { searchForWorkspaceRoot } from 'vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		preprocess({
			postcss: true
		})
	],
	kit: {
		adapter: adapter(),
		vite: {
			plugins: [markdown({ mode: ['html', 'toc'] })],
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
		}
	}
};

export default config;
