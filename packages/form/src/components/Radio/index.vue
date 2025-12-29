<template>
  <div
    class="starfish-formitem"
    :class="{
      formCover: drag,
      'starfish-vertical': labelalign != 'top',
      [item.data.csslist?.join(' ')]: !!item.data.csslist,
    }"
    v-show="item.data.label !== '计数器尺寸类型'"
  >
    <div
      class="label"
      :class="'label_' + labelalign"
      :style="{ width: labelWidth + 'px' }"
    >
      <span v-if="item.data.required && !readonly && item.data.state !== 'readonly'" class="item_require">*</span>
      <label>{{ item.data.label }}{{ suffix }}</label>
      <el-tooltip
        v-if="item.data.tip && !readonly"
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
      <!-- 只读状态显示对应的 label -->
      <span v-if="!drag && (item.data.state === 'readonly' || readonly)">
        {{ getDisplayText() }}
      </span>
      <el-radio-group
        v-else-if="!drag"
        v-model="data[item.data.fieldName]"
        :size="size"
        :class="{'vertical-group': item.data.arrangeMent === 'vertical'}"
      >
        <el-radio
          v-for="(sitem, sindex) in item.data.itemConfig.items"
          :key="sindex"
          :label="sitem.value"
          :value="sitem.value"
          :disabled="item.data.state === 'disabled' || item.data.state === 'readonly'"
          >{{ sitem.label }}</el-radio
        >
      </el-radio-group>
      <el-radio-group
        v-if="drag"
        v-model="item.data.itemConfig.value"
        :size="size"
        :class="{'vertical-group': item.data.arrangeMent === 'vertical'}"
      >
        <el-radio
          v-for="(sitem, sindex) in item.data.itemConfig.items"
          :key="sindex"
          :label="sitem.value"
          :value="sitem.value"
          :disabled="item.data.state === 'disabled' || item.data.state === 'readonly'"
          >{{ sitem.label }}</el-radio
        >
      </el-radio-group>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { getFormConfig } from "../../utils/fieldConfig";
import fieldProps from "../../utils/fieldProps";
import { useWatch } from "../../utils/customHooks";
export default defineComponent({
  ControlType: "Radio", // 必须与文件名匹配
  nameCn: "单选框",
  icon: "icon-danxuankuang",
  formConfig: getFormConfig("Radio", [
    { fieldName: "itemConfig", component: "KeyValueConfig" },
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
      if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
        return '--';
      }
      
      // 查找对应的 label
      const selectedItem = items.find(item => item.value === fieldValue);
      
      // 如果找到对应的 label，显示 label，否则显示原始值
      return selectedItem ? selectedItem.label : fieldValue;
    }
  }
});
</script>