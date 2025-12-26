// import { createStore } from "vuex";
import { reactive } from "vue";
import { state as form } from "./form";
import { AllFormItem, ShortCutState } from "@/type";

const state = reactive<ShortCutState>({
  form: form,
  copyContent: {},
  curList: [], // 当前操作在哪个选中区间中
});

/**
 * 快捷键对表单的处理
 */
class ShortCut {
  copy(list: AllFormItem[]) {
    if (state.form.currentIndex > -1) {
      state.copyContent = list[state.form.currentIndex];
    }
  }
  paste(list: AllFormItem[]) {
    if (state.copyContent) {
      const pasteControl = window.VueContext.$Flex.deepClone(state.copyContent);

      // 确保 date 组件的 default 值被正确复制
      if (pasteControl.ControlType === "Date") {
        // 特殊处理 Date 组件
        this.handleDateComponentCopy(pasteControl, state.copyContent);
      }

      if (pasteControl.data) {
        // 如果是布局控件，给其中的基础控件也设置新的fieldName 和 id
        if (pasteControl.layout) {
          // 栅格布局
          if (pasteControl.ControlType === "Grid") {
            pasteControl.data.columns.forEach((column: any, colIndex: number) => {
              if (column.list.length > 0) {
                column.list.forEach((item: any, listIndex: number) => {
                  if (item.ControlType === "Date") {
                    this.handleDateComponentCopy(
                      item,
                      state.copyContent.data.columns[colIndex].list[listIndex]
                    );
                  }
                  // 生成新的 fieldName 和 id
                  if (item.data) {
                    item.data.fieldName =
                      item.ControlType +
                      "_" +
                      window.VueContext.$Flex.generateMixed();
                    item.id = window.VueContext.$Flex.generateMixed();
                  }
                });
              }
            });
          }// 表格布局
          else if (pasteControl.ControlType === "TableLayout") {
            // 遍历表格的所有行
            pasteControl.data.trs.forEach((tr: any, trIndex: number) => {
              // 遍历行的所有单元格
              tr.tds.forEach((td: any, tdIndex: number) => {
                // 遍历单元格中的所有控件
                td.list.forEach((item: any, itemIndex: number) => {
                  if (item.ControlType === "Date") {
                    // 处理 Date 组件的复制
                    this.handleDateComponentCopy(
                      item,
                      state.copyContent.data.trs[trIndex]?.tds[tdIndex]?.list[itemIndex]
                    );
                  }
                  // 生成新的 fieldName 和 id
                  if (item.data) {
                    item.data.fieldName =
                      item.ControlType +
                      "_" +
                      window.VueContext.$Flex.generateMixed();
                    item.id = window.VueContext.$Flex.generateMixed();
                  }
                });
              });
            });
          }
        }
        // 生成新的 fieldName 和 id
        pasteControl.data.fieldName =
          pasteControl.ControlType +
          "_" +
          window.VueContext.$Flex.generateMixed();
        pasteControl.id = window.VueContext.$Flex.generateMixed();

        // 插入到列表
        list.splice(state.form.currentIndex, 0, pasteControl);
        state.form.formUpdate = true;
      }
    }
  }

  // 特殊处理 Date 组件的复制
  handleDateComponentCopy(target: AllFormItem, source: AllFormItem) {
    // 确保 default 值被复制
    if (source.data?.default !== undefined) {
      // 如果是字符串，直接复制
      if (typeof source.data.default === "string") {
        target.data.default = source.data.default;
      }
      // 如果是 Date 对象，转换为字符串
      else if (source.data.default instanceof Date) {
        target.data.default = this.formatDateToString(
          source.data.default,
          source.data.format || "YYYY-MM-DD"
        );
      }
      // 其他情况，尝试转换为字符串
      else if (source.data.default) {
        target.data.default = String(source.data.default);
      }
    }

    // 确保 format 存在
    if (!target.data.format && source.data?.format) {
      target.data.format = source.data.format;
    }
  }

  // 日期对象转字符串
  formatDateToString(date: Date, format: string): string {
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
  }
  delete(list: AllFormItem[]) {
    console.log("delete list", list);
    list.splice(state.form.currentIndex, 1);
    state.form.curControl = {};
    state.form.formUpdate = true;
    state.form.currentIndex = -1;
    state.form.currentId = "";
  }
  onTop(list: AllFormItem[]) {
    if (state.form.currentIndex > 0) {
      const temp = list.splice(state.form.currentIndex, 1);
      state.form.currentIndex -= 1;
      list.splice(state.form.currentIndex, 0, ...temp);
    }
  }
  onBottom(list: AllFormItem[]) {
    if (state.form.currentIndex < list.length - 1) {
      const temp = list.splice(state.form.currentIndex, 1);
      state.form.currentIndex += 1;
      list.splice(state.form.currentIndex, 0, ...temp);
    }
  }
  clear() {
    state.form.allFormList.length = 0;
    state.form.formUpdate = true;
  }
  moveTop() {
    if (state.form.currentIndex > 0) {
      state.form.currentIndex -= 1;
    }
  }
  moveBottom(list: AllFormItem[]) {
    if (state.form.currentIndex < list.length - 1) {
      state.form.currentIndex += 1;
    }
  }
  set(name: keyof ShortCutState, value: any) {
    state[name] = value;
  }

  get(name: keyof ShortCutState) {
    return state[name];
  }
  commit(event: string) {
    this[event](state.curList);
  }
}

export type shortCut = ShortCut;

export default new ShortCut();
