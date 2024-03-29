# Changelog

## [2022-11-14] (["HACK WEEK"](https://mcndt.dev/posts/hack-week-november-2022/))

- feat: ✨ Support for showing file title as note title in web viewer.

## [2022-11-13] (["HACK WEEK"](https://mcndt.dev/posts/hack-week-november-2022/))

- security: 🔐 Can now decrypt GCM-encrypted notes from Quickshare plugin versions 1.0.2 and higher.

## [2022-09-11]

- fix: 🐛 Fix inline code showing the backtick syntax after rendering.

## [2022-08-23]

- feat: ✨ Footnotes are rendered as they are in the Obsidian client.

## [2022-08-16]

- fix: 🐛 Fix highlights not rendering correctly when mixed with other formatting. ([issue #19](https://github.com/mcndt/noteshare.space/issues/19))
- fix: 🐛 Fix some characters escaping the rendering for #tags. ([issue #10](https://github.com/mcndt/noteshare.space/issues/10))

## [2022-08-11]

- feat: ✨ Users receive a unique error page when opening expired notes vs. wrong URL. ([issue #11](https://github.com/mcndt/noteshare.space/issues/11))

## [2022-08-07]

- fix: 🐛 collapsed/uncollapsed callout syntax now correctly renders as a callout block instead of a block quote.
- fix: 🐛 text highlights (`==highlight==` syntax) are now more legibile in dark mode.
- fix: 🐛 code blocks no longer render as "undefined" for unregistered languages (e.g. Dataview or Toggl query blocks).

## [2022-08-06]

- feat: ✨ Added a changelog page.
- feat: ✨ Added syntax highlighting for code blocks in the 36 most common languages (see [highlight.js](https://highlightjs.org/download/) for the full list).
