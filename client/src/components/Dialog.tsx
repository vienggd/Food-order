import { useEffect, useId, useRef, type ReactNode } from "react";

// Confirm sheet (phone) / dialog (desktop). Esc closes it. Callers put autoFocus on the safe button.
// NFR-09: Tab stays inside the dialog, and focus goes back to the control that opened it when it closes.
export function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const titleId = useId();
  const box = useRef<HTMLDivElement>(null);
  const opener = useRef(document.activeElement as HTMLElement | null); // read during the first render, before autoFocus moves focus into the dialog
  // Focus goes back only on a real close: the 0 ms check skips React StrictMode's fake unmount, where the box is still in the page.
  useEffect(() => () => void setTimeout(() => !box.current?.isConnected && opener.current?.focus(), 0), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return onClose();
      if (e.key !== "Tab" || !box.current) return;
      const items = [...box.current.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])")].filter((el) => !(el as HTMLButtonElement).disabled);
      if (items.length === 0) return;
      const first = items[0], last = items[items.length - 1];
      if (!box.current.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div ref={box} className="dialog card" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
        <h3 id={titleId} className="title">
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
}
