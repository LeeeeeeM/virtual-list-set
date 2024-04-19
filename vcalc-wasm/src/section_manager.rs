mod position;
mod section;

pub use position::{CellInfo, CellPosition, Point, SessionPosition};

use section::Section;
use std::collections::{HashMap, HashSet};

use std::cell::RefCell;
use std::rc::Rc;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
// #[derive(Serialize)]
pub struct SectionManager {
    section_size: u32,
    sections_map: HashMap<Point, Rc<RefCell<Section>>>,
    cell_lists: HashMap<u32, CellPosition>,
}

// #[wasm_bindgen]
impl SectionManager {
    // #[wasm_bindgen(constructor)]
    pub fn new(section_size: u32) -> Self {
        Self {
            section_size,
            sections_map: HashMap::new(),
            cell_lists: HashMap::new(),
        }
    }

    pub fn get_cell(&self, index: u32) -> Option<CellPosition> {
        self.cell_lists.get(&index).cloned()
    }

    pub fn register_cells(&mut self, pos: CellPosition, index: u32) {
        self.cell_lists.insert(index, pos.clone());
        let sections = self.collect_sections(pos);
        for section in sections.iter() {
            section.borrow_mut().add_cell_index(index);
        }
    }

    pub fn collect_sections(&mut self, pos: CellPosition) -> Vec<Rc<RefCell<Section>>> {
        let CellPosition {
            width,
            height,
            x,
            y,
        } = pos;
        let section_size = self.section_size as f32;

        let section_x_start = (x / section_size).floor() as u32;
        let section_x_end = ((x + width - 1.0) / section_size).ceil() as u32;

        let section_y_start = (y / section_size).floor() as u32;
        let section_y_end = ((y + height - 1.0) / section_size).ceil() as u32;

        let mut sections = Vec::new();

        let bound = self.section_size;

        for section_x in section_x_start..section_x_end + 1 {
            for section_y in section_y_start..section_y_end + 1 {
                let point = Point(section_x, section_y);

                let section = self.sections_map.entry(point.clone()).or_insert_with(|| {
                    let section = Section::new(SessionPosition {
                        width: bound,
                        height: bound,
                        x: section_x * bound,
                        y: section_y * bound,
                    });
                    Rc::new(RefCell::new(section))
                });
                sections.push(section.clone());
            }
        }
        sections
    }

    pub fn get_cell_indices(&mut self, pos: CellPosition) -> Vec<u32> {
        // 收集当前视窗内的所有section贴片，然后再根据每个贴片的依赖关系收集到所有需要渲染的cell位置索引
        let mut indices = HashSet::<u32>::new();

        let section_list = self.collect_sections(pos);

        for section in section_list {
            for indice in section.borrow().get_indices() {
                indices.insert(indice);
            }
        }

        indices.into_iter().collect()
    }

    pub fn get_collect_sections(&mut self, pos: CellPosition) -> Vec<Rc<RefCell<Section>>> {
        // 收集当前视窗内的所有section贴片，然后再根据每个贴片的依赖关系收集到所有需要渲染的cell位置索引

        let section_list = self.collect_sections(pos);

        return section_list;
    }

    pub fn get_inner(&mut self) -> Result<JsValue, JsValue> {
        // let r = self.collect_sections(pos); pos: CellPosition
        // let r = self.sections_map.clone();
        let r = self.section_size;
        Ok(serde_wasm_bindgen::to_value(&r)?)
    }
}
