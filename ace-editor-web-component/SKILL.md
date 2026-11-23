---
name: ace-editor-web-component
description: Display or edit source code with syntax highlighting in an HTML page using the <ace-editor> web component (Ace Editor wrapper, loaded from CDN, no build step, no npm package). Use when a page needs highlighted code blocks or an in-page code editor, or when existing <ace-editor> elements must be read or updated from JavaScript (change content, change language, use in a form, wait for initialization, avoid duplicate ids).
---

# `<ace-editor>` web component

A custom element that wraps [Ace Editor](https://ace.c9.io/). It loads Ace asynchronously (once per page, no matter how many editors are rendered), auto-sizes to its content, wraps long lines, takes part in forms, and exposes a small textarea-like API.

- Full documentation and live demos: https://stopsopa.github.io/ace-editor-webcomponent/learning/008_ace_async_loader/dynamic.html
- Source of the component (single file): https://stopsopa.github.io/ace-editor-webcomponent/ace-web-component.js

## 1. Installation (CDN, one script tag)

Add this **once** per page, preferably in `<head>`:

```html
<script
  type="module"
  src="https://stopsopa.github.io/ace-editor-webcomponent/ace-web-component.js"
  data-main-ace="https://cdnjs.cloudflare.com/ajax/libs/ace/1.43.3/ace.min.js"
></script>
```

- `src` registers the `<ace-editor>` custom element. `type="module"` is required.
- `data-main-ace` tells the component where the main Ace script is. It is required. Modes and themes are fetched by Ace from the same location on demand.
- There is no npm package and nothing to install. The only project-specific file is `ace-web-component.js`; it can be used from the URL above or copied into the project and referenced locally.
- `data-main-ace` may point to any publicly available Ace build. Use the cdnjs URL above by default; the user will change it by hand if they want something else. Known alternatives:
  - `https://cdn.jsdelivr.net/npm/ace-builds@1.43.4/src-min-noconflict/ace.js`
  - `https://stopsopa.github.io/ace-editor-webcomponent/noprettier/ace/ace-builds-1.43.4/src-min-noconflict/ace.js`
- Do not add a separate `<script>` for Ace itself, and do not repeat the tag above per editor. If Ace is already on the page (`window.ace`), the component uses it and does not load it again.
- With a bundler (no script tag to carry `data-main-ace`), import the module and call the exported `setDataMainAce(url)` before any `<ace-editor>` is connected to the DOM. `setDataMainAce` wins over the attribute.

## 2. Basic usage

```html
<ace-editor lang="javascript">
  <script type="ace">
    function greet(name) {
        console.log("Hello, " + name + "!");
    }

    greet("World");
  </script>
</ace-editor>
```

Put the code between `<script type="ace">` and `</script>` and choose the language with `lang`.

- Always prefer the `<script type="ace">` form. Code placed directly between `<ace-editor>` tags also works, but formatters such as Prettier will reflow it, and the HTML parser will interpret any `<` and `&` in it.
- Common indentation is removed automatically, together with the line break after the opening tag and the whitespace-only line before the closing tag, so the code can be indented to match the surrounding HTML. Add `data-notrim` to keep it exactly as written.
- If the code itself contains a closing script tag, write it as `&lt;/script>`. Inside `<script type="ace">` `&lt;` is decoded to `<` (only this one entity); add `data-nolt` to switch that decoding off.
- The editor is editable by default. For display-only code blocks add `readonly`.
- Do not set `theme` unless the user asks for it. Leave the default.

### Attributes

| Attribute          | Default                       | Notes                                                                                                                                                                                              |
| ------------------ | ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`               | auto-generated `ace-editor-N` | Must be unique. See section 6.                                                                                                                                                                     |
| `lang`             | `javascript`                  | Ace mode name: `python`, `typescript`, `html`, `css`, `json`, `sh`, `text` (no highlighting), ... Full list: https://github.com/ajaxorg/ace/blob/v1.43.4/src/ext/modelist.js#L72                   |
| `value`            | empty                         | Editor content, used exactly as given. Overrides `<script type="ace">` and text content.                                                                                                           |
| `readonly`         | off                           | Boolean attribute. Stops the user from editing; JavaScript can still change the content.                                                                                                           |
| `theme`            | `idle_fingers`                | Leave the default unless asked.                                                                                                                                                                    |
| `tab-size`         | `4`                           | Tab size in spaces.                                                                                                                                                                                |
| `min-height-lines` | none                          | Minimum height in lines.                                                                                                                                                                           |
| `min-height-px`    | none                          | Minimum height in pixels. Wins if both are set.                                                                                                                                                    |
| `name`             | none                          | Name under which the content is submitted with a `<form>`. See section 4.                                                                                                                          |
| `data-eval`        | off                           | Runs the initial content as a script after the editor is initialized (`data-eval="module"` for an ES module). Only for code written by the page author: whatever is in the editor at start is run. |

`value`, `lang`, `theme`, `readonly`, `tab-size` and the min-height attributes can be changed at any time. Removing `lang` or `theme` returns to the default. `data-notrim`, `data-nolt`, `data-eval` and `content` are read once, when the editor initializes.

Initial content priority: `.value` property assigned from JavaScript, then `value` attribute, then `<script type="ace">`, then plain text content, then `content` attribute.

`js`, `ts` and `bash` are accepted as short names for `javascript`, `typescript` and `sh`.

Long lines are always wrapped; there is no attribute to switch wrapping off.

## 3. Interacting from JavaScript

Get the element like any other DOM node. Give it an explicit `id` when you need to reach it from JavaScript:

```js
const editor = document.getElementById("my-editor");
```

### Change content and language

```js
editor.setAttribute("lang", "python");
editor.value = `# Python Example
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`;
```

- Content: `editor.value = "..."` or `editor.setAttribute("value", "...")`. Both do the same thing: they work on a `readonly` editor, they do not fire the `input` event, and they do nothing when the new content equals the current one (cursor stays where it is).
- Assigning content is safe at any time, also before the editor has initialized: the value is kept and shown when the editor is ready.
- `theme`, `readonly` (`setAttribute("readonly", "")` / `removeAttribute("readonly")`), `tab-size` and the min-height attributes are changed with `setAttribute` too.

### Read content

```js
const code = editor.value;
```

Reading needs the component script to have run. See section 5 for when that matters.

### Listen for user edits

```js
editor.addEventListener("input", (e) => {
  console.log(e.target.value);
});
```

- `input` fires once for every edit made by the user. It does not fire when content is set from JavaScript (same as a native textarea).
- `change` fires when the editor loses focus and its content differs from what it was when it got focus (same as a native textarea).

### Focus

`editor.focus()` puts the cursor into the editor.

### Native Ace instance

`editor.getEditor()` returns the underlying Ace editor for anything the component does not expose (search, cursor, selection, options). It is `null` until the editor has initialized; see section 5.

## 4. Forms

Inside a `<form>` the editor behaves like a `<textarea>`:

```html
<form method="post" action="/save">
  <label for="code">Code</label>
  <ace-editor id="code" name="code" lang="javascript">
    <script type="ace">
      console.log("submitted with the form");
    </script>
  </ace-editor>
  <button type="submit">Save</button>
  <button type="reset">Reset</button>
</form>
```

- With a `name`, the content is submitted with the form and is included in `new FormData(form)`. Without `name` it is not submitted.
- `form.reset()` (or `<button type="reset">`) restores the initial content.
- Inside a disabled `<fieldset>` the editor is read-only and is not submitted.
- `<label for="id">` focuses the editor.
- There is no built-in `required` validation.

## 5. Async initialization: wait before reading or using the native editor

`<ace-editor>` is not ready when it appears in the HTML. Two things happen later: the component script runs (it is a module, so it runs after the whole page is parsed), and then Ace is downloaded and the editor is built.

What is safe and when:

| Action                         | Inline `<script>` in the page, running before the component script | After the component script has run, before the editor is built | After initialization |
| ------------------------------ | ------------------------------------------------------------------ | -------------------------------------------------------------- | -------------------- |
| `editor.value = "..."`         | safe                                                               | safe                                                           | safe                 |
| `editor.setAttribute(...)`     | safe                                                               | safe                                                           | safe                 |
| `editor.addEventListener(...)` | safe                                                               | safe                                                           | safe                 |
| read `editor.value`            | **`undefined`**                                                    | returns the content                                            | returns the content  |
| `editor.getEditor()`           | **not a function yet**                                             | `null`                                                         | Ace instance         |
| `editor.ready`                 | **`undefined`**                                                    | promise                                                        | promise              |

So: code that only **assigns** needs no waiting. Code that **reads** the content or uses the native editor must wait. The way that works from everywhere is the `onLoad` listener:

```html
<ace-editor id="snippet">
  <script type="ace">
    // Initial function
    function greet(name) {
      console.log("Hello, " + name);
    }
  </script>
</ace-editor>

<script>
  {
    const element = document.getElementById("snippet");

    element.addEventListener("onLoad", ({ component, editor, id }) => {
      // component: the <ace-editor> element, editor: native Ace instance
      component.value = component.value + '\nconsole.log("appended");';
      editor.gotoLine(1);
    });
  }
</script>
```

Facts about `onLoad`:

- It is safe to register at any time. If the editor is already initialized, the callback runs immediately. Treat it as "run this when the editor is ready".
- The callback argument has `component` (the web component), `editor` (the native Ace instance) and `id` directly on it, so it can be destructured as above.
- It can be registered many times; each callback runs once per initialization.
- An editor inside a `display: none` container (for example an inactive tab) does not initialize until it gets layout, so its `onLoad` callbacks run only then. `visibility: hidden` and `opacity: 0` do not delay it.
- The event name is exactly `onLoad`. `load` does not work.

### Promise alternative: `ready`

In module scripts and framework code (anything that runs after the component is defined) a promise is more convenient:

```js
const { component, editor, id } = await element.ready;
```

It resolves immediately when the editor is already initialized. If the code may run before the component script, wait for the definition first: `await customElements.whenDefined("ace-editor")`.

### Global alternative: `ready` event

`ready` is a bubbling `CustomEvent` fired once per editor when it is initialized. Listen on `document` to configure every editor in one place:

```js
document.addEventListener("ready", (event) => {
  if (event.target.tagName !== "ACE-EDITOR") return;
  const { component, editor, id } = event.detail;
});
```

Unlike `onLoad`, it is not replayed: the listener must be registered before the editors initialize, so put it ahead of the component's script tag. `aceOnLoad` is the older name of the same event and still works.

## 6. Unique ids

Every `<ace-editor>` must have an id that is unique among all editors on the page. The component enforces this.

- **No `id` given:** the component assigns `ace-editor-1`, `ace-editor-2`, and so on. This is the safest choice for editors that are never referenced from JavaScript.
- **`id` given:** it is used as-is and you are responsible for uniqueness.
- **Duplicate `id`:** the second editor does not render. It shows a "Duplicate ID Error" box in place of the editor and an error is thrown in the console.
- **Editor removed from the DOM:** its id is released and can be used by a new editor.

Rules to follow when generating code:

1. Omit `id` on editors that JavaScript never touches.
2. Add an explicit `id` whenever JavaScript needs the editor. Do not rely on the auto-generated `ace-editor-N` names; they depend on the order in which editors are created.
3. When rendering editors in a loop or from a template, build each id from a unique key of the item (for example `` `snippet-${item.id}` ``), never a fixed string.
4. When copying an example block that has an `id`, change the id in both the markup and the script that looks it up.
5. Do not use an id that already belongs to another element on the page.

An existing `<ace-editor>` can be moved to another place in the DOM (`newParent.appendChild(editor)`); it keeps its content and its Ace instance. An editor that was removed and is inserted again later comes back with the content it had.

## 7. Complete example

Two editors on one page (Ace is still downloaded only once): a read-only block with an auto-generated id, and an editable one that is updated from JavaScript.

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <script
      type="module"
      src="https://stopsopa.github.io/ace-editor-webcomponent/ace-web-component.js"
      data-main-ace="https://cdnjs.cloudflare.com/ajax/libs/ace/1.43.3/ace.min.js"
    ></script>
  </head>
  <body>
    <ace-editor lang="json" readonly>
      <script type="ace">
        {
          "name": "example",
          "version": "1.0.0"
        }
      </script>
    </ace-editor>

    <ace-editor id="playground" lang="javascript">
      <script type="ace">
        console.log("Hello, World!");
      </script>
    </ace-editor>

    <button id="to-python">Switch to Python</button>
    <pre id="output"></pre>

    <script>
      const editor = document.getElementById("playground");
      const output = document.getElementById("output");

      // Reading has to wait for the component
      editor.addEventListener("onLoad", ({ component }) => {
        output.textContent = component.value;
      });

      // User edits
      editor.addEventListener("input", (e) => {
        output.textContent = e.target.value;
      });

      // Change language and content
      document.getElementById("to-python").addEventListener("click", () => {
        editor.setAttribute("lang", "python");
        editor.value = 'print("Hello, World!")';
        output.textContent = editor.value;
      });
    </script>
  </body>
</html>
```

## Checklist

- One loader script tag per page, with `type="module"` and `data-main-ace`.
- Code goes inside `<script type="ace">`, language in `lang`, no `theme` override.
- `readonly` for display-only blocks.
- `name` on editors whose content should be submitted with a form.
- Explicit, unique `id` only where JavaScript needs the editor.
- Assigning `.value` and attributes needs no waiting. Every read of `.value` and every call to `.getEditor()` from an inline script sits inside `editor.addEventListener("onLoad", ...)` (or after `await editor.ready` in module code).
- `input` does not fire for changes made from JavaScript; update dependent UI yourself after assigning `.value`.
