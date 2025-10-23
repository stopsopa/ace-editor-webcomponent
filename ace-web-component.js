// ace-web-component.js - Singleton loader for Ace Editor using window global pattern
// This file loads the Ace Editor library only once, no matter how many components use it
// use: <script type="module" src="./ace-web-component.js" data-main-ace="/noprettier/ace/ace-builds-[version]/src-min-noconflict/ace.js"></script>

let dataMainAce;
export function setDataMainAce(url) {
  dataMainAce = url;
}

function log(...args) {
  console.log("📦 ace-web-component.js", ...args);
}
// Get configuration from the script tag that loaded this file
// NOTE: We use "data-main-ace" (which Ace converts to "aceUrl" - not a valid Ace config)
// Ace Editor reads data-ace-* attributes, so we avoid names like "data-ace-editor-url"
// that would convert to "editorUrl" and conflict with Ace's config
const currentScript = document.currentScript;

// Singleton loader for Ace Editor
let aceEditorPromise = null;

// Track all ace-editor IDs to detect duplicates and generate unique IDs
const registeredIds = new Set();
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

/**
 * Decodes HTML entities in a string (similar to lodash _.unescape)
 * Converts &lt; to <, &gt; to >, &amp; to &, &quot; to ", &#39; to '
 * @param {string} str - String with HTML entities
 * @returns {string} Decoded string
 */
