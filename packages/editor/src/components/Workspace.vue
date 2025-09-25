<template>
  <div class="editor_pages_center" @click="onEditorCenter" tabindex="1">
    <div
      class="canvasBox"
      ref="canvasBox"
      :class="[
        fullScreen ? 'fullScreenBox' : '',
        pageType + '_layout',
        globalDatas.csslist?.join(' '),
      ]"
      :style="`--scale:${scale} `"
    >
      <div
        class="draggable_container"
        ref="dragDom"
        @contextmenu="handleNoDraggable"
      >
        <div class="editForm" ref="editForm" v-show="pasteShow">
          <span @click="handlePaste">粘贴</span>
        </div>
        <draggable
          class="dragArea"
          animation="300"
          ghostClass="itemGhost"
          v-model="allmainList"
          @add="addControl"
          group="starfish-form"
          @choose="chooseClick"
          item-key="id"
          @update="changePos"
        >
          <template #item="{ element, index }">
            <Shape
              :active="currentId == element.id"
              :currentIndex="index"
              :currentId="element.id"
              :item="element"
              :len="allmainList.length"
            >
              <component
                :is="element.ControlType"
                :drag="true"
                :item="element"
                :data="{}"
                v-bind="globalDatas"
                size="default"
              ></component>
            </Shape>
          </template>
        </draggable>
        <div class="form-empty" v-if="allmainList.length == 0">
          从左侧拖拽来添加字段
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  ref,
  nextTick,
  computed,
  getCurrentInstance,
  inject,
} from "vue";
// import { formcomponents } from "@/pages/Editor";
// import formStore from "@/store/form";
// import store from "@/store/index";
import { paste } from "@/utils/formKeycon";
import type { Controls, AllFormItem, BaseFormConfig } from "@/type";
export default defineComponent({
  setup() {
    const { proxy } = getCurrentInstance() as any;
    const { uiControl, store, formStore } = inject<Controls>("control") || {};
    const formcomponents = proxy.$formcomponents;
    // 画布dom
    const canvasBox = ref();
    // 页面默认大小
    const canvasSize = ref(1);
    // 移动的dom
    const dragDom = ref();
    // 粘贴模块是否显示
    const pasteShow = ref(false);
    const editForm = ref();

    const globalDatas = computed(() => formStore?.get("globalDatas"));

    const fullScreen = computed(() => uiControl?.get("isFullscreen"));

    const pageType = computed(() => uiControl?.get("pageType"));

    /**
     * dynamic: true
     * 代表全局配置可以定义到组件配置中
     */
    const dynamicList = computed(() =>
      formStore?.get("globalFormList")?.filter((item: BaseFormConfig) => {
        if (item.dynamic) {
          return item;
        }
      })
    );

    const allmainList = computed({
      get() {
        return formStore?.get("allFormList");
      },
      set(value: AllFormItem[]) {
        // 确保所有项都是响应式对象
        const processedValue = value
          .map((item: AllFormItem) => {
            // 检查是否是有效的组件
            if (!item || !item.ControlType) {
              console.error("无效的组件:", item);
              return null;
            }

            // 如果组件没有初始化数据，进行初始化
            if (!item.data || !item.controlItems) {
              try {
                const clonedItem = proxy.$Flex.deepClone(item);
                const currentComponent =
                  formcomponents[item.ControlType as any];

                if (!currentComponent) {
                  console.error("未找到组件:", item.ControlType);
                  return item; // 返回原始项避免破坏
                }

                clonedItem.formConfig = currentComponent.formConfig;
                clonedItem.data = clonedItem.formConfig?.data?.() || {};

                if (!clonedItem.data.fieldName) {
                  clonedItem.data.fieldName =
                    clonedItem.ControlType + "_" + proxy.$Flex.generateMixed();
                }

                clonedItem.id = clonedItem.id || proxy.$Flex.generateMixed();

                let controlItems = (
                  clonedItem.formConfig?.morenConfig?.() || []
                ).concat(dynamicList.value || []);

                // 动作面板处理逻辑
                if (currentComponent.actionType?.length > 0) {
                  const actionControl = controlItems.find(
                    (control) => control.ControlType == "Action"
                  );
                  if (actionControl) {
                    actionControl.data.formConfig = {
                      value: {},
                      items: [],
                    };
                    currentComponent.actionType.forEach(
                      (action: string, index: number) => {
                        actionControl.data.formConfig.items.push({
                          label: action,
                          value: action,
                          id: index + 1,
                        });
                      }
                    );
                  }
                } else {
                  controlItems = controlItems.filter(
                    (control) => control.ControlType !== "Action"
                  );
                }

                clonedItem.rules = proxy.$Flex.controlFormRule(
                  controlItems,
                  clonedItem
                );
                clonedItem.controlItems = controlItems;

                return clonedItem;
              } catch (error) {
                console.error("组件初始化失败:", error, item);
                return item; // 出错时返回原始项
              }
            }

            // 如果已经有数据，确保是响应式对象
            return proxy.$Flex.deepClone(item);
          })
          .filter(Boolean); // 过滤掉null值

        console.log("处理后的value", processedValue);
        formStore?.updateAllFormList(processedValue);
      },
    });
    const currentId = computed(() => {
      return formStore?.get("currentId");
    });

    const handleCanvasScale = () => {
      // 处理页面的放大缩小
      canvasBox.value.style.transform = `scale(${canvasSize.value})`;
    };
    const handleCanvasSize = (size: string) => {
      if (proxy.$Flex.clickCountLimit()) {
        // 限制放大缩小指定范围
        if (size === "add" && canvasSize.value < 1.5) {
          canvasSize.value = Number((canvasSize.value + 0.1).toFixed(2));
        } else if (size === "cut" && canvasSize.value > 0.5) {
          canvasSize.value = Number((canvasSize.value - 0.1).toFixed(2));
        } else if (size === "restore") {
          canvasSize.value = 1;
        }
        handleCanvasScale();
      }
    };
    const chooseClick = (e: any) => {
      formStore?.setFormCurrentId(allmainList.value[e.oldIndex]?.id);
      formStore?.setFormCurrentIndex(e.oldIndex);
      store?.set("curList", allmainList.value);
    };
    const changePos = (e: any) => {
      formStore?.setFormCurrentId(allmainList.value[e.newIndex]?.id);
      formStore?.setFormCurrentIndex(e.newIndex);
      store?.set("curList", allmainList.value);
    };
    const addControl = (e: any) => {
      console.log("拖拽添加的组件:", allmainList.value[e.newIndex]);
      console.log("组件类型:", allmainList.value[e.newIndex]?.ControlType);
      console.log("是否有data:", !!allmainList.value[e.newIndex]?.data);

      formStore?.setFormCurrentId(allmainList.value[e.newIndex]?.id);
      formStore?.setFormCurrentIndex(e.newIndex);
      store?.set("curList", allmainList.value);
    };
    const handlePaste = () => {
      pasteShow.value = false;
      paste();
    };
    const handleNoDraggable = (e: any) => {
      if (pasteShow.value) {
        pasteShow.value = false;
      }
      e.preventDefault();
      const path = e.path;
      for (let i = 0; i < path.length; i++) {
        if (
          path[i].getAttribute &&
          path[i].getAttribute("class") &&
          path[i].getAttribute("class").indexOf("shape") >= 0
        ) {
          return;
        }
      }
      const x = e.offsetX;
      const y = e.offsetY;
      nextTick(() => {
        editForm.value.style.left = x + "px";
        editForm.value.style.top = y + "px";
        pasteShow.value = true;
      });
    };
    return {
      scale: computed(() => uiControl?.get<number>("scale")),
      globalDatas,
      canvasBox,
      editForm,
      handleCanvasSize,
      pageType,
      canvasSize,
      dragDom,
      chooseClick,
      addControl,
      changePos,
      allmainList,
      currentId,
      handleNoDraggable,
      handlePaste,
      pasteShow,
      fullScreen,
      onEditorCenter: (e: any) => {
        if (e && e.path && e.path[0].className == "editor_pages_center") {
          formStore?.setFormCurrentId("");
          pasteShow.value = false;
        }
      },
    };
  },
});
</script>
