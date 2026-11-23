# Suggested changes

Review of the whole repository: the `<ace-editor>` component (`ace-web-component.js`), its typings, the React demo (`ace-editor/`), the documentation page (`learning/008_ace_async_loader/dynamic.html`), the lessons, the dev server and the project docs.

Nothing in the project was changed. This file only lists findings.

## Status

The plan below was executed. This table says what was done for each finding. The findings themselves are left as they were written, as a record of the state before the changes.

| ID  | Status  | Notes                                                                                                                                                                                                                                                                                                         |
| --- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | done    | Form-associated: `name`, `FormData`, `form.reset()`, disabled `<fieldset>`, `<label for>`, state restore. No `required` validation. Form example added to `dynamic.html`.                                                                                                                                     |
| A2  | done    | `value` attribute updates a read-only editor. The optional focus-based protection (step 3) was not added.                                                                                                                                                                                                     |
| A3  | done    |                                                                                                                                                                                                                                                                                                               |
| A4  | done    | The optional `&amp;lt;` decoding (step 4) was not added.                                                                                                                                                                                                                                                      |
| A5  | partly  | Assigning `.value` now works at any time, and reading works as soon as the component script has run. Reading from an inline script that runs **before** the component script still gives `undefined`: the element is not upgraded yet, and no component code can change that. The docs now say so.            |
| A6  | done    |                                                                                                                                                                                                                                                                                                               |
| A7  | done    | One `input` per user edit, none for programmatic changes (attribute or property). `change` event added.                                                                                                                                                                                                       |
| A8  | done    | Also added the `tab-size` attribute. No `mode` alias for `lang`.                                                                                                                                                                                                                                              |
| B1  | done    | A moved editor keeps its Ace instance. A removed and re-inserted editor comes back with its content.                                                                                                                                                                                                          |
| B2  | done    | `id` changes after connect are still not tracked (optional step 4).                                                                                                                                                                                                                                           |
| B3  | done    |                                                                                                                                                                                                                                                                                                               |
| B4  | done    | Kept the component's own height calculation (not `maxLines`).                                                                                                                                                                                                                                                 |
| B5  | done    | Shared `adoptedStyleSheets`, one page-wide observer.                                                                                                                                                                                                                                                          |
| B6  | done    |                                                                                                                                                                                                                                                                                                               |
| B7  | changed | Added the `ready` promise and the `ready` event. `onLoad` was **not** deprecated: it is the only way that also works from an inline script running before the component script. Its listeners now always get an event with `component`, `editor`, `id` on it. `aceOnLoad` kept as an older name.              |
| B8  | done    | All ten items. Console logging is now off unless `data-debug` is on the script tag or `window.ACE_WEB_COMPONENT_DEBUG = true`.                                                                                                                                                                                |
| C1  | done    | Verified with `tsc -b` against React 19. New CI workflow `.github/workflows/typecheck.yml`.                                                                                                                                                                                                                   |
| C2  | partly  | Lockfile regenerated from the public registry, symlink replaced by a direct import, `link.sh` removed, README rewritten, build passes. Still two package managers (yarn in the root, npm in `ace-editor/`). The old lockfile with the private host name is still in the git history.                          |
| D1  | done    |                                                                                                                                                                                                                                                                                                               |
| D2  | done    |                                                                                                                                                                                                                                                                                                               |
| D3  | done    | `learning/007_async_script_loading/index.html` added, landing page updated, `server.js` serves `index.html` for folders.                                                                                                                                                                                      |
| D4  | done    | The "Async Initialization Pitfall" section was rewritten (see A5 and B7).                                                                                                                                                                                                                                     |
| D5  | done    | `CLAUDE.md` rewritten from the code. `src` and `wrap` attributes were removed from the docs, not implemented. `SKILL.md` updated.                                                                                                                                                                             |
| D6  | partly  | Done: items 1-4 and 7-11. `cookie-parser` is no longer used but is still listed in `package.json`, because `yarn.lock` could not be regenerated here. **Not done:** items 5 and 6 (`.claude/settings.json`, `.claude/config.json`): they change what the AI agent is allowed to do, so they are left for you. |

## How to read this file

Every finding has the same four parts:

- **Problem** – what is wrong, in one or two sentences.
- **Details** – where it is and what exactly happens.
- **Why it happens** – the logic that produces the behaviour.
- **Fix plan** – what to change, step by step.

**Severity**: `High` = wrong data, a crash, or a page that does not work. `Medium` = wrong behaviour in a realistic situation. `Low` = inconsistency, dead code, cosmetics.

**Checked** says how sure the finding is:

- `browser` – reproduced in headless Chrome against the local Ace 1.43.4 build, with a throw-away test page outside the repository.
- `read` – found by reading the code; not executed.

The TypeScript findings (C1, C2 part 3) are `read` only: I could not install the React demo's dependencies to run `tsc` (see C2 for the reason).

## Summary

| ID  | Finding                                                                          | Severity | Checked |
| --- | -------------------------------------------------------------------------------- | -------- | ------- |
| A1  | The editor does not take part in HTML forms                                      | High     | browser |
| A2  | `value` attribute is ignored while the editor is `readonly`                      | High     | browser |
| A3  | `<script type="ace">` content gets an empty first and last line                  | Medium   | browser |
| A4  | Indentation removal and `&lt;` decoding are applied to the wrong sources         | High     | browser |
| A5  | `.value` set before the component is ready is lost, or breaks `.value` for good  | High     | browser |
| A6  | `.value = x` always rewrites the editor and resets the cursor                    | Medium   | browser |
| A7  | `input` event: fired twice per keystroke, and with an empty value on updates     | Medium   | browser |
| A8  | `lang` / `theme`: removing the attribute loads `null`; short names only at start | Medium   | browser |
| B1  | Moving or re-attaching an `<ace-editor>` throws and leaves it dead               | High     | browser |
| B2  | Removing a rejected duplicate frees the id of the valid editor                   | Medium   | browser |
| B3  | Editors inside `visibility: hidden` / `opacity: 0` never initialise              | High     | browser |
| B4  | Height is not recalculated when the width changes                                | Medium   | browser |
| B5  | Ace styles are copied into every editor again and again                          | Medium   | browser |
| B6  | Loader: dead `currentScript` code, no reuse of existing Ace, endless polling     | Medium   | read    |
| B7  | `onLoad` is not a real event and behaves differently from every other event      | Medium   | browser |
| B8  | Smaller component issues (focus, error box, CSS comments, dead fields, ...)      | Low      | mixed   |
| C1  | `ace-web-component.d.ts` does not match the component                            | Medium   | read    |
| C2  | React demo cannot be installed or built from a fresh clone                       | High     | mixed   |
| D1  | Lesson 008 (`index.html`) is broken: nothing loads                               | High     | browser |
| D2  | Lesson 007 "load once" pattern loads the dependency twice                        | Medium   | browser |
| D3  | Broken links and lesson numbering that differs between files                     | Medium   | read    |
| D4  | `dynamic.html`: invalid `<head>`, theme selector out of sync, smaller mismatches | Medium   | browser |
| D5  | `CLAUDE.md` describes an API and a repository that do not exist                  | Medium   | read    |
| D6  | Server and tooling leftovers                                                     | Low      | read    |

A suggested order of work is at the end of the file.

---

# Part A – Content and form data handling

These are the findings where what you put into the editor is not what you get out of it.

## A1. The editor does not take part in HTML forms

**Severity:** High · **Checked:** browser

**Problem.** The project describes `<ace-editor>` as usable "as easily as any standard input or textarea", but inside a `<form>` it submits nothing. A form with an editor in it silently loses the code.

**Details.** Test: `<form><input name="title" value="t"><ace-editor name="code" value="payload"></ace-editor></form>`. `new FormData(form)` contains only `title`. The same is true for a normal form submit. In addition:

