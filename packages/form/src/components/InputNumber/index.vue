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
      <label>{{ item.data.label }}{{ suffix }}</label>
      <span v-if="item.data.required" class="item_require">*</span>
      <el-tooltip
        v-if="item.data.tip"
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
      <el-input-number
        v-model="item.data.default"
        width="240px"
        :controls-position="item.data.type == 2 ? 'right' : ''"
        :size="size"
        :precision="item.data.precision"
        :disabled="item.data.state === 'disabled' || item.data.state === 'readonly'"
        v-if="drag"
      />
      <!-- 只读展示文字 -->
      <span v-if="!drag && item.data.state === 'readonly'">{{ formatReadonlyNumber(data[item.data.fieldName], item.data.precision) }}</span>
      <el-input-number
        v-model="data[item.data.fieldName]"
        width="240px"
        v-else-if="!drag"
        :controls-position="item.data.type == 2 ? 'right' : ''"
        :disabled="item.data.state === 'disabled' || item.data.state === 'readonly'"
        :precision="item.data.precision"
        :size="size"
        @focus="execFunc('onFocus')"
        @blur="execFunc('onBlur')"
      />
    </div>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  getCurrentInstance,
  ComponentInternalInstance,
} from "vue";
import { getFormConfig } from "../../utils/fieldConfig";
import fieldProps from "../../utils/fieldProps";
import { useWatch } from "../../utils/customHooks";
export default defineComponent({
  ControlType: "InputNumber", // 必须与文件名匹配
  nameCn: "计数器",
  icon: "icon-jishuqi",
  formConfig: getFormConfig("InputNumber", [
    { fieldName: "default", component: "InputNumber" },
    { fieldName: "type", component: "Radio" },
    { fieldName: "size", component: "Radio" },
    { fieldName: "precision", component: "InputNumber" },
    { fieldName: "state", component: "Radio" },
  ]),
  props: {
    ...fieldProps,
  },
  actionType: ["onChange", "onFocus", "onBlur"],
  setup(props) {
    const vm = getCurrentInstance() as ComponentInternalInstance;
    useWatch(props);
     // 格式化只读数字显示
    const formatReadonlyNumber = (value: any, precision: number) => {
      if (value === null || value === undefined || value === '') {
        return '-';
      }
      
      // 转换为数字
      const numValue = Number(value);
      
      // 检查是否为有效数字
      if (isNaN(numValue)) {
        return String(value);
      }
      
      // 如果有精度设置，进行格式化
      if (precision !== undefined && precision !== null) {
        return numValue.toFixed(precision);
      }
      
      // 如果没有精度设置，直接返回数字
      return String(numValue);
    };
    return {
      formatReadonlyNumber,
      execFunc(type: string) {
        if (props.item.data.action && props.item.data.action[type]) {
          window.VApp.$Flex.funcExec(props.item.data.action[type], vm.proxy, [
            props.item.data.fieldName,
          ]);
        }
      },
    };
  },
});
</script>
