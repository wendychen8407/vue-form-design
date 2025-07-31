<template>
  <el-dialog
    v-model="isshow"
    :custom-class="['MyDialogBody', dialogclass, { fullscreen: isFullScreen }]"
    :width="newWidth"
    :append-to-body="true"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @close="close"
  >
    <template #title>
      <div class="my-pageHeader">
        <div class="my-icon">
          <em class="iconfontui" :class="icon"></em>
        </div>
        <div class="my-title">{{ title }}</div>
      </div>
    </template>
    <slot></slot>
  </el-dialog>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from "vue";

export default defineComponent({
  props: {
    dialogclass: String,
    showDialog: Boolean,
    width: Number,
  },
  emits: ["open", "close"],
  setup(props, { emit }) {
    const isshow = ref<boolean>(false);
    const title = ref<string>("");
    const icon = ref<string>("");
    const isFullScreen = ref<boolean>(false);
    const newWidth = computed(() => {
      if (typeof props.width == "number") {
        return props.width + "px";
      } else {
        return props.width || "50%";
      }
    });
    return {
      isshow,
      title,
      icon,
      isFullScreen,
      newWidth,
      init(titles: string, icons: string) {
        title.value = titles;
        icon.value = icons;
      },
      show() {
        isshow.value = true;
        emit("open");
      },
      close() {
        isshow.value = false;
        emit("close");
      },
    };
  },
});
</script>

<style scoped>
.MyDialogBody {
  position: relative;
}
.fullscreen {
  width: 100% !important;
  height: 100% !important;
  margin: 0;
  padding: 0;
}
</style>
