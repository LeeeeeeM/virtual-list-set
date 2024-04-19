<template>
  <div
    class="virtual-collection"
    ref="boxRef"
    @scroll="handleScroll"
    :style="boxStyle"
  >
    <div class="virtual-collection-container" :style="containerStyle">
      <div
        v-for="item in displayItems"
        :key="item.key"
        :class="`cell-container card ${item.data.color}`"
        :style="getComputedStyle(item)"
      >
        {{ item.data.text }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted, computed } from "vue";
import { CellInfo } from "../../../../src/types";
import { CACHE_SIZE } from "../../constant";
import { GroupManager } from "./Manager";

interface DisplayItem {
  itemIndex: number;
  key: number;
  width: number;
  height: number;
  x: number;
  y: number;
  data: ItemData;
}

interface ItemData {
  text: string;
  color: string;
}

export default defineComponent({
  name: "VirtualWaterFallList",
  props: {
    height: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    collection: {
      type: Array as () => ItemData[],
      required: true,
    },
    sectionSize: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const displayItems = ref<DisplayItem[]>([]);
    const totalHeight = ref(0);
    const totalWidth = ref(0);
    const boxRef = ref<HTMLDivElement | null>(null);
    const collectionRef = ref<ItemData[]>([]);

    const boxStyle = computed(() => ({
      height: `${props.height}px`,
      width: `${props.width}px`,
    }));

    const containerStyle = computed(() => ({
      height: `${totalHeight.value}px`,
      width: `${totalWidth.value}px`,
    }));

    const handleCollectionChange = () => {
      const cellSizeAndPositionGetter = (item: CellInfo) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { data, ...sizeAndPosition } = item;
        return sizeAndPosition;
      };
      const groupManager = new GroupManager(
        props.collection,
        props.sectionSize,
        cellSizeAndPositionGetter
      );

      groupManagerRef.value = groupManager;

      collectionRef.value = props.collection;

      updateGridDimensions();
      flushDisplayItems();

      return () => {
        groupManagerRef.value = null;
      };
    };

    const flushDisplayItems = () => {
      const boxElement = boxRef.value;
      const groupManager = groupManagerRef.value;
      const collection = collectionRef.value || [];
      if (!boxElement || !groupManager) return;
      const { scrollLeft, scrollTop } = boxElement;
      const displayItemsList: DisplayItem[] = [];

      const indices = groupManager.getCellIndices({
        height: props.height + 2 * CACHE_SIZE,
        width: props.width + 2 * CACHE_SIZE,
        x: Math.max(0, scrollLeft - CACHE_SIZE),
        y: Math.max(0, scrollTop - CACHE_SIZE),
      });

      indices.forEach((index: number) => {
        const item = collection[index];
        displayItemsList.push({
          itemIndex: index,
          key: index,
          ...item,
        });
      });

      displayItems.value = displayItemsList;
    };

    const getComputedStyle = (displayItem: DisplayItem) => {
      const { width, height, x, y } = displayItem;
      return {
        transform: `translateX(${x}px) translateY(${y}px) translateZ(0)`,
        width: `${width}px`,
        height: `${height}px`,
      };
    };

    const updateGridDimensions = () => {
      const groupManager = groupManagerRef.value;
      if (!groupManager) return;
      totalHeight.value = groupManager.totalHeight;
      totalWidth.value = groupManager.totalWidth;
    };

    const handleScroll = () => {
      flushDisplayItems();
    };

    const groupManagerRef = ref<GroupManager | null>(null);

    onMounted(() => {
      collectionRef.value = props.collection;
      handleCollectionChange();
    });

    onUnmounted(() => {
      groupManagerRef.value = null;
    });

    return {
      displayItems,
      totalHeight,
      totalWidth,
      boxRef,
      boxStyle,
      containerStyle,
      handleScroll,
      getComputedStyle,
    };
  },
});
</script>

<style scoped less>
.virtual-collection {
  overflow: scroll;
  -webkit-overflow-scrolling: touch;
}

.virtual-collection-container {
  position: relative;
}

.virtual-collection .cell-container {
  position: absolute;
  top: 0;
  left: 0;
}

.card {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #fff;
  line-height: 100%;
  background-color: #aaa;
  border-radius: 5px;
  padding: 0;

  &.color0 {
    background-color: rgb(244, 67, 54);
  }

  &.color1 {
    background-color: rgb(255, 235, 59);
  }

  &.color2 {
    background-color: rgb(255, 152, 0);
  }

  &.color3 {
    background-color: rgb(33, 150, 243);
  }

  &.color4 {
    background-color: rgb(55, 64, 70);
  }

  &.color5 {
    background-color: rgb(103, 58, 183);
  }

  &.color6 {
    background-color: rgb(63, 81, 181);
  }

  &.color7 {
    background-color: rgb(76, 175, 80);
  }
}
</style>
