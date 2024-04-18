import React, {
  FC,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { CellInfo, CellPos, GroupManager } from "./Manager";
import {
  CACHE_SIZE,
  CELL_HEIGHT_BASE,
  CELL_INTERVAL,
  CELL_TOTAL_COUNT,
  CELL_WIDTH,
  SECTION_SIZE,
  VIEW_PORT_HEIGHT,
  VIEW_PORT_WIDTH,
  WATERFALL_CELL_COLUMN_COUNT,
} from "./constant";
import { randomNumebr, color } from "./utils";

import { LayerManager } from "vcalc-wasm";

import styles from "./index.module.less";

const searchParams = new URLSearchParams(location.search);
const jsParams = searchParams.get("useJs");
const useJs = jsParams === "true" || jsParams === "";

interface ItemData extends CellInfo {
  key?: number;
}

interface DisplayItem extends ItemData {
  groupIndex: number;
  itemIndex: number;
}

interface VirtualWaterFallList {
  height: number;
  width: number;
  collection: ItemData[];
  sectionSize: number; // 贴片越小，视窗内使用的贴片越多，收集起来的越精细，但是消耗性能。贴片越大，视窗内贴片越小，可能会有无效的元素被渲染，不过可以做缓冲区域。要结合场景使用
  cellSizeAndPositionGetter: (item: CellInfo, index: string) => CellPos;
}

const VirtualWaterFallList: FC<VirtualWaterFallList> = ({
  height,
  width,
  collection,
  sectionSize,
  cellSizeAndPositionGetter,
}) => {
  const [displayItems, setDisplayItems] = useState<DisplayItem[]>([]);
  const [totalHeight, setTotalHeight] = useState<number>(0);
  const [totalWidth, setTotalWidth] = useState<number>(0);
  const boxRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const b = collection.map(({ data, ...rest }) => rest);
  //   // console.log(b);
  //   const a = new LayerManager(sectionSize, b);
  //   a.init();
  //   window.a = a;
  //   // console.log(a);
  // }, [collection, sectionSize]);

  // console.log(displayItems, "xxx");

  const boxStyle = useMemo(
    () => ({
      height: `${height}px`,
      width: `${width}px`,
    }),
    [width, height]
  );

  const containerStyle = useMemo(
    () => ({
      height: `${totalHeight}px`,
      width: `${totalWidth}px`,
    }),
    [totalHeight, totalWidth]
  );

  const groupManagersRef = useRef<GroupManager[] | null>(null);
  const collectionGroupsRef = useRef<{ group: CellInfo[] }[]>([]);

  const flushDisplayItems = useCallback(() => {
    const boxElement = boxRef.current;
    const groupManagers = groupManagersRef.current || [];
    if (!boxElement) return;
    const { scrollLeft, scrollTop } = boxElement;
    const displayItems: DisplayItem[] = [];

    // console.log(groupManagers);

    groupManagers.forEach((groupManager: GroupManager, index: number) => {
      let indices;
      if (useJs) {
        indices = groupManager.getCellIndices({
          height: height + 2 * CACHE_SIZE,
          width: width + 2 * CACHE_SIZE,
          x: Math.max(0, scrollLeft - CACHE_SIZE),
          y: Math.max(0, scrollTop - CACHE_SIZE),
        });
      } else {
        indices = groupManager.get_cell_indices({
          height: height + 2 * CACHE_SIZE,
          width: width + 2 * CACHE_SIZE,
          x: Math.max(0, scrollLeft - CACHE_SIZE),
          y: Math.max(0, scrollTop - CACHE_SIZE),
        });

        // const result = groupManager.test({
        //   height,
        //   width,
        //   x: scrollLeft,
        //   y: scrollTop,
        // });

        // console.log(result);
      }

      // console.log(indices, height, width, scrollLeft, scrollTop);
      indices.forEach((indice: number) => {
        if (useJs) {
          // console.log(groupManager.getItem(indice));
          displayItems.push({
            groupIndex: index,
            itemIndex: indice,
            key: displayItems.length,
            ...groupManager.getItem(indice),
          });
        } else {
          const item = groupManager.get_item(indice);
          // console.log(item);
          // 从rust里取值
          const { data, height, width, x, y } = item;
          displayItems.push({
            groupIndex: index,
            itemIndex: indice,
            key: displayItems.length,
            data,
            height,
            width,
            x,
            y,
          });
        }
      });
    });
    setDisplayItems(displayItems);
  }, [height, width]);

  const updateGridDimensions = useCallback(() => {
    const groupManagers = groupManagersRef.current || [];
    const totalHeight = Math.max(
      ...groupManagers.map((it) => (useJs ? it.totalHeight : it.total_height))
    );
    const totalWidth = Math.max(
      ...groupManagers.map((it) => (useJs ? it.totalWidth : it.total_width))
    );
    setTotalHeight(totalHeight);
    setTotalWidth(totalWidth);
  }, []);

  const handleCollectionChange = useCallback(() => {
    const groupManagers: GroupManager[] = [];
    const collectionGroups = collectionGroupsRef.current || [];

    collectionGroups.forEach(({ group }, index) => {
      let ref;

      if (useJs) {
        ref = new GroupManager(
          index,
          group,
          sectionSize,
          cellSizeAndPositionGetter
        );
      } else {
        // console.log(group);
        ref = new LayerManager(sectionSize, group);
        ref.init();
      }

      groupManagers.push(ref);
    });

    // 需要重新设置一下, 如果为null, groupManagers的引用就是[], 和ref无关, 后续会引用错误
    groupManagersRef.current = groupManagers;

    updateGridDimensions();
    flushDisplayItems();
    return () => {
      groupManagersRef.current = [];
    };
  }, [sectionSize]);

  useEffect(() => {
    collectionGroupsRef.current = [{ group: collection }];
    handleCollectionChange();
  }, [collection]);

  const getComputedStyle = useCallback((displayItem: DisplayItem) => {
    const groupManagers = groupManagersRef.current || [];
    const groupManager = groupManagers[displayItem.groupIndex];
    if (!groupManager) return;
    let cellPos;
    if (useJs) {
      cellPos = groupManager.getCell(displayItem.itemIndex);
    } else {
      cellPos = groupManager.get_cell(displayItem.itemIndex);
    }

    if (!cellPos) return;
    const { width, height, x, y } = cellPos;
    return {
      transform: `translateX(${x}px) translateY(${y}px) translateZ(0)`,
      width: `${width}px`,
      height: `${height}px`,
    };
  }, []);

  const resetCollection = useCallback(() => {
    handleCollectionChange();
  }, []);

  const handleContainerResize = useCallback(() => {
    resetCollection();
  }, []);

  useEffect(() => {
    if (!boxRef.current) return;
    const boxElement = boxRef.current;
    let resizeObserver: ResizeObserver;
    if (ResizeObserver) {
      resizeObserver = new ResizeObserver(handleContainerResize);
      resizeObserver.observe(boxElement);
    } else {
      boxElement.addEventListener("resize", handleContainerResize);
    }
    return () => {
      if (ResizeObserver) {
        resizeObserver.disconnect();
      } else {
        boxElement.removeEventListener("resize", handleContainerResize);
      }
    };
  }, []);

  const handleScroll = useCallback(() => {
    flushDisplayItems();
  }, []);

  return (
    <div
      className={styles["virtual-collection"]}
      ref={boxRef}
      onScroll={handleScroll}
      style={boxStyle}
    >
      <div
        className={styles["virtual-collection-container"]}
        style={containerStyle}
      >
        {displayItems.map((item: DisplayItem) => (
          <div
            className={`${styles["cell-container"]} ${styles.card} ${
              styles[item.data.color]
            }`}
            key={item.key}
            style={getComputedStyle(item)}
          >
            {item.data.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export const VirtualWaterFallListInstance: FC = () => {
  const columnHeight = new Array(WATERFALL_CELL_COLUMN_COUNT).fill(0);
  const collection: ItemData[] = new Array(CELL_TOTAL_COUNT)
    .fill("")
    .map((_, index) => {
      const columnIndex = index % WATERFALL_CELL_COLUMN_COUNT;
      const cellHeight = randomNumebr(CELL_HEIGHT_BASE);
      const result = {
        data: {
          text: `#${index}`,
          color: color(3),
        },
        height: cellHeight,
        width: CELL_WIDTH,
        x: columnIndex * (CELL_WIDTH + CELL_INTERVAL),
        y: columnHeight[columnIndex],
      };
      columnHeight[columnIndex] += cellHeight + CELL_INTERVAL;
      return result;
    });

  const cellSizeAndPositionGetter = useCallback((item: ItemData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, ...sizeAndPosition } = item;
    return sizeAndPosition;
  }, []);

  return (
    <VirtualWaterFallList
      height={VIEW_PORT_HEIGHT}
      width={VIEW_PORT_WIDTH}
      sectionSize={SECTION_SIZE}
      collection={collection}
      cellSizeAndPositionGetter={cellSizeAndPositionGetter}
    />
  );
};

export default VirtualWaterFallList;
