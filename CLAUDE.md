# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains the **`<ace-editor>` web component** (a wrapper of [Ace Editor](https://ace.c9.io/)) and the learning path of **Web Components** lessons which led to it.

- The component is a single file: `ace-web-component.js` (typings: `ace-web-component.d.ts`).
- Its documentation with live demos is `learning/008_ace_async_loader/dynamic.html`.
- The description of its public API for AI agents is `ace-editor-web-component/SKILL.md`. **That file is the source of truth for the API** - keep it in sync with the component when behavior changes.

## Repository Structure

```
/
├── ace-web-component.js         # THE component: <ace-editor> (ES module, no dependencies, no build)
├── ace-web-component.d.ts       # TypeScript typings (element, events, JSX for React)
├── ace-editor-web-component/
│   └── SKILL.md                 # agent skill: how to use <ace-editor> (source of truth for the API)
│
├── server.js                    # Simple Express server for development
├── package.json                 # express, serve-index, prettier (yarn)
├── index.html                   # Landing page with navigation to all lessons
├── .nojekyll                    # GitHub Pages configuration
├── xx.ts                        # menu of project commands for the xx tool
│
├── /learning/                   # Progressive web components lessons
│   ├── 001_basic_custom_element/
│   ├── 002_shadow_dom_basics/
│   ├── 003_attributes_and_properties/
│   ├── 004_slots_and_content_projection/
│   ├── 005_lifecycle_hooks/
│   ├── 006_event_handling/
│   ├── 007_async_script_loading/        # index.html (overview) + esm/ and window/ variants
│   ├── 008_ace_async_loader/
│   │   ├── index.html                   # lesson: loading the component on demand
│   │   └── dynamic.html                 # documentation and demo of the final component
│   └── bonus_templates_for_dynamic_content/
│
├── /ace-editor/                 # React 19 + TypeScript + Vite demo using the component (npm)
│
├── /noprettier/                 # External libraries (not processed by prettier)
│   └── /ace/
│       └── /ace-builds-1.43.4/
│           └── /src-min-noconflict/
│               └── ace.js       # Ace editor main file
│
└── /existing_examples/          # Original React implementation (reference only)
    ├── Ace.jsx
    ├── github.js
    └── doace.js
```

## Development Commands

### Start Development Server

```bash
node server.js        # or: yarn start (reads HOST and PORT from .env)
```

- Serves all files from the project root on http://localhost:3000
- A directory url serves its `index.html` (same as GitHub Pages), directories without one show a listing
- `?delay=1000` added to any url delays the response (used by lesson 007)
- No build process required - pure web standards

### Install Dependencies

```bash
yarn install
```

Installs the dev server (express, serve-index) and prettier. No bundler and no build tools for the component.

### Formatting

```bash
yarn format          # prettier --write .
yarn format:check    # what CI runs
```

### React demo

```bash
cd ace-editor
npm install
npm run dev
npm run build        # tsc -b && vite build - this also type-checks ../ace-web-component.d.ts
```

## Ace Editor Setup

### Version Information

- **Version in the repository**: 1.43.4 (`/noprettier/ace/ace-builds-1.43.4/`, history in `/noprettier/ace/log.md`)
- **Download Source**: https://github.com/ajaxorg/ace-builds/releases
- **Installation**: Manual download as zip file (not npm)

### Installation Steps

1. Download ace-builds-[version].zip from GitHub releases
2. Extract to `/noprettier/ace/ace-builds-[version]/`
3. Main file: `/noprettier/ace/ace-builds-[version]/src-min-noconflict/ace.js`
4. Extensions: `/noprettier/ace/ace-builds-[version]/src-min-noconflict/ext-linking.js`

### Why Manual Installation?

The project follows a pure web standards approach without npm packages for frontend code. Ace is loaded dynamically at runtime using the async script loading pattern.

## Learning Path Architecture

### Lessons 001-007 + bonus: Web Components Fundamentals

1. Basic custom elements and lifecycle
2. Shadow DOM and style encapsulation
3. Attributes, properties, and reactivity
4. Content projection with slots
5. Complete lifecycle management
6. Event handling and custom events
7. Async script loading patterns (two variants: ES module, window global)

Bonus: template elements.

