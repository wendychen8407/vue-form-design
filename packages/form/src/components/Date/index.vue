<template>
  <div
    class="starfish-formitem"
    :class="{
      formCover: drag,
      'starfish-vertical': labelalign != 'top',
      [item.data.csslist?.join(' ')]: !!item.data.csslist,
    }"
  >
    <div
      class="label"
      :class="'label_' + labelalign"
      :style="{ width: labelWidth + 'px' }"
    >
      <span
        v-if="
          item.data.required &&
          !readonly &&
          item.data.state !== 'readonly' &&
          !search
        "
        class="item_require"
        >*</span
      >
      <el-tooltip :disabled="item.data.label.length <= 6" :content="item.data.label + suffix" placement="top">
        <label>{{ item.data.label}}{{ suffix }}</label>
      </el-tooltip>
      <el-tooltip
        v-if="item.data.tip && !readonly && !search"
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
      <!-- 拖拽时的预览 -->
      <el-date-picker
        v-model="previewValue"
        style="width: 320px"
        :type="getPickerType(item.data.format)"
        :format="item.data.format"
        :value-format="item.data.format"
        :placeholder="item.data.placeholder"
        v-if="drag"
        :size="size"
        :disabled="item.data.state === 'disabled'"
        :readonly="item.data.state === 'readonly'"
        @change="handlePreviewChange"
      ></el-date-picker>

      <!-- 实际运行时的组件 -->
      <!-- 只读的时候就展示文字 -->
      <span v-if="!drag && (item.data.state === 'readonly' || readonly)">{{
        formatReadonlyDate(data[item.data.fieldName], item.data.format)
      }}</span>
      <el-date-picker
        v-model="data[item.data.fieldName]"
        style="width: 320px"
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
import { defineComponent, ref, watch, onMounted } from "vue";
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
    { 
      fieldName: "format", 
      component: "Selected"
    },
    { fieldName: "state", component: "Radio" },
  ]),
  actionType: ["onChange"],
  props: {
    ...fieldProps,
  },
  setup(props) {
    useWatch(props);
    
    // 预览值，用于处理日期对象到字符串的转换
    const previewValue = ref('');
    
    // 根据格式获取对应的日期选择器类型
    const getPickerType = (format: string) => {
      if (!format) return "date"; // 默认类型

      const formatTypeMap: Record<string, string> = {
        YYYY: "year",
        "YYYY-MM": "month",
        "YYYY-MM-DD": "date",
        "YYYY-MM-DD HH": "datetime",
        "YYYY-MM-DD HH:mm": "datetime",
        "YYYY-MM-DD HH:mm:ss": "datetime",
      };
      return formatTypeMap[format] || "date";
    };
    
    // 格式化日期显示
    const formatReadonlyDate = (dateValue: any, format: string) => {
      if (!dateValue) return "--";

      // 如果已经是格式化好的字符串，直接返回
      if (typeof dateValue === "string") {
        return dateValue;
      }

      // 如果是日期对象，进行格式化
      if (dateValue instanceof Date) {
        return formatDateToString(dateValue, format);
      }

      // 其他情况返回原始值
      return String(dateValue);
    };
    
    // 将Date对象转换为指定格式的字符串
    const formatDateToString = (date: Date, format: string) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      const formatMap: Record<string, string> = {
        YYYY: `${year}`,
        "YYYY-MM": `${year}-${month}`,
        "YYYY-MM-DD": `${year}-${month}-${day}`,
        "YYYY-MM-DD HH": `${year}-${month}-${day} ${hours}`,
        "YYYY-MM-DD HH:mm": `${year}-${month}-${day} ${hours}:${minutes}`,
        "YYYY-MM-DD HH:mm:ss": `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`,
      };

      return formatMap[format] || `${year}-${month}-${day}`;
    };
    
    // 处理预览值变化
    const handlePreviewChange = (val: string) => {
      props.item.data.default = val;
    };
    
    // 更新预览值
    const updatePreviewValue = () => {
      if (props.drag && props.item.data.default) {
        if (props.item.data.default instanceof Date) {
          previewValue.value = formatDateToString(props.item.data.default, props.item.data.format || 'YYYY-MM-DD');
        } else {
          previewValue.value = props.item.data.default;
        }
      } else {
        previewValue.value = '';
      }
    };
    
    // 监听默认值变化
    watch(
      () => props.item.data.default,
      () => {
        updatePreviewValue();
      },
      { deep: true }
    );
    
    // 监听格式变化
    watch(
      () => props.item.data.format,
      () => {
        updatePreviewValue();
      }
    );
    
    // 组件挂载时初始化预览值
    onMounted(() => {
      updatePreviewValue();
    });
    
    return {
      previewValue,
      getPickerType,
      formatReadonlyDate,
      handlePreviewChange,
    };
  },
});
</script>