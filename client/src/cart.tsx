import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";
import { cartReducer, emptyCart, type Cart, type CartAction } from "./lib/cart";

// Cart lives in memory for this browser tab (not saved). Shared by the menu screen and the Cart tab.
const CartContext = createContext<{ cart: Cart; dispatch: Dispatch<CartAction> } | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, emptyCart);
  return <CartContext.Provider value={{ cart, dispatch }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
