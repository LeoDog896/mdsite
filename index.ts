import { DOMParser, type HTMLDocument, Element } from "https://deno.land/x/deno_dom@v0.1.35-alpha/deno-dom-wasm.ts";
import { NodeHtmlMarkdown } from "https://esm.sh/node-html-markdown@1.3.0";
import { Readability } from "https://esm.sh/@mozilla/readability@0.4.4";
import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { renderMarkdown } from "./markdown.ts";

const port = 8080;
const base = Deno.env.get("BASE") ?? `http://localhost:${port}/`;

const mainPage = (await Deno.readTextFile("./assets/index.md")).replaceAll("{{base}}", base);

const mainPageMixin = (await Deno.readTextFile("./assets/index-mixin.html")).replace("{{base}}", base);

function status(code: number, message: string): Response {
  return new Response(JSON.stringify({ message }), {
    status: code,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function markdown(markdown: string, mixin?: string): Response {
  return new Response(renderMarkdown(markdown, mixin), {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}

function safeURL(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function rebaseLinks(document: HTMLDocument, url: URL) {
  const links = document.querySelectorAll("a");

  for (const link of links) {
    if (!(link instanceof Element)) {
      continue;
    }

    const l = link as Element;
    
    const href = l.getAttribute("href");

    if (!href) {
      continue;
    }

    const url = safeURL(href);

    if (!url) {
      continue;
    }

    if (url.origin === base) {
      continue;
    }

    l.setAttribute("href", `${base}${url}`);
  }

  const images = document.querySelectorAll("img");
  
  for (const image of images) {
    // set the src of image's URL's base to the base of the requested URL
    if (!(image instanceof Element)) {
      continue;
    }

    const i = image as Element;

    const src = i.getAttribute("src");

    if (!src) {
      continue;
    }

    if (src.startsWith("http")) {
      continue;
    }

    i.setAttribute("src", new URL(src, url).href);
  }
}

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);

  // main page
  if (url.pathname === "/") {
    return markdown(mainPage, mainPageMixin);
  }

  const requestedURL = safeURL(url.pathname.slice(1));

  if (!requestedURL) {
    return status(400, "Invalid URL");
  }

  const response = await fetch(requestedURL);

  if (!response.ok) {
    return status(response.status, response.statusText);
  }

  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  if (!doc) {
    return status(500, "Unable to parse HTML");
  }

  if (!url.searchParams.has("no-rebase")) {
    rebaseLinks(doc, requestedURL);
  }

  const reader = new Readability(doc as unknown as Document);
  const article = reader.parse();

  if (!article) {
    return status(500, "Unable to parse article");
  }

  if (url.searchParams.has("html")) {
    return new Response(article.content, {
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  }

  const renderedMarkdown = NodeHtmlMarkdown.translate(article.content);

  if (url.searchParams.has("raw")) {
    return new Response(`# ${article.title}\n
${renderedMarkdown}`, {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  }

  return markdown(`# ${article.title} ([original](${requestedURL})) ([raw](?raw))\n\n
${renderedMarkdown}`);
};

await serve(handler, { port });