- `name`, `required` and `disabled` attributes do nothing.
- `form.reset()` does not restore the editor.
- Browser back/forward form restore does not restore the editor.
- `<label for="editor-id">` does not focus the editor.
- There is no `change` event (see A7), which form libraries listen to.

**Why it happens.** A custom element is ignored by forms unless it declares itself form-associated and reports its value through `ElementInternals`. The component does neither (`ace-web-component.js:210-222`).

**Fix plan.**

1. Declare the element form-associated and keep an internals object:
   ```js
   static formAssociated = true;
   #internals;
   constructor() {
     super();
     this.#internals = this.attachInternals();
   }
   ```
2. Report the value every time it can change: after the initial content is set, inside the session `change` handler, and in the `value` setter:
   ```js
   this.#internals.setFormValue(this.value);
   ```
3. Add the form callbacks:
   - `formResetCallback()` – restore the initial content (keep it in a private field at init).
   - `formDisabledCallback(disabled)` – `editor.setReadOnly(disabled || this.hasAttribute("readonly"))`.
   - `formStateRestoreCallback(state)` – `this.value = state`.
4. Add `name` and `form` getters (`this.getAttribute("name")`, `this.#internals.form`), and optionally `required` with `this.#internals.setValidity(...)`.
5. The form value must be correct even before Ace has loaded, otherwise a quick submit sends an empty string. This needs the "pending value" change from A5, so do A5 first.
6. Add a form example to `dynamic.html` and a "Forms" section to `ace-editor-web-component/SKILL.md`.

## A2. `value` attribute is ignored while the editor is `readonly`

**Severity:** High · **Checked:** browser

**Problem.** A read-only editor is the normal way to display code. But when the editor is `readonly`, changing the `value` attribute does not change what is shown.

**Details.** Test: `<ace-editor readonly value="old">`, then `setAttribute("value", "NEW")`. The attribute is `NEW`, the editor still shows `old`. The new text appears only when `readonly` is removed. You can see it on the demo page: tick "Readonly", type in the textarea, and the live preview stops following while the "HTML Usage Example" panel shows the new text.

**Why it happens.** `attributeChangedCallback` stores the new value in `_pendingValue` and returns when `editor.getReadOnly()` is true (`ace-web-component.js:736-741`). The value is applied later, when `readonly` is removed (`:763-774`). `readonly` is meant to stop the _user_ from editing; here it also stops the _page_. This looks like a mix-up with the pattern in `CLAUDE.md` ("skip updates while the editor has **focus**"), where the reason is to not disturb a user who is typing. A read-only editor has no typing user.

The `.value` property does the opposite: it writes immediately, even when read-only (`:841-857`). So the two ways of setting content disagree. This also depends on the React version: React 19 sets `value` as a property when the element is already defined, React 18 and older set it as an attribute. The same JSX therefore behaves differently.

**Fix plan.**

1. Remove the `readonly` check and the `_pendingValue` mechanism from `attributeChangedCallback` and from the `readonly` branch.
2. Route both the attribute and the property through one private method, for example `#applyValue(text)`, so they can never disagree (A6 and A7 use the same method).
3. If protection of a typing user is wanted, base it on focus, not on `readonly`: when the editor has focus and is _not_ read-only, keep the incoming value and apply it on `blur`. In a React controlled setup this is rarely needed, because the echoed value equals the editor content and is skipped by the equality check.
4. Update the comparison table in `SKILL.md` (row "On a `readonly` editor") and the "Key Takeaway" text in `dynamic.html`.

## A3. `<script type="ace">` content gets an empty first and last line

**Severity:** Medium · **Checked:** browser

**Problem.** Every editor filled from `<script type="ace">` starts with an empty line and ends with an extra empty line that the author did not write.

**Details.** Test markup:

```html
<ace-editor
  ><script type="ace">
    foo
    bar
  </script></ace-editor
>
```

`.value` is `"\nfoo\nbar\n"`, not `"foo\nbar"`. On the demo page `#programmatic-demo` has the value `"\n// Original content\nconsole.log(\"Hello, World!\");\n"`. Every editor is two lines taller than its code, and code that is saved or evaluated carries the extra lines.

**Why it happens.** The text of the script element starts right after `<script type="ace">`, so it begins with the line break that follows the tag, and it ends with the indentation before `</script>`. The component removes the common indentation (`:569-596`) but never removes these two outer lines. The opt-out attribute is called `data-notrim`, which suggests trimming was intended.

**Fix plan.**

1. After the indentation step, for static sources only (script tag and text content), remove one leading line break and the trailing whitespace-only line:
   ```js
   text = text.replace(/^[ \t]*\r?\n/, "").replace(/\r?\n[ \t]*$/, "");
   ```
2. Keep it behind `data-notrim`, same as the indentation removal.
3. Remove only **one** leading line, so an author can still start with a deliberate empty line.
4. Check the demos on `dynamic.html` that depend on line numbers ("Go to Line 11", "Highlight Lines 5-8"): the numbers shift by one.

## A4. Indentation removal and `&lt;` decoding are applied to the wrong sources

**Severity:** High · **Checked:** browser

**Problem.** Two clean-up steps exist to make hand-written HTML convenient. They are also applied to content that comes from JavaScript or from an attribute, where they silently change the data.

**Details.** Three separate cases:

1. **`value` attribute loses indentation.** `<ace-editor value="    indented\n    more">` shows `indented\nmore`. If the same text is set later with `setAttribute`, the indentation is kept. So the result depends on _when_ the value arrives. For a form this is data corruption: load an indented YAML or Python fragment, change nothing, save, and the indentation is gone. In React the state says `"    x"` and the editor says `"x"`.
2. **`.value` set before initialisation is decoded and loses indentation.** `el.value = "    a &lt; b"` before the editor is ready ends up as `a < b`. After initialisation the same assignment is stored unchanged.
3. **Plain text content is decoded twice.** `<ace-editor>a &amp;lt; b</ace-editor>`: the HTML parser already turns it into `a &lt; b`, then the component turns that into `a < b`. There is no way to show the literal text `&lt;` this way.

**Why it happens.**

- The indentation block (`:569-596`) sits after the `if / else` that picks the source, so it runs for every source, including the `value` attribute.
- The decoding (`:564-566`) is inside the `else` branch, which is meant for "static content". But `this.initialContent` can already hold a value assigned through the property setter (`:859`), and that goes through the same branch.
- Decoding is only needed for `<script>` content, because the parser treats it as raw text. Text content and attribute values are already decoded by the parser.

**Fix plan.**

1. Resolve the initial content in one function that returns the text **and** its source: `"property"`, `"value-attribute"`, `"script"`, `"text"`, `"content-attribute"`.
2. Apply the steps by source:

   | Source              | Decode `&lt;` | Remove indentation / trim (A3) |
   | ------------------- | ------------- | ------------------------------ |
   | property (`.value`) | no            | no                             |
   | `value` attribute   | no            | no                             |
   | `<script>` child    | yes           | yes                            |
   | text content        | no            | yes                            |
   | `content` attribute | no            | no                             |

3. Fix the comments so they describe what the code does. The JSDoc of `unescapeHtmlEntities` (`:73-78`) and the class comment (`:202-205`) say `&gt;`, `&amp;`, `&quot;` and `&#39;` are decoded. Only `&lt;` is (`:80-88`). `SKILL.md` is already correct.
4. Optional: also decode `&amp;lt;` to `&lt;` inside `<script type="ace">`, so the literal text `&lt;` can be written there.

## A5. `.value` set before the component is ready is lost, or breaks `.value` for good

**Severity:** High · **Checked:** browser

