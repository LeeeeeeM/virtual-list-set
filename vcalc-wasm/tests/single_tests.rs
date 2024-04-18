use vcalc_wasm::LayerManager;
use wasm_bindgen::JsValue;

#[test]
fn compose_operation() {
    LayerManager::new(5, JsValue::from("[]"));
}
