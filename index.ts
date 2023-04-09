import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.35-alpha/deno-dom-wasm.ts";
import { Readability } from "https://esm.sh/@mozilla/readability@0.4.4";
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { renderMarkdown } from "./markdown.ts";

const port = 8080;

const mainPage = `
# MDSite

Render URLs as Markdown.
`

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);

  if (url.pathname === "/") {
    return new Response(renderMarkdown(mainPage), {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  }

  const requestedURL = url.pathname.slice(1);

  const response = await fetch(requestedURL);

  if (!response.ok) {
    return new Response("Not found", { status: 404 });
  }

  const contentType = response.headers.get("content-type");

  if (!contentType) {
    return new Response("Not found", { status: 404 });
  }

  if (contentType.includes("text/html")) {
    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    
    if (!doc) {
      return new Response("Not found", { status: 404 });
    }

    const reader = new Readability(doc as unknown as Document);
    const article = reader.parse();

    if (!article) {
      return new Response("Not found", { status: 404 });
    }

    return new Response(renderMarkdown(`# ${article.title}
${article.content}`), {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });

  } else if (contentType.includes("text/markdown")) {
    const markdown = await response.text();
    return new Response(renderMarkdown(markdown), {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });

  }

  return new Response("Not found", { status: 404 });
};

await serve(handler, { port });
