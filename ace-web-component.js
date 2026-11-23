// ace-web-component.js - <ace-editor> web component, loads the Ace Editor library only once per page
// use: <script type="module" src="./ace-web-component.js" data-main-ace="/noprettier/ace/ace-builds-[version]/src-min-noconflict/ace.js"></script>
// debug logs: add data-debug to the script tag above, or set window.ACE_WEB_COMPONENT_DEBUG = true

let dataMainAce;
export function setDataMainAce(url) {
  dataMainAce = url;
}

/**
 * Where to load the main Ace script from.
 * This file is an ES module, so document.currentScript is not available here.
 * Order: setDataMainAce(url), then <script data-main-ace="...">, then any element with data-main-ace.
 * NOTE: the attribute is called "data-main-ace" on purpose: Ace reads data-ace-* attributes
 * of script tags as its own config, so names starting with "data-ace-" are avoided.
 */
function resolveAceUrl() {
  return (
    dataMainAce ||
    document.querySelector("script[data-main-ace]")?.getAttribute("data-main-ace") ||
    document.querySelector("[data-main-ace]")?.getAttribute("data-main-ace")
  );
}

function debugEnabled() {
  return (
    window.ACE_WEB_COMPONENT_DEBUG === true || document.querySelector("script[data-main-ace][data-debug]") !== null
  );
}

function log(...args) {
  if (debugEnabled()) {
    console.log("📦 ace-web-component.js", ...args);
  }
}

const DEFAULT_LANG = "javascript";
const DEFAULT_THEME = "idle_fingers";
const DEFAULT_TAB_SIZE = 4;
const ACE_LOAD_TIMEOUT_MS = 10000;

const LANG_ALIASES = { js: "javascript", ts: "typescript", bash: "sh" };

function modePath(lang) {
  return `ace/mode/${LANG_ALIASES[lang] || lang || DEFAULT_LANG}`;
}

function themePath(theme) {
  return `ace/theme/${theme || DEFAULT_THEME}`;
}

// ---------------------------------------------------------------------------
// ids
// ---------------------------------------------------------------------------

// id -> the <ace-editor> element which registered it
const registeredIds = new Map();
let autoIdCounter = 0;

/**
 * Generates a unique ID for an ace-editor component
 * @returns {string} Unique ID in format "ace-editor-N"
 */
function generateUniqueId() {
  let id;
  do {
    autoIdCounter++;
    id = `ace-editor-${autoIdCounter}`;
  } while (registeredIds.has(id) || document.getElementById(id));
  return id;
}

// ---------------------------------------------------------------------------
// content helpers
// ---------------------------------------------------------------------------

/**
 * Element has layout boxes. False for display: none on the element or on any ancestor.
 * visibility: hidden and opacity: 0 still have layout, and Ace can initialize there.
 */
function hasLayout(el) {
  return el instanceof Element && el.getClientRects().length > 0;
}

/**
 * Decodes &lt; to <
 * Only this one entity is decoded. It exists to make it possible to write
 * &lt;/script> inside <script type="ace"> without closing the tag.
 * @param {string} str
 * @returns {string}
 */
function unescapeHtmlEntities(str) {
  return str.replace(/&lt;/g, "<");
}

/**
 * Removes common leading whitespace from all lines
 * @param {string} text
 * @returns {string}
 */
function dedent(text) {
  let diff = Number.MAX_SAFE_INTEGER;

  let lines = text.split("\n");

  lines.forEach((line) => {
    if (!/^\s*$/.test(line)) {
      // if line isn't just white characters
      const d = line.length - line.replace(/^\s+/, "").length;

      if (d < diff) {
        diff = d;
      }
    }
  });

  if (diff !== Number.MAX_SAFE_INTEGER && diff > 0) {
    lines = lines.map((line) => line.substring(diff));

    return lines.join("\n");
  }

  return text;
}

/**
 * Clean-up for content written by hand in html:
 * removes common indentation, the line break right after the opening tag
 * and the whitespace-only line before the closing tag.
 * Only one leading line is removed, so an intended empty first line can be kept by adding one more.
 */
function cleanStaticContent(text) {
  return dedent(text)
    .replace(/^[ \t]*\r?\n/, "")
    .replace(/\r?\n[ \t]*$/, "");
}

// ---------------------------------------------------------------------------
// Ace loader (singleton)
// ---------------------------------------------------------------------------

