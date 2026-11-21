Demo and documentation page: [link](https://stopsopa.github.io/ace-editor-webcomponent/learning/008_ace_async_loader/dynamic.html)

---

## AI skill

This repository ships an agent skill ([ace-editor-web-component/SKILL.md](ace-editor-web-component/SKILL.md)) that teaches AI coding agents (Claude Code, Cursor, Codex, ...) how to use the `<ace-editor>` web component: loading it from CDN, markup, updating content and language from JavaScript, waiting for initialization with `onLoad`, and unique ids.

Install it with [skills.sh](https://skills.sh):

```bash
npx skills add stopsopa/ace-editor-webcomponent --skill ace-editor-web-component
```

Useful variations:

```bash
# install globally (user-level) instead of into the current project
npx skills add stopsopa/ace-editor-webcomponent --skill ace-editor-web-component -g

# install only for a specific agent
npx skills add stopsopa/ace-editor-webcomponent --skill ace-editor-web-component --agent claude-code

# list skills available in this repository without installing
npx skills add stopsopa/ace-editor-webcomponent --list

# update / remove later
npx skills update ace-editor-web-component
npx skills remove ace-editor-web-component
```

---

Bonus: Learning web components page: https://stopsopa.github.io/ace-editor-webcomponent