**Problem.** Writing to `.value` early has three different outcomes depending on timing. Two of them lose data, and one leaves the element permanently broken.

**Details.**

1. **Before the component script has run** (a normal inline `<script>` right after the element, which is exactly what the "Async Initialization Pitfall" demo on `dynamic.html` does): the assignment creates a plain property on the not-yet-upgraded element. This plain property hides the component's getter and setter forever. Test result: after everything has loaded, `el.value = "set after init"` does not reach the editor (it still shows the markup content), and reading `el.value` returns the stale string instead of the editor content. The documentation says the early write is "thrown away". In reality every later read and write on that element is wrong.
2. **After the script ran, before Ace is ready, with markup content**: the value is stored in `initialContent` and then overwritten by the `<script type="ace">` content (`:531-559`).
3. **Same, without markup content**: the value is used, but changed as described in A4.

Reading has the same gap: `.value` returns `""` until Ace is ready (`:825-827`), although the content is already known.

**Why it happens.**

- Case 1 is the standard "property set before upgrade" trap of custom elements. The component has no upgrade step for it.
- Cases 2 and 3: the setter stores into the same field (`initialContent`) that the markup lookup later overwrites, so an explicit assignment has the lowest priority instead of the highest.

**Fix plan.**

1. Add the upgrade step and call it for `value` at the start of `connectedCallback`:
   ```js
   #upgradeProperty(prop) {
     if (Object.prototype.hasOwnProperty.call(this, prop)) {
       const v = this[prop];
       delete this[prop]; // remove the plain property
       this[prop] = v;    // run the real setter
     }
   }
   ```
2. Give the setter its own private field, for example `#pendingValue`. When it is set before the editor exists, it wins over every markup source and is used unchanged (matches the table in A4).
3. Make the getter return, in this order: the editor content, else `#pendingValue`, else the content resolved from the markup. Then `editor.value + "..."` works at any time.
4. With 1-3 the "Async Initialization Pitfall" disappears. Rewrite that section of `dynamic.html` and section 4 of `SKILL.md`: `onLoad` is then needed only for `getEditor()`, not for `.value`.

## A6. `.value = x` always rewrites the editor and resets the cursor

**Severity:** Medium · **Checked:** browser

**Problem.** Assigning the same text that the editor already contains should do nothing. It rewrites the whole document and moves the cursor to the start.

**Details.** Test: cursor at line 2, column 3, then `el.value = el.value`. Cursor is at line 1, column 0 afterwards. The selection and scroll position are lost too.

**Why it happens.** The setter compares against `this.editor.value` (`:846`). An Ace editor has no `value` property, so this is always `undefined`, the comparison is always "different", and `setValue` always runs. The attribute path uses the correct `this.editor.getValue()` (`:746`). The same mistake is in the reference snippet in `CLAUDE.md` ("Editor Update Management": `const editorContent = editor.value;`).

**Fix plan.**

1. Use `this.editor.getValue()` in the setter. Best: delete the duplicated logic and call the shared `#applyValue()` from A2.
2. Fix the snippet in `CLAUDE.md`.
3. Reset `_isProgrammaticChange` right after `setValue` instead of inside `setTimeout(..., 0)` (`:855-857`). Ace fires its change event synchronously, so the flag does not need to stay on until the next tick.

## A7. `input` event: fired twice per keystroke, and with an empty value on updates

**Severity:** Medium · **Checked:** browser

**Problem.** The `input` event is the only way to follow edits, and it does not behave like the `input` event of a textarea, although the documentation says it does.

**Details.**

1. **Two events per typed character.** Typing `a` produces two `input` events on `<ace-editor>`: the component's own `Event`, and the browser's native `InputEvent` from Ace's hidden textarea. Deleting with Backspace produces only one. So a listener cannot count events, and anything expensive (validation, autosave) runs twice per character.
2. **An event with an empty value on every attribute update.** `setAttribute("value", "new value")` fires two `input` events. The first one reports `e.target.value === ""`, the second reports `"new value"`. An autosave or validation listener sees an empty document for a moment. The height is also recalculated twice (collapse, then grow).
3. **Attribute and property disagree.** `setAttribute("value", ...)` fires `input`, `.value = ...` does not. A native textarea fires it for neither.
4. **No `change` event.** `CLAUDE.md` promises `change` with `event.detail.value`. It does not exist.

**Why it happens.**

1. Native `input` events are "composed": they cross the shadow boundary and arrive at the host element. The component adds its own event on top (`:638-646`). Backspace is handled by Ace on `keydown` without a native `input`, which is why it is single.
2. Ace's `setValue` is implemented as "remove everything, then insert". That is two change events. The attribute path does not set `_isProgrammaticChange` (`:748-751`), so both are forwarded.
3. Only the property setter sets the flag (`:844`).

**Fix plan.**

1. Stop the native event at the shadow root, so only the component's event leaves:
   ```js
   shadow.addEventListener("input", (e) => e.stopPropagation());
   ```
   Ace's own listeners sit on the textarea and have already run at that point.
2. Do every programmatic write inside the flag, in the shared `#applyValue()`:
   ```js
   this._isProgrammaticChange = true;
   try {
     this.editor.setValue(text, -1);
     this.editor.clearSelection();
   } finally {
     this._isProgrammaticChange = false;
   }
   heightUpdateFunction(); // once
   ```
3. Decide one rule and document it. Recommended, because it matches a textarea: programmatic changes (attribute or property) fire nothing, user edits fire exactly one `input`. Update the comparison table in `SKILL.md` (row "Fires the `input` event").
4. Add a `change` event: remember the content on `focus`, and on `blur` dispatch `change` if it differs.

## A8. `lang` / `theme`: removing the attribute loads `null`; short names only at start

**Severity:** Medium · **Checked:** browser

**Problem.** The language and theme attributes are handled by two different pieces of code, one at start-up and one for later changes, and they do not agree.

**Details.**

- `removeAttribute("lang")` sets the mode to `ace/mode/null` and the browser requests `mode-null.js` (404). The expected result is the default, `javascript`. React removes an attribute whenever a prop becomes `undefined`, so this happens in normal use. `theme` goes through the same code with `ace/theme/null`.
- `lang="js"` works in the markup, but `setAttribute("lang", "js")` sets `ace/mode/js` and requests `mode-js.js` (404). Same for `ts` and `bash`. `SKILL.md` documents this as a rule to remember instead of it being fixed.

**Why it happens.** Start-up maps short names and applies defaults (`:501-508`). `attributeChangedCallback` passes the raw new value, which is `null` on removal, straight into the path (`:753-758`).

**Fix plan.**

1. Add two small functions used by both places:
   ```js
   const LANG_ALIASES = { js: "javascript", ts: "typescript", bash: "sh" };
   const modePath = (lang) => `ace/mode/${LANG_ALIASES[lang] || lang || "javascript"}`;
   const themePath = (theme) => `ace/theme/${theme || "idle_fingers"}`;
   ```
2. Remove the "only in the initial markup" sentence from `SKILL.md` and the last checklist line there.
3. Note for the docs (no code change needed): `lang` is also a standard HTML attribute for the human language of the content. `lang="javascript"` is not a valid language tag. It is harmless in practice, but an alias such as `mode` would avoid the overlap.

---

# Part B – Component lifecycle and rendering

## B1. Moving or re-attaching an `<ace-editor>` throws and leaves it dead

**Severity:** High · **Checked:** browser

**Problem.** An editor that is removed from the page and inserted again, or simply moved to another parent, throws an error and never works again.

**Details.** Test: `el.remove(); wrapper.appendChild(el);` gives `NotSupportedError: Failed to execute 'attachShadow' on 'Element': Shadow root cannot be created on a host which already hosts a shadow tree`, and `el.editor` stays `null`. Moving an element (`parent.appendChild(existingEditor)`, drag-and-drop sorting, a tab or layout library that re-parents content) does the same, because a move is "disconnect, then connect". `SKILL.md` rule 6 tells users not to do it. It is a limitation that can be removed.

