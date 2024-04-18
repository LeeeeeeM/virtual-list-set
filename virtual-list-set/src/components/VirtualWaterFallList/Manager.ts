/* eslint-disable lines-between-class-members */
/* eslint-disable max-classes-per-file */
/* eslint-disable require-jsdoc */

import { SECTION_SIZE } from "./constant";

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

export class Section {
  height: number; // 分片高度
  width: number; // 分片宽度
  x: number; // 分片的 x 坐标
  y: number; // 分片的 y 坐标
  private indexMap: Record<string, boolean>;
  private indices: number[];

  constructor({ height, width, x, y }: CellPos) {
    this.height = height;
    this.width = width;
    this.x = x;
    this.y = y;

    this.indexMap = {};
    this.indices = [];
  }

  addCellIndex(index: number): void {
    if (!this.indexMap[index]) {
      this.indexMap[index] = true;
      this.indices.push(index);
    }
  }

  getCellIndices(): number[] {
    return this.indices;
  }
}

class SectionManager {
  private sectionSize: number;
  private sections: Record<string, Section>;
  private cellList: CellPos[];

  constructor(sectionSize = SECTION_SIZE) {
    this.sectionSize = sectionSize;
    this.sections = {};
    this.cellList = [];
  }

  // 只需要用floor判断，因为同图层不会叠加，所以只需要在一个section内就表明需要渲染
  getSections({ height, width, x, y }: ContainerPos): Section[] {
    const sectionXStart = Math.floor(x / this.sectionSize);
    const sectionXStop = Math.ceil((x + width - 1) / this.sectionSize);
    const sectionYStart = Math.floor(y / this.sectionSize);
    const sectionYStop = Math.ceil((y + height - 1) / this.sectionSize);

    const sections = [];

    // 依赖收集

    for (let sectionX = sectionXStart; sectionX <= sectionXStop; sectionX++) {
      for (let sectionY = sectionYStart; sectionY <= sectionYStop; sectionY++) {
        const key = `${sectionX}.${sectionY}`;
        if (!this.sections[key]) {
          this.sections[key] = new Section({
            height: this.sectionSize,
            width: this.sectionSize,
            x: sectionX * this.sectionSize,
            y: sectionY * this.sectionSize,
          });
        }
        sections.push(this.sections[key]);
      }
    }

    return sections;
  }

  registerCell(cellInfo: CellPos, index: number): void {
    this.cellList[index] = cellInfo;
    this.getSections(cellInfo).forEach((section: Section) => {
      section.addCellIndex(index);
    });
  }

  getCell(index: number): CellPos {
    return this.cellList[index];
  }

  getCellIndices({ height, width, x, y }: ContainerPos): number[] {
    const indices: Record<string, number> = {};
    this.getSections({ height, width, x, y }).forEach((section: Section) => {
      section.getCellIndices().forEach((index) => {
        indices[index] = index;
      });
    });
    return Object.keys(indices).map((index) => indices[index]);
  }
}

class GroupManager {
  groupId: number;
  sectionSize: number;
  group: CellInfo[];
  sectionManager: SectionManager;
  totalHeight: number;
  totalWidth: number;
  cellSizeAndPositionGetter: (pos: CellInfo, index: string) => CellPos;

  constructor(
    groupId: number,
    group: CellInfo[],
    sectionSize: number,
    cellSizeAndPositionGetter: (pos: CellInfo, index: string) => CellPos
  ) {
    this.groupId = groupId;
    this.sectionSize = sectionSize;
    this.totalHeight = 0;
    this.totalWidth = 0;
    this.group = group;
    this.sectionManager = new SectionManager(this.sectionSize);
    this.cellSizeAndPositionGetter = cellSizeAndPositionGetter;
    this.updateGroup(group);
  }

  updateGroup(group: CellInfo[]): void {
    let totalHeight = 0;
    let totalWidth = 0;
    group.forEach((item: CellInfo, index: number) => {
      const cellPos = this.cellSizeAndPositionGetter(item, `${index}`);
      // 针对当前图层里每一个元素判断
      this.sectionManager.registerCell(cellPos, index);

      const { x, y, width, height } = cellPos;
      const bottom = y + height;
      const right = x + width;
      if (bottom > totalHeight) {
        totalHeight = bottom;
      }
      if (right > totalWidth) {
        totalWidth = right;
      }
    });
    this.totalHeight = totalHeight;
    this.totalWidth = totalWidth;
  }

  getCellIndices(region: CellPos): number[] {
    return this.sectionManager.getCellIndices(region);
  }

  getCell(index: number): CellPos {
    return this.sectionManager.getCell(index);
  }

  getItem(index: number): CellInfo {
    return this.group[index];
  }
}

export { SectionManager, GroupManager };
