import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import ScrollToTop from "./components/ScrollToTop";
import LoadingScreen from "./components/LoadingScreen";

const Root: React.FC = () => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Show the splash at least a moment so it doesn't flicker.
    const minMs = 1500; // keep splash visible a bit longer
    const start = Date.now();

    const done = () => {
      const elapsed = Date.now() - start;
      const wait = Math.max(0, minMs - elapsed);
      window.setTimeout(() => setLoading(false), wait);
    };

    // Prefer the real page load event when available.
    if (document.readyState === "complete") {
      done();
      return;
    }

    window.addEventListener("load", done, { once: true });
    return () => window.removeEventListener("load", done);
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      {loading ? <LoadingScreen message="Welcome to Future Spark" /> : null}
      <App />
    </BrowserRouter>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
