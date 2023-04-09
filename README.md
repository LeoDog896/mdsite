# [mdsite](https://mdsite.deno.dev/)

Render URLs as Markdown. Deployed on [Deno Deploy](https://deno.com/deploy).

## Usage

1. Type
   [`https://mdsite.deno.dev/https://example.com`](https://mdsite.deno.dev/https://example.com)
   in your browser.
2. Enjoy the rendered Markdown.

## Queries

- Appending `?raw` to the URL will return the raw Markdown.
- Appending `?html` to the URL will return the raw HTML.
- Appending `?no-redirect` to the URL will return the the page without
  redirecting to itself.

You can use any combination of these queries.

## Regressions

This project uses a combination of 3 different libraries to render Markdown:

- [deno-dom](https://deno.land/manual@v1.25.4/jsx_dom/deno_dom)
- [node-html-markdown](https://github.com/crosstype/node-html-markdown)
- [Readability](https://github.com/mozilla/readability)

Most regressions are caused by Readability. If you're unsure what library caused
the regression, open an issue here and I'll redirect it to the correct library.