let aceEditorPromise = null;

/**
 * Loads Ace Editor scripts only once using singleton pattern
 * @returns {Promise<Object>} Promise that resolves with window.ace object
 */
function loadAceEditor(aceEditorUrl) {
  // Return cached promise if already loading/loaded
  if (aceEditorPromise) {
    return aceEditorPromise;
  }

  // Ace is already on the page (loaded by somebody else) - don't load it again
  if (typeof window.ace?.edit === "function") {
    aceEditorPromise = Promise.resolve(window.ace);
    return aceEditorPromise;
  }

  log("Loading Ace Editor for the first time...");

  const promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = aceEditorUrl;

    const fail = (message) => {
      script.remove();
      console.error(`❌ ${message}`);
      reject(new Error(message));
    };

    script.onload = () => {
      log("Ace Editor core script loaded successfully!");

      const started = Date.now();

      // Wait for window.ace to be available
      const checkAce = () => {
        if (typeof window.ace?.edit === "function") {
          resolve(window.ace);
        } else if (Date.now() - started > ACE_LOAD_TIMEOUT_MS) {
          fail(
            `Script loaded but window.ace.edit is not available after ${ACE_LOAD_TIMEOUT_MS}ms. Is this the Ace Editor main script? ${aceEditorUrl}`,
          );
        } else {
          setTimeout(checkAce, 50);
        }
      };

      checkAce();
    };

    script.onerror = () => fail(`Failed to load Ace Editor from ${aceEditorUrl}`);

    document.head.appendChild(script);
  });

  // IMPORTANT: stored synchronously, before anything async happens,
  // so all components connected in the same moment share this one promise
  aceEditorPromise = promise;

  // Don't cache a failure: the next editor connected to the page can try again
  promise.catch(() => {
    if (aceEditorPromise === promise) {
      aceEditorPromise = null;
    }
  });

  return promise;
}

// ---------------------------------------------------------------------------
// Ace styles -> shadow DOM
// ---------------------------------------------------------------------------
// Ace injects its base css into document.head. Styles from the document don't reach shadow DOM,
// so they have to be brought into each shadow root.
// One CSSStyleSheet object is created per <style> node and shared by all editors (no copies).

const supportsAdoptedStyleSheets =
  typeof CSSStyleSheet !== "undefined" &&
  "replaceSync" in CSSStyleSheet.prototype &&
  typeof ShadowRoot !== "undefined" &&
  "adoptedStyleSheets" in ShadowRoot.prototype;

// <style> node -> CSSStyleSheet
const sheetCache = new WeakMap();

function isAceStyleNode(node) {
  return node && node.tagName === "STYLE" && /\.ace[_-]/.test(node.textContent || "");
}

function aceStyleNodes() {
  return Array.from(document.querySelectorAll("style")).filter(isAceStyleNode);
}

function sheetFor(node) {
  let sheet = sheetCache.get(node);
  if (!sheet) {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(node.textContent);
    sheetCache.set(node, sheet);
  }
  return sheet;
}

function applyAceStyles(shadow) {
  const nodes = aceStyleNodes();

  if (supportsAdoptedStyleSheets) {
    try {
      // assignment replaces previous list - nothing accumulates
      shadow.adoptedStyleSheets = nodes.map(sheetFor);
      return;
    } catch (e) {
      log("Could not adopt stylesheets, copying manually:", e);
    }
  }

  // Fallback: copy styles manually, replacing previous copies
  shadow.querySelectorAll("style[data-ace-copy]").forEach((old) => old.remove());

  nodes.forEach((node) => {
    const copy = document.createElement("style");
    copy.setAttribute("data-ace-copy", "");
    copy.textContent = node.textContent;
    shadow.appendChild(copy);
  });
}

// all initialized editors currently on the page
const liveEditors = new Set();

// one observer for the whole page, catches Ace styles added later (themes loaded on demand)
let headObserver = null;

function watchAceStyles() {
  if (headObserver) {
    return;
  }

  headObserver = new MutationObserver((mutations) => {
    const found = mutations.some((mutation) => Array.from(mutation.addedNodes).some(isAceStyleNode));

    if (found) {
      liveEditors.forEach((component) => component._onAceStylesChanged());
    }
  });

  headObserver.observe(document.head, { childList: true });
}

