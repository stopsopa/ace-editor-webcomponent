// my-tool-window.js - Web Component with singleton pattern using window global and script load events
// use: <script src="./my-tool-window.js"></script>

(function () {
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  // Singleton loader for external script (internalToolWindow.js)
  let internalToolWindowPromise = null; // Loading promise
  let scriptLoadResolve = null;
  let scriptLoadReject = null;

  async function loadInternalToolWindow() {
    // Return cached promise if already loading/loaded
    if (internalToolWindowPromise) {
      console.log(
        "✅ internalToolWindow loading already initialized, returning cached promise"
      );
      return internalToolWindowPromise;
    }

    await delay(1000); // testing delay

    // Start loading
    console.log("🔄 Loading internalToolWindow.js for the first time...");

    internalToolWindowPromise = new Promise((resolve, reject) => {
      scriptLoadResolve = resolve;
      scriptLoadReject = reject;

      // Create script element
      const script = document.createElement("script");
      script.src = "./internalToolWindow.js";

      // Handle load success
      script.onload = () => {
        console.log("✅ internalToolWindow.js script loaded successfully!");
        // Resolve with the window function
        if (typeof window.internalToolWindowMounted === "function") {
          resolve(window.internalToolWindowMounted);
        } else {
          reject(new Error("internalToolWindowMounted function not found"));
        }
      };

      // Handle load error
      script.onerror = () => {
        console.error("❌ Failed to load internalToolWindow.js");
        reject(new Error("Failed to load internalToolWindow.js"));
      };

      // Append to head to trigger loading
      document.head.appendChild(script);
    });

    return internalToolWindowPromise;
  }

  class InternalToolWindowComponent extends HTMLElement {
    connectedCallback() {
      const shadow = this.attachShadow({ mode: "open" });

      // Create structure immediately
      shadow.innerHTML = `
      <style>
        .my_component {
          border: 2px solid #667eea;
          border-radius: 8px;
          background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        p {
          font-weight: bold;
          color: #667eea;
          font-size: 14px;
        }
        .tool-container {
          width: 100%;
        }
      </style>
      <div class="my_component">
        <p>⏳ Loading internalToolWindow.js...</p>
        <div class="tool-container"></div>
      </div>
    `;

      const componentId = this.id || "unnamed";

      console.log(`🔗 Component connected: ${componentId}`);

      // Load script and initialize
      (async () => {
        try {
          const internalToolWindowFn = await loadInternalToolWindow();
          this.initializeWithTool(internalToolWindowFn);
        } catch (error) {
          console.error(`❌ Failed to initialize component ${componentId}:`, error);
          const label = shadow.querySelector("p");
          if (label) {
            label.textContent = "❌ Failed to load internalToolWindow.js";
            label.style.color = "#dc3545";
          }
        }
      })();
    }

    initializeWithTool(internalToolWindowFn) {
      const shadow = this.shadowRoot;
      const container = shadow.querySelector(".tool-container");
      const label = shadow.querySelector("p");

      label.textContent = "✅ internalToolWindow.js Loaded!";

      // Use the loaded function
      internalToolWindowFn(container);

      console.log(
        `  ✅ Component initialized with internalToolWindow: ${this.id || "unnamed"}`
      );
    }

    disconnectedCallback() {
      console.log(`🔌 Component disconnected: ${this.id || "unnamed"}`);
    }
  }

  // Register the custom element
  customElements.define("my-tool-window", InternalToolWindowComponent);

  console.log(
    "📦 my-tool-window.js loaded! <my-tool-window> components are now registered."
  );
})();
