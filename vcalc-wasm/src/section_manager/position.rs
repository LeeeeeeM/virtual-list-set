use serde::{Deserialize, Serialize};
use serde_json::Value;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct SessionPosition {
    pub x: u32,      // 当前切片x轴坐标
    pub y: u32,      // 当前切片y轴坐标
    pub width: u32,  // 分片宽度
    pub height: u32, // 分片高度
}

#[wasm_bindgen]
#[derive(Clone, Copy, Serialize, Deserialize)]
pub struct CellPosition {
    pub x: f32,      // 当前瀑布流卡片x轴坐标
    pub y: f32,      // 当前瀑布流卡片y轴坐标
    pub width: f32,  // 当前瀑布流卡片宽度
    pub height: f32, // 当前瀑布流卡片高度
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize, PartialEq, Hash, Eq, Clone)]
pub struct Point(pub u32, pub u32);

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, PartialEq, Deserialize, Serialize)]
struct CellData {
    pub text: String,
    pub color: String,
}

#[wasm_bindgen]
#[derive(Clone, Serialize, Deserialize, PartialEq)]
pub struct CellInfo {
    pub x: f32,      // 当前瀑布流卡片x轴坐标
    pub y: f32,      // 当前瀑布流卡片y轴坐标
    pub width: f32,  // 当前瀑布流卡片宽度
    pub height: f32, // 当前瀑布流卡片高度
    #[serde(deserialize_with = "deserialize_data")]
    data: CellData,
}

fn deserialize_data<'de, D>(deserializer: D) -> Result<CellData, D::Error>
where
    D: serde::Deserializer<'de>,
{
    let value = Value::deserialize(deserializer)?;
    let obj = value
        .as_object()
        .ok_or_else(|| serde::de::Error::custom("Expected object"))?;
    let text = obj
        .get("text")
        .ok_or_else(|| serde::de::Error::missing_field("text"))?;
    let color = obj
        .get("color")
        .ok_or_else(|| serde::de::Error::missing_field("color"))?;

    Ok(CellData {
        text: text
            .as_str()
            .ok_or_else(|| serde::de::Error::custom("Expected string"))?
            .to_owned(),
        color: color
            .as_str()
            .ok_or_else(|| serde::de::Error::custom("Expected string"))?
            .to_owned(),
    })
}

#[wasm_bindgen]
impl CellInfo {
    #[wasm_bindgen(getter)]
    pub fn data(&self) -> CellData {
        self.data.clone()
    }

    #[wasm_bindgen(setter)]
    pub fn set_data(&mut self, data: CellData) {
        self.data = data;
    }
}
