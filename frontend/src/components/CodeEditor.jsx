import { useEffect, useRef } from 'react';
import { basicSetup } from 'codemirror';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

export default function CodeEditor({
  value,
  onChange,
  onRun,
  onReset,
  disabled = false,
}) {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const readOnlyCompartmentRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const onRunRef = useRef(onRun);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);

  useEffect(() => {
    if (!containerRef.current) return;

    const readOnlyCompartment = new Compartment();
    readOnlyCompartmentRef.current = readOnlyCompartment;

    const runShortcut = keymap.of([
      {
        key: 'Mod-Enter',
        run: () => {
          if (onRunRef.current) {
            onRunRef.current();
            return true;
          }
          return false;
        },
      },
    ]);

    const state = EditorState.create({
      doc: '',
      extensions: [
        basicSetup,
        keymap.of([indentWithTab]),
        runShortcut,
        python(),
        oneDark,
        readOnlyCompartment.of(EditorView.editable.of(true)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && onChangeRef.current) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': {
            fontSize: '15px',
            minHeight: '220px',
            textAlign: 'left',
          },
          '.cm-scroller': {
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
            minHeight: '220px',
          },
          '.cm-content': {
            padding: '12px 0',
          },
          '&.cm-focused': {
            outline: 'none',
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
      readOnlyCompartmentRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const nextDoc = value ?? '';
    const currentDoc = view.state.doc.toString();
    if (nextDoc !== currentDoc) {
      view.dispatch({
        changes: {
          from: 0,
          to: currentDoc.length,
          insert: nextDoc,
        },
      });
    }
  }, [value]);

  useEffect(() => {
    const view = viewRef.current;
    const compartment = readOnlyCompartmentRef.current;
    if (!view || !compartment) return;

    view.dispatch({
      effects: compartment.reconfigure(EditorView.editable.of(!disabled)),
    });
  }, [disabled]);

  return (
    <div className="w-full rounded-xl overflow-hidden border-2 border-gray-700 bg-[#282c34] text-left">
      <div className="flex items-center justify-between px-4 py-2 bg-[#162329] border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
          <span className="text-xs font-mono font-bold text-gray-300">
            main.py
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">
            Python 3
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-gray-400">
            Ctrl/Cmd + Enter para executar
          </span>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              disabled={disabled}
              className="text-xs font-semibold text-gray-300 hover:text-white px-2.5 py-1 rounded-md border border-gray-600 hover:bg-gray-700 transition disabled:opacity-40"
            >
              Resetar
            </button>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className={disabled ? 'opacity-70 pointer-events-none' : ''}
      />
    </div>
  );
}