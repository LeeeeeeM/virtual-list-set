use serde::Serialize;
use std::collections::HashSet;
use wasm_bindgen::prelude::*;

use super::position::SessionPosition;

#[wasm_bindgen]
#[derive(Debug, Default, Clone, Serialize)]
pub struct Section {
    width: u32,  // 分片宽度
    height: u32, // 分片高度
    x: u32,      // 当前切片x轴坐标
    y: u32,      // 当前切片y轴坐标
    index_set: HashSet<u32>,
    indices: Vec<u32>,
}

impl Section {
    pub fn new(pos: SessionPosition) -> Self {
        let SessionPosition {
            x,
            width,
            y,
            height,
        } = pos;
        Self {
            width,
            height,
            x,
            y,
            index_set: HashSet::new(),
            indices: Vec::new(),
        }
    }

    pub fn add_cell_index(&mut self, index: u32) {
        if !self.index_set.contains(&index) {
            self.index_set.insert(index);
            self.indices.push(index);
        }
    }

    pub fn get_indices(&self) -> Vec<u32> {
        // return vec![1, 2, 3, 4];
        self.indices.clone()
    }
}
