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
      <div class="rich-text-editor" @click.stop>
        <QuillEditor 
          ref="quillEditorRef"
          theme="snow" 
          :content="content" 
          @update:content="handleContentChange"
          toolbar="full" 
          :read-only="isReadonly" 
          class="editor-content" 
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import { getFormConfig } from "../../utils/fieldConfig";
import fieldProps from "../../utils/fieldProps";
import { useWatch } from "../../utils/customHooks";

export default defineComponent({
  ControlType: "RichText",
  nameCn: "富文本",
  icon: "icon-textEdit",
  formConfig: getFormConfig("RichText", [{ fieldName: "state", component: "Radio" }]),
  props: {
    ...fieldProps,
  },
  components: {
    QuillEditor
  },
  setup(props) {
    useWatch(props);
    const quillEditorRef = ref();
    const content = ref(props.data[props.item.data.fieldName] || props.item.data.default || '');
    
    // 计算只读状态
    const isReadonly = computed(() => 
      props.readonly || props.item.data.state === 'readonly'
    );
    
    // 处理内容变化
    const handleContentChange = (value: string) => {
      content.value = value;
      // 更新父组件数据
      props.data[props.item.data.fieldName] = value;
    };
    
    // 监听外部数据变化
    watch(() => props.data[props.item.data.fieldName], (newValue) => {
      if (newValue !== content.value) {
        content.value = newValue || '';
      }
    });
    
    return {
      content,
      quillEditorRef,
      handleContentChange,
      isReadonly
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

// 确保编辑器层级
:deep(.editor-content) {
  min-height: 200px;
  
  // 确保工具栏正常显示
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

// 防止拖拽区域覆盖编辑器
:deep(.shape) {
  .rich-text-editor {
    pointer-events: auto !important;
  }
}
</style>