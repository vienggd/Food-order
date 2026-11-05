import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";

// Skeleton only. Screens S1-S5 (docs/ui/ui-spec.md) are added by F-01..F-04.
function Home() {
  const [api, setApi] = useState("checking…");
  useEffect(() => {
    fetch("/api/health")
      .then((r) => (r.ok ? "API is up" : "API error"))
      .catch(() => "API is not reachable")
      .then(setApi);
  }, []);
  return (
    <main>
      <h1>Campus Café</h1>
      <p>{api}</p>
    </main>
  );
}

function NotFound() {
  return (
    <main>
      <h1>Page not found</h1>
      <Link to="/">Go home</Link>
    </main>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
