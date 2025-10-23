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
    get value(): string;

    /**
     * Set the content of the editor
     * @param content The new content to set in the editor
     */
    set value(content: string);

    /**
     * Get the native Ace Editor instance
     */
    getEditor(): any;

    /**
     * Tracks whether the editor has been fully loaded
     * @private
     */
    #isLoaded: boolean;

    /**
     * Adds an event listener with special handling for 'onLoad' event
     * @param type The event type to listen for
     * @param listener The event listener function
     * @param options Optional event listener options
     */
    addEventListener(
        type: 'onLoad',
        listener: () => void,
        options?: boolean | AddEventListenerOptions
    ): void;

    /**
     * Dispatches the load event and triggers pending load listeners
     * @private
     */
    _triggerLoadEvent(): void;
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
          /** Event fired when editor is fully loaded */
          onLoad?: () => void;
        },
        AceEditorComponent
      >;
    }
  }
}

export default AceEditorComponent;