<template>
  <div class="editor__header">
    <template v-for="(item, index) in items" :key="index">
      <div v-if="item.type === 'divider'" class="divider" />
      <MenuItem v-else :icon="item.icon" :title="item.title" :action="item.action" :is-active="item.isActive" />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import MenuItem from './MenuItem.vue'

export default defineComponent({
  name: 'MenuBar',
  components: {
    MenuItem
  },
  props: {
    editor: {
      type: Object as PropType<any>,
      required: true
    }
  },
  setup(props) {
    const items = [
      {
        icon: 'bold',
        title: 'Bold',
        action: () => props.editor.chain().focus().toggleBold().run(),
        isActive: () => props.editor.isActive('bold'),
      },
      {
        icon: 'italic',
        title: 'Italic',
        action: () => props.editor.chain().focus().toggleItalic().run(),
        isActive: () => props.editor.isActive('italic'),
      },
      {
        icon: 'strikethrough',
        title: 'Strike',
        action: () => props.editor.chain().focus().toggleStrike().run(),
        isActive: () => props.editor.isActive('strike'),
      },
      {
        icon: 'code-view',
        title: 'Code',
        action: () => props.editor.chain().focus().toggleCode().run(),
        isActive: () => props.editor.isActive('code'),
      },
      {
        type: 'divider',
      },
      {
        icon: 'h-1',
        title: 'Heading 1',
        action: () => props.editor.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: () => props.editor.isActive('heading', { level: 1 }),
      },
      {
        icon: 'h-2',
        title: 'Heading 2',
        action: () => props.editor.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: () => props.editor.isActive('heading', { level: 2 }),
      },
      {
        icon: 'paragraph',
        title: 'Paragraph',
        action: () => props.editor.chain().focus().setParagraph().run(),
        isActive: () => props.editor.isActive('paragraph'),
      },
      {
        icon: 'list-unordered',
        title: 'Bullet list',
        action: () => props.editor.chain().focus().toggleBulletList().run(),
        isActive: () => props.editor.isActive('bulletList'),
      },
      {
        icon: 'list-ordered',
        title: 'Ordered list',
        action: () => props.editor.chain().focus().toggleOrderedList().run(),
        isActive: () => props.editor.isActive('orderedList'),
      },
      {
        icon: 'code-box-line',
        title: 'Code block',
        action: () => props.editor.chain().focus().toggleCodeBlock().run(),
        isActive: () => props.editor.isActive('codeBlock'),
      },
      {
        type: 'divider',
      },
      {
        icon: 'double-quotes-l',
        title: 'Blockquote',
        action: () => props.editor.chain().focus().toggleBlockquote().run(),
        isActive: () => props.editor.isActive('blockquote'),
      },
      {
        icon: 'separator',
        title: 'Horizontal rule',
        action: () => props.editor.chain().focus().setHorizontalRule().run(),
      },
      {
        type: 'divider',
      },
      {
        icon: 'arrow-go-back-line',
        title: 'Undo',
        action: () => props.editor.chain().focus().undo().run(),
      },
      {
        icon: 'arrow-go-forward-line',
        title: 'Redo',
        action: () => props.editor.chain().focus().redo().run(),
      },
    ]

    return {
      items
    }
  }
})
</script>

<style scoped>
.editor__header {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border: 1px solid #DCDFE6;
  border-bottom: none;
  background-color: #f8f9fa;
  flex-wrap: wrap;
}

.divider {
  width: 1px;
  height: 20px;
  background-color: #DCDFE6;
  margin: 0 4px;
}
</style>