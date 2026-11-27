import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, ApiError, NETWORK_MESSAGE } from "../api";
import { formatBaht as baht } from "../lib/money";
import { bahtToSatang } from "../lib/price";

type Item = { id: number; name: string; price: number; isAvailable: boolean };
type FormState = { id: number | null; name: string; price: string; isAvailable: boolean };
const EMPTY: FormState = { id: null, name: "", price: "", isAvailable: true };

export function OperatorMenuPage() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState<{ field: string; text: string } | null>(null);
  const [boxError, setBoxError] = useState(false);
  const [toast, setToast] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      setItems(await api<Item[]>("/api/operator/menu"));
    } catch {
      setLoadError(true);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  function openForm(f: FormState) {
    setForm(f);
    setFieldError(null);
    setBoxError(false);
  }

  async function toggle(item: Item) {
    setToast(null);
    try {
      const saved = await api<Item>(`/api/operator/menu/${item.id}`, { method: "PATCH", body: { isAvailable: !item.isAvailable } });
      setItems((l) => l?.map((i) => (i.id === saved.id ? saved : i)) ?? null);
      setToast({ kind: "success", text: saved.isAvailable ? `${saved.name} is back on the menu.` : `${saved.name} is sold out for new orders.` });
    } catch (err) {
      setToast({ kind: "error", text: err instanceof ApiError ? err.message : NETWORK_MESSAGE });
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setFieldError(null);
    setBoxError(false);
    const name = form.name.trim();
    if (!name) return setFieldError({ field: "name", text: "Name is required." });
    if (name.length > 60) return setFieldError({ field: "name", text: "Name must be 60 characters or fewer." });
    const price = bahtToSatang(form.price);
    if ("error" in price) return setFieldError({ field: "price", text: price.error });
    setSaving(true);
    try {
      const body = { name, price: price.satang, isAvailable: form.isAvailable };
      const saved =
        form.id === null
          ? await api<Item>("/api/operator/menu", { method: "POST", body })
          : await api<Item>(`/api/operator/menu/${form.id}`, { method: "PATCH", body });
      setToast({ kind: "success", text: form.id === null ? `${saved.name} added.` : `${saved.name} saved.` });
      setForm(null);
      await load();
    } catch (err) {
      const d = err instanceof ApiError ? (err.details as { field?: string } | null) : null;
      if (err instanceof ApiError && err.status === 400 && d?.field) {
        setBoxError(true);
        setFieldError({ field: d.field, text: err.message });
      } else setToast({ kind: "error", text: err instanceof ApiError ? err.message : NETWORK_MESSAGE });
    } finally {
      setSaving(false);
    }
  }

  if (loadError)
    return (
      <div className="empty">
        <p className="empty-title">Couldn't load the menu.</p>
        <button className="btn inline" onClick={load}>
          Reload menu
        </button>
      </div>
    );
  if (!items)
    return (
      <div aria-busy="true">
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    );

  return (
    <section>
      <div className="queue-head">
        <h2 className="section-title">Menu items</h2>
        <button className="btn small" onClick={() => openForm(EMPTY)}>
          Add item
        </button>
      </div>
      {toast && (
        <div className={"msg " + toast.kind} role={toast.kind === "error" ? "alert" : "status"}>
          {toast.text}
        </div>
      )}
      {form && (
        <form className="card" onSubmit={submit} noValidate aria-label={form.id === null ? "Add item form" : "Edit item form"}>
          {boxError && (
            <div className="msg error" role="alert">
              Item not saved. Fix the marked field.
            </div>
          )}
          <label>
            Name <span className="muted">{form.name.length} / 60</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={fieldError?.field === "name"} />
          </label>
          <p className="muted">1–60 characters, must be unique</p>
          {fieldError?.field === "name" && (
            <p className="msg error" role="alert">
              {fieldError.text}
            </p>
          )}
          <label>
            Price (฿)
            <input inputMode="decimal" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} aria-invalid={fieldError?.field === "price"} />
          </label>
          <p className="muted">฿0.01 – ฿1,000.00</p>
          {fieldError?.field === "price" && (
            <p className="msg error" role="alert">
              {fieldError.text}
            </p>
          )}
          <label>
            <input type="checkbox" checked={!form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: !e.target.checked })} /> Sold out
          </label>
          <p className="muted">Affects new orders only. Orders already placed keep their items.</p>
          {form.id !== null && (
            <p className="muted">Changing the price does not change orders already placed: they keep the price they were ordered at.</p>
          )}
          <button className="btn small" type="submit" disabled={saving}>
            {saving ? "Saving…" : form.id === null ? "Add item" : "Save changes"}
          </button>{" "}
          <button className="btn ghost small" type="button" onClick={() => setForm(null)}>
            Cancel
          </button>
        </form>
      )}
      {items.length === 0 ? (
        <div className="empty">
          <p className="empty-title">No menu items yet.</p>
          <p className="muted">Add the first item customers can order.</p>
        </div>
      ) : (
        <ul className="queue">
          {items.map((i) => (
            <li className="card order-card" key={i.id} data-testid={`menu-${i.id}`}>
              <span className="q-who">
                {i.name} {!i.isAvailable && <span className="pill">Sold out</span>}
              </span>
              <strong className="q-total">{baht(i.price)}</strong>
              <label className="q-time">
                <input type="checkbox" role="switch" aria-label={`Sold out: ${i.name}`} checked={!i.isAvailable} onChange={() => toggle(i)} /> Sold out
              </label>
              <button
                className="q-action btn ghost small"
                onClick={() => openForm({ id: i.id, name: i.name, price: (i.price / 100).toFixed(2), isAvailable: i.isAvailable })}
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
