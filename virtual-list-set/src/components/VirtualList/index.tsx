import React, {
  FC,
  useRef,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import cns from "classnames";
import styles from "./index.module.less";

interface Data {
  value: number;
  index: number;
}

interface VirtualListProps {
  data: Data[];
  dynamicHeight: (v: Data, index: number) => number;
  estimatedItemSize?: number;
}

interface Measure {
  offset: number;
  size: number;
}

const VirtualList: FC<VirtualListProps> = ({
  data,
  dynamicHeight,
  estimatedItemSize = 30,
}) => {
  const [visibleData, setVisibleData] = useState<Data[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sizeAndOffsetCacheRef = useRef<Record<string, Measure>>({});
  const lastMeasuredIndexRef = useRef<number>(-1);

  const getItemSizeAndOffset = useCallback(
    (index: number) => {
      const sizeAndOffsetCache = sizeAndOffsetCacheRef.current;
      const lastMeasuredIndex = lastMeasuredIndexRef.current;

      if (lastMeasuredIndex >= index) {
        return sizeAndOffsetCache[index];
      }

      let offset = 0;
      if (lastMeasuredIndex >= 0) {
        const lastMeasure = sizeAndOffsetCache[lastMeasuredIndex];
        if (lastMeasure) {
          offset = lastMeasure.offset + lastMeasure.size;
        }
      }

      for (let i = lastMeasuredIndex + 1; i <= index; i++) {
        const item = data[i];
        const size = dynamicHeight(item, i);
        sizeAndOffsetCache[i] = {
          size,
          offset,
        };

        offset += size;
      }

      if (index > lastMeasuredIndex) {
        lastMeasuredIndexRef.current = index;
      }

      return sizeAndOffsetCache[index];
    },
    [dynamicHeight, data]
  );

  const findNearestItemIndex = useCallback(
    (scrollTop: number) => {
      let total = 0;
      for (let i = 0, j = data.length; i < j; i++) {
        const size = getItemSizeAndOffset(i).size;
        total += size;
        if (total >= scrollTop || i === j - 1) {
          return i;
        }
      }

      return 0;
    },
    [getItemSizeAndOffset, data]
  );

  const getLastMeasuredSizeAndOffset = useCallback(() => {
    const sizeAndOffsetCache = sizeAndOffsetCacheRef.current;
    const lastMeasuredIndex = lastMeasuredIndexRef.current;
    return lastMeasuredIndex > 0
      ? sizeAndOffsetCache[lastMeasuredIndex]
      : { offset: 0, size: 0 };
  }, []);

  const updateVisibleData = (scrollTop: number, clientHeight: number) => {
    const start = findNearestItemIndex(scrollTop);
    const end = findNearestItemIndex(scrollTop + clientHeight);
    setVisibleData(data.slice(start, Math.min(end + 1, data.length)));
    if (contentRef.current) {
      const contentElement = contentRef.current;
      contentElement.style.transform = `translate3d(0, ${
        getItemSizeAndOffset(start).offset
      }px, 0)`;
    }
  };

  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop = 0, clientHeight } = listRef.current;
    // 增加1000px的缓冲区
    updateVisibleData(Math.max(0, scrollTop - 300), clientHeight + 700);
  };

  const contentHeight = useMemo(() => {
    const lastMeasuredIndex = lastMeasuredIndexRef.current;
    const itemCount = data.length;
    if (lastMeasuredIndex >= 0) {
      const lastMeasuredSizeAndOffset = getLastMeasuredSizeAndOffset();
      return (
        lastMeasuredSizeAndOffset.offset +
        lastMeasuredSizeAndOffset.size +
        (itemCount - 1 - lastMeasuredIndex) * estimatedItemSize
      );
    }
    return itemCount * estimatedItemSize;
  }, [data, estimatedItemSize, getLastMeasuredSizeAndOffset]);

  useEffect(() => {
    if (!listRef.current) return;
    const { scrollTop = 0, clientHeight } = listRef.current;
    updateVisibleData(scrollTop, clientHeight);
  }, []);

  return (
    <>
      <div
        ref={listRef}
        className={styles["list-view"]}
        onScroll={handleScroll}
      >
        <div
          className={styles["list-view-phantom"]}
          style={{
            height: contentHeight,
          }}
        />
        <div ref={contentRef} className={styles["list-view-content"]}>
          {visibleData.map((item, index) => (
            <div
              className={cns(
                styles["list-view-item"],
                styles[`class-${item.index % 4}`]
              )}
              key={index}
              style={{
                height: `${getItemSizeAndOffset(item.index).size}px`,
              }}
            >
              {item.value}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export const VirtualListInstance: FC = () => {
  const data = new Array(10e5).fill("").map((_, index) => ({
    value: index,
    index,
  }));

  const dynamicCalcHeight = useCallback((_: Data, index: number) => {
    const mod = index % 4;
    let height = 0;
    switch (mod) {
      case 0:
        height = 25;
        break;
      case 1:
        height = 35;
        break;
      case 2:
        height = 50;
        break;
      case 3:
        height = 80;
        break;
    }
    return height;
  }, []);

  // return <div className={styles.wrapper}>{explainInfo}</div>;
  return <VirtualList data={data} dynamicHeight={dynamicCalcHeight} />;
};

export default VirtualList;
