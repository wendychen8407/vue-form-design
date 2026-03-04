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
      <span v-if="item.data.required && !readonly && item.data.state !== 'readonly' && !search" class="item_require">*</span>
      <el-tooltip :disabled="item.data.label.length <= 6" :content="item.data.label + suffix" placement="top">
        <label>{{ item.data.label }}{{ suffix }}</label>
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
      <el-select
        v-model="item.data.itemConfig.value"
        style="width: 320px;"
        :placeholder="item.data.placeholder"
        v-if="drag"
        multiple
        collapse-tags
        clearable
        :disabled="item.data.state === 'disabled' || item.data.state === 'readonly'"
        :size="size"
      >
        <el-option
          v-for="items in item.data.itemConfig.items"
          :key="items.value"
          :label="items.label"
          :value="items.value"
        />
      </el-select>
      <!-- 只读状态显示对应的 label -->
      <span v-else-if="!drag && (item.data.state === 'readonly' || readonly)">
        {{ getDisplayText() }}
      </span>
      <el-select
        v-else
        v-model="data[item.data.fieldName]"
        style="width: 320px;"
        :placeholder="item.data.placeholder"
        multiple
        collapse-tags
        clearable
        :size="size"
        :disabled="item.data.state === 'disabled' || item.data.state === 'readonly'"
        @focus="execFunc('onFocus')"
        @blur="execFunc('onBlur')"
      >
        <el-option
          v-for="items in item.data.itemConfig.items"
          :key="items.value"
          :label="items.label"
          :value="items.value"
        />
      </el-select>
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
  ControlType: "Selecteds", // 必须与文件名匹配
  nameCn: "多选择器",
  icon: "icon-xuanzeqi",
  formConfig: getFormConfig("Selecteds", [
    { fieldName: "placeholder", component: "Text" },
    { fieldName: "itemConfig", component: "KeyValueConfigMult" },
    { fieldName: "state", component: "Radio" },
  ]),
  actionType: ["onChange", "onFocus", "onBlur"],
  props: {
    ...fieldProps,
  },
  setup(props) {
    const vm = getCurrentInstance() as ComponentInternalInstance;
    useWatch(props);
    
    return {
      execFunc(type: string) {
        if (props.item.data.action && props.item.data.action[type]) {
          window.VApp.$Flex.funcExec(props.item.data.action[type], vm.proxy, [
            props.item.data.fieldName,
          ]);
        }
      },
    };
  },
  methods: {
    getDisplayText() {
      const fieldValue = this.data[this.item.data.fieldName];
      const items = this.item.data.itemConfig?.items || [];
      
      // 如果没有值，显示默认的 "--"
      if (!fieldValue || !Array.isArray(fieldValue) || fieldValue.length === 0) {
        return this.item.data.placeholder || '--';
      }
      
      // 根据选中的 value 数组查找对应的 label
      const selectedLabels = fieldValue.map(value => {
        const item = items.find(item => item.value === value);
        return item ? item.label : value;
      });
      
      // 返回用逗号分隔的 label 字符串
      return selectedLabels.join(', ');
    }
  }
});
</script>