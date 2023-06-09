# MDSite

Render URLs as Markdown.

<input type="text" id="url" placeholder="https://example.com" style="width: 100%; font-size: 1.5rem; padding: 0.5rem; margin-bottom: 1rem; border: 1px solid #ccc; border-radius: 0.25rem;">
<button id="submit" style="width: 100%; font-size: 1.5rem; padding: 0.5rem; margin-bottom: 1rem; border: 1px solid #ccc; border-radius: 0.25rem; background-color: #eee; cursor: pointer;">Render</button>

<script defer>
    const url = document.getElementById("url");
    const submit = document.getElementById("submit");

    submit.addEventListener("click", () => {
        window.location.href = `{{base}}${url.value}`;
    });

    url.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            submit.click();
        }
    });
</script>

## Usage

1. Type [`{{base}}https://example.com`]({{base}}https://example.com) in your
   browser.
2. Enjoy the rendered Markdown.

## Queries

- Appending `?raw` to the URL will return the raw Markdown.
- Appending `?html` to the URL will return the raw HTML.
- Appending `?no-rebase` to the URL will return the the page without redirecting
  to itself.

You can use any combination of these queries:
[https://example.com?raw&no-rebase]({{base}}https://example.com?raw&no-rebase)

## Source

The source code is available on [GitHub](https://github.com/LeoDog896/mdsite).
If you want to support this project, please consider starring it.
