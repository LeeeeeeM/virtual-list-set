import {
  CELL_HEIGHT_BASE,
  CELL_INTERVAL,
  CELL_TOTAL_COUNT,
  CELL_WIDTH,
  WATERFALL_CELL_COLUMN_COUNT,
} from "./constant";
import { ItemData } from "./types";

export const randomColor = () => `color${(Math.random() * 8) >>> 0}`;
export const randomNumebr = (base: number) => base + base * Math.random();

export const color = (n: number) => `color${n % 8}`;

export const generateDatas = (): ItemData[] => {
  const columnHeight = new Array(WATERFALL_CELL_COLUMN_COUNT).fill(0);
  const collection: ItemData[] = new Array(CELL_TOTAL_COUNT)
    .fill("")
    .map((_, index) => {
      const columnIndex = index % WATERFALL_CELL_COLUMN_COUNT;
      const cellHeight = randomNumebr(CELL_HEIGHT_BASE);
      const result = {
        data: {
          text: `${index % 9}`,
          color: randomColor(),
        },
        height: cellHeight,
        width: CELL_WIDTH,
        x: columnIndex * (CELL_WIDTH + CELL_INTERVAL),
        y: columnHeight[columnIndex],
      };
      columnHeight[columnIndex] += cellHeight + CELL_INTERVAL;
      return result;
    });

  return collection;
};
