/* tslint:disable */
/* eslint-disable */
/**
* @param {string} a
* @returns {string}
*/
export function gen_hello_string(a: string): string;
/**
*/
export class CellData {
  free(): void;
/**
*/
  color: string;
/**
*/
  text: string;
}
/**
*/
export class CellInfo {
  free(): void;
/**
*/
  height: number;
/**
*/
  width: number;
/**
*/
  x: number;
/**
*/
  y: number;
}
/**
*/
export class CellPosition {
  free(): void;
/**
*/
  height: number;
/**
*/
  width: number;
/**
*/
  x: number;
/**
*/
  y: number;
}
/**
*/
export class LayerManager {
  free(): void;
/**
* @param {number} section_size
* @param {any} arr
*/
  constructor(section_size: number, arr: any);
/**
*/
  init(): void;
/**
*/
  calc_layer(): void;
/**
* @param {any} pos
* @returns {any}
*/
  get_cell_indices(pos: any): any;
/**
* @returns {any}
*/
  test(): any;
/**
* @param {number} index
* @returns {CellInfo}
*/
  get_item(index: number): CellInfo;
/**
* @param {number} index
* @returns {CellPosition | undefined}
*/
  get_cell(index: number): CellPosition | undefined;
/**
* @returns {string}
*/
  to_string(): string;
/**
*/
  section_size: number;
/**
*/
  total_height: number;
/**
*/
  total_width: number;
}
/**
*/
export class Point {
  free(): void;
/**
*/
  0: number;
/**
*/
  1: number;
}
/**
*/
export class Section {
  free(): void;
}
/**
*/
export class SectionManager {
  free(): void;
}
/**
*/
export class SessionPosition {
  free(): void;
/**
*/
  height: number;
/**
*/
  width: number;
/**
*/
  x: number;
/**
*/
  y: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_get_sessionposition_width: (a: number) => number;
  readonly __wbg_set_sessionposition_width: (a: number, b: number) => void;
  readonly __wbg_get_sessionposition_height: (a: number) => number;
  readonly __wbg_set_sessionposition_height: (a: number, b: number) => void;
  readonly __wbg_point_free: (a: number) => void;
  readonly __wbg_get_point_0: (a: number) => number;
  readonly __wbg_set_point_0: (a: number, b: number) => void;
  readonly __wbg_get_point_1: (a: number) => number;
  readonly __wbg_set_point_1: (a: number, b: number) => void;
  readonly __wbg_celldata_free: (a: number) => void;
  readonly __wbg_get_celldata_text: (a: number, b: number) => void;
  readonly __wbg_set_celldata_text: (a: number, b: number, c: number) => void;
  readonly __wbg_get_celldata_color: (a: number, b: number) => void;
  readonly __wbg_set_celldata_color: (a: number, b: number, c: number) => void;
  readonly __wbg_cellinfo_free: (a: number) => void;
  readonly __wbg_get_cellinfo_x: (a: number) => number;
  readonly __wbg_set_cellinfo_x: (a: number, b: number) => void;
  readonly __wbg_get_cellinfo_y: (a: number) => number;
  readonly __wbg_set_cellinfo_y: (a: number, b: number) => void;
  readonly __wbg_get_cellinfo_width: (a: number) => number;
  readonly __wbg_set_cellinfo_width: (a: number, b: number) => void;
  readonly __wbg_get_cellinfo_height: (a: number) => number;
  readonly __wbg_set_cellinfo_height: (a: number, b: number) => void;
  readonly __wbg_set_sessionposition_x: (a: number, b: number) => void;
  readonly __wbg_set_sessionposition_y: (a: number, b: number) => void;
  readonly __wbg_set_cellposition_x: (a: number, b: number) => void;
  readonly __wbg_set_cellposition_y: (a: number, b: number) => void;
  readonly __wbg_set_cellposition_width: (a: number, b: number) => void;
  readonly __wbg_set_cellposition_height: (a: number, b: number) => void;
  readonly __wbg_get_sessionposition_x: (a: number) => number;
  readonly __wbg_get_sessionposition_y: (a: number) => number;
  readonly __wbg_get_cellposition_x: (a: number) => number;
  readonly __wbg_get_cellposition_y: (a: number) => number;
  readonly __wbg_get_cellposition_width: (a: number) => number;
  readonly __wbg_get_cellposition_height: (a: number) => number;
  readonly __wbg_sessionposition_free: (a: number) => void;
  readonly __wbg_cellposition_free: (a: number) => void;
  readonly __wbg_sectionmanager_free: (a: number) => void;
  readonly __wbg_layermanager_free: (a: number) => void;
  readonly __wbg_get_layermanager_section_size: (a: number) => number;
  readonly __wbg_set_layermanager_section_size: (a: number, b: number) => void;
  readonly __wbg_get_layermanager_total_height: (a: number) => number;
  readonly __wbg_set_layermanager_total_height: (a: number, b: number) => void;
  readonly __wbg_get_layermanager_total_width: (a: number) => number;
  readonly __wbg_set_layermanager_total_width: (a: number, b: number) => void;
  readonly layermanager_new: (a: number, b: number) => number;
  readonly layermanager_init: (a: number) => void;
  readonly layermanager_calc_layer: (a: number) => void;
  readonly layermanager_get_cell_indices: (a: number, b: number, c: number) => void;
  readonly layermanager_test: (a: number, b: number) => void;
  readonly layermanager_get_item: (a: number, b: number) => number;
  readonly layermanager_get_cell: (a: number, b: number) => number;
  readonly layermanager_to_string: (a: number, b: number) => void;
  readonly gen_hello_string: (a: number, b: number, c: number) => void;
  readonly __wbg_section_free: (a: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
