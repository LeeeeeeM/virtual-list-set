use std::collections::HashMap;

use crate::section_manager::{CellPosition, SectionManager};

use super::section_manager::CellInfo;
use serde::Serialize;
use serde_json;
use serde_wasm_bindgen;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct LayerManager {
    section_size: u32,
    group: Vec<CellInfo>,
    section_manager: SectionManager,
    total_height: f32,
    total_width: f32,
}

#[wasm_bindgen]
impl LayerManager {
    #[wasm_bindgen(constructor)]
    pub fn new(section_size: u32, arr: JsValue) -> Self {
        let array: Vec<CellInfo> = serde_wasm_bindgen::from_value(arr).unwrap();

        // array
        //     .into_iter()
        //     .map(|info| {
        //         let CellInfo {
        //             x,
        //             y,
        //             width,
        //             height,

        //         } = info;
        //         let data = info.data();
        //     })
        //     .collect();
        // let array = serde_json::from_str(arr).unwrap();

        Self {
            section_size,
            total_width: 0.0,
            total_height: 0.0,
            section_manager: SectionManager::new(section_size),
            group: array,
        }
    }

    pub fn init(&mut self) {
        self.calc_layer();
    }

    pub fn calc_layer(&mut self) {
        let mut total_height = 0.0;
        let mut total_width = 0.0;
        for index in 0..self.group.len() {
            let group = &self.group[index];
            let CellInfo {
                x,
                y,
                width,
                height,
                ..
            } = *group;
            // let CellInfo { data, pos } = group;
            self.section_manager.register_cells(
                CellPosition {
                    x,
                    y,
                    width,
                    height,
                },
                index as u32,
            );

            let bottom = y + height;
            let right = x + width;
            if bottom > total_height {
                total_height = bottom;
            }
            if right > total_width {
                total_width = right;
            }
        }
        self.total_height = total_height;
        self.total_width = total_width;
    }

    pub fn get_cell_indices(&mut self, pos: JsValue) -> Result<JsValue, JsValue> {
        let pos: CellPosition = serde_wasm_bindgen::from_value(pos).unwrap();
        let r = self.section_manager.get_cell_indices(pos);
        Ok(serde_wasm_bindgen::to_value(&r)?)
    }

    pub fn test(&mut self, pos: JsValue) -> Result<JsValue, JsValue> {
        let pos: CellPosition = serde_wasm_bindgen::from_value(pos).unwrap();
        // let r = self.section_manager.get_collect_sections(pos);
        return self.section_manager.get_inner(pos);
        // let r = &self.group;

        // Ok(serde_wasm_bindgen::to_value(&r)?)
    }

    pub fn get_item(&self, index: u32) -> CellInfo {
        self.group[index as usize].clone()
    }

    pub fn get_cell(&self, index: u32) -> Option<CellPosition> {
        self.section_manager.get_cell(index)
    }

    pub fn to_string(&self) -> String {
        serde_json::to_string(&self.group).expect("json serialization failure")
    }
}
