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
        clearable
        :size="size"
        :disabled="item.data.state === 'disabled' || item.data.state === 'readonly'"
      >
        <el-option
          v-for="items in item.data.itemConfig.items"
          :key="items.value"
          :label="items.label"
          :value="items.value"
        />
      </el-select>
      <!-- 只读状态显示对应的 label -->
      <span v-if="!drag && (item.data.state === 'readonly' || readonly)">
        {{ getDisplayText() }}
      </span>
      <el-select
        v-model="data[item.data.fieldName]"
        style="width: 320px;"
        :placeholder="item.data.placeholder"
        v-else-if="!drag"
        :size="size"
        clearable
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
  ControlType: "Selected", // 必须与文件名匹配
  nameCn: "选择器",
  icon: "icon-xuanzeqi",
  formConfig: getFormConfig("Selected", [
    { fieldName: "placeholder", component: "Text" },
    { fieldName: "itemConfig", component: "KeyValueConfig" },
    { fieldName: "state", component: "Radio" },
  ]),
  props: {
    ...fieldProps,
  },
  actionType: ["onChange", "onFocus", "onBlur"],
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
      if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
        return this.item.data.placeholder || '--';
      }
      
      // 查找对应的 label
      const selectedItem = items.find(item => item.value === fieldValue);
      
      // 如果找到对应的 label，显示 label，否则显示原始值
      return selectedItem ? selectedItem.label : fieldValue;
    }
  }
});
</script>