import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.35-alpha/deno-dom-wasm.ts";
import { NodeHtmlMarkdown } from "https://esm.sh/node-html-markdown@1.3.0";
import { Readability } from "https://esm.sh/@mozilla/readability@0.4.4";
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { renderMarkdown } from "./markdown.ts";

const port = 8080;

const mainPage = `
# MDSite

Render URLs as Markdown.

## Usage

1. Type \`https://mdsite.deno.dev/https://example.com\` in your browser.
2. Enjoy the rendered Markdown.

You can also get the raw Markdown by appending \`?raw\` to the URL.
`;

function status(code: number, message: string): Response {
  return new Response(JSON.stringify({ message }), {
    status: code,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function markdown(markdown: string): Response {
  return new Response(renderMarkdown(markdown), {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);

  if (url.pathname === "/") {
    return markdown(mainPage);
  }

  const requestedURL = url.pathname.slice(1);

  const response = await fetch(requestedURL);

  if (!response.ok) {
    return status(response.status, response.statusText);
  }

  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  if (!doc) {
    return status(500, "Unable to parse HTML");
  }

  const reader = new Readability(doc as unknown as Document);
  const article = reader.parse();

  if (!article) {
    return status(500, "Unable to parse article");
  }

  const renderedMarkdown = NodeHtmlMarkdown.translate(article.content);

  if (url.searchParams.has("raw")) {
    return new Response(renderedMarkdown, {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  }

  return markdown(`# ${article.title}
${renderedMarkdown}`);
};

await serve(handler, { port });