function unescapeHtmlEntities(str) {
  const htmlEntities = {
    "&lt;": "<",
    // '&gt;': '>',
    // '&amp;': '&',
    // '&quot;': '"',
    // '&#39;': "'",
    // '&#x27;': "'",
    // '&#x2F;': '/',
  };

  return str.replace(/&(?:lt|gt|amp|quot|#39|#x27|#x2F);/g, (match) => htmlEntities[match] || match);
}

/**
 * Registers an ID and throws if it's a duplicate
 * @param {string} id - The ID to register
 * @throws {Error} If ID is already registered
 */
function registerEditorId(id) {
  if (registeredIds.has(id)) {
    throw new Error(
      `❌ Duplicate ace-editor ID detected: "${id}". ` +
        `Each ace-editor must have a unique ID. ` +
        `Either remove the duplicate ID or let the component auto-generate unique IDs.`
    );
  }
  registeredIds.add(id);
}

/**
 * Unregisters an ID when component is removed
 * @param {string} id - The ID to unregister
 */
function unregisterEditorId(id) {
  registeredIds.delete(id);
}

/**
 * Loads Ace Editor scripts only once using singleton pattern
 * @returns {Promise<Object>} Promise that resolves with window.ace object
 */
async function loadAceEditor(aceEditorUrl) {
  // Return cached promise if already loading/loaded
  if (aceEditorPromise) {
    return aceEditorPromise;
  }

  log("Loading Ace Editor for the first time...");

  aceEditorPromise = new Promise((resolve, reject) => {
    // Create script element for main Ace library
    const script = document.createElement("script");
    script.src = aceEditorUrl;

    // Handle load success
    script.onload = () => {
      log("Ace Editor core script loaded successfully!");

      // Wait for window.ace to be available
      const checkAce = () => {
        if (window?.ace && typeof window?.ace?.edit === "function") {
          resolve(window.ace);
        } else {
          setTimeout(checkAce, 150);
        }
      };

      checkAce();
    };

    // Handle load error
    script.onerror = () => {
      console.error("❌ Failed to load Ace Editor");
      reject(new Error("Failed to load Ace Editor"));
    };

    // Append to head to trigger loading
    document.head.appendChild(script);
  });

  return aceEditorPromise;
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
 * @property {string} [value] - Initial content of the editor
 * @property {string} [lang='javascript'] - Programming language mode (e.g., 'javascript', 'python', 'typescript')
 * @property {string} [theme='idle_fingers'] - Editor color theme
 * @property {boolean} [readonly=false] - Make editor read-only
 * @property {number} [min-height-px] - Minimum height in pixels
 * @property {number} [min-height-lines] - Minimum height in lines
 *
 * Content Priority (from highest to lowest):
 * 1. value attribute - for React/dynamic updates (controlled component)
 * 2. <script type="ace"> - preserves formatting, Prettier-friendly
 * 3. textContent - direct text content (initial value only)
 * 4. content attribute - alternative to textContent
 *
 * HTML Entity Decoding:
 * By default, HTML entities like &lt; &gt; &amp; are decoded to < > & when reading
 * from static content (methods 2-4). This allows writing &lt;/script&gt; inside
 * <script type="ace"> without prematurely closing the tag.
 *
 * @see Use data-nolt attribute to disable HTML entity decoding
 * @note value attribute never decodes entities
 */
export default class AceEditorComponent extends HTMLElement {
  #isLoaded = false;
  #pendingLoadListeners = [];
  // Define observed attributes for React compatibility
  static get observedAttributes() {
    return ["value", "lang", "theme", "readonly", "min-height-px", "min-height-lines", "data-nolt"];
  }

  // Track loading state and listeners for onLoad event
  constructor() {
    super();
    this._loadListeners = [];
  }

  _triggerLoadEvent() {
    if (this.#isLoaded) return; // Prevent double firing

    this.#isLoaded = true;

    // 1. Dispatch the CustomEvent for regular listeners
    const loadEvent = new CustomEvent("onLoad", {
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(loadEvent);

    // 2. Trigger all pending listeners added before the load event
    this.#pendingLoadListeners.forEach((listener) => listener());

    // Clear the pending listeners array
    this.#pendingLoadListeners = [];
  }

  // Override addEventListener to implement custom 'onLoad' behavior
  addEventListener(type, listener, options) {
    if (type === "onLoad") {
      if (this.#isLoaded) {
        // If already loaded, trigger the listener immediately
        listener();
      } else {
        // If not loaded, store the listener to be called when it loads
        this.#pendingLoadListeners.push(listener);
      }
    }

    // Always call the native addEventListener for standard behavior
    super.addEventListener(type, listener, options);
  }

  connectedCallback() {
    const aceEditorUrl =
      currentScript?.getAttribute("data-main-ace") ||
      document.querySelector("[data-main-ace]")?.getAttribute("data-main-ace") ||
      dataMainAce;

    if (!aceEditorUrl) {
      /**
       * TODO:
       * This is interesting case - might actually return when I would like to use it with react and bundler
       * Because in such case I will not have separate script tag loading this file
       * Probably it would work when we would set attribute [data-main-ace] on the script tag that loads the bundle
       * But we cannot asume we will always have such luxury - some frameworks might make it difficult
       *
       * So in that case we would need to have alternative way to provide aceEditorUrl
       */
      console.error(
        "❌ ace-web-component.js: Missing required data-main-ace attribute on script tag that loads this file. You can also use method setDataMainAce(url) to provide the URL programmatically." +
          "Please provide the URL to the Ace Editor main script."
      );
      return;
    }

    this.aceUrl = aceEditorUrl;

    // Handle ID: auto-generate if missing, or validate if provided
    if (this.id) {
      // Validate that manually provided ID is not a duplicate
      try {
        registerEditorId(this.id);
      } catch (error) {
        // Show error in console and UI
        console.error(error.message);

        // Create error display in shadow DOM
        const shadow = this.attachShadow({ mode: "open" });
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
              <div class="error-message">${error.message}</div>
            </div>
          `;

        // Throw error to prevent further initialization
        throw error;
      }
    } else {
      // Generate unique ID automatically
      this.id = generateUniqueId();
      log(`🆔 Auto-generated unique ID: ${this.id}`);

      // Register auto-generated IDs (they won't be duplicates by design)
      registerEditorId(this.id);
    }

    const shadow = this.attachShadow({ mode: "open" });

    // Create structure immediately with loading state
    shadow.innerHTML = `
        <style>
          :host {
            display: block;
            width: 100%;
          }
          .ace-wrapper {
            // height: 22px;
            border: 1px solid #999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            // min-height: 200px;
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

    const componentId = this.id;

    // Load Ace and initialize
    (async () => {
      try {
        const ace = await loadAceEditor(this.aceUrl);
        this.initializeEditor(ace);
      } catch (error) {
        console.error(`❌ Failed to initialize Ace Editor ${componentId}:`, error);
        const label = shadow.querySelector(".loading-message");
        if (label) {
          label.textContent = "❌ Failed to load Ace Editor";
          label.style.color = "#555";
        }
      }
    })();
  }

  initializeEditor(ace) {
    const shadow = this.shadowRoot;
    const wrapper = shadow.querySelector(".ace-wrapper");
    const container = shadow.querySelector(".ace-container");
    const label = shadow.querySelector(".loading-message");

    // Update UI to show loaded state
    label.textContent = "Ace Editor Loaded!";
    setTimeout(() => {
      label.style.display = "none";
      wrapper.classList.add("loaded");
    }, 500);

    // Initialize Ace Editor
    const editor = ace.edit(container);

    // Flag to track if we're in a programmatic update (to suppress 'input' event)
    // Initialize early so we can use it during initial content setting
    this._isProgrammaticChange = false;

    // CRITICAL: Adopt document stylesheets into shadow DOM
    // Ace injects its styles into document.styleSheets dynamically
    // We need to copy those styles into the shadow DOM
    const adoptStylesheets = () => {
      // Get all document stylesheets that Ace has created
      const aceStyleSheets = Array.from(document.styleSheets).filter((sheet) => {
        try {
          // Check if it's an Ace-related stylesheet
          const ownerNode = sheet.ownerNode;

          // Ace creates style tags dynamically
          if (ownerNode && ownerNode.tagName === "STYLE") {
            const content = ownerNode.textContent || "";
            // Check if it contains Ace-specific classes
            if (content.includes(".ace_") || content.includes("ace-")) {
              return true;
            }
          }

          return false;
        } catch (e) {
          return false;
        }
      });

      // For browsers that support adoptedStyleSheets
      if (shadow.adoptedStyleSheets === undefined) {
        // Fallback: copy styles manually
        copyStylesManually();
      } else {
        try {
          shadow.adoptedStyleSheets = [...aceStyleSheets];
        } catch (e) {
          // Expected error: Ace creates regular <style> tags, not constructed stylesheets
          // console.log("Could not adopt stylesheets:", e);
          // Fallback: copy styles manually
          copyStylesManually();
        }
      }

      function copyStylesManually() {
        aceStyleSheets.forEach((sheet) => {
          try {
            const styleEl = document.createElement("style");
            const rules = Array.from(sheet.cssRules || sheet.rules || []);
            styleEl.textContent = rules.map((rule) => rule.cssText).join("\n");
            shadow.appendChild(styleEl);
          } catch (e) {
            log("Could not copy stylesheet:", e);
          }
        });
      }
    };

    // Get configuration from attributes
    let lang = this.getAttribute("lang") || "javascript";
    const theme = this.getAttribute("theme") || "idle_fingers";
    const readonly = this.hasAttribute("readonly");

    // Map short language names to full Ace mode names
    if (lang === "js") lang = "javascript";
    if (lang === "ts") lang = "typescript";
    if (lang === "bash") lang = "sh";

    // Configure editor
    const session = editor.getSession();
    session.setUseWorker(false); // disable loading worker-javascript.js
    session.setTabSize(4);
    session.setUseWrapMode(true);

    editor.setTheme(`ace/theme/${theme}`);
    session.setMode(`ace/mode/${lang}`);

    // Hide horizontal scrollbar since we're using wrap mode
    editor.setOption("hScrollBarAlwaysVisible", false);

    // Additional scrollbar configuration
    editor.renderer.setScrollMargin(0, 0, 0, 0);

    if (readonly) {
      editor.setReadOnly(true);
    }

    // Set initial content from multiple sources
    // Priority: value attribute > <script type="ace"> > textContent > content attribute
    if (typeof this.initialContent !== "string" || !this.initialContent) {
      this.initialContent = "";
    }

    const value = this.getAttribute("value");
    // Check for value attribute first
    if (typeof value === "string" && value) {
      this.initialContent = value;
    }
    // Check for <script> tag
    else {
      const scriptTag = this.querySelector("script");
      if (scriptTag) {
        if (typeof scriptTag.textContent === "string" && scriptTag.textContent) {
          this.initialContent = scriptTag.textContent;
        }
      } else {
        const content = this.getAttribute("content");
        if (typeof this.textContent === "string" && this.textContent) {
          const k = this.textContent;
          this.initialContent = k;
        } else if (typeof content === "string" && content) {
          this.initialContent = content;
        }
      }

      if (!this.initialContent) {
        this.initialContent = "";
      }

      // Decode HTML entities ONLY when reading from static content (not from value attribute)
      // and ONLY if data-nolt attribute is NOT present
      // This allows writing &lt;/script&gt; inside <script> without prematurely closing the tag
      if (this.initialContent && !this.hasAttribute("data-nolt")) {
        this.initialContent = unescapeHtmlEntities(this.initialContent);
      }
    }

    // Apply dedent logic unless data-notrim is present
    // Removes common leading whitespace from all lines
    if (this.initialContent && !this.hasAttribute("data-notrim")) {
      let diff = Number.MAX_SAFE_INTEGER;

      let tmp = this.initialContent.split("\n");

      tmp.forEach((line) => {
        if (!/^\s*$/.test(line)) {
          // if line isn't just white characters
          const length_before = line.length;

          const length_after = line.replace(/^\s+/, "").length;

          const d = length_before - length_after;

          if (d < diff) {
            diff = d;
          }
        }
      });

      if (diff !== Number.MAX_SAFE_INTEGER && diff > 0) {
        tmp = tmp.map((line) => line.substring(diff));

        this.initialContent = tmp.join("\n");
      }
    }

    // Set initial content (suppress 'input' event for initialization)
    if (this.initialContent) {
      this._isProgrammaticChange = true;
      editor.setValue(this.initialContent, -1); // -1 moves cursor to start
      editor.clearSelection();
      this._isProgrammaticChange = false;
    }

    // Store data-eval info for later execution (after full initialization)
    const shouldEval = this.hasAttribute("data-eval");
    const dataEvalValue = this.getAttribute("data-eval");
    const codeToEval = this.initialContent;

    // Remove data-eval attribute to prevent re-execution
    if (shouldEval) {
      this.removeAttribute("data-eval");
    }

    // Auto-resize to fit content
    const heightUpdateFunction = () => {
      // Calculate height based on content only (horizontal scrollbar is hidden)
      const contentHeight = session.getScreenLength() * editor.renderer.lineHeight;

      // Check for min-height constraints
      const minHeightPx = this.getAttribute("min-height-px");
      const minHeightLines = this.getAttribute("min-height-lines");

      let minHeight = 0;
      if (minHeightPx) {
        minHeight = parseInt(minHeightPx, 10);
      } else if (minHeightLines) {
        minHeight = parseInt(minHeightLines, 10) * editor.renderer.lineHeight;
      }

      const finalHeight = Math.max(contentHeight, minHeight) + 16; // correction
      container.style.height = finalHeight + "px";
      editor.resize();
    };

    // Update size on content change and dispatch input event
    session.on("change", () => {
      heightUpdateFunction();

      // Only dispatch input event for user interactions, not programmatic changes
      // This matches native textarea/input behavior where element.value = "..." does NOT fire 'input'
      if (!this._isProgrammaticChange) {
        this.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });

    // Store reference for attribute changes
    this._heightUpdateFunction = heightUpdateFunction;

    // Wait for Ace to inject its styles, then adopt them
    setTimeout(() => {
      adoptStylesheets();
      // Set initial size AFTER styles are adopted
      setTimeout(heightUpdateFunction, 50);
    }, 100);

    // Also set up a MutationObserver to catch styles added later
    const styleObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes) {
          mutation.addedNodes.forEach((node) => {
            if (node.tagName === "STYLE" && node.textContent && node.textContent.includes(".ace_")) {
              // New Ace style detected, adopt it
              adoptStylesheets();
              setTimeout(heightUpdateFunction, 50);
            }
          });
        }
      });
    });

    styleObserver.observe(document.head, { childList: true });
    this._styleObserver = styleObserver;

    // Store editor reference
    this.editor = editor;

    // Store pending value that was blocked by readonly
    this._pendingValue = null;

    const triggerReady = () => {
      // Dispatch custom 'aceOnLoad' event
      this.dispatchEvent(
        new CustomEvent("aceOnLoad", {
          bubbles: true,
          detail: {
            component: this,
            editor: this.editor,
            id: this.id,
          },
        })
      );
      Promise.resolve().then(() => {
        this._triggerLoadEvent();
      });
    };

    // Execute data-eval code AFTER everything is fully initialized
    // This ensures this.editor is set and getValue() works correctly
    if (shouldEval && codeToEval) {
      // Wait for next tick to ensure all initialization is complete
      setTimeout(() => {
        // Determine script type:
        // - data-eval="module" -> type="module"
        // - data-eval or data-eval="" -> regular script (no type attribute)
        const scriptType = dataEvalValue === "module" ? "module" : null;

        log(`🔥 Executing data-eval code for: ${this.id || "unnamed"}${scriptType ? ` (type: ${scriptType})` : ""}`);

        const script = document.createElement("script");

        // Set script type if it's a module
        if (scriptType) {
          script.type = scriptType;
        }

        script.textContent = codeToEval;
        document.body.appendChild(script);

        // Mark that initial eval was done
        this._initialEvalDone = true;

        triggerReady();
      }, 0);
    } else {
      triggerReady();
    }
  }

  // Handle attribute changes (React compatibility)
  attributeChangedCallback(name, oldValue, newValue) {
    if (!this.editor) return;

    switch (name) {
      case "value":
        // If editor is readonly, store the pending value
        if (this.editor.getReadOnly()) {
          this._pendingValue = newValue;
          return;
        }
        // Clear any pending value since we're applying this one
        this._pendingValue = null;

        // Only update if value is actually different from the current editor value
        const currentValue = this.editor.getValue();

        if (currentValue !== newValue) {
          this.editor.setValue(newValue || "", -1);
          this.editor.clearSelection();
        }
        break;
      case "lang":
        this.editor.getSession().setMode(`ace/mode/${newValue}`);
        break;
      case "theme":
        this.editor.setTheme(`ace/theme/${newValue}`);
        break;
      case "readonly":
        const isReadonly = newValue !== null;
        this.editor.setReadOnly(isReadonly);

        // If readonly is being removed and there's a pending value, apply it
        if (!isReadonly && this._pendingValue !== null) {
          const cursorPosition = this.editor.getCursorPosition();
          this.editor.setValue(this._pendingValue, -1);
          try {
            this.editor.moveCursorToPosition(cursorPosition);
          } catch (e) {
            // Cursor position might be invalid
          }
          this.editor.clearSelection();
          this._pendingValue = null;
        }
        break;
      case "min-height-px":
      case "min-height-lines":
        // Trigger height recalculation
        if (this._heightUpdateFunction) {
          this._heightUpdateFunction();
        }
        break;
    }
  }

  disconnectedCallback() {
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
    if (this._styleObserver) {
      this._styleObserver.disconnect();
      this._styleObserver = null;
    }

    // Unregister ID when component is removed
    if (this.id) {
      unregisterEditorId(this.id);
    }

    log(`🔌 Ace Editor component disconnected: ${this.id || "unnamed"}`);
  }

  /**
   * Get the native Ace Editor instance
   *
   * @returns {Object} The underlying Ace Editor instance
   * @description
   * Provides access to advanced Ace Editor features not exposed by the component API
   *
   * @example
   * // Find text in the editor
   * editor.getEditor().find('search term', { backwards: false })
   */
  getEditor() {
    return this.editor;
  }

  /**
   * Property getter for editor content
   *
   * @type {string}
   * @description Reads the current editor content
   */
  get value() {
    return this.editor ? this.editor.getValue() : "";
  }

  /**
   * Property setter for editor content
   *
   * @param {string} value - New content for the editor
   * @description
   * Sets the editor content without firing an 'input' event
   * Matches native textarea behavior
   *
   * @example
   * // Set editor content
   * acecomp.value = 'new code';
   */
  set value(value) {
    if (this.editor) {
      // Set flag to suppress 'input' event during programmatic change
      this._isProgrammaticChange = true;

      const currentValue = this.editor.value;

      if (value !== currentValue) {
        this.editor.setValue(value, -1);
      }
      // For programmatic updates via setValue(), bypass readonly check
      this._pendingValue = null;

      // Reset flag after a tick to allow normal user input events
      setTimeout(() => {
        this._isProgrammaticChange = false;
      }, 0);
    } else {
      this.initialContent = value;
    }
  }
}

// Register the custom element
customElements.define("ace-editor", AceEditorComponent);

log("loaded! <ace-editor> components are now registered.");