### Lesson 008 and the final component

- `learning/008_ace_async_loader/index.html` - loading `ace-web-component.js` on demand, Ace loaded once for many editors
- `learning/008_ace_async_loader/dynamic.html` - documentation and demo of everything the final component does

The originally planned lessons 009-016 were not written as separate lessons: their content went directly into `ace-web-component.js` and `dynamic.html`.

### Design Principles

- **Zero dependencies**: Each lesson uses pure HTML/JS/CSS
- **Progressive**: Each lesson builds on previous concepts
- **Minimal UI**: Raw HTML elements, no fancy styling
- **Practical**: Real-world patterns used in production
- **Self-contained**: Each lesson is complete and runnable
- **MDN Documentation**: Each lesson includes relevant MDN (Mozilla Developer Network) links for deeper learning

## Key Technical Patterns

All of these are implemented in `ace-web-component.js`.

### 1. Async Script Loading Pattern (load once)

```javascript
let promise = null;

// NOT async: the promise is stored in the same synchronous step in which it was found missing,
// otherwise every component connected in the meantime starts its own loading
function loadAceEditor(url) {
  if (promise) return promise;

  if (typeof window.ace?.edit === "function") return (promise = Promise.resolve(window.ace));

  promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.onload = () => {
      /* poll for window.ace.edit, reject after a timeout */
    };
    script.onerror = () => reject(new Error(`Failed to load ${url}`));
    document.head.appendChild(script);
  });

  return promise;
}
```

