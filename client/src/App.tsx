import { Link, Navigate, Route, Routes } from "react-router-dom";
import { homeFor, useAuth } from "./auth";
import { RequireRole } from "./Layout";
import { LoginPage } from "./pages/LoginPage";
import { MenuPage } from "./pages/MenuPage";

// Placeholder until the feature that owns the screen replaces it (F-02/F-03: ninja, F-04: vieng).
function Coming({ feature }: { feature: string }) {
  return (
    <div className="empty">
      <p className="empty-title">Coming soon</p>
      <p>This screen is built in {feature}.</p>
    </div>
  );
}

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
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/menu" element={<RequireRole role="CUSTOMER" title="Menu"><MenuPage /></RequireRole>} />
      <Route path="/orders" element={<RequireRole role="CUSTOMER" title="My orders"><Coming feature="F-03" /></RequireRole>} />
      <Route path="/orders/:id" element={<RequireRole role="CUSTOMER" title="Order"><Coming feature="F-03" /></RequireRole>} />
      <Route path="/operator/orders" element={<RequireRole role="OPERATOR" title="Order queue"><Coming feature="F-04" /></RequireRole>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