**Why it happens.** `connectedCallback` calls `attachShadow` every time (`:349`, and `:308` in the duplicate branch). An element can only ever have one shadow root. `disconnectedCallback` destroys the Ace instance (`:787-790`) but leaves the old shadow DOM, and nothing can rebuild it. The lessons (002, 004, 005, 006, 007, bonus) teach the same `attachShadow` inside `connectedCallback` pattern, which is where it comes from. Lesson 003 already has the safe form: `this.shadowRoot || this.attachShadow(...)`.

**Fix plan.**

1. Create the shadow root once: `const shadow = this.shadowRoot ?? this.attachShadow({ mode: "open" });`, and build its content only when it is empty.
2. Do not tear down on a move. In `disconnectedCallback` wait one microtask and check whether the element is really gone:
   ```js
   disconnectedCallback() {
     queueMicrotask(() => {
       if (!this.isConnected) this.#teardown();
     });
   }
   ```
   In `connectedCallback`, return early if the editor exists or is being created, and call `editor.resize()`.
3. For a real remove followed by a later insert: in `#teardown()` keep the content (`this.#pendingValue = editor.getValue()`), destroy the editor, clear the container. The next `connectedCallback` then initialises again from `#pendingValue`.
4. Add a paragraph to lesson 005 (lifecycle): `connectedCallback` can run more than once, so one-time setup must be guarded.
5. Remove rule 6 from `SKILL.md`.

## B2. Removing a rejected duplicate frees the id of the valid editor

**Severity:** Medium · **Checked:** browser

**Problem.** The duplicate-id protection can be switched off by accident: remove the rejected element, and the id is free again while the original editor still uses it.

**Details.** Test: editor `g` exists. Add a second `<ace-editor id="g">`: rejected, error box shown (correct). Remove that second element. Add a third `<ace-editor id="g">`: accepted. Two working editors now share one id.

Related cases:

- Changing `el.id` after connect leaves the old id registered forever and never registers the new one.
- An element that returned early because of the missing Ace URL (`:279-294`) also unregisters its id on removal, although it never registered it.

**Why it happens.** `disconnectedCallback` unregisters `this.id` whenever the element has an id (`:797-799`). It does not check that _this element_ is the one that registered it. The rejected duplicate has the same id as the valid editor, so it removes the valid editor's entry.

**Fix plan.**

1. Remember what was actually registered: set `this.#registeredId = id` only after `registerEditorId(id)` succeeded.
2. In teardown, unregister only that: `if (this.#registeredId) { unregisterEditorId(this.#registeredId); this.#registeredId = null; }`.
3. Optional: use a `Map` from id to element instead of a `Set`, so the check "is this id mine?" is explicit and the error message can point at the other element.
4. Optional: add `id` to `observedAttributes` and re-register on change.

## B3. Editors inside `visibility: hidden` / `opacity: 0` never initialise

**Severity:** High · **Checked:** browser

**Problem.** An editor inside a container that is hidden with `visibility: hidden` or `opacity: 0` shows "Loading Ace Editor..." forever, even after the container becomes visible. Fade-in animations and many dialog and tab libraries use exactly these two properties.

**Details.** Test: `<div style="visibility:hidden"><ace-editor value="x">`. Not initialised. Set `visibility: visible`, wait 1.5 s: still not initialised, the label still says "Loading Ace Editor...". The `display: none` case, which the wait was written for, works.

**Why it happens.** `visible()` (`:39-71`) returns false for `display: none`, `visibility: hidden` **and** `opacity: 0`, on the element and on every ancestor. The component then waits with a `ResizeObserver` (`:417-428`). A `ResizeObserver` fires only when the **size** changes. Showing a `display: none` element changes its size from zero. Changing `visibility` or `opacity` does not change any size, so the observer never fires again and the promise never resolves.

The waiting is needed only for `display: none`, where Ace cannot measure characters. With `visibility: hidden` or `opacity: 0` the element has a normal layout box and Ace initialises correctly.

Two more problems in the same code:

- The observer is a local variable. If the element is removed while waiting, it is never disconnected.
- If the element is removed while Ace is still downloading, `initializeEditor` still runs for the detached element and then waits forever.

**Fix plan.**

1. Reduce the check to "does it have a layout box":
   ```js
   const hasLayout = (el) => el.getClientRects().length > 0;
   ```
   Delete the `visibility` and `opacity` checks and the ancestor loop. An ancestor with `display: none` already gives zero client rects.
2. Store the observer on the instance and disconnect it in teardown.
3. At the start of `initializeEditor`, and again after the wait, stop if `!this.isConnected`.

## B4. Height is not recalculated when the width changes

**Severity:** Medium · **Checked:** browser

**Problem.** The editor sizes itself to its content, but only when the text changes. When it gets narrower, lines wrap into more rows and the editor does not grow, so part of the content is cut off behind an inner scroll.

**Details.** Test: one long line in a 900 px wide wrapper: height 32 px, needed 32 px. Wrapper set to 220 px: height stays 32 px. After a window `resize` event Ace has re-wrapped the text and 128 px are needed, but the height is still 32 px. Typical triggers: resizing the window, a sidebar opening, a responsive grid such as the three-column layout on `dynamic.html`. The opposite direction leaves empty space below the code.

**Why it happens.** `heightUpdateFunction` is called from the session `change` event (`:638-639`), from two start-up timers (`:652-656`) and from the min-height attributes. The number of screen rows also depends on the width, because wrap mode is always on (`:514`), and nothing listens for width or wrap changes. Ace notices only window resizes, not container resizes, and neither path calls the height function.

**Fix plan.**

1. Recalculate when Ace re-wraps: `session.on("changeWrapLimit", heightUpdateFunction);`
2. Tell Ace when the container width changes. Compare the width so that the component's own height changes do not cause a loop:
   ```js
   let lastWidth = 0;
   this.#resizeObserver = new ResizeObserver(([entry]) => {
     const w = entry.contentRect.width;
     if (w !== lastWidth) {
       lastWidth = w;
       editor.resize();
     }
   });
   this.#resizeObserver.observe(container);
   ```
3. Also call it when the character size changes (late web font, browser zoom): `editor.renderer.on("changeCharacterSize", heightUpdateFunction);`
4. Guard the min-height parsing: `parseInt("abc")` is `NaN`, and `Math.max(x, NaN)` is `NaN`, which produces `height: NaNpx` (`:626-633`). Use `Number.isFinite`.
5. Alternative to 1-3: Ace's built-in auto height, `editor.setOptions({ maxLines: Infinity, minLines: n })`. It replaces `heightUpdateFunction`, but `min-height-px` then has to be converted to lines. Step 2 is needed in both variants.

## B5. Ace styles are copied into every editor again and again

**Severity:** Medium · **Checked:** browser

**Problem.** Each editor holds many identical copies of Ace's CSS, and the number grows while the page is used.

**Details.** Right after loading, one editor's shadow root has 13 `<style>` elements: Ace's own two theme styles, the component's style, and **two** full copies of five Ace stylesheets (the largest is 26 kB). After two theme changes on a _different_ editor, every editor on the page has 26 to 28. A page with 30 editors, like `dynamic.html`, carries several megabytes of duplicated CSS, and it grows with every new theme.

**Why it happens.**

