// Shared order shapes from the API (docs/system-sds.md 4.3). Money in satang, times ISO.
export type OrderStatus = "PLACED" | "ACCEPTED" | "PREPARING" | "READY" | "PICKED_UP" | "REJECTED" | "CANCELLED";
export type OrderLine = { menuItemId: number; name: string; unitPrice: number; quantity: number; lineTotal: number };
export type Order = { id: number; status: OrderStatus; total: number; createdAt: string; acceptedAt: string | null; lines: OrderLine[] };
export type OrderSummary = { id: number; status: OrderStatus; total: number; itemCount: number; createdAt: string };
