use wasm_bindgen::prelude::*;

#[wasm_bindgen] // test reture String
pub fn gen_hello_string(a: &str) -> String {
    format!("hello, {}!", a)
}