- `adoptStylesheets` (`:449-498`) first tries `shadow.adoptedStyleSheets = [...]` with Ace's normal `<style>` sheets. That always throws, because only stylesheets created with `new CSSStyleSheet()` may be adopted. So the fallback `copyStylesManually` always runs.
- The fallback appends a fresh `<style>` for **every** Ace stylesheet on **every** call and never removes or skips the earlier copies.
- It is called once from a timer (`:652-656`) and again from a `MutationObserver` on `document.head` whenever any Ace style appears (`:659-674`). Every editor has its own observer, so one theme change makes every editor copy everything again.
- Part of the work is not needed: Ace 1.43 already puts the theme CSS into the shadow root itself (the `ace-tm`, `ace-idle-fingers`, ... styles with ids seen in the test). Only the base CSS, which Ace puts into `document.head`, has to be brought in.

**Fix plan.**

1. Share one stylesheet object per source `<style>` between all editors:
   ```js
   const sheetCache = new WeakMap(); // <style> node -> CSSStyleSheet
   function sheetFor(node) {
     let sheet = sheetCache.get(node);
     if (!sheet) {
       sheet = new CSSStyleSheet();
       sheet.replaceSync(node.textContent);
       sheetCache.set(node, sheet);
     }
     return sheet;
   }
   // in each editor:
   shadow.adoptedStyleSheets = aceStyleNodes().map(sheetFor);
   ```
   Assigning the array replaces the previous one, so there is nothing to accumulate, and the browser parses each stylesheet once for the whole page.
2. Use one module-level `MutationObserver` and a `Set` of live editors, instead of one observer per editor. Add in `connectedCallback`, delete in teardown.
3. Keep the manual copy only as a fallback for browsers without constructable stylesheets, and make it safe to repeat: mark copies (for example `data-ace-copy`) and remove the old ones before copying.
4. Replace the two fixed timers (100 ms + 50 ms) with a direct call after `ace.edit()`. The base CSS is already in `document.head` at that point.

## B6. Loader: dead `currentScript` code, no reuse of existing Ace, endless polling

**Severity:** Medium · **Checked:** read

**Problem.** The code that finds and loads `ace.js` has a branch that can never run and two situations it does not handle.

**Details and why.**

1. **`document.currentScript` is always `null` here.** The file uses `export`, so it can only be loaded as a module, and `document.currentScript` is `null` inside modules by definition (`:17`). The first branch in `connectedCallback` (`:275`) is dead. The URL is always found by the second branch, `document.querySelector("[data-main-ace]")`. That works, but it matches the first element of **any** kind with that attribute, not the script that loaded the file. The comment above (`:13-16`) describes a mechanism that is not in use.
2. **`setDataMainAce(url)` has the lowest priority** (`:274-277`). An explicit call in code loses against any `data-main-ace` attribute that happens to be on the page.
3. **An Ace that is already on the page is loaded a second time.** `loadAceEditor` (`:121-161`) never looks at `window.ace` before adding the script tag. A page that already includes Ace gets it twice, which is the thing the project explicitly wants to avoid.
4. **Polling never ends.** After the script's `load` event the code polls for `window.ace.edit` every 150 ms with no limit (`:139-147`). If the URL returns something that is not Ace (wrong file, an HTML error page served with status 200), all editors show "Loading Ace Editor..." forever and nothing is logged.
5. **A failed load is cached.** The rejected promise stays in `aceEditorPromise`, so a temporary network error cannot be retried without a page reload.
6. The error message for the missing URL (`:290-291`) has no space between its two sentences ("programmatically.Please").

**Fix plan.**

1. Delete `currentScript` and its comment. Resolve the URL as: `setDataMainAce()` value, else `document.querySelector("script[data-main-ace]")`.
2. Start `loadAceEditor` with `if (typeof window.ace?.edit === "function") return window.ace;`.
3. Limit the polling (for example 10 s) and reject with a message that contains the URL.
4. On rejection set `aceEditorPromise = null` and remove the failed `<script>` element, so the next editor can try again.
5. Fix the message text.

## B7. `onLoad` is not a real event and behaves differently from every other event

**Severity:** Medium · **Checked:** browser (item 2), read (rest)

**Problem.** `addEventListener("onLoad", ...)` is intercepted by the component and handled with its own list. It looks like an event but follows none of the event rules.

**Details and why.** The override is at `:254-271`, the trigger at `:224-251`.

1. The listener receives a plain object `{ component, editor, id }`, not an `Event`. Every other listener gets an `Event`.
2. A real `CustomEvent("onLoad")` is also dispatched and bubbles (`:230-239`). The override never registers listeners for it on the element, so the only code that can receive it is a listener on an ancestor, where it arrives as a normal `Event` with `detail`. Together with `aceOnLoad` (`:684-693`), `document` receives two different events for the same moment (test: 14 `onLoad` and 14 `aceOnLoad` for 14 initialised editors).
3. `removeEventListener("onLoad", fn)` does nothing. The pending list is not touched.
4. The `options` argument (`once`, `signal`) is ignored, and a listener object with `handleEvent` throws because it is called as a function.
5. If one listener throws, the listeners after it are skipped. The loop is a plain `forEach` inside a promise callback (`:241-247`).
6. In React, an `onLoad` prop is React's built-in handler for the native `load` event. It will not receive this custom event, although the typings advertise it (see C1).
7. The name does not follow the convention of lowercase event names without the `on` prefix, and `CLAUDE.md` calls the event `ready`.

**Fix plan.**

1. Add a promise, which is the usual way to express "run now or as soon as it is ready":
   ```js
   // resolved with { component, editor, id } at the end of initializeEditor
   get ready() {
     return this.#readyPromise;
   }
   ```
   Usage: `await editor.ready` or `editor.ready.then(({ editor }) => ...)`. It can be used at any time and any number of times, which is the whole purpose of the current override.
2. Dispatch one normal bubbling event, for example `ready`, with `detail: { component, editor, id }`.
3. Keep the `onLoad` override and `aceOnLoad` for one version as deprecated aliases, then remove them together with the extra bubbling `CustomEvent("onLoad")`.
4. Until the override is removed: also override `removeEventListener`, honour `once`, and wrap each listener call in `try / catch`.
5. Update `dynamic.html`, `SKILL.md`, the typings and `CLAUDE.md` to one name.

## B8. Smaller component issues

**Severity:** Low

| #   | Where                            | Problem                                                                                                                                                                                                                                  | Fix                                                                                                                                         | Checked |
| --- | -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | whole class                      | `CLAUDE.md` promises `.focus()`. `el.focus()` does nothing: the editor is not focused and the active element does not change.                                                                                                            | Add `focus() { this.editor?.focus(); }` and `blur()`. Use `attachShadow({ mode: "open", delegatesFocus: true })`.                           | browser |
| 2   | `:309-335`                       | The duplicate-id error box is built with `innerHTML` and contains the id as text. An id that comes from user data can inject HTML.                                                                                                       | Build the box with `textContent`.                                                                                                           | read    |
| 3   | `:359`, `:365`                   | `// height: 22px;` and `// min-height: 200px;` are inside a `<style>` block. CSS has no `//` comments. It works only because the parser skips the broken declaration up to the next `;`.                                                 | Delete the two lines or use `/* */`.                                                                                                        | read    |
| 4   | `:215`                           | `data-nolt` is observed but `attributeChangedCallback` has no branch for it. `data-notrim` and `content` are not observed. All three are read only once, at start.                                                                       | Remove `data-nolt` from the list and document all three as "read at initialisation only".                                                   | read    |
| 5   | `:221`, `:722`                   | `this._loadListeners` and `this._initialEvalDone` are written and never read.                                                                                                                                                            | Delete.                                                                                                                                     | read    |
| 6   | `:513-514`                       | Tab size 4 and wrap mode are fixed. `CLAUDE.md` documents `tab-size` and `wrap` attributes.                                                                                                                                              | Implement the attributes or remove them from the docs (D5).                                                                                 | read    |
| 7   | `:431-435`                       | After init the label changes to "Ace Editor Loaded!" and stays for 500 ms above the editor, then disappears. Every editor jumps on every page load.                                                                                      | Hide the label as soon as the editor is created.                                                                                            | read    |
| 8   | `:606-614`, `:711-719`           | `data-eval` removes the attribute from the user's element and appends a `<script>` to `<body>` that is never removed. It also runs the content of the `value` attribute, not only of the script child.                                   | Use a private flag instead of removing the attribute. Remove the script element after it ran. Say in the docs that the attribute runs code. | read    |
| 9   | `:10-12`, `:343`, `:418`, `:801` | The component logs to the console for every editor (id generated, waiting for visibility, disconnected). A page with 30 editors prints dozens of lines.                                                                                  | Log only when a debug switch is on, for example `data-debug` on the script tag.                                                             | read    |
| 10  | `:542`                           | `this.querySelector("script")` takes the first script of **any** type at **any** depth. If that script is empty, the plain text and the `content` attribute are not tried, because that fallback sits in the `else` of `if (scriptTag)`. | Prefer `:scope > script[type="ace"]`, then any direct child script, and fall through when it is empty.                                      | read    |

