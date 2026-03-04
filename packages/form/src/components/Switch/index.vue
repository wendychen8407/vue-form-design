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
      <span v-if="item.data.required && !readonly && item.data.state !== 'readonly'" class="item_require">*</span>
      <el-tooltip :disabled="item.data.label.length <= 6" :content="item.data.label + suffix" placement="top">
        <label>{{ item.data.label }}{{ suffix }}</label>
      </el-tooltip>
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
      <!-- 只读状态显示是或否 -->
      <span v-if="!drag && (item.data.state === 'readonly' || readonly)">
        {{ getDisplayText() }}
      </span>
      <el-switch
        v-else-if="drag"
        v-model="item.data.default"
        :size="size"
        :disabled="item.data.state === 'disabled' || item.data.state === 'readonly'"
      />
      <el-switch
        v-else
        v-model="data[item.data.fieldName]"
        :size="size"
        :disabled="item.data.state === 'disabled' || item.data.state === 'readonly'"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { getFormConfig } from "../../utils/fieldConfig";
import fieldProps from "../../utils/fieldProps";
import { useWatch } from "../../utils/customHooks";

export default defineComponent({
  ControlType: "Switch", // 必须与文件名匹配
  nameCn: "开关",
  icon: "icon-kaiguanguan",
  formConfig: getFormConfig("Switch", [
    { fieldName: "default", component: "Switch" },
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
      
      // 如果没有值，显示默认的 "--"
      if (fieldValue === undefined || fieldValue === null) {
        return '--';
      }
      
      // 根据布尔值返回是或否
      return fieldValue ? '是' : '否';
    }
  }
});
</script>