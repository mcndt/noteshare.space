import { render, screen } from '@testing-library/svelte';
import MarkdownRenderer from '$lib/components/MarkdownRenderer.svelte';

const testCases = [
	{
		title: 'Don!t forget to account for non-letters! //fsd \\n',
		content: 'Sample text.',
		markdown: `
> [!Warning] Don!t forget to account for non-letters! //fsd \\n
> Sample text.
	`
	},
	{
		title: 'Regular callout',
		content: 'Sample text.',
		markdown: `
> [!NOTE] Regular callout
> Sample text.
	`
	},
	{
		title: 'Collapsed callout',
		content: 'Sample text.',
		markdown: `
> [!NOTE]- Collapsed callout
> Sample text.
	`
	},
	{
		title: 'Uncollapsed callout',
		content: 'Sample text.',
		markdown: `
> [!NOTE]+ Uncollapsed callout
> Sample text.
`
	}
];

describe.each(testCases)('Rendering callouts', async (testCase) => {
	it('Renders callout title correctly ', async () => {
		render(MarkdownRenderer, { plaintext: testCase.markdown });
		const titleEl = await screen.findByText(testCase.title);
		expect(titleEl).toBeInTheDocument();
		expect(titleEl).toHaveClass('callout-title');
	});

	// TODO: this test is broken. Need to fix it.
	it.skip('Renders callout content correctly ', async () => {
		render(MarkdownRenderer, { plaintext: testCase.markdown });
		const contentEl = await screen.findByText(testCase.content);
		// const contentEl = await screen.findByText(testCase.content);
		expect(contentEl).toBeInTheDocument();
		expect(contentEl.parentElement).toHaveClass('callout-content');
	});
});
