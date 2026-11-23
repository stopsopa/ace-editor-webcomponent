/**
 * Sets the main Ace Editor script URL to be used for dynamic loading.
 * Call it before any <ace-editor> is connected to the DOM.
 * Takes precedence over data-main-ace attribute.
 * @param url The URL of the Ace Editor main script
 */
export function setDataMainAce(url: string): void;

/**
 * What the `ready` promise resolves with, what is in `event.detail` of 'ready' and 'aceOnLoad' events,
 * and what 'onLoad' listeners find directly on their argument
 */
export interface AceEditorReadyDetail {
  /** The <ace-editor> element */
  component: AceEditorComponent;
  /** The native Ace Editor instance */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: any;
  /** id of the element (given or auto-generated) */
  id: string;
}

/**
 * Web Component for wrapping Ace Editor
 */
declare class AceEditorComponent extends HTMLElement {
  /** Takes part in <form> like native textarea */
  static formAssociated: boolean;

  /**
   * Content of the editor.
   * Works also before the editor is initialized.
   * Assigning does not fire 'input' event (same as native textarea).
   */
  get value(): string;
  set value(content: string);

  /** Name under which the content is submitted with the form */
  get name(): string | null;
  set name(name: string | null);

  /** The <form> this editor belongs to */
  get form(): HTMLFormElement | null;

  /** The native Ace Editor instance, null until initialized */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: any | null;

  /** Resolved when the editor is initialized. Can be used at any time. */
  get ready(): Promise<AceEditorReadyDetail>;

  /**
   * Get the native Ace Editor instance (null until initialized)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getEditor(): any | null;

  /**
   * 'onLoad' listener is called when the editor is initialized, or immediately if it already is.
   * It receives an event which has component, editor and id directly on it.
   * Works also when registered before the component script has loaded
   * (the `ready` promise needs the component to be defined).
   */
  addEventListener(type: "onLoad", listener: (detail: AceEditorReadyDetail) => void): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: AceEditorComponent, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;

  removeEventListener(type: "onLoad", listener: (detail: AceEditorReadyDetail) => void): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: AceEditorComponent, ev: HTMLElementEventMap[K]) => unknown,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
}

/** Attributes of <ace-editor> (on top of standard html attributes) */
export interface AceEditorAttributes {
  /** Content of the editor */
  value?: string;
  /** Programming language mode, default "javascript" */
  lang?: string;
  /** Editor theme, default "idle_fingers" */
  theme?: string;
  /** User can't edit the content */
  readonly?: boolean;
  /** Name under which the content is submitted with a form */
  name?: string;
  /** Tab size in spaces, default 4 */
  ["tab-size"]?: number | string;
  /** Min height in px */
  ["min-height-px"]?: number | string;
  /** Min height in lines */
  ["min-height-lines"]?: number | string;
  /** Initial content, lowest priority */
  content?: string;
  /** Disable decoding of &lt; in <script> content */
  ["data-nolt"]?: boolean | "";
  /** Disable removing of common indentation and outer empty lines */
  ["data-notrim"]?: boolean | "";
  /** Evaluate the content as a script after the editor is initialized */
  ["data-eval"]?: boolean | "" | "module";
}

// Global type declarations
declare global {
  interface HTMLElementTagNameMap {
    "ace-editor": AceEditorComponent;
  }

  interface HTMLElementEventMap {
    /** <ace-editor> is initialized */
    ready: CustomEvent<AceEditorReadyDetail>;
    /** older name for 'ready' */
    aceOnLoad: CustomEvent<AceEditorReadyDetail>;
  }

  interface DocumentEventMap {
    ready: CustomEvent<AceEditorReadyDetail>;
    aceOnLoad: CustomEvent<AceEditorReadyDetail>;
  }

  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ace?: any;
  }
}

type AceEditorJSXProps = React.DetailedHTMLProps<
  React.HTMLAttributes<AceEditorComponent> & AceEditorAttributes,
  AceEditorComponent
>;

// React 19: JSX namespace lives in the "react" module
declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ace-editor": AceEditorJSXProps;
    }
  }
}

// React 18 and older: global JSX namespace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "ace-editor": AceEditorJSXProps;
    }
  }
}

export default AceEditorComponent;
