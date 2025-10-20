// my-tool-esm.js - Web Component with singleton pattern for external dependency
// use: <script type="module" src="./my-tool-esm.js?delay=1000"></script>

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Singleton loader for external module (myToolESM.js)
let myToolESMPromise = null; // Loading promise

async function loadMyToolESM() {
  // Return cached promise if already loading/loaded
  if (myToolESMPromise) {
    console.log(
      " myToolESM loading already initialized, returning cached module promise"
    );
    return myToolESMPromise;
  }

//   await delay(2000); // testing delay

  // Start loading
  console.log("= Loading myToolESM.js for the first time...");

  myToolESMPromise = import("./myToolESM.js");

  return myToolESMPromise;
}

class MyToolESMComponent extends HTMLElement {
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
        <p>Loading myToolESM.js...</p>
        <div class="tool-container"></div>
      </div>
    `;

    const componentId = this.id || "unnamed";

    console.log(`= Component connected: ${componentId}`);

    // Load module and initialize
    (async () => {
      const myToolESMModule = await loadMyToolESM();

      this.initializeWithTool(myToolESMModule);
    })();
  }

  initializeWithTool(myToolESMModule) {
    const shadow = this.shadowRoot;
    const container = shadow.querySelector(".tool-container");
    const label = shadow.querySelector("p");

    label.textContent = " myToolESM.js Loaded!";

    // Use the loaded module
    myToolESMModule.myToolESM(container);

    console.log(
      `   Component initialized with myToolESM: ${this.id || "unnamed"}`
    );
  }

  disconnectedCallback() {
    console.log(`= Component disconnected: ${this.id || "unnamed"}`);
  }
}

// Register the custom element
customElements.define("my-tool", MyToolESMComponent);

console.log("=� my-tool-esm.js loaded! <my-tool> components are now registered.");