When presenting prototypes of web component wrapping ace editor always present (render) at least two components at the same time to inspect if ace editor is loaded twice or not. Should be loaded once (Loaded - I mean loading main ace editor script ace.js once per page loaded. I don't want to have ace.js loaded twice because we are rendering web component more than one).

### 2. One place which writes content into the editor

Both the `value` attribute and the `.value` property go through one method, so they can't behave differently:

```javascript
#applyValue(text) {
  if (this.editor.getValue() === text) return; // nothing to do, cursor stays where it is

  // Ace implements setValue as "remove all" + "insert" = two change events.
  // The flag stops them from being reported as user edits ('input' event).
  this.#programmaticChange = true;
  try {
    this.editor.setValue(text, -1);
  } finally {
    this.#programmaticChange = false;
  }
}
```

NOTE: an Ace editor has no `.value` property, its content is read with `editor.getValue()`.

In a controlled React setup this equality check is what prevents update loops: the value echoed back from the state equals the editor content and is skipped.

### 3. Auto-sizing Based on Content

```javascript
const height = session.getScreenLength() * editor.renderer.lineHeight; // + min-height attributes
container.style.height = height + "px";
editor.resize();
```

Recalculated on content change, on `changeWrapLimit` (wrap mode is always on, so the number of rows depends on the width), on `changeCharacterSize`, and when a `ResizeObserver` reports a new width of the container (Ace itself notices only window resizes).

### 4. Initial content and its source

Initial content is resolved in one function together with its source, and clean-up depends on the source:

| Source              | Decode `&lt;` | Remove indentation and outer empty lines |
| ------------------- | ------------- | ---------------------------------------- |
| `.value` property   | no            | no                                       |
| `value` attribute   | no            | no                                       |
| `<script>` child    | yes           | yes                                      |
| text content        | no            | yes                                      |
| `content` attribute | no            | no                                       |

Values coming from JavaScript or from an attribute are data and must never be modified.

### 5. Lifecycle

- `connectedCallback` can run many times: the shadow root is created once (`this.shadowRoot || this.attachShadow(...)`), a moved element keeps its editor.
- `disconnectedCallback` waits a microtask and tears down only when the element is really gone (a move is "disconnect, then connect").
- Teardown keeps the content, so an element inserted again comes back with it.
- Ace's base css lives in `document.head`; it is shared with every shadow root through `adoptedStyleSheets` (one `CSSStyleSheet` per source `<style>`, cached), never copied per editor.

## Ace Editor Web Component API

The full description is in [ace-editor-web-component/SKILL.md](ace-editor-web-component/SKILL.md). Short version:

### Basic Usage

```html
<script
  type="module"
  src="/ace-web-component.js"
  data-main-ace="/noprettier/ace/ace-builds-1.43.4/src-min-noconflict/ace.js"
></script>

<ace-editor lang="javascript" name="code">
  <script type="ace">
    console.log('Hello World');
  </script>
</ace-editor>
```

The URL of `ace.js` is given once per page: `data-main-ace` attribute of the script tag, or `setDataMainAce(url)` exported by the module. There is no `src` attribute on `<ace-editor>`.

### Attributes

- `value`: editor content (can be changed at any time, also on a readonly editor)
- `lang`: language mode (default: javascript; `js`, `ts`, `bash` are accepted aliases)
- `theme`: editor theme (default: idle_fingers)
- `readonly`: user can't edit (boolean attribute)
- `tab-size`: tab size in spaces (default: 4)
- `min-height-lines`, `min-height-px`: minimum height
- `name`: name for form submission
- `id`: unique among editors, auto-generated when missing
- `data-notrim`, `data-nolt`, `data-eval`, `content`: read once at initialization

Line wrapping is always on.

### Properties and methods

- `.value`: get/set editor content (set works at any time, never fires `input`)
- `.editor` / `.getEditor()`: underlying Ace editor instance (null until initialized)
- `.ready`: promise resolved with `{ component, editor, id }` when initialized
- `.focus()`, `.blur()`
- `.form`, `.name`: form participation (the element is form-associated)

### Events

- `input`: user edited the content (once per edit; not fired for programmatic changes). Read `event.target.value`
- `change`: editor lost focus with changed content
- `ready`: editor is initialized, `event.detail` is `{ component, editor, id }` (`aceOnLoad` is the older name)
- `onLoad`: `element.addEventListener("onLoad", ({ component, editor, id }) => {})` - called when initialized, or immediately when it already is

## Reference Implementation Notes

The `existing_examples/` directory contains the original React implementation:

- **Ace.jsx**: Full-featured React component with all patterns
- **github.js**: Script loading and initialization logic
- **doace.js**: Vanilla JS implementation for syntax highlighting
- **003next.entry.jsx**: Complex usage example with multiple editors

These files are history: they are not used by the component and some of their patterns were replaced (see "Key Technical Patterns" above).

These files demonstrate:

- Async loading pattern for Ace editor
- Update management between React state and editor
- Auto-sizing calculations
- Focus/blur handling
- Event delegation for UI interactions
- Extension loading (ext-linking.js)

## GitHub Pages Deployment

The repository is configured to serve via GitHub Pages from the root directory:

- `.nojekyll` file prevents Jekyll processing
- All files served statically
- `/noprettier/` directory included for Ace editor
- No build process required

## Common Tasks

### Adding a New Lesson

1. Create directory: `/learning/0XX_lesson_name/`
2. Create `index.html` with minimal HTML structure
3. Implement web component inline in `<script>` tag
4. Add relevant MDN documentation links (see MDN Links section below)
5. Add navigation link in root `index.html`
6. Keep it minimal - raw HTML elements only

### MDN Documentation Links

Each lesson should include relevant MDN links in a "Further Reading" section. Common MDN resources:

**Web Components:**

- Using custom elements: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements
- Using shadow DOM: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM
- Using templates and slots: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots

**APIs:**

- customElements.define(): https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define
- attachShadow(): https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow
- observedAttributes: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes
- attributeChangedCallback: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
- slot element: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot

**Lifecycle Callbacks:**

- connectedCallback: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
- disconnectedCallback: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks
- adoptedCallback: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks

### Updating Ace Editor Version

1. Download new version from https://github.com/ajaxorg/ace-builds/releases
2. Extract to `/noprettier/ace/ace-builds-X.Y.Z/` and add a line to `/noprettier/ace/log.md`
3. Update the paths in `learning/008_ace_async_loader/index.html` and `dynamic.html`
4. Update the version in `ace-editor-web-component/SKILL.md`, `ace-editor/src/App.tsx` and in this file
5. Test both pages of lesson 008

### Testing the Web Component

1. Start server: `node server.js`
2. Open: http://localhost:3000/learning/008_ace_async_loader/dynamic.html
3. Check browser console for errors (one "Duplicate ace-editor ID" error is expected: it is a demo on that page)
4. In the Network tab `ace.js` must be requested exactly once
5. Things which are easy to break and are not visible by just looking at the page:
   - `<form>` with a named editor: `new FormData(form)` contains its content
   - typing one character fires exactly one `input` event; setting `.value` or the `value` attribute fires none
   - moving an editor in the DOM (`parent.appendChild(editor)`) keeps it working
   - an editor inside `display: none` initializes when it is shown
   - narrowing the container makes the editor taller (lines wrap)
6. `cd ace-editor && npm run build` type-checks the typings

## Architecture Decisions

### Why No Build Process?

- Pure web standards approach
- Maximum compatibility and longevity
- Easy to understand and debug
- No tooling complexity
- Directly maps to what browsers run

### Why Manual Ace Download?

- Following existing project pattern
- Full control over version
- No npm dependency conflicts
- Matches production deployment strategy
- Simpler for learning purposes

### Why Progressive Lessons?

- Each concept builds on previous
- Easy to debug and understand
- Can reference specific lesson for each feature
- Demonstrates real-world component development
- Clear learning progression

## Troubleshooting

### Ace Editor Not Loading

1. Check path in `src` attribute matches actual file location
2. Verify `/noprettier/ace/` directory exists and contains ace.js
3. Check browser console for 404 errors
4. Ensure server is running and serving static files

### Component Not Registering

1. Verify component name has hyphen (required for custom elements)
2. Check `customElements.define()` is called
3. Ensure script runs after DOM is ready
4. Check for JavaScript errors in console

### Editor Not Auto-sizing

1. Verify 'change' event listener is attached to session
2. Check height calculation includes scrollbar width
3. Ensure `editor.resize()` is called after height change
4. Test with different content lengths

### Updates Not Working

1. Check that `observedAttributes` includes the attribute
2. `value` is skipped when it equals the current content - that is intended
3. From an inline script which runs before the component script, `.value` can be assigned but not read (see SKILL.md, section 5)

## React Integration Strategy for Ace Editor Web Component

### Objectives

- Seamlessly use the existing Web Component in React
- Minimal wrapper required
- Preserve all existing functionality
- Support React's controlled component pattern

### Integration Approaches

#### 1. Direct Web Component Usage

This is what `ace-editor/src/App.tsx` does:

```tsx
import type AceEditorComponent from "../../ace-web-component.js";
import { setDataMainAce } from "../../ace-web-component.js";

setDataMainAce("https://cdnjs.cloudflare.com/ajax/libs/ace/1.43.3/ace.min.js");

function AceEditorComponentDemo() {
  const [code, setCode] = useState("");

  return (
    <ace-editor
      value={code}
      onInput={(e: React.FormEvent<AceEditorComponent>) => setCode(e.currentTarget.value)}
      lang="javascript"
    />
  );
}
```

#### 2. Wrapper Component

```jsx
function ReactAceEditor({ value, onChange, lang = "javascript", theme = "idle_fingers", ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const current = ref.current;

    const handleInput = (e) => {
      onChange(e.target.value);
    };

    current?.addEventListener("input", handleInput);

    return () => {
      current?.removeEventListener("input", handleInput);
    };
  }, [onChange]);

  return <ace-editor ref={ref} value={value} lang={lang} theme={theme} {...props} />;
}
```

### Key Considerations

- Importing `ace-web-component.js` registers the element (`customElements.define()`), do it before rendering
- Call `setDataMainAce(url)` before the first `<ace-editor>` is rendered; Ace itself is loaded lazily by the component
- React 19 sets `value` as a property when the element is defined, React 18 as an attribute - both go through the same code in the component
- React's `onInput` works. React's `onLoad` prop is the native `load` event and does NOT receive the component's `onLoad`: use `ref.current.ready` or `ref.current.addEventListener("onLoad", ...)` in an effect
- Typings: `ace-web-component.d.ts` augments `JSX.IntrinsicElements`. When the file is imported from outside of the package (like the demo does), "react" has to be resolvable from its location - see `paths` in `ace-editor/tsconfig.app.json`

### Performance Optimizations

- Lazy load Ace editor script
- Memoize wrapper component
- Use `shouldComponentUpdate` or `React.memo` for minimal re-renders
