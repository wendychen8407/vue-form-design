<!--
 * @Author: chenwen chenwen@jiton.com
 * @Date: 2025-07-25 15:26:40
 * @LastEditors: chenwen chenwen@jiton.com
 * @LastEditTime: 2025-12-24 16:07:50
 * @FilePath: \vue-form-design\packages\form\src\components\Radio\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
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
      <span v-if="!drag && (item.data.state === 'readonly' || readonly)">{{ data[item.data.fieldName] || '--' }}</span>
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
});
</script>
