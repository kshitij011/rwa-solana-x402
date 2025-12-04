import "./polyfills";

import { createRoot } from "react-dom/client";
import App from "./App";
import Providers from "./providers/providers";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <Providers>
    <App />
  </Providers>
);
