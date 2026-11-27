// Client cart (F-03). Only for convenience: the server re-checks every rule (BR-01..BR-04).
export const MAX_QTY = 10; // BR-01
export const MAX_LINES = 20; // BR-02
export const MAX_ITEMS = 15; // BR-01b (Lab 7, C-1): items in total over all lines

export type CartLine = { menuItemId: number; name: string; price: number; quantity: number };
export type Cart = { lines: CartLine[] };
export const emptyCart: Cart = { lines: [] };
export const itemCount = (cart: Cart) => cart.lines.reduce((n, l) => n + l.quantity, 0);

type Item = { id: number; name: string; price: number };
export type CartAction =
  | { type: "add"; item: Item }
  | { type: "setQty"; menuItemId: number; quantity: number }
  | { type: "remove"; menuItemId: number }
  | { type: "clear" };

const clampQty = (q: number) => Math.min(MAX_QTY, Math.max(1, Math.trunc(q) || 1));

export function cartReducer(cart: Cart, action: CartAction): Cart {
  switch (action.type) {
    case "add": {
      const line = cart.lines.find((l) => l.menuItemId === action.item.id);
      if (line) return cartReducer(cart, { type: "setQty", menuItemId: line.menuItemId, quantity: line.quantity + 1 });
      if (cart.lines.length >= MAX_LINES || itemCount(cart) >= MAX_ITEMS) return cart;
      const { id, name, price } = action.item;
      return { lines: [...cart.lines, { menuItemId: id, name, price, quantity: 1 }] };
    }
    case "setQty": {
      // the other lines keep their quantity; this line may only use what is left of the 15 (never below 1)
      const others = itemCount(cart) - (cart.lines.find((l) => l.menuItemId === action.menuItemId)?.quantity ?? 0);
      const q = Math.max(1, Math.min(clampQty(action.quantity), MAX_ITEMS - others));
      return { lines: cart.lines.map((l) => (l.menuItemId === action.menuItemId ? { ...l, quantity: q } : l)) };
    }
    case "remove":
      return { lines: cart.lines.filter((l) => l.menuItemId !== action.menuItemId) };
    case "clear":
      return emptyCart;
  }
}

export const estimatedTotal = (cart: Cart) => cart.lines.reduce((sum, l) => sum + l.price * l.quantity, 0);

// ui-spec S2: at 20 lines every + on the menu is disabled (lines in the cart change only with their stepper).
export const canAddFromMenu = (cart: Cart) => cart.lines.length < MAX_LINES && itemCount(cart) < MAX_ITEMS;
export const atItemLimit = (cart: Cart) => itemCount(cart) >= MAX_ITEMS;
