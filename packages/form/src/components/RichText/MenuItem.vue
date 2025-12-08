<template>
  <el-tooltip 
    effect="dark" 
    :content="chineseTitle" 
    placement="top"
  >
    <button 
      class="menu-item" 
      :class="{ 'is-active': isActive && isActive() }" 
      @click.stop="action"
    >
      <i :class="`ri-${icon}`" class="menu-icon"></i>
    </button>
  </el-tooltip>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'MenuItem',
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    action: {
      type: Function,
      required: true
    },
    isActive: {
      type: Function,
      default: null
    }
  },
  setup(props) {
    const titleMap: Record<string, string> = {
      'Bold': '粗体',
      'Italic': '斜体',
      'Strike': '删除线',
      'Code': '行内代码',
      'Heading 1': '标题 1',
      'Heading 2': '标题 2',
      'Paragraph': '段落',
      'Bullet list': '无序列表',
      'Ordered list': '有序列表',
      'Code block': '代码块',
      'Blockquote': '引用块',
      'Horizontal rule': '水平分割线',
      'Undo': '撤销',
      'Redo': '重做'
    }

    const chineseTitle = computed(() => {
      return titleMap[props.title] || props.title
    })

    return {
      chineseTitle
    }
  }
})
</script>

<style scoped>
.menu-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-style: normal;
}

.menu-item:hover {
  background-color: #f0f0f0;
  border-color: #999;
}

.menu-item.is-active {
  background-color: #e0e0e0;
  border-color: #666;
}

.menu-icon {
  font-size: 16px;
  color: #333;
}
</style>