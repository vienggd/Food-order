import { useState } from "react";
import { api, ApiError, NETWORK_MESSAGE } from "../api";
import { formatBaht } from "../lib/money";
import type { Order, PaymentStatus } from "../lib/orders";
import { formatPlacedTime } from "../lib/time";

const LABEL: Record<PaymentStatus, string> = { UNPAID: "Unpaid", PAID: "Paid", REFUNDED: "Refunded" };

// Payment badge: a square dot and the word, so colour is never the only signal.
export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`pay-badge ${status.toLowerCase()}`} data-testid="payment-badge">
      <span className="pay-dot" aria-hidden="true" />
      {LABEL[status]}
    </span>
  );
}

const PAYABLE = ["PLACED", "ACCEPTED", "PREPARING", "READY"];

// F-08: Payment card on the order detail. Simulated: no card fields, the server uses the order total.
export function PaymentCard({ order, onPaid }: { order: Order; onPaid: (o: Order) => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const canPay = order.paymentStatus === "UNPAID" && PAYABLE.includes(order.status);

  async function pay() {
    setBusy(true);
    setMessage(null);
    try {
      const paid = await api<Order>(`/api/orders/${order.id}/pay`, { method: "POST" });
      onPaid(paid);
      setMessage({ kind: "success", text: `Paid ${formatBaht(paid.total)} (simulated).` });
    } catch (err) {
      const text = err instanceof ApiError ? `Not paid. ${err.message}` : NETWORK_MESSAGE;
      setMessage({ kind: "error", text });
      if (err instanceof ApiError && err.status === 409) onPaid(await api<Order>(`/api/orders/${order.id}`).catch(() => order));
    } finally {
      setBusy(false);
    }
  }

  let body;
  if (order.paymentStatus === "PAID" && order.paidAt)
    body = <p>Paid {formatBaht(order.total)} at {formatPlacedTime(order.paidAt)} (simulated)</p>;
  else if (order.paymentStatus === "REFUNDED" && order.refundedAt)
    body = <p>Refunded {formatBaht(order.total)} at {formatPlacedTime(order.refundedAt)} (simulated), because the order was {order.status === "REJECTED" ? "rejected" : "cancelled"}.</p>;
  else if (canPay)
    body = (
      <button className="btn pay-btn" onClick={pay} disabled={busy}>
        {busy ? "Paying…" : `Pay ${formatBaht(order.total)} (simulated)`}
      </button>
    );
  else body = <p className="muted">Nothing to pay.</p>;

  return (
    <div className="pay-card" aria-label="Payment">
      <div className="cart-line-top">
        <strong>Payment</strong>
        <span className="sim-tag">Simulated</span>
        <PaymentBadge status={order.paymentStatus} />
      </div>
      <p className="muted">Practice payment for this project: no real money moves and no card details are asked.</p>
      {order.status === "READY" && order.paymentStatus === "UNPAID" && (
        <p className="msg info">
          <strong>Your order is ready.</strong> Pay first, then pick it up at the counter.
        </p>
      )}
      {body}
      {message && (
        <div className={"msg " + message.kind} role={message.kind === "error" ? "alert" : "status"}>
          {message.text}
        </div>
      )}
    </div>
  );
}
