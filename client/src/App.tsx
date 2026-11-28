import { useEffect, useRef } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { homeFor, useAuth } from "./auth";
import { RequireRole } from "./Layout";
import { LoginPage } from "./pages/LoginPage";
import { MenuPage } from "./pages/MenuPage";
import { OrdersSplit } from "./pages/OrdersPage";
import { CartProvider } from "./cart";
import { QueuePage } from "./pages/QueuePage";
import { OperatorMenuPage } from "./pages/OperatorMenuPage";
import { OperatorSalesPage } from "./pages/OperatorSalesPage";

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page" aria-busy="true" />;
  return <Navigate to={user ? homeFor(user.role) : "/login"} replace />;
}

function NotFound() {
  return (
    <main className="content center">
      <h1 className="page-title">Page not found</h1>
      <Link className="btn inline" to="/">
        Go home
      </Link>
    </main>
  );
}

export function App() {
  // key: a new user gets a new, empty cart.
  const { user, notice, noticeTarget, setNotice } = useAuth();
  const { pathname } = useLocation();
  const shownOnRef = useRef<string | null>(null);

  useEffect(() => {
    if (!notice) {
      shownOnRef.current = null;
      return;
    }
    const expected = noticeTarget ?? pathname;
    if (pathname === expected) {
      shownOnRef.current = expected;
    } else if (shownOnRef.current !== null && pathname !== shownOnRef.current) {
      setNotice(null);
    }
  }, [notice, noticeTarget, pathname, setNotice]);

  return (
    <CartProvider key={user?.id ?? 0}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/menu" element={<RequireRole role="CUSTOMER" title="Menu"><MenuPage /></RequireRole>} />
      <Route path="/orders" element={<RequireRole role="CUSTOMER" title="My orders"><OrdersSplit /></RequireRole>} />
      <Route path="/orders/:id" element={<RequireRole role="CUSTOMER" title="My orders"><OrdersSplit /></RequireRole>} />
      <Route path="/operator/orders" element={<RequireRole role="OPERATOR" title="Order queue"><QueuePage /></RequireRole>} />
      <Route path="/operator/menu" element={<RequireRole role="OPERATOR" title="Menu items"><OperatorMenuPage /></RequireRole>} />
      <Route path="/operator/sales" element={<RequireRole role="OPERATOR" title="Sales summary"><OperatorSalesPage /></RequireRole>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </CartProvider>
  );
}
