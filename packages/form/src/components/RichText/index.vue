<template>
  <div class="starfish-formitem" 
    :class="{ formCover: drag, 'starfish-vertical': labelalign != 'top', [item.data.csslist?.join(' ')]: !!item.data.csslist}" 
    :data-control-type="item.ControlType"
    :data-id="item.id"
    >
    <div class="label" :class="'label_' + labelalign" :style="{width: labelWidth + 'px'}">
      <span v-if="item.data.required && !readonly && item.data.state !== 'readonly'" class="item_require">*</span>
      <label>{{ item.data.label }}{{suffix}}</label>
      <el-tooltip v-if="item.data.tip" class="item" effect="dark" :content="item.data.tip" placement="top">
        <span class="tip iconfontui icon-tishi"></span>
      </el-tooltip>
    </div>
    <div class="control" :style="{marginLeft: labelalign != 'top'?labelWidth + 'px': ''}">
      <div class="rich-text-editor">
        <!-- 使用 MenuBar 组件 -->
        <MenuBar v-if="editor && !readonly" :editor="editor" />
        <editor-content :editor="editor" class="editor-content" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, onUnmounted, watch } from "vue";
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Code from '@tiptap/extension-code'
import Blockquote from '@tiptap/extension-blockquote'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import CodeBlock from '@tiptap/extension-code-block'
import { getFormConfig } from "../../utils/fieldConfig";
import fieldProps from "../../utils/fieldProps";
import { useWatch } from "../../utils/customHooks";
import MenuBar from "./MenuBar.vue"; // 导入 MenuBar 组件

export default defineComponent({
  ControlType: "RichText",
  nameCn: "富文本",
  icon: "icon-textEdit",
  formConfig: getFormConfig("RichText", [{ fieldName: "state", component: "Radio" }]),
  props: {
    ...fieldProps,
  },
  components: {
    EditorContent,
    MenuBar
  },
  setup(props) {
    const editor = useEditor({
      content: props.data[props.item.data.fieldName] || props.item.data.defaultValue || '',
      extensions: [
        StarterKit.configure({
          codeBlock: {
            HTMLAttributes: {
              class: 'code-block',
            },
          },
        }),
        Code.configure({
          HTMLAttributes: {
            class: 'inline-code',
          },
        }),
        CodeBlock.configure({
          HTMLAttributes: {
            class: 'code-block',
          },
        }),
        Blockquote.configure({
          HTMLAttributes: {
            class: 'blockquote',
          },
        }),
        HorizontalRule,
      ],
      editable: !props.readonly,
      editorProps: {
        attributes: {
          class: 'prose focus:outline-none max-w-none',
          style: 'min-height: 200px; border: 1px solid #DCDFE6; padding: 8px 12px; background-color: #fff;'
        }
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        props.data[props.item.data.fieldName] = html;
      },
      onBlur: ({ editor }) => {
        const html = editor.getHTML();
        props.data[props.item.data.fieldName] = html;
      }
    })
    useWatch(props);

    // 监听只读状态变化
    watch(() => props.readonly, (newVal) => {
      if (editor.value) {
        editor.value.setEditable(!newVal);
      }
    });

    onUnmounted(() => {
      if (editor.value) {
        editor.value.destroy();
      }
    });

    return {
      editor
    };
  },
});
</script>

<style scoped>
.rich-text-editor {
  min-height: 200px;
}

:deep(.editor-content) {
  min-height: 200px;
}

:deep(.ProseMirror) {
  min-height: 180px;
  outline: none;
  padding: 12px;
}

:deep(.ProseMirror p.is-editor-empty:first-child::before) {
  color: #adb5bd;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

/* 行内代码样式 */
:deep(.ProseMirror .inline-code) {
  background-color: #f3f4f6;
  color: #e53e3e;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875em;
  border: 1px solid #e5e7eb;
}

/* 代码块样式 */
:deep(.ProseMirror .code-block) {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  margin: 12px 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.875em;
  line-height: 1.5;
  position: relative;
  border: 1px solid #374151;
}


/* 引用块样式 */
:deep(.ProseMirror blockquote) {
  border-left: 4px solid #3b82f6;
  background-color: #f8fafc;
  padding: 12px 16px;
  margin: 12px 0;
  border-radius: 0 8px 8px 0;
  font-style: italic;
  color: #4b5563;
}

/* 水平分割线样式 */
:deep(.ProseMirror hr) {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 24px 0;
}

/* 列表样式 */
:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  padding-left: 24px;
  margin: 12px 0;
}

:deep(.ProseMirror li) {
  margin: 4px 0;
}

/* 标题样式 */
:deep(.ProseMirror h1) {
  font-size: 1.875em;
  font-weight: bold;
  margin: 24px 0 16px 0;
  color: #111827;
}

:deep(.ProseMirror h2) {
  font-size: 1.5em;
  font-weight: bold;
  margin: 20px 0 12px 0;
  color: #111827;
}
</style>