import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { formatBaht } from "../lib/money";

export type MenuItem = { id: number; name: string; price: number; isAvailable: boolean };

type Load = { state: "loading" } | { state: "error" } | { state: "ok"; items: MenuItem[] };

// Loads GET /api/menu. `reload` is also used by F-03 after a rejected order (fresh sold-out flags).
export function useMenu() {
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const reload = useCallback(() => {
    setLoad({ state: "loading" });
    api<MenuItem[]>("/api/menu")
      .then((items) => setLoad({ state: "ok", items }))
      .catch(() => setLoad({ state: "error" })); // 401 is handled by api(); anything else shows the error state
  }, []);
  useEffect(reload, [reload]);
  return { load, reload };
}

type ListProps = {
  load: Load;
  reload: () => void;
  onAdd?: (item: MenuItem) => void; // wired by F-03 (cart)
  inCart?: Record<number, number>; // menuItemId -> quantity
  addDisabled?: boolean; // e.g. cart full
};

export function MenuList({ load, reload, onAdd, inCart = {}, addDisabled = false }: ListProps) {
  if (load.state === "loading") {
    return (
      <div aria-busy="true" aria-label="Loading menu">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton" />
        ))}
      </div>
    );
  }
  if (load.state === "error") {
    return (
      <div className="empty" role="alert">
        <p className="empty-title">Couldn't load the menu. Check your connection.</p>
        <button className="btn inline small" onClick={reload}>
          Reload menu
        </button>
      </div>
    );
  }
  if (load.items.length === 0) {
    return (
      <div className="empty">
        <p>Nothing on the menu yet. Please check back later.</p>
      </div>
    );
  }
  return (
    <ul className="menu-list">
      {load.items.map((item) => {
        const qty = inCart[item.id] ?? 0;
        return (
          <li key={item.id} className={"menu-item" + (item.isAvailable ? "" : " sold-out")}>
            <div>
              <p className="menu-name">{item.name}</p>
              <p className="menu-price">{formatBaht(item.price)}</p>
              {!item.isAvailable && <span className="badge sold">Sold out</span>}
              {qty > 0 && <span className="badge in-cart">In cart · {qty}</span>}
            </div>
            <button
              className="add"
              aria-label={`Add ${item.name}`}
              disabled={!item.isAvailable || !onAdd || addDisabled}
              onClick={() => onAdd?.(item)}
            >
              +
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function MenuPage() {
  const { load, reload } = useMenu();
  return (
    <>
      <section className="banner">
        <p className="banner-title">Order ahead. Skip the line.</p>
        <p className="banner-sub">Coffee and snacks from ฿35. Pickup ASAP at the counter.</p>
      </section>
      <MenuList load={load} reload={reload} />
    </>
  );
}
