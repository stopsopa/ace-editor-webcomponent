/**
 * Sets the main Ace Editor script URL to be used for dynamic loading
 * @param url The URL of the Ace Editor main script
 */
export function setDataMainAce(url: string): void;

/**
 * Web Component for wrapping Ace Editor
 */
declare class AceEditorComponent extends HTMLElement {
    /**
     * Get the current content of the editor
     */
    getValue(): string;

    /**
     * Set the content of the editor programmatically
     * @param value Content to set in the editor
     */
    setValue(value: string): void;

    /**
     * Get the native Ace Editor instance
     */
    getEditor(): any;
}

// Global type declarations
declare global {
    interface HTMLElementTagNameMap {
        'ace-editor': AceEditorComponent;
    }

    interface Window {
        ace?: {
            edit: (container: HTMLElement) => any;
        };
    }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "ace-editor": React.DetailedHTMLProps<
        React.HTMLAttributes<AceEditorComponent> & {
          /** Initial content of the editor */
          value?: string;
          /** Programming language mode */
          lang?: string;
          /** Editor theme */
          theme?: string;
          /** Readonly mode */
          readonly?: boolean;
          /** Min height in px */
          ["min-height-px"]?: number;
          /** Min height in lines */
          ["min-height-lines"]?: number;
          /** Disable entity decoding */
          ["data-nolt"]?: boolean;
          /** Evaluate code after load */
          ["data-eval"]?: boolean | "module";
        },
        AceEditorComponent
      >;
    }
  }
}


export default AceEditorComponent;