<template>
  <div
    class="starfish-formitem"
    :class="{
      formCover: drag,
      'starfish-vertical': labelalign != 'top',
      [item.data.csslist?.join(' ')]: !!item.data.csslist,
    }"
    :data-control-type="item.ControlType"
    :data-id="item.id"
  >
    <div
      class="label"
      :class="'label_' + labelalign"
      :style="{ width: labelWidth + 'px' }"
    >
      <span
        v-if="item.data.required && !readonly && item.data.state !== 'readonly'"
        class="item_require"
        >*</span
      >
      <label>{{ item.data.label }}{{ suffix }}</label>
      <el-tooltip
        v-if="item.data.tip && !readonly"
        class="item"
        effect="dark"
        :content="item.data.tip"
        placement="top"
      >
        <span class="tip iconfontui icon-tishi"></span>
      </el-tooltip>
    </div>
    <div
      class="control"
      :style="{ marginLeft: labelalign != 'top' ? labelWidth + 'px' : '' }"
    >
      <div class="rich-text-editor" @click.stop>
        <QuillEditor
          ref="quillEditorRef"
          theme="snow"
          v-model:content="internalContent"
          @update:content="handleContentChange"
          @ready="onEditorReady"
          :toolbar="toolbarOptions"
          :read-only="isReadonly || drag"
          class="editor-content"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, nextTick } from "vue";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { getFormConfig } from "../../utils/fieldConfig";
import fieldProps from "../../utils/fieldProps";
import { useWatch } from "../../utils/customHooks";
import type { Delta } from "@vueup/vue-quill";

export default defineComponent({
  ControlType: "RichText",
  nameCn: "富文本",
  icon: "icon-textEdit",
  formConfig: getFormConfig("RichText", [
    { fieldName: "state", component: "Radio" },
  ]),
  props: {
    ...fieldProps,
  },
  components: {
    QuillEditor,
  },
  setup(props) {
    useWatch(props);
    const quillEditorRef = ref<InstanceType<typeof QuillEditor>>();
    const internalContent = ref<string | Delta | null>(null);
    const isEditorReady = ref(false);

    const toolbarOptions = [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      ["link", "image", "formula"],
      [{ header: 1 }, { header: 2 }],
      [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ size: ["small", false, "large", "huge"] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      ["clean"],
    ];

    const isReadonly = computed(
      () => props.readonly || props.item.data.state === "readonly"
    );

    // 编辑器就绪回调
    const onEditorReady = () => {
      isEditorReady.value = true;
      initContentFromProps();
    };

    // 从 props 初始化内容（支持字符串和 Delta 对象）
    const initContentFromProps = () => {
      if (!isEditorReady.value) return;

      const fieldName = props.item.data.fieldName;
      const rawValue = props.data[fieldName];
      const defaultValue = props.item.data.default || "";

      // 处理空值
      if (rawValue === undefined || rawValue === null || rawValue === "") {
        internalContent.value = defaultValue;
        return;
      }

      // 情况1：如果是 Delta 对象（{ ops: [...] }）
      if (
        rawValue &&
        typeof rawValue === "object" &&
        Array.isArray(rawValue.ops)
      ) {
        internalContent.value = rawValue;
        return;
      }

      // 情况2：如果是字符串
      if (typeof rawValue === "string") {
        // 尝试解析是否为 JSON 字符串的 Delta
        if (rawValue.trim().startsWith("{") || rawValue.trim().startsWith("[")) {
          try {
            const parsed = JSON.parse(rawValue);
            if (parsed && Array.isArray(parsed.ops)) {
              internalContent.value = parsed;
            } else {
              // 不是 Delta JSON，当作普通 HTML 字符串
              internalContent.value = rawValue;
            }
          } catch {
            // 解析失败，当作普通 HTML 字符串
            internalContent.value = rawValue;
          }
        } else {
          // 普通字符串
          internalContent.value = rawValue;
        }
        return;
      }

      // 情况3：其他类型，使用默认值
      internalContent.value = defaultValue;
    };

    // 处理内容变化
    const handleContentChange = (value: string | Delta) => {
      internalContent.value = value;

      if (!quillEditorRef.value) return;

      const quill = quillEditorRef.value.getQuill();
      if (!quill) return;

      const fieldName = props.item.data.fieldName;
      const htmlContent = quill.root.innerHTML;
      props.data[fieldName] = htmlContent;
    };

    // 监听外部数据变化（父组件更新时）
    watch(
      () => props.data[props.item.data.fieldName],
      (newValue) => {
        // 避免循环更新
        if (!isEditorReady.value) return;

        // 转换为内部表示
        let newInternalValue: string | Delta | null = null;

        if (newValue === undefined || newValue === null || newValue === "") {
          newInternalValue = props.item.data.default || "";
        } else if (
          newValue &&
          typeof newValue === "object" &&
          Array.isArray(newValue.ops)
        ) {
          // Delta 对象
          newInternalValue = newValue;
        } else if (typeof newValue === "string") {
          // 字符串（可能是 HTML 或 JSON 字符串）
          if (newValue.trim().startsWith("{") || newValue.trim().startsWith("[")) {
            try {
              const parsed = JSON.parse(newValue);
              if (parsed && Array.isArray(parsed.ops)) {
                newInternalValue = parsed;
              } else {
                newInternalValue = newValue;
              }
            } catch {
              newInternalValue = newValue;
            }
          } else {
            newInternalValue = newValue;
          }
        }
        // 只有值真正变化时才更新
        if (JSON.stringify(newInternalValue) !== JSON.stringify(internalContent.value)) {
          internalContent.value = newInternalValue;
        }
      },
      { immediate: true }
    );

    // 监听编辑器就绪状态
    watch(isEditorReady, (ready) => {
      if (ready) {
        nextTick(() => {
          initContentFromProps();
        });
      }
    });

    return {
      content: internalContent,
      quillEditorRef,
      handleContentChange,
      onEditorReady,
      toolbarOptions,
      isReadonly,
    };
  },
});
</script>

<style lang="scss" scoped>
.rich-text-editor {
  min-height: 200px;
  position: relative;
  z-index: 1;
}

:deep(.editor-content) {
  min-height: 200px;

  .ql-toolbar {
    z-index: 100;
    background: white;
    border: 1px solid #ccc;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    position: relative;
  }

  .ql-container {
    border: 1px solid #ccc;
    border-top: none;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    min-height: 200px;
    z-index: 99;
  }
}

:deep(.shape) {
  .rich-text-editor {
    pointer-events: auto !important;
  }
}
</style>