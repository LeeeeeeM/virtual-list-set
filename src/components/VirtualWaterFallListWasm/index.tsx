import React, {
  FC,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  CACHE_SIZE,
  SECTION_SIZE,
  VIEW_PORT_HEIGHT,
  VIEW_PORT_WIDTH,
} from "../../constant";
import { generateDatas } from "../../utils";

import { LayerManager } from "../../pkg";

import { CellInfo, DisplayItem, ItemData } from "../../types";

import styles from "./index.module.less";

interface VirtualWaterFallList {
  height: number;
  width: number;
  collection: ItemData[];
  sectionSize: number; // 贴片越小，视窗内使用的贴片越多，收集起来的越精细，但是消耗性能。贴片越大，视窗内贴片越小，可能会有无效的元素被渲染，不过可以做缓冲区域。要结合场景使用
}

const VirtualWaterFallList: FC<VirtualWaterFallList> = ({
  height,
  width,
  collection,
  sectionSize,
}) => {
  const [displayItems, setDisplayItems] = useState<DisplayItem[]>([]);
  const [totalHeight, setTotalHeight] = useState<number>(0);
  const [totalWidth, setTotalWidth] = useState<number>(0);
  const boxRef = useRef<HTMLDivElement>(null);

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

  const layerManagerRef = useRef<LayerManager | null>(null);

  const collectionRef = useRef<CellInfo[]>([]);

  const flushDisplayItems = useCallback(() => {
    const boxElement = boxRef.current;
    const layerManager = layerManagerRef.current;
    const collection = collectionRef.current || [];
    if (!boxElement || !layerManager) return;
    const { scrollLeft, scrollTop } = boxElement;
    const displayItems: DisplayItem[] = [];

    const indices = layerManager.get_cell_indices({
      height: height + 2 * CACHE_SIZE,
      width: width + 2 * CACHE_SIZE,
      x: Math.max(0, scrollLeft - CACHE_SIZE),
      y: Math.max(0, scrollTop - CACHE_SIZE),
    });

    indices.forEach((indice: number) => {
      const item = collection[indice];
      displayItems.push({
        itemIndex: indice,
        key: indice,
        ...item,
      });
    });
    setDisplayItems(displayItems);
  }, [height, width]);

  const updateGridDimensions = useCallback(() => {
    const layerManager = layerManagerRef.current;
    if (!layerManager) return;
    const totalHeight = layerManager.total_height;
    const totalWidth = layerManager.total_width;
    setTotalHeight(totalHeight);
    setTotalWidth(totalWidth);
  }, []);

  const handleCollectionChange = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const compactCollection = collection.map(({ data, ...rest }) => rest);
    const layerManager = new LayerManager(sectionSize, compactCollection);
    layerManager.init();

    // 需要重新设置一下, 如果为null, groupManagers的引用就是[], 和ref无关, 后续会引用错误
    layerManagerRef.current = layerManager;

    updateGridDimensions();
    flushDisplayItems();
    return () => {
      layerManagerRef.current = null;
    };
  }, [sectionSize, collection]);

  useEffect(() => {
    collectionRef.current = collection;
    handleCollectionChange();
  }, [collection]);

  const getComputedStyle = useCallback((displayItem: DisplayItem) => {
    const { width, height, x, y } = displayItem;
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
  const collection = generateDatas();

  return (
    <VirtualWaterFallList
      height={VIEW_PORT_HEIGHT}
      width={VIEW_PORT_WIDTH}
      sectionSize={SECTION_SIZE}
      collection={collection}
    />
  );
};

export default VirtualWaterFallList;
