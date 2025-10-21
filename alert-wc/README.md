# Alert Box Web Component

A lightweight, reusable alert/callout web component with GitHub-style alerts. Built with vanilla JavaScript and the Web Components API.

## Features

- ✅ Pure Web Components API - no dependencies
- ✅ Shadow DOM for style encapsulation
- ✅ GitHub-style alert designs with Octicons
- ✅ Supports any HTML content via slots
- ✅ Reactive attribute updates
- ✅ Five alert types: note, tip, important, warning, caution
- ✅ Lightweight (~3KB uncompressed)

## Installation

### Option 1: Local File

Download `alert-box.js` and include it in your HTML:

```html
<script src="path/to/alert-box.js"></script>
```

### Option 2: ES Module

```javascript
import './alert-box.js';
```

## Usage

### Basic Example

```html
<!DOCTYPE html>
<html>
<head>
  <script src="alert-box.js"></script>
</head>
<body>
  <alert-box type="note">
    This is a note callout with important information.
  </alert-box>

  <alert-box type="warning">
    <strong>Warning:</strong> This action cannot be undone.
  </alert-box>
</body>
</html>
```

### All Alert Types

```html
<!-- Note (blue) - Informational content -->
<alert-box type="note">
  Highlights information that users should take into account, even when skimming.
</alert-box>

<!-- Tip (green) - Helpful suggestions -->
<alert-box type="tip">
  Optional information to help a user be more successful.
</alert-box>

<!-- Important (purple) - Crucial information -->
<alert-box type="important">
  Crucial information necessary for users to succeed.
</alert-box>

<!-- Warning (yellow) - Critical content -->
<alert-box type="warning">
  Critical content demanding immediate user attention due to potential risks.
</alert-box>

<!-- Caution (red) - Negative consequences -->
<alert-box type="caution">
  Negative potential consequences of an action.
</alert-box>
```

### Rich HTML Content

The component accepts any HTML content via the default slot:

```html
<alert-box type="warning">
  <strong>⚠️ Warning:</strong> Using both methods will cause issues:
  <ul>
    <li>Method A is preferred</li>
    <li>Method B has limitations</li>
    <li>Don't combine both approaches</li>
  </ul>
  <p>See the <a href="/docs">documentation</a> for details.</p>
</alert-box>
```

## API Reference

### Attributes

| Attribute | Type   | Default | Description                                                    |
|-----------|--------|---------|----------------------------------------------------------------|
| `type`    | string | `note`  | Alert type: "note", "tip", "important", "warning", or "caution" |

### Slots

| Slot      | Description                                     |
|-----------|-------------------------------------------------|
| (default) | Content to display in the alert box (accepts HTML) |

### Alert Types

| Type        | Color  | Use Case                                  |
|-------------|--------|-------------------------------------------|
| `note`      | Blue   | Neutral, informational content            |
| `tip`       | Green  | Helpful, optional information             |
| `important` | Purple | Crucial information                       |
| `warning`   | Yellow | Critical content with potential risks     |
| `caution`   | Red    | Negative consequences                     |

## Dynamic Usage

### Changing Alert Type

```javascript
const alert = document.querySelector('alert-box');
alert.setAttribute('type', 'warning'); // Automatically re-renders
```

### Creating Alerts Dynamically

```javascript
const alert = document.createElement('alert-box');
alert.setAttribute('type', 'important');
alert.textContent = 'This is dynamically created!';
document.body.appendChild(alert);
```

## Styling

The component uses Shadow DOM for style encapsulation. The default styles match GitHub's alert design.

### Custom Spacing

You can control the spacing around alerts using standard CSS on the host element:

```css
alert-box {
  margin: 20px 0;
}
```

### Theming

The component's colors are hard-coded to match GitHub's design. If you need custom colors, you can modify the `getConfig()` method in `alert-box.js`.

## Browser Compatibility

- Chrome/Edge: 53+
- Firefox: 63+
- Safari: 10.1+
- Opera: 40+

The component uses:
- Custom Elements v1
- Shadow DOM v1
- ES6 Classes

## Examples

Check out `index.html` for a complete demo with all alert types and examples.

## Technical Details

### Architecture

- **Custom Element:** Extends `HTMLElement` using the Custom Elements API
- **Shadow DOM:** Encapsulates styles and markup
- **Observed Attributes:** Reacts to `type` attribute changes
- **Slots:** Default slot for flexible content projection

### Component Lifecycle

1. **Constructor:** Attaches shadow root
2. **connectedCallback:** Renders initial content when inserted into DOM
3. **attributeChangedCallback:** Re-renders when `type` attribute changes

### Shadow DOM Structure

```
#shadow-root
  └── style (component styles)
  └── .alert-box (container)
      ├── svg.icon (GitHub Octicon)
      ├── .label (Alert type label)
      └── .content (slot for user content)
```

## License

MIT License - Feel free to use in your projects!

## Links

- [MDN: Using custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)
- [MDN: Using shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM)
- [GitHub Primer Design System](https://primer.style/design/foundations/color)
