import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { bootstrapTheme } from "./lib/theme/themes";
import { autoSeedSamplesOnce } from "./lib/pia/sampleSeeds";

bootstrapTheme();
autoSeedSamplesOnce();

createRoot(document.getElementById("root")!).render(<App />);
