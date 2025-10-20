// my-tool-esm.js - Web Component with singleton pattern for external dependency
// use: <script type="module" src="./my-tool-esm.js?delay=1000"></script>

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Singleton loader for external module (internalToolESM.js)
let internalToolESMPromise = null; // Loading promise

async function loadinternalToolESM() {
  // Return cached promise if already loading/loaded
  if (internalToolESMPromise) {
    console.log(
      " internalToolESM loading already initialized, returning cached module promise"
    );
    return internalToolESMPromise;
  }

  await delay(1000); // testing delay

  // Start loading
  console.log("= Loading internalToolESM.js for the first time...");

  internalToolESMPromise = import("./internalToolESM.js");

  return internalToolESMPromise;
}

class internalToolESMComponent extends HTMLElement {
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
        <p>Loading internalToolESM.js...</p>
        <div class="tool-container"></div>
      </div>
    `;

    const componentId = this.id || "unnamed";

    console.log(`= Component connected: ${componentId}`);

    // Load module and initialize
    (async () => {
      const internalToolESMModule = await loadinternalToolESM();

      this.initializeWithTool(internalToolESMModule);
    })();
  }

  initializeWithTool(internalToolESMModule) {
    const shadow = this.shadowRoot;
    const container = shadow.querySelector(".tool-container");
    const label = shadow.querySelector("p");

    label.textContent = " internalToolESM.js Loaded!";

    // Use the loaded module
    internalToolESMModule.internalToolESM(container);

    console.log(
      `   Component initialized with internalToolESM: ${this.id || "unnamed"}`
    );
  }

  disconnectedCallback() {
    console.log(`= Component disconnected: ${this.id || "unnamed"}`);
  }
}

// Register the custom element
customElements.define("my-tool", internalToolESMComponent);

console.log("=� my-tool-esm.js loaded! <my-tool> components are now registered.");
