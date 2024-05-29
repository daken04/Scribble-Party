import React from "react";
import { createRoot } from 'react-dom/client';
import App from "./App";
import './index.css';  // Make sure to import the Tailwind CSS

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);