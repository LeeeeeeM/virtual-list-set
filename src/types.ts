export interface CellInfo extends CellPos {
  data: { text: string; color: string };
}

export interface ContainerPos {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CellPos {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ItemData extends CellInfo {
  key?: number;
}

export interface DisplayItem extends ItemData {
  groupIndex: number;
  itemIndex: number;
}
