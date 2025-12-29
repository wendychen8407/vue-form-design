<template>
  <div class="starfish-formitem" :class="{ formCover: drag, 'starfish-vertical': labelalign != 'top', [item.data.csslist?.join(' ')]: !!item.data.csslist}">
    <div class="label" :class="'label_' + labelalign" :style="{width: labelWidth + 'px'}">
      <span v-if="item.data.required && !readonly && item.data.state !== 'readonly' && !search" class="item_require">*</span>
      <label>{{ item.data.label }}{{suffix}}</label>
      <el-tooltip v-if="item.data.tip && !readonly && !search" class="item" effect="dark" :content="item.data.tip" placement="top">
        <span class="tip iconfontui icon-tishi"></span>
      </el-tooltip>
    </div>
    <div class="control" :style="{marginLeft: labelalign != 'top'?labelWidth + 'px': ''}">
      <!-- 只读的时候就只展示文本 -->
      <span v-if="!drag && (item.data.state === 'readonly' || readonly)">
        {{ getDisplayText() }}
      </span>
      <el-checkbox-group v-model="data[item.data.fieldName]" :class="{'vertical-group': item.data.arrangeMent === 'vertical'}" v-else-if="!drag && data[item.data.fieldName]" :size="size" :disabled="item.data.state === 'disabled' || item.data.state === 'readonly'">
        <el-checkbox v-for="(sitem, sindex) in item.data.itemConfig.items" :key="sindex" :label="sitem.value" :value="sitem.value">{{ sitem.label }}</el-checkbox>
      </el-checkbox-group>
      <el-checkbox-group v-model="item.data.itemConfig.value" :class="{'vertical-group': item.data.arrangeMent === 'vertical'}" v-if="drag" :size="size" :disabled="item.data.state === 'disabled' || item.data.state === 'readonly'">
        <el-checkbox v-for="(sitem, sindex) in item.data.itemConfig.items" :key="sindex" :label="sitem.value" :value="sitem.value">{{ sitem.label }}</el-checkbox>
      </el-checkbox-group>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent } from "vue";
  import { getFormConfig } from "../../utils/fieldConfig";
  import fieldProps from "../../utils/fieldProps";
  import { useWatch } from "../../utils/customHooks";
  
  export default defineComponent({
    ControlType: "CheckBox", // 必须与文件名匹配
    nameCn: "复选框",
    icon: "icon-fuxuankuang_xuanzhong",
    formConfig: getFormConfig("CheckBox", [
      { fieldName: "itemConfig", component: "KeyValueConfigMult" }, 
      { fieldName: "arrangeMent", component: "Radio" },
      { fieldName: "state", component: "Radio" },
    ]),
    props: {
      ...fieldProps,
    },
    actionType: ["onChange"],
    setup(props) {
      useWatch(props);
    },
    methods: {
      getDisplayText() {
        const fieldValue = this.data[this.item.data.fieldName];
        const items = this.item.data.itemConfig?.items || [];
        
        // 如果没有值，显示默认的 "--"
        if (!fieldValue && fieldValue !== 0 && fieldValue !== false) {
          return '--';
        }
        
        // 如果是数组（多选）
        if (Array.isArray(fieldValue)) {
          if (fieldValue.length === 0) return '--';
          
          // 根据选中的 value 查找对应的 label
          const selectedLabels = fieldValue.map(value => {
            const item = items.find(item => item.value === value);
            return item ? item.label : value;
          });
          
          return selectedLabels.join(', ');
        } 
        // 如果是单个值（单选模式）
        else {
          const item = items.find(item => item.value === fieldValue);
          return item ? item.label : fieldValue;
        }
      }
    }
  });
</script>