---

# Part C – Typings and the React demo

## C1. `ace-web-component.d.ts` does not match the component

**Severity:** Medium · **Checked:** read (not compiled, see C2)

**Problem.** The type file describes some things that do not exist, and it hides things that do.

**Details and why.**

1. **Only `onLoad` listeners type-check.** The class declares a single signature, `addEventListener(type: "onLoad", listener: () => void, ...)` (`ace-web-component.d.ts:39`). In TypeScript a method declared in a subclass replaces all inherited overloads. The expected result is that `editor.addEventListener("input", ...)` on a typed reference is an error ("input" is not assignable to "onLoad").
2. **Wrong listener signature.** It is typed `() => void`. At run time it receives `{ component, editor, id }`.
3. **The JSX declaration is probably not applied with React 19.** The file adds `"ace-editor"` to the **global** `JSX` namespace (`:61-89`). The React 19 type packages, which the demo uses (`@types/react ^19.1.16`), removed the global `JSX` namespace. Elements are looked up in `React.JSX`. If so, `<ace-editor>` in `App.tsx` is an unknown element for `tsc` and `npm run build` (`tsc -b && vite build`) fails. `vite dev` does not type-check, which would explain why it was not noticed.
4. **`onLoad?: () => void` in the JSX props** (`:83`) suggests the React prop receives the component's `onLoad`. It does not (B7 item 6).
5. **Missing members:** the `editor` field, the attributes `data-notrim` and `content`, and a type for the event payload.
6. `#isLoaded` and `_triggerLoadEvent()` are internal and should not be in a public type file.
7. `Window.ace` is declared with only `edit`. That is fine for the component but narrows the type for anyone who uses more of Ace through `window.ace`.

**Fix plan.**

1. Declare the overloads again and type the payload:
   ```ts
   export interface AceEditorReadyDetail {
     component: AceEditorComponent;
     editor: any;
     id: string;
   }

   addEventListener(type: "onLoad", listener: (detail: AceEditorReadyDetail) => void): void;
   addEventListener<K extends keyof HTMLElementEventMap>(
     type: K,
     listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
     options?: boolean | AddEventListenerOptions,
   ): void;
   addEventListener(
     type: string,
     listener: EventListenerOrEventListenerObject,
     options?: boolean | AddEventListenerOptions,
   ): void;
   ```
2. Move the JSX declaration to the React module, and keep the global one only if React 18 must be supported:
   ```ts
   declare module "react" {
     namespace JSX {
       interface IntrinsicElements {
         "ace-editor": /* same props as now */;
       }
     }
   }
   ```
3. Remove `onLoad` from the JSX props, or replace it with whatever B7 ends up with.
4. Add `editor`, `ready` (after B7), `data-notrim`, `content`. Remove the internal members.
5. Add a type-check step to CI next to the prettier check, so the type file cannot drift again: `tsc -b` in `ace-editor/` with a small `.tsx` file that uses `addEventListener("input", ...)`, `ref` and the JSX element.

## C2. React demo cannot be installed or built from a fresh clone

**Severity:** High · **Checked:** browser/shell (items 1, 2), read (items 3, 4)

**Problem.** A new clone of the repository cannot run the React demo by following the usual steps.

**Details and why.**

1. **The lockfile points to a private registry.** All 237 `resolved` URLs in `ace-editor/package-lock.json` point to `gdartifactory1.jfrog.io/artifactory/api/npm/node-virt/...`. `npm ci` fails with `E401 Incorrect or missing password` for anyone without access to that server (reproduced on a copy of the folder). It also publishes an internal host name in a public repository. The root `yarn.lock` is fine, it uses the public registry.
2. **A required file is not in the repository.** `App.tsx` imports `./ace-web-component.js` (`ace-editor/src/App.tsx:4`). That file is a symlink created by `link.sh` (`yarn ln` in the root `package.json`) and it is listed in `.gitignore`. Nothing in `README.md` or `ace-editor/README.md` mentions the step. The second file is still the unmodified Vite template text. Symlinks are also a problem on Windows.
3. **The type check probably fails** because of C1 item 3. In addition `handleEditorChange` is typed with the DOM `Event` (`App.tsx:26`) but is passed to React's `onInput`, which supplies a React `FormEvent`.
4. **Two package managers:** yarn in the root (`yarn.lock`, CI uses yarn), npm in `ace-editor/` (`package-lock.json`).

**Fix plan.**

1. Regenerate the lockfile against the public registry: delete `ace-editor/package-lock.json`, run `npm install --registry=https://registry.npmjs.org/`, and check that no `jfrog` URL is left. If the host name should not be public at all, the old file also stays in the git history. Decide whether that matters.
2. Replace the symlink with a real import path, for example a Vite alias:
   ```ts
   // ace-editor/vite.config.ts
   resolve: { alias: { "ace-web-component": path.resolve(__dirname, "../ace-web-component.js") } },
   server: { fs: { allow: [".."] } },
   ```
   plus a matching `paths` entry in `tsconfig.app.json` for the `.d.ts`. Then delete `link.sh`, the `ln` script and the two `.gitignore` / `.prettierignore` lines.
3. Type the handler as `(event: React.FormEvent<AceEditorComponent>) => setEditorContent(event.currentTarget.value)` and delete the local `HTMLElementWithValue` interface.
4. Replace `ace-editor/README.md` with three lines: what the demo is, how to install, how to start.
5. Use one package manager for both folders.

---

# Part D – Lessons, documentation, server

## D1. Lesson 008 (`learning/008_ace_async_loader/index.html`) is broken: nothing loads

**Severity:** High · **Checked:** browser

**Problem.** The lesson page linked from the landing page as "Lesson 008" does not work. Its button reports success, and no editor appears.

**Details.** Clicking "Load ace-web-component.js" gives the console error `SyntaxError: Unexpected token 'export'`, the status line says "✅ ace-web-component.js loaded! Editors are now alive!", and `customElements.get("ace-editor")` stays undefined. The three static editors stay as plain text.

**Why it happens.**

1. The page creates the script tag without `type="module"` (`:289-290`, the comment even says "regular script, not module"). `ace-web-component.js` has used `export` since the React integration, so it is a syntax error as a classic script.
2. A script with a syntax error still fires its `load` event, so the page shows the success message (`:296-303`).
3. Even with the type fixed, `data-main-ace` points to `/noprettier/ace/ace-builds-1.15.0/...` (`:293`). Only `ace-builds-1.43.4` exists, so it would be a 404. The path is also absolute, which cannot work on GitHub Pages, where the site lives under `/ace-editor-webcomponent/`.
4. Both "Next" links go to `../009_ace_configuration/`, which does not exist (`:105`, `:270`).

