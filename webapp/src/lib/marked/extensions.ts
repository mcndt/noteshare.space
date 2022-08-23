const InternalLinkExtension = {
	name: 'internal-link',
	level: 'inline',
	start(src: string) {
		return src.match(/^\[\[/)?.index;
	},
	tokenizer(src: string) {
		const match = src.match(/^\[\[([^\n]+?)]\]/);
		if (match) {
			return {
				type: 'internal-link',
				raw: match[0].trim(),
				text: match[1].trim()
			};
		}
		return false;
	}
};

const InternalEmbedExtension = {
	name: 'internal-embed',
	level: 'inline',
	start(src: string) {
		return src.match(/^!\[\[/)?.index;
	},
	tokenizer(src: string) {
		const match = src.match(/^!\[\[([^\n]+?)]\]/);
		if (match) {
			return {
				type: 'internal-embed',
				raw: match[0].trim(),
				text: match[1].trim()
			};
		}
		return false;
	}
};

const TagExtension = {
	name: 'tag',
	level: 'inline',
	start(src: string) {
		return src.match(/#/)?.index;
	},
	tokenizer(src: string) {
		const match = src.match(/^#([0-9A-Za-zÀ-ÖØ-öø-ÿ/_-]+)[\s\n]?/);
		if (match) {
			return {
				type: 'tag',
				raw: match[0].trim(),
				text: match[1].trim()
			};
		}
		return false;
	}
};

const HighlightExtension = {
	name: 'highlight',
	level: 'inline',
	start(src: string) {
		return src.match(/==/)?.index;
	},
	tokenizer(src: string): any {
		const match = src.match(/^==(.+)==/);
		const text = match ? match[1].trim() : '';
		if (match) {
			return {
				type: 'highlight',
				raw: match[0].trim(),
				text: text,
				// @ts-expect-error - marked types are wrong
				tokens: this.lexer.inlineTokens(text, [])
			};
		}
		return false;
	}
};

const MathInline = {
	name: 'math-inline',
	level: 'inline',
	start(src: string) {
		return src.indexOf('$');
	},

	tokenizer(src: string) {
		const match = src.match(/^(\${1})((?:\\.|[^$])+)\1/);
		if (match) {
			return {
				type: 'math-inline',
				raw: match[0],
				text: match[2].trim()
			};
		}
		return false;
	}
};

const MathBlock = {
	name: 'math-block',
	level: 'inline',
	start(src: string) {
		return src.indexOf('$$');
	},

	tokenizer(src: string) {
		const match = src.match(/^(\${2})((?:\\.|[^$]|\n)+)\1/);
		if (match) {
			return {
				type: 'math-block',
				raw: match[0],
				text: match[2].trim()
			};
		}
		return false;
	}
};

const footnoteRef = {
	name: 'footnote-ref',
	level: 'inline',
	start(src: string) {
		return src.indexOf('[^');
	},

	tokenizer(src: string) {
		const match = src.match(/^\[\^([^\]]+)\]/);
		if (match) {
			return {
				type: 'footnote-ref',
				raw: match[0],
				id: match[1].trim()
			};
		}
		return false;
	}
};

const footnote = {
	name: 'footnote',
	level: 'block',
	start(src: string) {
		return src.match(/^\[\^([^\]]+)\]:/)?.index;
	},

	tokenizer(src: string): any {
		const matchFootnote = /^\[\^([^\]]+)\]: ?((?:[^\r\n]*))/;

		const lines = src.split('\n');
		const match = lines[0].match(matchFootnote);
		if (match) {
			// find all subsequent lines that are not a match with matchFootnote or blank
			let i = 1;
			while (i < lines.length && !lines[i].match(matchFootnote) && lines[i].trim() !== '') {
				i++;
			}
			const raw = lines.slice(0, i).join('\n');

			// const text equals raw without the [^id]: part
			const text = raw.replace(/^\[\^([^\]]+)\]: ?/, '').trim();

			return {
				type: 'footnote',
				raw: raw,
				id: match[1].trim(),
				// @ts-expect-error - marked types are wrong
				tokens: this.lexer.blockTokens(text, [])
			};
		}
		return false;
	}
};

export default [
	InternalLinkExtension,
	InternalEmbedExtension,
	TagExtension,
	HighlightExtension,
	MathBlock,
	MathInline,
	footnoteRef,
	footnote
];
