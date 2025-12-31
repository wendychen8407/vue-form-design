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
          v-model:content="content"
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
    const content = ref<Delta | string | null>(null);
    const isEditorReady = ref(false);
    const currentHtml = ref<string>(""); // 保存当前显示的 HTML

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

    // 初始化内容
    const initContentFromProps = () => {
      if (!isEditorReady.value || !quillEditorRef.value) return;

      const quill = quillEditorRef.value.getQuill();
      if (!quill) return;

      const fieldName = props.item.data.fieldName;
      const rawValue = props.data[fieldName];
      const defaultValue = props.item.data.default || "";

      // 获取当前 HTML
      const currentEditorHtml = quill.root.innerHTML || "";

      // 处理空值
      if (rawValue === undefined || rawValue === null || rawValue === "") {
        if (defaultValue && currentEditorHtml !== defaultValue) {
          quill.setContents([]);
          quill.clipboard.dangerouslyPasteHTML(0, defaultValue);
          content.value = quill.getContents();
        }
        return;
      }

      // 处理字符串类型的 HTML
      if (typeof rawValue === "string" && rawValue.trim()) {
        // 处理转义字符
        const cleanHtml = rawValue.replace(/\\"/g, '"').replace(/\\'/g, "'");

        // 只有当编辑器内容与新内容不同时才更新
        if (currentEditorHtml !== cleanHtml) {
          // 如果编辑器是空的（只有<p><br></p>），直接插入
          if (currentEditorHtml === "<p><br></p>" || currentEditorHtml === "") {
            quill.clipboard.dangerouslyPasteHTML(0, cleanHtml);
          } else {
            // 否则先清空再插入
            quill.setContents([]);
            quill.clipboard.dangerouslyPasteHTML(0, cleanHtml);
          }
          content.value = quill.getContents();
        }
        return;
      }
    };

    // 处理内容变化
    const handleContentChange = (value: Delta | string) => {
      if (!quillEditorRef.value) return;

      const quill = quillEditorRef.value.getQuill();
      if (!quill) return;

      // 获取最新的 HTML
      const newHtml = quill.root.innerHTML;

      // 只有当 HTML 真正发生变化时才更新父组件
      if (newHtml !== currentHtml.value) {
        const fieldName = props.item.data.fieldName;
        props.data[fieldName] = newHtml;
        currentHtml.value = newHtml;
      }
    };

    // 监听外部数据变化（父组件更新时）
    watch(
      () => props.data[props.item.data.fieldName],
      (newValue) => {
        // 避免循环更新
        if (!isEditorReady.value || !quillEditorRef.value) return;

        const quill = quillEditorRef.value.getQuill();
        if (!quill) return;

        // 获取当前编辑器的 HTML
        const currentEditorHtml = quill.root.innerHTML || "";

        // 处理新值
        let newHtml = "";
        if (newValue === undefined || newValue === null || newValue === "") {
          newHtml = props.item.data.default || "";
        } else if (typeof newValue === "string") {
          newHtml = newValue;
        }

        // 只有值真正变化时才更新编辑器
        if (newHtml !== currentEditorHtml && newHtml !== currentHtml.value) {
          // 清空编辑器后插入新内容
          quill.setContents([]);
          if (newHtml) {
            quill.clipboard.dangerouslyPasteHTML(0, newHtml);
          }
          content.value = quill.getContents();
          currentHtml.value = newHtml;
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
      content,
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
