import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, ApiError, NETWORK_MESSAGE } from "../api";
import { formatBaht as baht } from "../lib/money";
import { formatPlacedTime } from "../lib/time";
import { PaymentBadge } from "../components/Payment";
import { Dialog } from "../components/Dialog";
import type { OrderStatus, PaymentStatus } from "../lib/orders";

type QueueOrder = {
  id: number;
  status: OrderStatus;
  total: number;
  createdAt: string;
  paymentStatus: PaymentStatus;
  customer: { id: number; name: string };
  lines: { name: string; quantity: number }[];
};

// F-07: three tabs over the open orders. The tab is kept in the URL (?tab=new|progress|ready).
const TABS = [
  { key: "new", label: "New", title: "New orders", statuses: ["PLACED"] },
  { key: "progress", label: "In progress", title: "In progress", statuses: ["ACCEPTED", "PREPARING"] },
  { key: "ready", label: "Ready", title: "Ready for pickup", statuses: ["READY"] },
] as const;
// The one next step a card offers; `to` is the status shown in the toast (BR-13).
const NEXT = {
  ACCEPTED: { from: "ACCEPTED", label: "Start preparing", busy: "Starting…", done: (id: number) => `Order #${id} is now Preparing.` },
  PREPARING: { from: "PREPARING", label: "Mark ready", busy: "Marking ready…", done: (id: number) => `Order #${id} is ready.` },
  READY: { from: "READY", label: "Mark picked up", busy: "Marking picked up…", done: (id: number) => `Order #${id} picked up.` },
} as const;

const items = (o: QueueOrder) => o.lines.map((l) => `${l.name} ×${l.quantity}`).join(", ");

