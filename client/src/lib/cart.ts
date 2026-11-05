// Implemented in the [green] commit.
export const MAX_LINES = 20;
export type CartLine = { menuItemId: number; name: string; price: number; quantity: number };
export type Cart = { lines: CartLine[] };
export const emptyCart: Cart = { lines: [] };
type Item = { id: number; name: string; price: number };
export type CartAction =
  | { type: "add"; item: Item }
  | { type: "setQty"; menuItemId: number; quantity: number }
  | { type: "remove"; menuItemId: number }
  | { type: "clear" };
export function cartReducer(cart: Cart, _action: CartAction): Cart {
  return cart;
}