**Fix plan.**

1. Add `script.type = "module";`.
2. Use the relative path `../../noprettier/ace/ace-builds-1.43.4/src-min-noconflict/ace.js`, same as `dynamic.html`.
3. Report success only when the element is really registered: `await customElements.whenDefined("ace-editor")` with a timeout, instead of trusting `script.onload`.
4. Point "Next" to `dynamic.html` or remove it.
5. Consider making `dynamic.html` the lesson's `index.html`. It is the page `README.md` links to, and it is not reachable from the landing page at all.

## D2. Lesson 007 "load once" pattern loads the dependency twice

**Severity:** Medium · **Checked:** browser

**Problem.** Lesson 007 teaches "load an external script only once". The example code has a race, and in the `window` variant the script is added twice.

**Details.** On `learning/007_async_script_loading/window/` there are two static components. After "Load my-tool-window.js" the page contains **two** `<script src="./internalToolWindow.js">` tags, and the console prints "Loading ... for the first time..." twice. The ESM variant has the same race. There the browser's module cache hides it, so the file is fetched once but the "first time" branch still runs once per component.

**Why it happens.** In both loaders the order is: check the cached promise, `await delay(1000)`, and only then store the promise (`window/my-tool-window.js:18-59`, `esm/my-tool-esm.js:9-24`). All components that connect within that second pass the check before the first one has stored anything. The final `ace-web-component.js` does not have this bug: it stores the promise synchronously.

**Fix plan.**

1. Store the promise before any `await`, and put the artificial delay inside it:
   ```js
   function loadInternalToolWindow() {
     if (!internalToolWindowPromise) {
       internalToolWindowPromise = (async () => {
         await delay(1000); // testing delay
         return new Promise((resolve, reject) => {
           /* create the script tag as before */
         });
       })();
     }
     return internalToolWindowPromise;
   }
   ```
   Same shape for the ESM file.
2. Add one sentence to the lesson text: the check and the assignment must happen in the same synchronous step. It is the main point of the pattern.
3. Small mismatches in `esm/index.html`: it says "3 static components" in a comment and in the console text, but there are 2 (`:227`, `:313`).

## D3. Broken links and lesson numbering that differs between files

**Severity:** Medium · **Checked:** read (file system compared with links)

**Problem.** The lesson list is described in three places (landing page, `CLAUDE.md`, the lesson pages) and each one says something different. Several links lead nowhere.

**Details.**

| Where                                           | Says / links to                                                       | Reality                                                                                         |
| ----------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `index.html:338`, lesson 006 `:64`, bonus `:77` | `learning/007_async_script_loading/`                                  | The folder has no `index.html`, only `esm/` and `window/`. 404 on GitHub Pages.                 |
| lesson 008 `:105`, `:270`                       | `../009_ace_configuration/`                                           | Does not exist.                                                                                 |
| `index.html:250`                                | "Lessons 009-016 will complete the Ace Editor component"              | The cards below list 009-015. None of them exist.                                               |
| `CLAUDE.md`                                     | 16 lessons, `007_templates_and_fragments`, `008_async_script_loading` | Folders are 001-006, `007_async_script_loading`, `008_ace_async_loader`, `bonus_templates_...`. |
| `index.html` lesson cards                       | no link to `dynamic.html`                                             | It is the main documentation page and the one `README.md` links to.                             |
| `index.html:259`, `:487`                        | `CLAUDE.md` as "Complete Project Documentation"                       | On GitHub Pages this is served as raw text. It is also the least accurate document (D5).        |
| 007 `esm/` and `window/` pages                  | no link to each other                                                 | A reader who lands on one variant does not learn that the other exists.                         |
| `server.js:59-60`                               | `index: false` for static files                                       | Locally every folder link shows a file listing. On GitHub Pages the same link opens the lesson. |

**Why it happens.** The plan in `CLAUDE.md` was written first. The work then went a different way: lessons 009-016 became the single `ace-web-component.js` plus `dynamic.html`, and the plan and the landing page were not updated.

**Fix plan.**

1. Add `learning/007_async_script_loading/index.html`: a short page that explains the two variants and links to both.
2. Landing page: remove the "coming soon" cards for 009-015, or replace them with one card "Final component: documentation and demo" that links to `dynamic.html`. Fix the "009-016" sentence.
3. Fix the lesson 008 "Next" links (D1).
4. Make local and published behaviour the same. Either remove `index: false` from `server.js`, so folders open their `index.html` locally too, or link to `.../index.html` explicitly everywhere. The first is one line.
5. Link to the `README` or to `dynamic.html` instead of `CLAUDE.md` from the landing page.

## D4. `dynamic.html`: invalid `<head>`, theme selector out of sync, smaller mismatches

**Severity:** Medium · **Checked:** browser (items 1, 2), read (rest)

**Problem.** The main documentation page has one structural HTML error, one control that shows a wrong state, and several texts that do not match the code next to them.

**Details, reasons and fixes.**

1. **A `<div>` inside `<head>`** (`dynamic.html:30-63`). The "project overview" block is placed in the head. The HTML parser closes `<head>` at the first element that is not allowed there, so everything after it lands in `<body>`: the font `<link>`s, the main `<style>` and the scripts. Confirmed: the first children of `<body>` are `DIV.project-overview, LINK, LINK, STYLE, SCRIPT, SCRIPT`. The later `</head>` and `<body>` tags are ignored. It renders, but it is invalid, and the overview is shown above the `<h1>`. **Fix:** move the block (and its `<style>`) into `<body>`, after the `<h1>`.

2. **The theme selector does not show the real theme.** The first option of the theme list is `ambiance`, so every new demo editor shows "Ambiance" selected. The editor is created without a `theme` attribute and therefore uses `idle_fingers` (confirmed: select `ambiance`, editor `ace/theme/idle_fingers`). `generateHtmlCode()` leaves out `theme` when the selection is `ambiance` (`:1232`), as if `ambiance` were the default. Choosing "Ambiance" on purpose produces a snippet without `theme`, which renders as `idle_fingers`. **Fix:** preselect `idle_fingers` (`themeSelect.value = "idle_fingers"` after building the list) and compare with `"idle_fingers"` in `generateHtmlCode()`.

3. **Text is put into `innerHTML` without escaping** (`:1175`, `:1183`). The JavaScript snippet goes into `value="${CODE_SNIPPETS.javascript}"`. It works only because that snippet has no double quote. One `"` in the snippet cuts the attribute. **Fix:** create the element, then `aceEditor.setAttribute("value", snippet)` and `textarea.value = snippet`.

4. **The generated HTML is not escaped** (`:1227-1228`, the escaping line is commented out). If the textarea contains `</script>`, the "HTML Usage Example" shows markup that would break when pasted. **Fix:** `currentValue.replace(/<\/script/gi, "&lt;/script")`, which is the rule the page itself teaches.

5. **A fixed 1.5 s timer instead of the ready signal** (`:1261`): `setTimeout(updateHtmlView, 1500)`. The page teaches not to do this. **Fix:** `htmlViewEditor.addEventListener("onLoad", updateHtmlView)`. After A5 the timer can simply be removed.

6. **Read-only makes the preview stop updating.** This is A2. No change needed here once A2 is fixed.

