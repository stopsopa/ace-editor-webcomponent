// ace-loader.js - Singleton loader for Ace Editor using window global pattern
// This file loads the Ace Editor library only once, no matter how many components use it
// use: <script src="./ace-loader.js" data-main-ace="/noprettier/ace/ace-builds-1.15.0/src-min-noconflict/ace.js"></script>

(function () {
  // Get configuration from the script tag that loaded this file
  // NOTE: We use "data-main-ace" (which Ace converts to "aceUrl" - not a valid Ace config)
  // Ace Editor reads data-ace-* attributes, so we avoid names like "data-ace-editor-url"
  // that would convert to "editorUrl" and conflict with Ace's config
  const currentScript = document.currentScript;
  const aceEditorUrl = currentScript?.getAttribute("data-main-ace");

  console.log(`📋 Configuration: aceEditorUrl = "${aceEditorUrl}"`);

  // Singleton loader for Ace Editor
  let aceEditorPromise = null;

  /**
   * Loads Ace Editor scripts only once using singleton pattern
   * @returns {Promise<Object>} Promise that resolves with window.ace object
   */
  async function loadAceEditor() {
    // Return cached promise if already loading/loaded
    if (aceEditorPromise) {
      console.log(
        "✅ Ace Editor loading already initialized, returning cached promise"
      );
      return aceEditorPromise;
    }

    console.log("🔄 Loading Ace Editor for the first time...");

    aceEditorPromise = new Promise((resolve, reject) => {
      // Create script element for main Ace library
      const script = document.createElement("script");
      script.src = aceEditorUrl;

      // Handle load success
      script.onload = () => {
        console.log("✅ Ace Editor core script loaded successfully!");

        // Wait for window.ace to be available
        const checkAce = () => {
          if (window?.ace && typeof window?.ace?.edit === "function") {
            console.log("✅ window.ace.edit is ready!", window.ace);
            resolve(window.ace);
          } else {
            console.log("⏳ Waiting for window.ace.edit...");
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
   * Usage: <ace-editor id="editor1" lang="javascript"></ace-editor>
   */
  class AceEditorComponent extends HTMLElement {
    connectedCallback() {
      const shadow = this.attachShadow({ mode: "open" });

      // Create structure immediately with loading state
      shadow.innerHTML = `
        <style>
          :host {
            display: block;
            width: 100%;
          }
          .ace-wrapper {
            border: 2px solid #667eea;
            border-radius: 8px;
            background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
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
            color: #667eea;
            font-size: 14px;
          }
          .ace-container {
            position: relative;
            width: 100%;
            // height: 200px;
          }
        </style>
        <div class="ace-wrapper">
          <p class="loading-message">⏳ Loading Ace Editor...</p>
          <div class="ace-container"></div>
        </div>
      `;

      const componentId = this.id || "unnamed";
      console.log(`🔗 Ace Editor component connected: ${componentId}`);

      // Load Ace and initialize
      (async () => {
        try {
          const ace = await loadAceEditor();
          this.initializeEditor(ace);
        } catch (error) {
          console.error(
            `❌ Failed to initialize Ace Editor ${componentId}:`,
            error
          );
          const label = shadow.querySelector(".loading-message");
          if (label) {
            label.textContent = "❌ Failed to load Ace Editor";
            label.style.color = "#dc3545";
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
      label.textContent = "✅ Ace Editor Loaded!";
      setTimeout(() => {
        label.style.display = "none";
        wrapper.classList.add("loaded");
      }, 500);

      // Initialize Ace Editor
      const editor = ace.edit(container);

      // CRITICAL: Adopt document stylesheets into shadow DOM
      // Ace injects its styles into document.styleSheets dynamically
      // We need to copy those styles into the shadow DOM
      const adoptStylesheets = () => {
        const existingAdoptedSheets = shadow.adoptedStyleSheets || [];

        // Get all document stylesheets that Ace has created
        const aceStyleSheets = Array.from(document.styleSheets).filter(
          (sheet) => {
            try {
              // Check if it's an Ace-related stylesheet
              const href = sheet.href || "";
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
          }
        );

        // For browsers that support adoptedStyleSheets
        if (shadow.adoptedStyleSheets !== undefined) {
          try {
            shadow.adoptedStyleSheets = [...aceStyleSheets];
          } catch (e) {
            console.log("Could not adopt stylesheets:", e);
            // Fallback: copy styles manually
            copyStylesManually();
          }
        } else {
          // Fallback: copy styles manually
          copyStylesManually();
        }

        function copyStylesManually() {
          aceStyleSheets.forEach((sheet) => {
            try {
              const styleEl = document.createElement("style");
              const rules = Array.from(sheet.cssRules || sheet.rules || []);
              styleEl.textContent = rules
                .map((rule) => rule.cssText)
                .join("\n");
              shadow.appendChild(styleEl);
            } catch (e) {
              console.log("Could not copy stylesheet:", e);
            }
          });
        }
      };

      // Get configuration from attributes
      const lang = this.getAttribute("lang") || "javascript";
      const theme = this.getAttribute("theme") || "idle_fingers";
      const readonly = this.hasAttribute("readonly");

      // Configure editor
      const session = editor.getSession();
      session.setUseWorker(false); // disable loading worker-javascript.js
      session.setTabSize(4);
      session.setUseWrapMode(true);

      editor.setTheme(`ace/theme/${theme}`);
      session.setMode(`ace/mode/${lang}`);

      if (readonly) {
        editor.setReadOnly(true);
      }

      // Set initial content from textContent or attribute
      const initialContent =
        this.textContent.trim() || this.getAttribute("content") || "";
      if (initialContent) {
        editor.setValue(initialContent, -1); // -1 moves cursor to start
        editor.clearSelection();
      }

      // Auto-resize to fit content
      const heightUpdateFunction = () => {
        const newHeight =
          session.getScreenLength() * editor.renderer.lineHeight +
          editor.renderer.scrollBar.getWidth();

        container.style.height = newHeight + "px";
        editor.resize();
      };

      // Update size on content change
      session.on("change", heightUpdateFunction);

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
              if (
                node.tagName === "STYLE" &&
                node.textContent &&
                node.textContent.includes(".ace_")
              ) {
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

      console.log(`✅ Ace Editor initialized: ${this.id || "unnamed"}`);
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
      console.log(
        `🔌 Ace Editor component disconnected: ${this.id || "unnamed"}`
      );
    }

    // Public API: Get editor value
    getValue() {
      return this.editor ? this.editor.getValue() : "";
    }

    // Public API: Set editor value
    setValue(value) {
      if (this.editor) {
        this.editor.setValue(value, -1);
        this.editor.clearSelection();
      }
    }
  }

  // Register the custom element
  customElements.define("ace-editor", AceEditorComponent);

  console.log(
    "📦 ace-loader.js loaded! <ace-editor> components are now registered."
  );
})();