export function QueuePage() {
  const [orders, setOrders] = useState<QueueOrder[] | null>(null);
  const [params, setParams] = useSearchParams();
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<QueueOrder | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  // F-11: when a search is active the list comes from the search, otherwise from the open-order board.
  const [search, setSearch] = useState<{ q: string; status: string } | null>(null);
  const [draftQ, setDraftQ] = useState("");
  const [draftStatus, setDraftStatus] = useState("");
  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const query = search
        ? `?status=${search.status || "PLACED,ACCEPTED,PREPARING,READY,PICKED_UP,REJECTED,CANCELLED"}&q=${encodeURIComponent(search.q)}`
        : "?status=PLACED,ACCEPTED,PREPARING,READY";
      setOrders(await api<QueueOrder[]>(`/api/operator/orders${query}`));
    } catch {
      setLoadError(true);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  async function accept(id: number) {
    setBusyId(id);
    setMessage(null);
    try {
      await api(`/api/operator/orders/${id}/accept`, { method: "POST" });
      setMessage({ kind: "success", text: `Order #${id} accepted.` });
      await load();
    } catch (err) {
      const e = err instanceof ApiError ? err : null;
      if (e?.status === 409) setMessage({ kind: "error", text: `Order #${id}: ${e.message}` });
      else if (e?.status === 404) setMessage({ kind: "error", text: `Order #${id} no longer exists.` });
      else setMessage({ kind: "error", text: NETWORK_MESSAGE });
      if (e?.status === 409 || e?.status === 404) await load(); // what is on screen is out of date
    } finally {
      setBusyId(null);
    }
  }

  // F-07: move an order one step. `from` is the status this card shows, so a stale press gets a 409.
  async function step(o: QueueOrder & { status: keyof typeof NEXT }) {
    const next = NEXT[o.status];
    setBusyId(o.id);
    setMessage(null);
    try {
      await api(`/api/operator/orders/${o.id}/advance`, { method: "POST", body: { from: next.from } });
      setMessage({ kind: "success", text: next.done(o.id) });
      await load();
    } catch (err) {
      const e = err instanceof ApiError ? err : null;
      if (e?.status === 409) setMessage({ kind: "error", text: `Not moved. ${e.message}` });
      else if (e?.status === 404) setMessage({ kind: "error", text: `Order #${o.id} no longer exists.` });
      else setMessage({ kind: "error", text: NETWORK_MESSAGE });
      if (e?.status === 409 || e?.status === 404) await load();
    } finally {
      setBusyId(null);
    }
  }

  function openReject(o: QueueOrder) {
    setReason("");
    setReasonError(null);
    setRejecting(o);
  }

  // F-06 reject (BR-12). Client checks are only for convenience; the server checks again.
  async function reject() {
    if (!rejecting) return;
    const id = rejecting.id;
    const text = reason.trim();
    if (text.length < 3) return setReasonError("Write at least 3 characters.");
    if (text.length > 200) return setReasonError("Keep it to 200 characters or fewer.");
    setBusyId(id);
    setMessage(null);
    try {
      await api(`/api/operator/orders/${id}/reject`, { method: "POST", body: { reason: text } });
      setMessage({ kind: "success", text: `Order #${id} rejected. The customer can see your reason.` });
      setRejecting(null);
      await load();
    } catch (err) {
      const e = err instanceof ApiError ? err : null;
      setRejecting(null);
      if (e?.status === 409) setMessage({ kind: "error", text: `Not rejected. ${e.message}` });
      else if (e?.status === 404) setMessage({ kind: "error", text: `Order #${id} no longer exists.` });
      else setMessage({ kind: "error", text: NETWORK_MESSAGE });
      if (e?.status === 409 || e?.status === 404) await load();
    } finally {
      setBusyId(null);
    }
  }

  const refresh = (
    <button className="btn ghost small" onClick={load}>
      Refresh queue
    </button>
  );

  if (loadError)
    return (
      <div className="empty">
        <p className="empty-title">Couldn't load orders.</p>
        <button className="btn inline" onClick={load}>
          Reload queue
        </button>
      </div>
    );
  if (!orders)
    return (
      <div aria-busy="true">
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    );

  const tab = TABS.find((t) => t.key === params.get("tab")) ?? TABS[0];
  const countOf = (statuses: readonly string[]) => orders.filter((o) => statuses.includes(o.status)).length;
  const shown = search ? orders : orders.filter((o) => (tab.statuses as readonly string[]).includes(o.status));
  const now = Date.now();
  const oldestMin = shown.length ? Math.floor((now - Date.parse(shown[0].createdAt)) / 60000) : 0;
  const stats = [
    { label: "Waiting orders", value: String(shown.length) },
    { label: "Oldest waiting", value: `${oldestMin} min` },
    { label: "Items to make", value: String(shown.reduce((n, o) => n + o.lines.reduce((m, l) => m + l.quantity, 0), 0)) },
    { label: "Queue value", value: baht(shown.reduce((n, o) => n + o.total, 0)) },
  ];

  return (
    <section>
      <div className="queue-head">
        <h2 className="section-title">
          {search ? "Search results" : tab.title} <span className="count">{shown.length}</span>
        </h2>
        {refresh}
      </div>
      <form
        className="queue-search"
        onSubmit={(e) => {
          e.preventDefault();
          if (draftQ.trim()) setSearch({ q: draftQ.trim(), status: draftStatus });
        }}
      >
        <label htmlFor="queue-q">Order number or customer name</label>
        <input id="queue-q" type="search" maxLength={60} value={draftQ} onChange={(e) => setDraftQ(e.target.value)} />
        <label htmlFor="queue-status">Status</label>
        <select id="queue-status" value={draftStatus} onChange={(e) => setDraftStatus(e.target.value)}>
          <option value="">Any status</option>
          {["PLACED", "ACCEPTED", "PREPARING", "READY", "PICKED_UP", "REJECTED", "CANCELLED"].map((st) => (
            <option key={st} value={st}>
              {st.charAt(0) + st.slice(1).toLowerCase().replace("_", " ")}
            </option>
          ))}
        </select>
        <button className="btn small" type="submit">
          Search
        </button>
        <button
          className="btn small ghost"
          type="button"
          onClick={() => {
            setDraftQ("");
            setDraftStatus("");
            setSearch(null);
          }}
        >
          Clear
        </button>
      </form>
      <div role="tablist" className="queue-tabs" hidden={!!search}>
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={t.key === tab.key}
            className={"btn small " + (t.key === tab.key ? "" : "ghost")}
            onClick={() => setParams(t.key === "new" ? {} : { tab: t.key })}
          >
            {t.label} <span className="tab-count">{countOf(t.statuses)}</span>
          </button>
        ))}
      </div>
      {message && (
        <div className={"msg " + message.kind} role={message.kind === "error" ? "alert" : "status"}>
          {message.text}
        </div>
      )}
      <div className="stats">
        {stats.map((s) => (
          <div className="stat card" key={s.label}>
            <p className="muted">{s.label}</p>
            <p className="stat-value">{s.value}</p>
          </div>
        ))}
      </div>
      {shown.length === 0 ? (
        <div className="empty">
          <p className="empty-title">{search ? "No orders match your search." : tab.key === "new" ? "No new orders." : "Nothing here."}</p>
          {!search && tab.key === "new" && <p className="muted">New orders appear here when you refresh.</p>}
        </div>
      ) : (
        // Phone: one card per order (CSS grid). Desktop: semantic table (styles.css).
        <table className="queue">
          <thead>
            <tr className="queue-headrow">
              <th scope="col">Order</th>
              <th scope="col">Customer</th>
              <th scope="col">Items</th>
              <th scope="col">Placed</th>
              <th scope="col">Total</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((o) => (
              <tr className="card order-card" key={o.id} data-testid={`order-${o.id}`}>
                <td className="q-no order-no">#{o.id}</td>
                <td className="q-pill">
                  <span className={`pill ${o.status.toLowerCase()}`}>{o.status}</span>
                </td>
                <td className="q-who">
                  {o.customer.name} <PaymentBadge status={o.paymentStatus} />
                </td>
                <td className="q-items muted">{items(o)}</td>
                <td className="q-time muted">{formatPlacedTime(o.createdAt)}</td>
                <td className="q-total">
                  <strong>{baht(o.total)}</strong>
                </td>
                <td className="q-action">
                  {o.status === "PLACED" ? (
                    <span className="q-buttons">
                      <button className="btn small danger-outline" disabled={busyId === o.id} onClick={() => openReject(o)}>
                        Reject
                      </button>
                      <button className="btn small" disabled={busyId === o.id} onClick={() => accept(o.id)}>
                        {busyId === o.id ? "Accepting…" : "Accept order"}
                      </button>
                    </span>
                  ) : o.status in NEXT ? (
                    <div className="q-step">
                      <button
                        className="btn small"
                        disabled={busyId === o.id || (o.status === "READY" && o.paymentStatus !== "PAID")}
                        onClick={() => step(o as QueueOrder & { status: keyof typeof NEXT })}
                      >
                        {busyId === o.id ? NEXT[o.status as keyof typeof NEXT].busy : NEXT[o.status as keyof typeof NEXT].label}
                      </button>
                      {o.status === "READY" && o.paymentStatus !== "PAID" && (
                        <p className="muted q-wait">Waiting for payment. The customer pays in the app.</p>
                      )}
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {rejecting && (
        <Dialog title={`Reject order #${rejecting.id}?`} onClose={() => busyId === null && setRejecting(null)}>
          <p className="muted">
            {rejecting.customer.name} · {items(rejecting)} · {baht(rejecting.total)}
          </p>
          <label htmlFor="reject-reason">Reason (the customer will see this)</label>
          <textarea id="reject-reason" value={reason} onChange={(e) => setReason(e.target.value)} aria-describedby="reject-hint" />
          <p id="reject-hint" className="muted">
            3–200 characters · {reason.length} / 200
          </p>
          {reasonError && (
            <p className="msg error" role="alert">
              {reasonError}
            </p>
          )}
          <div className="dialog-actions">
            <button className="btn ghost" autoFocus disabled={busyId !== null} onClick={() => setRejecting(null)}>
              Back
            </button>
            <button className="btn danger" disabled={busyId !== null} onClick={reject}>
              {busyId === rejecting.id ? "Rejecting…" : "Reject order"}
            </button>
          </div>
        </Dialog>
      )}
    </section>
  );
}
