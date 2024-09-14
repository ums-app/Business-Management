import React from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import "./assets/css/bootstrap-icons.css"
import { StateProvider } from "./context/StateProvider"
import reducer, { initialState } from "./context/reducer"
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import "./locale/locale"

import App from "./App"

const container = document.getElementById("root")
const root = createRoot(container)
root.render(
  <StateProvider initialState={initialState} reducer={reducer}>
    <App />
  </StateProvider>
)