function unwatchAceStyles() {
  if (headObserver && liveEditors.size === 0) {
    headObserver.disconnect();
    headObserver = null;
  }
}

/**
 * Web Component for Ace Editor
 *
 * @description
 * A custom web component that wraps the Ace Editor with a flexible, declarative API.
 *
 * @example
 * <!-- Basic usage -->
 * <ace-editor
 *   id="my-editor"
 *   lang="javascript"
 *   theme="monokai"
 *   value="console.log('Hello World');"
 * ></ace-editor>
 *
 * @example
 * <!-- Alternative content sources -->
 * <ace-editor>
 *   <script type="ace">
 *     function example() {
 *       return "Preserves original formatting";
 *     }
 *   </script>
 * </ace-editor>
 *
 * @typedef {Object} AceEditorOptions
 * @property {string} [value] - Content of the editor
 * @property {string} [lang='javascript'] - Programming language mode (e.g., 'javascript', 'python', 'typescript')
 * @property {string} [theme='idle_fingers'] - Editor color theme
 * @property {boolean} [readonly=false] - Make editor read-only for the user
 * @property {number} [tab-size=4] - Tab size in spaces
 * @property {number} [min-height-px] - Minimum height in pixels
 * @property {number} [min-height-lines] - Minimum height in lines
 * @property {string} [name] - Name under which the content is submitted with a <form>
 *
 * Initial content priority (from highest to lowest):
 * 1. .value property assigned before the editor was ready - used unchanged
 * 2. value attribute - used unchanged
 * 3. <script type="ace"> - preserves formatting, Prettier-friendly
 * 4. text content
 * 5. content attribute - used unchanged
 *
 * Clean-up of content written by hand in html (sources 3 and 4 only):
 * - common indentation is removed, together with the line break after the opening tag
 *   and the whitespace-only line before the closing tag (disable with data-notrim)
 * - in <script> content &lt; is decoded to < (disable with data-nolt).
 *   This allows writing &lt;/script> inside <script type="ace"> without prematurely closing the tag.
 *
 * data-notrim, data-nolt, data-eval and content are read once, when the editor initializes.
 *
 * Events:
 * - input  - user edited the content (not fired for programmatic changes, same as native textarea)
 * - change - editor lost focus and the content is different than it was when it got focus
 * - ready  - editor is initialized. event.detail: { component, editor, id }. See also .ready promise
 * - aceOnLoad - older name for "ready", still supported
 * - onLoad - element.addEventListener("onLoad", ({ component, editor, id }) => {}) is called when the editor
 *   is initialized, or immediately if it already is. Works also when registered before this script has loaded.
 */
export default class AceEditorComponent extends HTMLElement {
  // participate in <form> like native textarea
  static formAssociated = true;

  static get observedAttributes() {
    return ["value", "lang", "theme", "readonly", "tab-size", "min-height-px", "min-height-lines"];
  }

  /** The underlying Ace editor instance, null until initialized */
  editor = null;

  #internals = null;
  #formDisabled = false;

  // value assigned through .value before the editor exists (or content kept after the editor was destroyed)
  #pendingValue = null;
  // content to restore on form.reset()
  #defaultValue = null;

  #registeredId = null;

  // identifies current initialization, set to null to cancel it
  #initToken = null;
  #cancelVisibilityWait = null;

  #programmaticChange = false;
  #valueAtFocus = null;

  #resizeObserver = null;
  #heightUpdateTimer = null;
  #resizePending = false;
  #evalDone = false;

  #isLoaded = false;
  #pendingLoadListeners = [];
  #readyPromise;
  #resolveReady;

  constructor() {
    super();

    this.#resetReadyPromise();

    if (typeof this.attachInternals === "function") {
      try {
        this.#internals = this.attachInternals();
      } catch (e) {
        // form participation not available
      }
    }
  }

