import { CSS, render } from "https://deno.land/x/gfm@0.2.1/mod.ts";

export interface Options {
  disableHtmlSanitization?: boolean;
  description?: string;
  title?: string;
}

export function renderMarkdown(markdown: string, options?: Options) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${options?.title ?? "Markdown"}</title>
    <meta name="description" content="${options?.description ?? ""}">
    <style>
    main {
        max-width: 800px;
        margin: 0 auto;
    }
    ${CSS}
    </style>
</head>
<body>
    <main data-color-mode="light" data-light-theme="light" data-dark-theme="dark" class="markdown-body">
        ${
    render(markdown, {
      disableHtmlSanitization: options?.disableHtmlSanitization,
    })
  }
    </main>
</body>
</html>
        `;
}
