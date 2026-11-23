# `<ace-editor>` in React

Small React + TypeScript + Vite app which uses the `<ace-editor>` web component from the root of this repository as a controlled input.

The component and its typings are imported directly from the parent directory ([../ace-web-component.js](../ace-web-component.js), [../ace-web-component.d.ts](../ace-web-component.d.ts)), there is nothing to copy or link.

```bash
cd ace-editor
npm install
npm run dev     # start dev server
npm run build   # type-check (tsc -b) and build
```

See [src/App.tsx](src/App.tsx):

- `setDataMainAce(url)` tells the component where to load Ace from (there is no script tag with `data-main-ace` in a bundled app)
- `value={...}` sets the content, `onInput` receives user edits, `event.currentTarget.value` is the new content