  #resetReadyPromise() {
    this.#isLoaded = false;
    this.#readyPromise = new Promise((resolve) => {
      this.#resolveReady = resolve;
    });
  }

  #readyDetail() {
    return {
      component: this,
      editor: this.editor,
      id: this.id,
    };
  }

  /**
   * Promise resolved with { component, editor, id } when the editor is initialized.
   * Safe to use at any time and any number of times:
   *   const { editor } = await element.ready;
   */
  get ready() {
    return this.#readyPromise;
  }

  static #callLoadListener(listener, detail) {
    try {
      if (typeof listener === "function") {
        listener(detail);
      } else if (listener && typeof listener.handleEvent === "function") {
        listener.handleEvent(detail);
      }
    } catch (e) {
      // one failing listener must not stop the others
      console.error("❌ ace-web-component.js: error in 'onLoad' listener:", e);
    }
  }

  _triggerLoadEvent() {
    if (this.#isLoaded) return; // Prevent double firing

    this.#isLoaded = true;

    const detail = this.#readyDetail();

    this.#resolveReady(detail);

    this.dispatchEvent(new CustomEvent("ready", { bubbles: true, detail }));

    // Real event for listeners registered BEFORE this element was upgraded (before this script ran):
    // at that time addEventListener() below didn't exist yet, so they are native listeners.
    const event = this.#onLoadEvent();

    this.dispatchEvent(event);

    // Listeners registered through addEventListener() below, before the editor was ready
    const listeners = this.#pendingLoadListeners;
    this.#pendingLoadListeners = [];
    listeners.forEach((listener) => AceEditorComponent.#callLoadListener(listener, event));
  }

  /**
   * What 'onLoad' listeners receive: an event which has component, editor and id
   * directly on it (and also in event.detail), so ({ component, editor, id }) => {} works
   * no matter when and how the listener was registered.
   */
  #onLoadEvent() {
    const detail = this.#readyDetail();

    return Object.assign(new CustomEvent("onLoad", { bubbles: true, detail }), detail);
  }

  // 'onLoad' is special: the listener is called also when it is registered
  // after the editor is already initialized ("run now or as soon as it is ready")
  addEventListener(type, listener, options) {
    if (type === "onLoad") {
      if (this.#isLoaded) {
        AceEditorComponent.#callLoadListener(listener, this.#onLoadEvent());
      } else {
        // If not loaded, store the listener to be called when it loads
        this.#pendingLoadListeners.push(listener);
      }
      return;
    }

    super.addEventListener(type, listener, options);
  }

  removeEventListener(type, listener, options) {
    if (type === "onLoad") {
      this.#pendingLoadListeners = this.#pendingLoadListeners.filter((l) => l !== listener);
      return;
    }

    super.removeEventListener(type, listener, options);
  }

  /**
   * A property assigned before this element was upgraded to AceEditorComponent
   * (before this script ran) is a plain own property which hides the getter and setter of the class.
   * Remove it and run the real setter with its value.
   */
  #upgradeProperty(prop) {
    if (Object.prototype.hasOwnProperty.call(this, prop)) {
      const value = this[prop];
      delete this[prop];
      this[prop] = value;
    }
  }

  #syncFormValue() {
    if (this.#internals && typeof this.#internals.setFormValue === "function") {
      this.#internals.setFormValue(this.value);
    }
  }

  /**
   * Content defined in the markup, with its clean-up applied.
   */
  #resolveMarkupContent() {
    // value attribute: used unchanged
    const value = this.getAttribute("value");
    if (typeof value === "string" && value) {
      return value;
    }

    const trim = !this.hasAttribute("data-notrim");

    // <script type="ace"> first, then any other script (executable script can be displayed too)
    const scriptTag =
      this.querySelector(':scope > script[type="ace"]') ||
      this.querySelector(":scope > script") ||
      this.querySelector("script");

    if (scriptTag && scriptTag.textContent) {
      let text = scriptTag.textContent;

      // script content is raw text for the html parser, so entities are still there
      if (!this.hasAttribute("data-nolt")) {
        text = unescapeHtmlEntities(text);
      }

      return trim ? cleanStaticContent(text) : text;
    }

    // plain text content: entities are already decoded by the html parser
    if (this.textContent) {
      const text = trim ? cleanStaticContent(this.textContent) : this.textContent;

      if (text) {
        return text;
      }
    }

    // content attribute: used unchanged
    return this.getAttribute("content") || "";
  }

  connectedCallback() {
    this.#upgradeProperty("value");

    // Element was moved in the DOM (disconnect + connect) or it is still initializing: keep what we have
    if (this.editor || this.#initToken) {
      this.#scheduleHeightUpdate(true);
      return;
    }

    this.#syncFormValue();

    const aceEditorUrl = resolveAceUrl();

    if (!aceEditorUrl) {
      console.error(
        "❌ ace-web-component.js: Missing URL of the Ace Editor main script. " +
          'Provide it in data-main-ace attribute of the script tag which loads this file: <script type="module" src=".../ace-web-component.js" data-main-ace=".../ace.js"></script> ' +
          "or programmatically with setDataMainAce(url) before any <ace-editor> is connected.",
      );
      return;
    }

    this.aceUrl = aceEditorUrl;

    // Handle ID: auto-generate if missing, or validate if provided
    if (!this.id) {
      this.id = generateUniqueId();
      log(`🆔 Auto-generated unique ID: ${this.id}`);
    }

    let owner = registeredIds.get(this.id);

    if (owner && owner !== this && !owner.isConnected) {
      // previous owner is already removed from the page, its cleanup just didn't run yet
      owner.#teardown();
      owner = null;
    }

    if (owner && owner !== this) {
      const error = new Error(
        `❌ Duplicate ace-editor ID detected: "${this.id}". ` +
          `Each ace-editor must have a unique ID. ` +
          `Either remove the duplicate ID or let the component auto-generate unique IDs.`,
      );

      console.error(error.message);

      this.#renderDuplicateError(error.message);

      // Throw error to prevent further initialization
      throw error;
    }

    registeredIds.set(this.id, this);
    this.#registeredId = this.id;

    const shadow = this.#renderShell();

    const componentId = this.id;

    const token = {};
    this.#initToken = token;

    // Load Ace and initialize
    (async () => {
      try {
        const ace = await loadAceEditor(this.aceUrl);

        if (this.#initToken !== token) return; // removed in the meantime

        await this.#initializeEditor(ace, token);
      } catch (error) {
        if (this.#initToken !== token) return;

        // allow another try when the element is connected again
        this.#initToken = null;

        console.error(`❌ Failed to initialize Ace Editor ${componentId}:`, error);
        const label = shadow.querySelector(".loading-message");
        if (label) {
          label.style.display = "";
          label.textContent = "❌ Failed to load Ace Editor";
          label.style.color = "#555";
        }
      }
    })();
  }

  #shadow() {
    // an element can have only one shadow root for its whole life, and connectedCallback can run many times
    return this.shadowRoot || this.attachShadow({ mode: "open", delegatesFocus: true });
  }

  #renderDuplicateError(message) {
    const shadow = this.#shadow();

    shadow.innerHTML = `
        <style>
          :host {
            display: block;
            width: 100%;
          }
          .error-wrapper {
            border: 2px solid #999;
            background: #e0e0e0;
            padding: 20px;
            color: #333;
          }
          .error-title {
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 10px;
          }
          .error-message {
            font-family: monospace;
            font-size: 14px;
          }
        </style>
        <div class="error-wrapper">
          <div class="error-title">❌ Duplicate ID Error</div>
          <div class="error-message"></div>
        </div>
      `;

    // textContent: the message contains the id, which might come from user data
    shadow.querySelector(".error-message").textContent = message;
  }

  #renderShell() {
    const shadow = this.#shadow();

    // Create structure immediately with loading state
    shadow.innerHTML = `
        <style>
          :host {
            display: block;
            width: 100%;
          }
          .ace-wrapper {
            border: 1px solid #999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .ace-wrapper.loaded {
            background: transparent;
            border: none;
          }
          .loading-message {
            font-weight: bold;
            color: #666;
            font-size: 14px;
            margin: 0;
          }
          .ace-container {
            position: relative;
            width: 100%;
          }
          /* Hide horizontal scrollbar since we use wrap mode */
          .ace_scrollbar-h {
            display: none !important;
          }
        </style>
        <div class="ace-wrapper">
          <p class="loading-message">Loading Ace Editor...</p>
          <div class="ace-container"></div>
        </div>
      `;

    // Native 'input' events of Ace's hidden textarea are "composed": they would leave the shadow DOM
    // and reach listeners of <ace-editor> as a second event, next to the one dispatched by this component.
    // Ace's own listeners are attached to the textarea and have already run at this point.
    if (!shadow._aceInputGuard) {
      shadow._aceInputGuard = true;
      shadow.addEventListener("input", (e) => e.stopPropagation());
    }

    return shadow;
  }

  async #initializeEditor(ace, token) {
    const shadow = this.shadowRoot;
    const wrapper = shadow.querySelector(".ace-wrapper");
    const container = shadow.querySelector(".ace-container");
    const label = shadow.querySelector(".loading-message");

    // Ace can't measure anything inside display: none, wait until the element gets layout
    if (!hasLayout(container)) {
      log(`⏳ Ace Editor [${this.id}] has no layout yet (display: none), waiting before initialization...`);

      await new Promise((resolve) => {
        const observer = new ResizeObserver(() => {
          if (hasLayout(container)) {
            observer.disconnect();
            // continue in a new task: changing layout inside ResizeObserver callback
            // ends with "ResizeObserver loop completed with undelivered notifications"
            setTimeout(resolve, 0);
          }
        });
        observer.observe(container);

        this.#cancelVisibilityWait = () => {
          observer.disconnect();
          resolve();
        };
      });

      this.#cancelVisibilityWait = null;

      if (this.#initToken !== token) return; // removed while waiting
    }

    // Ace base styles have to be in the shadow DOM before Ace measures characters
    applyAceStyles(shadow);

    // Initialize Ace Editor
    const editor = ace.edit(container);
    editor.renderer.setPadding(0);
    editor.renderer.setScrollMargin(0, 0, 0, 0);

    label.style.display = "none";
    wrapper.classList.add("loaded");

    // Configure editor
    const session = editor.getSession();
    session.setUseWorker(false); // disable loading worker-javascript.js
    session.setTabSize(this.#tabSize());
    session.setUseWrapMode(true);

    editor.setTheme(themePath(this.getAttribute("theme")));
    session.setMode(modePath(this.getAttribute("lang")));

    // Store editor reference
    this.editor = editor;

    this.#applyReadOnly();

    // Initial content. Value assigned through .value property wins and is used unchanged
    const markupContent = this.#resolveMarkupContent();

    if (this.#defaultValue === null) {
      this.#defaultValue = markupContent;
    }

    const initialContent = this.#pendingValue !== null ? this.#pendingValue : markupContent;

    this.#pendingValue = null;

    if (initialContent) {
      this.#programmaticChange = true;
      try {
        editor.setValue(initialContent, -1); // -1 moves cursor to start
        editor.clearSelection();
      } finally {
        this.#programmaticChange = false;
      }
    }

    // Content change: resize and dispatch 'input' event
    session.on("change", () => {
      // Only user interactions, not programmatic changes.
      // This matches native textarea/input behavior where element.value = "..." does NOT fire 'input'
      if (this.#programmaticChange) {
        return;
      }

      this.#updateHeight();
      this.#syncFormValue();
      this.dispatchEvent(new Event("input", { bubbles: true }));
    });

    // Wrap mode is on, so number of screen rows depends also on the width
    session.on("changeWrapLimit", () => this.#scheduleHeightUpdate());
    editor.renderer.on("changeCharacterSize", () => this.#scheduleHeightUpdate());

    // Ace notices only resize of the window, not of its container
    let lastWidth = container.getBoundingClientRect().width;
    this.#resizeObserver = new ResizeObserver((entries) => {
      const width = entries[entries.length - 1].contentRect.width;
      // only width: height is set by this component and must not trigger a loop
      if (width !== lastWidth) {
        lastWidth = width;
        // not here: layout must not be changed inside ResizeObserver callback
        this.#scheduleHeightUpdate(true);
      }
    });
    this.#resizeObserver.observe(container);

    // 'change' event, like native textarea: on blur, if content differs from what it was on focus
    editor.on("focus", () => {
      this.#valueAtFocus = editor.getValue();
    });
    editor.on("blur", () => {
      if (this.#valueAtFocus !== null && this.#valueAtFocus !== editor.getValue()) {
        this.dispatchEvent(new Event("change", { bubbles: true }));
      }
      this.#valueAtFocus = null;
    });

    liveEditors.add(this);
    watchAceStyles();

    this.#updateHeight();
    this.#scheduleHeightUpdate();
    this.#syncFormValue();

    const triggerReady = () => {
      if (this.#initToken !== token) return;

      // older name, kept for compatibility
      this.dispatchEvent(new CustomEvent("aceOnLoad", { bubbles: true, detail: this.#readyDetail() }));

      Promise.resolve().then(() => {
        if (this.#initToken !== token) return;

        this._triggerLoadEvent();
      });
    };

    // Execute data-eval code AFTER everything is fully initialized, and only once
    if (this.hasAttribute("data-eval") && !this.#evalDone && initialContent) {
      this.#evalDone = true;

      // - data-eval="module" -> type="module"
      // - data-eval or data-eval="" -> regular script (no type attribute)
      const isModule = this.getAttribute("data-eval") === "module";

      // Wait for next tick to ensure all initialization is complete
      setTimeout(() => {
        if (this.#initToken !== token) return;

        log(`🔥 Executing data-eval code for: ${this.id}${isModule ? " (type: module)" : ""}`);

        const script = document.createElement("script");

        if (isModule) {
          script.type = "module";
          // module runs asynchronously, remove the tag when it is done
          script.addEventListener("load", () => script.remove());
          script.addEventListener("error", () => script.remove());
        }

        script.textContent = initialContent;
        document.body.appendChild(script);

        if (!isModule) {
          // classic inline script has already run
          script.remove();
        }

        triggerReady();
      }, 0);
    } else {
      triggerReady();
    }
  }

  #tabSize() {
    const size = parseInt(this.getAttribute("tab-size"), 10);

    return Number.isFinite(size) && size > 0 ? size : DEFAULT_TAB_SIZE;
  }

  #applyReadOnly() {
    if (this.editor) {
      this.editor.setReadOnly(this.hasAttribute("readonly") || this.#formDisabled);
    }
  }

  /**
   * The only place which writes content into existing editor.
   * Used by both value attribute and .value property, so they can't behave differently.
   */
  #applyValue(text) {
    if (this.editor.getValue() === text) {
      return;
    }

    // Ace implements setValue as "remove all" + "insert": two change events, first with empty document.
    this.#programmaticChange = true;
    try {
      this.editor.setValue(text, -1);
      this.editor.clearSelection();
    } finally {
      this.#programmaticChange = false;
    }

    this.#updateHeight();
    this.#syncFormValue();
  }

  // Auto-resize to fit content
  #updateHeight() {
    const editor = this.editor;

    if (!editor) return;

    const container = this.shadowRoot.querySelector(".ace-container");

    if (!container) return;

    const lineHeight = editor.renderer.lineHeight;

    // Calculate height based on content only (horizontal scrollbar is hidden)
    const contentHeight = editor.getSession().getScreenLength() * lineHeight;

    // Check for min-height constraints, min-height-px wins
    const minHeightPx = parseInt(this.getAttribute("min-height-px"), 10);
    const minHeightLines = parseInt(this.getAttribute("min-height-lines"), 10);

    let minHeight = 0;
    if (Number.isFinite(minHeightPx) && minHeightPx > 0) {
      minHeight = minHeightPx;
    } else if (Number.isFinite(minHeightLines) && minHeightLines > 0) {
      minHeight = minHeightLines * lineHeight;
    }

    const height = Math.max(contentHeight, minHeight) + "px";

    if (container.style.height !== height) {
      container.style.height = height;
      editor.resize();
    }
  }

  /**
   * @param {boolean} [resize] - tell Ace first that size of its container has changed (it recalculates wrapping)
   */
  #scheduleHeightUpdate(resize = false) {
    if (resize) {
      this.#resizePending = true;
    }

    if (this.#heightUpdateTimer !== null) return;

    this.#heightUpdateTimer = setTimeout(() => {
      this.#heightUpdateTimer = null;

      if (this.#resizePending && this.editor) {
        this.#resizePending = false;
        this.editor.resize();
      }

      this.#updateHeight();
    }, 0);
  }

  // called by the page-wide observer when Ace added new styles to the document (theme loaded)
  _onAceStylesChanged() {
    if (!this.editor) return;

    applyAceStyles(this.shadowRoot);
    this.#scheduleHeightUpdate();
  }

  // Handle attribute changes (React compatibility)
  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.editor) {
      if (name === "value") {
        // latest write wins: attribute set after the property was assigned replaces it
        if (newValue !== null && oldValue !== newValue) {
          this.#pendingValue = null;
        }
        this.#syncFormValue();
      }
      // everything else is read from attributes when the editor initializes
      return;
    }

    switch (name) {
      case "value":
        this.#applyValue(newValue || "");
        break;
      case "lang":
        this.editor.getSession().setMode(modePath(newValue));
        break;
      case "theme":
        this.editor.setTheme(themePath(newValue));
        break;
      case "readonly":
        this.#applyReadOnly();
        break;
      case "tab-size":
        this.editor.getSession().setTabSize(this.#tabSize());
        break;
      case "min-height-px":
      case "min-height-lines":
        this.#updateHeight();
        break;
    }
  }

  disconnectedCallback() {
    // Moving an element in the DOM is "disconnect, then connect" in the same task.
    // Wait a microtask and clean up only if the element is really gone.
    queueMicrotask(() => {
      if (!this.isConnected) {
        this.#teardown();
      }
    });
  }

  #teardown() {
    // cancels initialization in progress
    this.#initToken = null;

    if (this.#cancelVisibilityWait) {
      this.#cancelVisibilityWait();
      this.#cancelVisibilityWait = null;
    }

    if (this.#heightUpdateTimer !== null) {
      clearTimeout(this.#heightUpdateTimer);
      this.#heightUpdateTimer = null;
    }

    if (this.#resizeObserver) {
      this.#resizeObserver.disconnect();
      this.#resizeObserver = null;
    }

    if (this.editor) {
      // keep the content: .value still works, and the editor comes back with it when connected again
      this.#pendingValue = this.editor.getValue();

      this.editor.destroy();
      this.editor = null;

      this.shadowRoot?.querySelector(".ace-container")?.replaceChildren();

      // next initialization creates new Ace instance, so "ready" has to happen again
      this.#resetReadyPromise();
    }

    liveEditors.delete(this);
    unwatchAceStyles();

    // Unregister only the id this element has really registered
    if (this.#registeredId !== null) {
      if (registeredIds.get(this.#registeredId) === this) {
        registeredIds.delete(this.#registeredId);
      }
      this.#registeredId = null;

      log(`🔌 Ace Editor component disconnected: ${this.id || "unnamed"}`);
    }
  }

  // ---- form participation -------------------------------------------------

  formResetCallback() {
    this.value = this.#defaultValue !== null ? this.#defaultValue : this.#resolveMarkupContent();
  }

  formDisabledCallback(disabled) {
    this.#formDisabled = disabled;
    this.#applyReadOnly();
  }

  // browser restores the state on back/forward navigation and on reload
  formStateRestoreCallback(state) {
    // display-only editor shows what the page says, not what was there before
    if (typeof state === "string" && !this.hasAttribute("readonly")) {
      this.value = state;
    }
  }

  /** The <form> this editor belongs to, or null */
  get form() {
    return this.#internals ? this.#internals.form : null;
  }

  /** Name under which the content is submitted with the form */
  get name() {
    return this.getAttribute("name");
  }

  set name(value) {
    if (value === null || value === undefined) {
      this.removeAttribute("name");
    } else {
      this.setAttribute("name", value);
    }
  }

  // ---- public api ---------------------------------------------------------

  /** Focus the editor */
  focus(options) {
    if (this.editor) {
      this.editor.focus();
    } else {
      super.focus(options);
    }
  }

  blur() {
    if (this.editor) {
      this.editor.blur();
    }
    super.blur();
  }

  /**
   * Get the native Ace Editor instance
   *
   * @returns {Object} The underlying Ace Editor instance (null until initialized)
   * @description
   * Provides access to advanced Ace Editor features not exposed by the component API
   *
   * @example
   * // Find text in the editor
   * const { editor } = await element.ready;
   * editor.find('search term', { backwards: false })
   */
  getEditor() {
    return this.editor;
  }

  /**
   * Property getter for editor content
   *
   * @type {string}
   * @description
   * Reads the current content. Works also before the editor is initialized:
   * returns what the editor is going to show.
   */
  get value() {
    if (this.editor) {
      return this.editor.getValue();
    }

    if (this.#pendingValue !== null) {
      return this.#pendingValue;
    }

    return this.#resolveMarkupContent();
  }

  /**
   * Property setter for editor content
   *
   * @param {string} value - New content for the editor
   * @description
   * Sets the editor content without firing an 'input' event (matches native textarea behavior).
   * Works also before the editor is initialized, and on readonly editor.
   *
   * @example
   * // Set editor content
   * acecomp.value = 'new code';
   */
  set value(value) {
    const text = value === null || value === undefined ? "" : String(value);

    if (this.editor) {
      this.#applyValue(text);
    } else {
      this.#pendingValue = text;
      this.#syncFormValue();
    }
  }
}

// Register the custom element
customElements.define("ace-editor", AceEditorComponent);

log("loaded! <ace-editor> components are now registered.");
