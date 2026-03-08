/**
 * Greeting Plugin for CodeMirror 6
 *
 * A beginner-friendly plugin that demonstrates core CM6 concepts:
 *
 *  1. Facet       – a composable config/value input for extensions
 *  2. StateEffect – typed "actions" dispatched to mutate state
 *  3. StateField  – reactive state stored inside EditorState
 *  4. Panel       – a DOM panel attached to the editor chrome
 *  5. Command     – a function (EditorView) => boolean
 *  6. Extension   – bundles everything into one composable unit
 */

import { Facet, StateField, StateEffect } from '@codemirror/state';
import { EditorView, Panel, showPanel } from '@codemirror/view';
import type { Extension } from '@codemirror/state';

// ---------------------------------------------------------------------------
// 1. Facet – carries plugin configuration into the state machinery.
//    Multiple extensions can contribute values; combine() merges them.
// ---------------------------------------------------------------------------

export interface GreetingConfig {
  /** Greeting text shown in the panel. Defaults to "Hello, CodeMirror 6!". */
  text?: string;
  /** Whether the panel is visible when the editor mounts. Defaults to false. */
  visible?: boolean;
}

const greetingConfig = Facet.define<GreetingConfig, Required<GreetingConfig>>({
  combine(configs) {
    // Merge all provided configs; later entries win for each key
    return {
      text: configs.findLast(c => c.text != null)?.text ?? 'Hello, CodeMirror 6!',
      visible: configs.findLast(c => c.visible != null)?.visible ?? false,
    };
  },
});

// ---------------------------------------------------------------------------
// 2. StateEffects – typed "actions" dispatched via view.dispatch({ effects })
// ---------------------------------------------------------------------------

/** Toggle panel visibility. */
export const toggleGreetingEffect = StateEffect.define<boolean>();

/** Update the greeting text at runtime. */
export const setGreetingTextEffect = StateEffect.define<string>();

// ---------------------------------------------------------------------------
// 3. StateField – holds plugin state; lives inside EditorState so it is
//    automatically tracked by undo/redo history.
// ---------------------------------------------------------------------------

interface GreetingState {
  visible: boolean;
  text: string;
}

export const greetingState = StateField.define<GreetingState>({
  create(state) {
    // Read initial values from the config facet
    const cfg = state.facet(greetingConfig);
    return { visible: cfg.visible, text: cfg.text };
  },

  update(value, tr) {
    // Apply any effects carried by this transaction
    for (const effect of tr.effects) {
      if (effect.is(toggleGreetingEffect)) {
        value = { ...value, visible: effect.value };
      } else if (effect.is(setGreetingTextEffect)) {
        value = { ...value, text: effect.value };
      }
    }
    return value;
  },

  // Wire the field into the showPanel facet so CM6 manages the DOM lifecycle
  provide: field =>
    showPanel.from(field, s => (s.visible ? buildPanel : null)),
});

// ---------------------------------------------------------------------------
// 4. Panel – a DOM element displayed at the top of the editor chrome.
//    CM6 calls update() on every editor transaction.
// ---------------------------------------------------------------------------

function buildPanel(view: EditorView): Panel {
  const dom = document.createElement('div');
  dom.className = 'cm-greeting-panel';

  const msg = document.createElement('span');
  msg.className = 'cm-greeting-message';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'cm-greeting-close';
  closeBtn.textContent = '✕';
  closeBtn.title = 'Close greeting';
  closeBtn.addEventListener('click', () => hideGreeting(view));

  dom.appendChild(msg);
  dom.appendChild(closeBtn);

  // Sync DOM to current state
  function syncDOM(state: GreetingState) {
    msg.textContent = state.text;
  }

  syncDOM(view.state.field(greetingState));

  return {
    dom,
    top: true, // render above the editor content
    update(update) {
      const prev = update.startState.field(greetingState);
      const next = update.state.field(greetingState);
      if (prev !== next) syncDOM(next);
    },
  };
}

// ---------------------------------------------------------------------------
// 5. Default styles via EditorView.baseTheme (scoped; won't leak globally).
// ---------------------------------------------------------------------------

const greetingTheme = EditorView.baseTheme({
  '.cm-greeting-panel': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 14px',
    fontFamily: 'sans-serif',
    fontSize: '14px',
    background: '#e8f5e9',
    borderBottom: '1px solid #a5d6a7',
    color: '#1b5e20',
  },
  '&dark .cm-greeting-panel': {
    background: '#1b3a21',
    borderBottom: '1px solid #2e7d32',
    color: '#a5d6a7',
  },
  '.cm-greeting-message': {
    flex: '1',
  },
  '.cm-greeting-close': {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '15px',
    padding: '0 2px',
    color: 'inherit',
    lineHeight: '1',
    opacity: '0.7',
  },
  '.cm-greeting-close:hover': {
    opacity: '1',
  },
});

// ---------------------------------------------------------------------------
// 6. Commands – standard CM6 command signature: (view: EditorView) => boolean
//    Return true if the command handled the event, false to pass it along.
// ---------------------------------------------------------------------------

/** Show the greeting panel. Returns false if it was already visible. */
export function showGreeting(view: EditorView): boolean {
  if (view.state.field(greetingState, false)?.visible) return false;
  view.dispatch({ effects: toggleGreetingEffect.of(true) });
  return true;
}

/** Hide the greeting panel. Returns false if it was already hidden. */
export function hideGreeting(view: EditorView): boolean {
  if (!view.state.field(greetingState, false)?.visible) return false;
  view.dispatch({ effects: toggleGreetingEffect.of(false) });
  return true;
}

/** Toggle the greeting panel open/closed. Always returns true. */
export function toggleGreeting(view: EditorView): boolean {
  const visible = view.state.field(greetingState, false)?.visible ?? false;
  view.dispatch({ effects: toggleGreetingEffect.of(!visible) });
  return true;
}

/**
 * Change the greeting text shown in the panel.
 *
 * @example
 * setGreeting(view, 'Welcome to my editor!');
 */
export function setGreeting(view: EditorView, text: string): boolean {
  view.dispatch({ effects: setGreetingTextEffect.of(text) });
  return true;
}

// ---------------------------------------------------------------------------
// 7. Public extension factory – the single entry-point for users.
// ---------------------------------------------------------------------------

/**
 * Create the greeting plugin extension.
 *
 * Add it to your editor's `extensions` array:
 *
 * ```ts
 * import { greeting } from '@emmetio/codemirror6-plugin';
 *
 * new EditorView({
 *   extensions: [
 *     basicSetup,
 *     greeting({ text: 'Welcome!', visible: true }),
 *   ],
 *   parent: document.body,
 * });
 * ```
 */
export function greeting(config: GreetingConfig = {}): Extension {
  return [greetingConfig.of(config), greetingState, greetingTheme];
}
