import React from "react";
import { VirtualWaterFallListInstance as JS } from "./components/VirtualWaterFallList";
import { VirtualWaterFallListInstance as WASM } from "./components/VirtualWaterFallListWasm";
import "./App.css";

const searchParams = new URLSearchParams(location.search);
const jsParams = searchParams.get("useJs");
const useJs = jsParams === "true" || jsParams === "";

const App = () => (
  <>
    <div className="app">{useJs ? <JS /> : <WASM />}</div>
  </>
);
export default App;
