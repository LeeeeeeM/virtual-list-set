<template>
  <VirtualWaterFallList
    :height="VIEW_PORT_HEIGHT"
    :width="VIEW_PORT_WIDTH"
    :sectionSize="SECTION_SIZE"
    :collection="collection"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VirtualWaterFallList from "./VirtualWaterFallListWasm.vue";
import {
  VIEW_PORT_HEIGHT,
  VIEW_PORT_WIDTH,
  SECTION_SIZE,
} from "../../constant";
import { generateDatas } from "../../utils";

export default defineComponent({
  name: "VirtualWaterFallListInstance",
  components: {
    VirtualWaterFallList,
  },
  data() {
    return {
      VIEW_PORT_HEIGHT,
      VIEW_PORT_WIDTH,
      SECTION_SIZE,
      collection: generateDatas(),
    };
  },
});
</script>
