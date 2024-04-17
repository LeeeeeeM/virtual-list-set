import React, {
  FC,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { CellInfo, CellPos, GroupManager } from "./Manager";
import styles from "./index.module.less";

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

  console.log(displayItems, "xxx");

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

    console.log(groupManagers);

    groupManagers.forEach((groupManager: GroupManager, index: number) => {
      const indices = groupManager.getCellIndices({
        height,
        width,
        x: scrollLeft,
        y: scrollTop,
      });
      indices.forEach((indice: number) => {
        displayItems.push({
          groupIndex: index,
          itemIndex: indice,
          key: displayItems.length,
          ...groupManager.getItem(indice),
        });
      });
    });
    setDisplayItems(displayItems);
  }, [height, width]);

  const updateGridDimensions = useCallback(() => {
    const groupManagers = groupManagersRef.current || [];
    const totalHeight = Math.max(...groupManagers.map((it) => it.totalHeight));
    const totalWidth = Math.max(...groupManagers.map((it) => it.totalWidth));
    setTotalHeight(totalHeight);
    setTotalWidth(totalWidth);
  }, []);

  const handleCollectionChange = useCallback(() => {
    const groupManagers: GroupManager[] = [];
    const collectionGroups = collectionGroupsRef.current || [];

    collectionGroups.forEach(({ group }, index) => {
      groupManagers.push(
        new GroupManager(index, group, sectionSize, cellSizeAndPositionGetter)
      );
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
    const cellPos = groupManager.getCell(displayItem.itemIndex);
    if (!cellPos) return;
    const { width, height, x, y } = cellPos;
    return {
      transform: `translateX(${x}px) translateY(${y}px)`,
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
  const viewPortHeight = 300;
  const viewPortWidth = 400;
  const randomColor = () => `color${(Math.random() * 8) >>> 0}`;
  const line = 55;
  const columnHeight = new Array(line).fill(0);
  const collection: ItemData[] = new Array(10e3).fill("").map((_, index) => {
    const column = index % line;
    const height = 50 + 100 * Math.random();
    const result = {
      data: {
        text: `#${index}`,
        color: randomColor(),
      },
      height,
      width: 75,
      x: column * 85,
      y: columnHeight[column],
    };
    columnHeight[column] += height + 10;
    return result;
  });

  const cellSizeAndPositionGetter = useCallback((item: ItemData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, ...sizeAndPosition } = item;
    return sizeAndPosition;
  }, []);

  return (
    <VirtualWaterFallList
      height={viewPortHeight}
      width={viewPortWidth}
      sectionSize={50}
      collection={collection}
      cellSizeAndPositionGetter={cellSizeAndPositionGetter}
    />
  );
};

export default VirtualWaterFallList;
