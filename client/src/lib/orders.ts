// Shared order shapes from the API (docs/sprint_1/system-sds.md 4.3). Money in satang, times ISO.
export type OrderStatus = "PLACED" | "ACCEPTED" | "PREPARING" | "READY" | "PICKED_UP" | "REJECTED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";
export type OrderLine = { menuItemId: number; name: string; unitPrice: number; quantity: number; lineTotal: number };
export type Order = { id: number; status: OrderStatus; total: number; createdAt: string; acceptedAt: string | null; pickupSlot: string | null; paymentStatus: PaymentStatus; paidAt: string | null; refundedAt: string | null; lines: OrderLine[] };
export type OrderSummary = { id: number; status: OrderStatus; paymentStatus: PaymentStatus; total: number; itemCount: number; createdAt: string };
