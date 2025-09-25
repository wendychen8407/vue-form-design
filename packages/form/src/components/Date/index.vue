<template>
  <div class="starfish-formitem" :class="{ formCover: drag, 'starfish-vertical': labelalign != 'top', [item.data.csslist?.join(' ')]: !!item.data.csslist}">
    <div class="label" :class="'label_' + labelalign" :style="{width: labelWidth + 'px'}">
      <label>{{ item.data.label }}{{suffix}}</label>
      <span v-if="item.data.required" class="item_require">*</span>
      <el-tooltip v-if="item.data.tip" class="item" effect="dark" :content="item.data.tip" placement="top">
        <span class="tip iconfontui icon-tishi"></span>
      </el-tooltip>
    </div>
    <div class="control" :style="{marginLeft: labelalign != 'top'?labelWidth + 'px': ''}">
      <!-- 拖拽时的预览 -->
      <el-date-picker 
        v-model="item.data.default" 
        width="240px"
        :type="getPickerType(item.data.format)" 
        :format="item.data.format" 
        :value-format="item.data.format" 
        :placeholder="item.data.placeholder" 
        v-if="drag" 
        :size="size" 
        :disabled="item.data.state === 'disabled'" 
        :readonly="item.data.state === 'readonly'"
      ></el-date-picker>
      
      <!-- 实际运行时的组件 -->
      <el-date-picker 
        v-model="data[item.data.fieldName]" 
        width="240px"
        :type="getPickerType(item.data.format)" 
        :format="item.data.format" 
        :value-format="item.data.format" 
        :placeholder="item.data.placeholder" 
        v-if="!drag" 
        :size="size" 
        :disabled="item.data.state === 'disabled'" 
        :readonly="item.data.state === 'readonly'"
      ></el-date-picker>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, computed } from "vue";
  import { getFormConfig } from "../../utils/fieldConfig";
  import fieldProps from "../../utils/fieldProps";
  import { useWatch } from "../../utils/customHooks";
  export default defineComponent({
    ControlType: "Date", // 必须与文件名匹配
    nameCn: "日期",
    icon: "icon-24gl-calendar",
    formConfig: getFormConfig("Date", [
      { fieldName: "default", component: "Date" },
      { fieldName: "placeholder", component: "Text" },
      { fieldName: "format", component: "Selected" },
      { fieldName: "state", component: "Radio" },
    ]),
    actionType: ["onChange"],
    props: {
      ...fieldProps,
    },
    setup(props) {
      useWatch(props);
      // 根据格式获取对应的日期选择器类型
      const getPickerType = (format: string) => {
        if (!format) return 'date'; // 默认类型
        
        const formatTypeMap: Record<string, string> = {
          'YYYY': 'year',
          'YYYY-MM': 'month',
          'YYYY-MM-DD': 'date',
          'YYYY-MM-DD HH': 'datetime',
          'YYYY-MM-DD HH:mm': 'datetime',
          'YYYY-MM-DD HH:mm:ss': 'datetime'
        };
        
        return formatTypeMap[format] || 'date';
      };
      return {
        getPickerType
      };
    },
  });
</script>
