<template>
  <div class="starfish-formitem" :class="{ formCover: drag, 'starfish-vertical': labelalign != 'top', [item.data.csslist?.join(' ')]: !!item.data.csslist}">
    <div class="label" :class="'label_' + labelalign" :style="{width: labelWidth + 'px'}">
      <span v-if="item.data.required && !readonly && item.data.state !== 'readonly'" class="item_require">*</span>
      <label>{{ item.data.label }}{{suffix}}</label>
      <el-tooltip v-if="item.data.tip" class="item" effect="dark" :content="item.data.tip" placement="top">
        <span class="tip iconfontui icon-tishi"></span>
      </el-tooltip>
    </div>
    <div class="control" :style="{marginLeft: labelalign != 'top'?labelWidth + 'px': ''}">
      <!-- 拖拽时的预览 -->
      <el-date-picker 
        v-model="item.data.default"
        style="width: 320px;"
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
      <!-- 只读的时候就展示文字 -->
      <span v-if="!drag && (item.data.state === 'readonly' || readonly)">{{ formatReadonlyDate(data[item.data.fieldName], item.data.format) }}</span>
      <el-date-picker 
        v-model="data[item.data.fieldName]" 
        style="width: 320px;"
        :type="getPickerType(item.data.format)" 
        :format="item.data.format" 
        :value-format="item.data.format" 
        :placeholder="item.data.placeholder" 
        v-else-if="!drag" 
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
      { fieldName: "default", component: "DateTime" },
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
       // 格式化只读日期显示
      const formatReadonlyDate = (dateValue: any, format: string) => {
        if (!dateValue) return '--';
        
        // 如果已经是格式化好的字符串，直接返回
        if (typeof dateValue === 'string') {
          return dateValue;
        }
        
        // 如果是日期对象，进行格式化
        if (dateValue instanceof Date) {
          const year = dateValue.getFullYear();
          const month = String(dateValue.getMonth() + 1).padStart(2, '0');
          const day = String(dateValue.getDate()).padStart(2, '0');
          const hours = String(dateValue.getHours()).padStart(2, '0');
          const minutes = String(dateValue.getMinutes()).padStart(2, '0');
          const seconds = String(dateValue.getSeconds()).padStart(2, '0');
          
          const formatMap: Record<string, string> = {
            'YYYY': `${year}`,
            'YYYY-MM': `${year}-${month}`,
            'YYYY-MM-DD': `${year}-${month}-${day}`,
            'YYYY-MM-DD HH': `${year}-${month}-${day} ${hours}`,
            'YYYY-MM-DD HH:mm': `${year}-${month}-${day} ${hours}:${minutes}`,
            'YYYY-MM-DD HH:mm:ss': `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
          };
          
          return formatMap[format] || `${year}-${month}-${day}`;
        }
        
        // 其他情况返回原始值
        return String(dateValue);
      };
      return {
        getPickerType,
        formatReadonlyDate
      };
    },
  });
</script>
