# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository is a comprehensive learning path for **Web Components**, culminating in a production-ready **Ace Editor Web Component**. The project teaches web component concepts progressively through 16 hands-on lessons, from basic custom elements to advanced component patterns.

## Repository Structure

```
/
├── server.js                    # Simple Express server for development
├── package.json                 # Node.js dependencies (Express only)
├── index.html                   # Landing page with navigation to all lessons
├── .nojekyll                    # GitHub Pages configuration
│
├── /learning/                   # Progressive web components lessons
│   ├── 001_basic_custom_element/
│   ├── 002_shadow_dom_basics/
│   ├── 003_attributes_and_properties/
│   ├── 004_slots_and_content_projection/
│   ├── 005_lifecycle_hooks/
│   ├── 006_event_handling/
│   ├── 007_templates_and_fragments/
│   ├── 008_async_script_loading/
│   ├── 009_ace_async_loader/
│   ├── 010_basic_ace_component/
│   ├── 011_ace_initialization/
│   ├── 012_ace_configuration/
│   ├── 013_ace_content_management/
│   ├── 014_ace_auto_sizing/
│   ├── 015_ace_advanced_features/
│   └── 016_final_ace_component/
│   Each directory contains an index.html file
│
├── /noprettier/                 # External libraries (not processed by prettier)
│   └── /ace/
│       └── /ace-builds-1.15.0/
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
node server.js
```
- Serves all files from the project root on http://localhost:3000
- Serves static files including `/node_modules` and `/noprettier`
- No build process required - pure web standards

### Install Dependencies
```bash
npm install
```
Only installs Express (no bundler, no React, no build tools)

## Ace Editor Setup

### Version Information
- **Current Version**: 1.15.0
- **Download Source**: https://github.com/ajaxorg/ace-builds/releases
- **Installation**: Manual download as zip file (not npm)

### Installation Steps
1. Download ace-builds-1.15.0.zip from GitHub releases
2. Extract to `/noprettier/ace/ace-builds-1.15.0/`
3. Main file: `/noprettier/ace/ace-builds-1.5.0/src-min-noconflict/ace.js`
4. Extensions: `/noprettier/ace/ace-builds-1.5.0/src-min-noconflict/ext-linking.js`

### Why Manual Installation?
The project follows a pure web standards approach without npm packages for frontend code. Ace is loaded dynamically at runtime using the async script loading pattern.

## Learning Path Architecture

### Lessons 001-008: Web Components Fundamentals
Progressive introduction to web components APIs:
1. Basic custom elements and lifecycle
2. Shadow DOM and style encapsulation
3. Attributes, properties, and reactivity
4. Content projection with slots
5. Complete lifecycle management
6. Event handling and custom events
7. Template elements and performance
8. Async script loading patterns

### Lessons 009-016: Ace Editor Web Component
Phased build of production-ready component:
9. Async loader for Ace editor
10. Basic component shell and structure
11. Editor initialization after async load
12. Configuration (mode, theme, options)
13. Content management and update patterns
14. Auto-sizing based on content
15. Advanced features (linking, clipboard)
16. Final production component

### Design Principles
- **Zero dependencies**: Each lesson uses pure HTML/JS/CSS
- **Progressive**: Each lesson builds on previous concepts
- **Minimal UI**: Raw HTML elements, no fancy styling
- **Practical**: Real-world patterns used in production
- **Self-contained**: Each lesson is complete and runnable

## Key Technical Patterns

### 1. Async Script Loading Pattern
Based on `existing_examples/github.js:347-375`:

```javascript
async function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    let handler = setInterval(() => {
      if (window.ace && window.ace.edit) {
        clearInterval(handler);
        resolve();
      }
    }, 100);
    script.src = src;
    document.head.appendChild(script);
  });
}
```

### 2. Editor Update Management
Based on `existing_examples/Ace.jsx:129-142`:

```javascript
// Skip updates when editor has focus to prevent conflicts
if (!this.updateFlag) return;

const editorContent = editor.getValue();
if (editorContent !== this.pendingContent) {
  editor.setValue(this.pendingContent, -1);
}
```

Pattern prevents update loops between component state and editor state.

### 3. Auto-sizing Based on Content
Based on `existing_examples/doace.js:372-396`:

```javascript
function updateHeight() {
  const session = editor.getSession();
  const newHeight =
    session.getScreenLength() *
    editor.renderer.lineHeight +
    editor.renderer.scrollBar.getWidth();

  container.style.height = newHeight + 'px';
  editor.resize();
}

editor.getSession().on('change', updateHeight);
```

### 4. Focus State Management
Based on `existing_examples/Ace.jsx:316-327`:

```javascript
editor.on('focus', () => {
  this.hasFocus = true;
  this.updateFlag = false;  // Prevent external updates
});

editor.on('blur', () => {
  this.hasFocus = false;
  this.updateFlag = true;   // Allow external updates
});
```

## Final Ace Editor Web Component API

### Basic Usage
```html
<ace-editor
  src="/noprettier/ace/ace-builds-1.5.0/src-min-noconflict/ace.js"
  value="console.log('Hello World');"
  lang="javascript"
  theme="idle_fingers"
  wrap
  readonly>
</ace-editor>
```

### Attributes
- `src` (required): Path to ace.js file
- `value`: Initial editor content
- `lang`: Language mode (javascript, python, json, etc.)
- `theme`: Editor theme (default: idle_fingers)
- `wrap`: Enable line wrapping (boolean attribute)
- `readonly`: Make editor read-only (boolean attribute)
- `tab-size`: Tab size in spaces (default: 4)

### Properties
- `.value`: Get/set editor content
- `.editor`: Access underlying Ace editor instance
- `.getValue()`: Get current content
- `.setValue(content)`: Set content programmatically
- `.focus()`: Focus the editor

### Events
- `change`: Fired when content changes
  - `event.detail.value`: New content
- `ready`: Fired when Ace editor is loaded and initialized
  - `event.detail.editor`: Ace editor instance

## Reference Implementation Notes

The `existing_examples/` directory contains the original React implementation:

- **Ace.jsx**: Full-featured React component with all patterns
- **github.js**: Script loading and initialization logic
- **doace.js**: Vanilla JS implementation for syntax highlighting
- **003next.entry.jsx**: Complex usage example with multiple editors

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
4. Add navigation link in root `index.html`
5. Keep it minimal - raw HTML elements only

### Updating Ace Editor Version
1. Download new version from https://github.com/ajaxorg/ace-builds/releases
2. Extract to `/noprettier/ace/ace-builds-X.Y.Z/`
3. Update `src` paths in lessons 009-016
4. Test all Ace-related lessons
5. Update version number in this file

### Testing the Web Component
1. Start server: `node server.js`
2. Open: http://localhost:3000/learning/016_final_ace_component/
3. Test all attributes and properties
4. Check browser console for errors
5. Verify cleanup on disconnect (no memory leaks)

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
1. Check focus/blur state management
2. Verify `updateFlag` is set correctly
3. Ensure `attributeChangedCallback` is implemented
4. Check `observedAttributes` includes 'value'
