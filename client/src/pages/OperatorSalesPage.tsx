import { useCallback, useEffect, useState, type FormEvent } from "react";
import { api, ApiError } from "../api";
import { formatBaht } from "../lib/money";

type Sales = {
  from: string;
  to: string;
  days: { date: string; orderCount: number; salesTotal: number }[];
  topItems: { menuItemId: number; name: string; quantity: number }[];
};

// F-10 sales summary: only PICKED_UP and PAID orders count (BR-17). The server decides everything.
export function OperatorSalesPage() {
  const [data, setData] = useState<Sales | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (query = "") => {
    setLoadError(false);
    setFormError(null);
    setBusy(true);
    try {
      const d = await api<Sales>(`/api/operator/sales${query}`);
      setData(d);
      setFrom(d.from);
      setTo(d.to);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) setFormError(err.message);
      else setLoadError(true);
    } finally {
      setBusy(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  function show(e: FormEvent) {
    e.preventDefault();
    load(`?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
  }

  if (loadError)
    return (
      <div className="empty">
        <p className="empty-title">Couldn't load sales.</p>
        <button className="btn inline" onClick={() => load()}>
          Reload sales
        </button>
      </div>
    );
  if (!data)
    return (
      <div aria-busy="true">
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    );

  const orders = data.days.reduce((n, d) => n + d.orderCount, 0);
  const total = data.days.reduce((n, d) => n + d.salesTotal, 0);

  return (
    <section>
      <h2 className="section-title">Sales summary</h2>
      <form className="card" onSubmit={show} noValidate aria-label="Date range">
        <label>
          From
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>{" "}
        <label>
          To
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>{" "}
        <button className="btn small" type="submit" disabled={busy}>
          {busy ? "Loading…" : "Show"}
        </button>
        {formError && (
          <p className="msg error" role="alert">
            {formError}
          </p>
        )}
      </form>
      <p className="muted">Only orders that are picked up and paid count. Days are Bangkok days.</p>
      <div className="stats">
        <div className="stat card">
          <p className="muted">Orders</p>
          <p className="stat-value" data-testid="sales-orders">{orders}</p>
        </div>
        <div className="stat card">
          <p className="muted">Sales total</p>
          <p className="stat-value" data-testid="sales-total">{formatBaht(total)}</p>
        </div>
      </div>
      {data.days.length === 0 ? (
        <div className="empty">
          <p className="empty-title">No sales in this period.</p>
        </div>
      ) : (
        <>
          <table className="lines" aria-label="Sales per day">
            <thead>
              <tr>
                <th align="left">Date</th>
                <th align="right">Orders</th>
                <th align="right">Sales</th>
              </tr>
            </thead>
            <tbody>
              {data.days.map((d) => (
                <tr key={d.date} data-testid={`day-${d.date}`}>
                  <td>{d.date}</td>
                  <td className="num">{d.orderCount}</td>
                  <td className="num">{formatBaht(d.salesTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 className="section-title">Top 3 items</h3>
          <ol data-testid="top-items">
            {data.topItems.map((i) => (
              <li key={i.menuItemId}>
                {i.name} <span className="muted">× {i.quantity}</span>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