7. **Texts that do not match the code:**

   | Line                 | Text                                                                             | Code                                                                    |
   | -------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
   | `:557`               | explanation mentions `src="../../ace-web-component.js"`                          | the example above it uses the full `https://stopsopa.github.io/...` URL |
   | `:43` vs `:47`       | mode list links to Ace `v1.43.4`, theme list to `v1.43.3`                        | one version everywhere                                                  |
   | `:532`               | "1.43.4 not published yet as of 2025-10-23"                                      | check cdnjs again and update the URL or the date                        |
   | `:769`               | "shows red error box"                                                            | the box is grey (`ace-web-component.js:316-317`)                        |
   | `:911` vs `:919-921` | "Cannot be used with `min-height-lines` simultaneously" vs "px takes precedence" | px wins. Keep only the second sentence.                                 |
   | `:2219`              | heading "onChange"                                                               | the section is about the `input` event                                  |
   | `:2439` vs `:2567`   | button "Go to Line 11", message "Jumped to line 30"                              | line 11                                                                 |
   | `:2445` vs `:2586`   | button "Highlight Lines 5-8", message "Lines 5-7", comments "lines 12-15"        | rows 5-8                                                                |
   | `:2696`              | second "Example code" editor is editable                                         | the first one is `readonly`                                             |
   | `:1550`              | "Both methods produce identical results at runtime"                              | not true once a formatter has changed the plain-text variant            |

8. **The page prints one browser error on load** from the intentional duplicate-id demo. That is expected. A one-line note in the text ("this example logs an error to the console on purpose") would save a reader from looking for a bug.

## D5. `CLAUDE.md` describes an API and a repository that do not exist

**Severity:** Medium · **Checked:** read

**Problem.** `CLAUDE.md` is linked as the "complete project documentation" and is the file AI tools read first. Large parts describe the original plan, not the result. Whoever follows it writes code that does not work.

**Details.**

| `CLAUDE.md` says                                              | Reality                                                                                       |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `src` attribute on `<ace-editor>` (required)                  | Not implemented. The URL comes from `data-main-ace` on the script tag or `setDataMainAce()`.  |
| `wrap` attribute                                              | Not implemented. Wrapping is always on.                                                       |
| `tab-size` attribute                                          | Not implemented. Always 4.                                                                    |
| `.focus()`                                                    | Not implemented (B8 item 1).                                                                  |
| `change` event with `event.detail.value`                      | Does not exist. The event is `input`, without `detail`.                                       |
| `ready` event with `event.detail.editor`                      | Does not exist. The names are `onLoad` and `aceOnLoad`.                                       |
| React examples use `onInput`                                  | Correct, but contradicts the "Events" section of the same file.                               |
| not mentioned                                                 | `min-height-px`, `min-height-lines`, `data-eval`, `data-nolt`, `data-notrim`, `content`, ids. |
| lessons 001-016, test at `/learning/016_final_ace_component/` | See D3.                                                                                       |
| "Only installs Express"                                       | Also `cookie-parser`, `serve-index`, `prettier`.                                              |
| `ace-builds-[version]` placeholders, "Update version number"  | No version is named. The repository contains 1.43.4.                                          |
| update snippet uses `editor.value`                            | Ace has `getValue()`. This mistake was copied into the component (A6).                        |
| "Focus State Management" pattern (`updateFlag`)               | Not in the component. The component uses `readonly` for it (A2).                              |
| `loadScript` snippet                                          | Never rejects and never stops polling. The same weakness is in the component (B6 item 4).     |
| not mentioned                                                 | `ace-web-component.js`, the `.d.ts`, `ace-editor/`, `SKILL.md`, `yarn format`, `xx.ts`.       |

`ace-editor-web-component/SKILL.md` was written from the real code and is accurate. Where it differs from good behaviour, it documents a bug as a rule: the read-only deferral (A2), the early `.value` loss (A5), "do not re-attach" (B1), "short names only in the markup" (A8).

Also: the docs use Ace 1.43.3 for the cdnjs URL and 1.43.4 for jsDelivr and the local copy (`SKILL.md`, `dynamic.html`, `App.tsx`).

**Fix plan.**

1. First decide per row whether the feature gets implemented or the line gets removed. `focus()`, a `change` event and a `ready` signal are cheap and suggested above (A7, B7, B8). `src`, `wrap` and `tab-size` are a product decision.
2. Rewrite the "Repository Structure", "Learning Path" and "Final API" sections of `CLAUDE.md` from the code. For the API, link to `SKILL.md` instead of repeating it, so one source stays correct.
3. After the Part A and B fixes, remove the matching workaround rules from `SKILL.md`.
4. Use one Ace version in all examples.

## D6. Server and tooling leftovers

**Severity:** Low · **Checked:** read

| #   | Where                                  | Problem                                                                                                                                                                    | Fix                                                                                                                            |
| --- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `server.js:25-29`                      | `cookieParser()`, `express.urlencoded()` and `express.json()` are installed, but there is no route that reads a body or a cookie. A form posted to this server gets a 404. | Remove the three lines and the `cookie-parser` dependency. Or add a `POST /echo` route and use it in the form example from A1. |
| 2   | `server.js:50-56`, `:61-66`            | The no-cache headers are set twice.                                                                                                                                        | Keep one.                                                                                                                      |
| 3   | `server.js:10-16`                      | `try { return console.log } catch` cannot fail.                                                                                                                            | `const log = console.log;`                                                                                                     |
| 4   | `lib/createScript.js`, `lib/doEval.js` | Not used anywhere. `data-eval` is implemented inside the component.                                                                                                        | Delete, or use them from the component.                                                                                        |
| 5   | `.claude/settings.json`                | `bashPermissions.allowedCommands` is not a Claude Code setting. The file has no effect.                                                                                    | Use `{ "permissions": { "allow": ["Bash(git commit:*)", ...] } }`, as `settings.local.json` already does.                      |
| 6   | `.claude/config.json`                  | MCP servers are not read from this file.                                                                                                                                   | Move to `.mcp.json` in the repository root, or delete.                                                                         |
| 7   | `.claude/settings.local.json`          | A personal, per-machine file is committed.                                                                                                                                 | `git rm --cached` and add to `.gitignore`.                                                                                     |
| 8   | lessons 003 and 005                    | Attribute values are written into `innerHTML` without escaping (`003:236-238`, `005:306`). As teaching material this shows an injection-prone pattern.                     | Use `textContent` for the values, or add one sentence that explains the risk.                                                  |
| 9   | lesson 003, "The Code" block           | The printed code differs from the code that runs (the running version has an `if (this.shadowRoot)` guard). `age` is observed but has no property.                         | Make the printed and the running code the same.                                                                                |
| 10  | `package.json:20`                      | `"author": ""`.                                                                                                                                                            | Fill in or remove.                                                                                                             |
| 11  | `.gitignore`                           | No line break at the end of the file. The next appended line would join the last one.                                                                                      | Add it.                                                                                                                        |

---

# Suggested order of work

The findings depend on each other. This order avoids doing things twice.

1. **Quick, independent repairs** (each is small and touches one file):
   D1 (lesson 008), D2 (lesson 007), D3 (links), D4 items 1-2, C2 item 1 (lockfile), A6, A8, B2.
2. **One refactor of content handling in `ace-web-component.js`:**
   one function that resolves the initial content with its source (A3, A4), one private pending value plus the property upgrade step (A5), one `#applyValue()` used by attribute and property (A2, A6, A7). These five findings share the same forty lines, so fix them together.
3. **Form support** (A1). It builds on step 2.
4. **Lifecycle:** B1 and B3 together (both change `connectedCallback` / `disconnectedCallback`), then B4 and B5.
5. **Public API clean-up:** B6, B7, B8, and then C1 so the typings describe the final API.
6. **Documentation last:** D5 and the `SKILL.md` updates, when the behaviour is final. C2 items 2-5.

One addition worth making early: a small test page, or a Playwright script, that checks the cases marked `browser` in this file. All of them can be checked with a few lines each (`el.value`, `new FormData(form)`, counting `input` events, counting `<style>` elements), and none of them is visible by just looking at the demo page.
