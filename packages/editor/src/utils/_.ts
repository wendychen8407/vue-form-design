import { ElNotification } from "element-plus";
import { nanoid } from "nanoid";
import { AllFormItem, BaseComponentItem, PartialKey } from "@/type";
import formStore from "@/controller/form";
class Flex {
  lastClickTime: number;
  openTanc: boolean;

  constructor() {
    this.lastClickTime = 0;
    this.openTanc = false; // 是否有弹窗
  }
  //  防止用户多次点击
  public clickCountLimit(): boolean {
    let isCanGo = false;

    if (window.clickCountLimitMock) {
      return true;
    }
    if (!this.lastClickTime) {
      this.lastClickTime = new Date().getTime();
      isCanGo = true;
    } else {
      const shicha = new Date().getTime() - this.lastClickTime;
      this.lastClickTime = new Date().getTime();
      isCanGo = shicha >= 1000;
    }
    if (!isCanGo) {
      console.log("手残党点击太快了");
    }
    return isCanGo;
  }
  public generateMixed(size?: number) {
    // let res = "";
    // for (let i = 0; i < n; i++) {
    //   const id = Math.ceil(Math.random() * 35);
    //   res += chars[id];
    // }
    return nanoid(size);
  }
  public controlFormRule(controlItems: any[]): any {
    const rules: any = {};
    controlItems.forEach((item: any) => {
      const rule: any[] = [];
      if (item.data.required) {
        rule.push({
          required: true,
          message: "请输入" + item.data.label,
          trigger: "blur",
        });
        rules[item.data.fieldName] = rule;
      }
      if (item.ControlType === "JsonEditor") {
        rules[item.data.fieldName] = this.getJsonValidate();
      }
    });
    return rules;
  }
  public deepClone(target: any): any {
    // 定义一个变量
    let result: any;
    // 如果当前需要深拷贝的是一个对象的话
    if (typeof target === "object") {
      // 如果是一个数组的话
      if (Array.isArray(target)) {
        result = []; // 将result赋值为一个数组，并且执行遍历
        for (let i = 0; i < target.length; i++) {
          // 递归克隆数组中的每一项
          if (Object.prototype.hasOwnProperty.call(target, i)) {
            result.push(this.deepClone(target[i]));
          }
        }
        // 判断如果当前的值是null的话；直接赋值为null
      } else if (target === null) {
        result = null;
        // 判断如果当前的值是一个RegExp对象的话，直接赋值
      } else if (target.constructor === RegExp) {
        result = target;
      } else {
        // 否则是普通对象，直接for in循环，递归赋值对象的所有值
        result = {};
        for (const i in target) {
          if (Object.prototype.hasOwnProperty.call(target, i)) {
            result[i] = this.deepClone(target[i]);
          }
        }
      }
      // 如果不是对象的话，就是基本数据类型，那么直接赋值
    } else {
      result = target;
    }
    // 返回最终结果
    return result;
  }

  public tryParseJson(json: string) {
    try {
      return JSON.parse(json);
    } catch (E) {
      if (json && json.startsWith && json.startsWith('"[')) {
        return [];
      }
      return {};
    }
  }
  public open(message: string, title = "Success", type: any = "success") {
    ElNotification({
      title: title || "Success",
      message: message,
      type,
    });
  }
  public getJsonValidate() {
    return this.deepClone([
      {
        validator: (rule: any, value: any, callback: (a?: any | undefined) => any) => {
          try {
            JSON.parse(value);
            callback();
          } catch (e) {
            console.error(e);
            return callback(new Error("请输入正确的json格式"));
          }
        },
        trigger: "blur",
      },
    ]);
  }
  // 获取数据类型
  public getDataType(data: any): any {
    const str: any = Object.prototype.toString.call(data);
    const reg = /\[object (.*)\]/;
    return str.match(reg)[1];
  }
  /**
   * json转标准数据格式进行收口
   */
public jsonToForm(item: AllFormItem) {
  try {
    // 基础参数校验
    if (!item || !item.ControlType) {
      console.error('jsonToForm: 无效的 item 参数', item);
      return item;
    }

    if (!item.data || !item.controlItems) {
      item = this.deepClone(item);
      const currentComponent = window.VApp.$formcomponents[item.ControlType as any];
      
      // 容错处理：确保 formConfig 存在
      if (!currentComponent) {
        console.warn(`jsonToForm: 未找到组件 ${item.ControlType}，使用默认配置`);
        item.formConfig = {
          data: () => ({}),
          morenConfig: () => []
        };
      } else {
        item.formConfig = currentComponent.formConfig || {};
      }

      // 容错处理：确保 data 方法存在
      if (!item.data) {
        if (item.formConfig.data && typeof item.formConfig.data === 'function') {
          item.data = item.formConfig.data();
        } else {
          console.warn(`jsonToForm: ${item.ControlType} 缺少 data 方法，使用空对象`);
          item.data = {};
        }
      }

      // 容错处理：确保 fieldName 存在
      if (!item.data.fieldName) {
        item.data.fieldName = item.ControlType + "_" + this.generateMixed();
      }

      // 布局组件递归处理（保持原有逻辑，添加容错）
      if (item.layout) {
        if (item.ControlType == "Grid" && item.data.columns && Array.isArray(item.data.columns)) {
          item.data.columns = item.data.columns.map((colItem: any) => {
            if (colItem.list && Array.isArray(colItem.list)) {
              colItem.list = colItem.list.map((listItem: any) => this.jsonToForm(listItem));
            }
            return colItem;
          });
        } else if (item.ControlType == "TableLayout" && item.data.trs && Array.isArray(item.data.trs)) {
          item.data.trs = item.data.trs.map((trItem: any) => {
            if (trItem.tds && Array.isArray(trItem.tds)) {
              trItem.tds = trItem.tds.map((tdItem: any) => {
                if (tdItem.list && Array.isArray(tdItem.list)) {
                  tdItem.list = tdItem.list.map((listItem: any) => this.jsonToForm(listItem));
                }
                return tdItem;
              });
            }
            return trItem;
          });
        } else if ((item.ControlType == "Collapse" || item.ControlType == "Tabs") && item.data.items && Array.isArray(item.data.items)) {
          item.data.items = item.data.items.map((colItem: any) => {
            if (colItem.list && Array.isArray(colItem.list)) {
              colItem.list = colItem.list.map((listItem: any) => this.jsonToForm(listItem));
            }
            return colItem;
          });
        }
      }

      /**
       * 全局动态配置
       */
      const dynamicList = formStore?.get("globalFormList")?.filter((globalItem: any) => {
        return globalItem && globalItem.dynamic;
      }) || [];

      item.id = item.id || this.generateMixed();
      
      // 容错处理：确保 morenConfig 方法存在
      let controlItems: any[] = [];
      if (item.formConfig.morenConfig && typeof item.formConfig.morenConfig === 'function') {
        controlItems = item.formConfig.morenConfig().concat(dynamicList);
      } else {
        console.warn(`jsonToForm: ${item.ControlType} 缺少 morenConfig 方法，使用空数组`);
        controlItems = dynamicList;
      }

      /**
       * 兼容动作面板,不同表单可能需要的事件不一样
       */
      if (currentComponent && currentComponent.actionType && Array.isArray(currentComponent.actionType) && currentComponent.actionType.length > 0) {
        const actionControl = controlItems.find((controlItem: any) => controlItem && controlItem.ControlType == "Action");
        if (actionControl) {
          actionControl.data = actionControl.data || {};
          actionControl.data.formConfig = {
            value: {},
            items: [],
          };
          currentComponent.actionType.forEach((action: string, index: number) => {
            if (actionControl.data.formConfig) {
              actionControl.data.formConfig.items.push({
                label: action,
                value: action,
                id: index + 1,
              });
            }
          });
        }
      } else {
        controlItems = controlItems.filter((controlItem: any) => {
          return controlItem && controlItem.ControlType !== "Action";
        });
      }

      // 容错处理：确保 controlFormRule 方法存在
      if (this.controlFormRule && typeof this.controlFormRule === 'function') {
        item.rules = this.controlFormRule(controlItems, item);
      } else {
        console.warn('jsonToForm: controlFormRule 方法不存在，使用空数组');
        item.rules = [];
      }
      
      item.controlItems = controlItems;
    }
    
    return item;
  } catch (error) {
    console.error('jsonToForm: 处理组件时发生错误', error, item);
    // 返回原始 item，避免整个流程中断
    return item;
  }
}

  /**
   * 完整的表单列表数据进行删减,方便展示
   */
  public initFormToJson(formlist: AllFormItem[]) {
    const jsonData: PartialKey<BaseComponentItem, "icon">[] = [];
    formlist.forEach((item: AllFormItem) => {
      if (item.layout) {
        if (item.ControlType == "Grid" && item.data.columns && item.data.columns.length > 0) {
          item.data.columns = item.data.columns.map((colItem: any) => {
            colItem.list = this.initFormToJson(colItem.list);
            return colItem;
          });
        } else if (item.ControlType == "TableLayout" && item.data.trs && item.data.trs.length > 0) {
          item.data.trs = item.data.trs.map((trItem: any) => {
            trItem.tds.forEach((tdItem: any) => {
              if (tdItem.list && tdItem.list.length > 0) {
                tdItem.list = this.initFormToJson(tdItem.list);
              }
              return tdItem;
            });
            return trItem;
          });
        } else if ((item.ControlType == "Collapse" || item.ControlType == "Tabs") && item.data.items && item.data.items.length > 0) {
          item.data.items = item.data.items.map((colItem: any) => {
            colItem.list = this.initFormToJson(colItem.list);
            return colItem;
          });
        }
      }
      const obj = {
        ControlType: item.ControlType,
        nameCn: item.nameCn,
        id: item.id,
        layout: !!item.layout,
        data: item.data,
      };
      jsonData.push(obj);
    });
    return jsonData;
  }

  public funcExec(action: string, proxy: any, argus: any = []) {
    const actionObj = JSON.parse(action || "{}");
    const funcStr = actionObj.funcStr;
    eval(`(function(${this.getField(actionObj.methods)}){${funcStr}}).apply(proxy, argus)`);
  }

  public getField(methods: string) {
    if (methods == "onChange") {
      return "value, oldValue, subFormData";
    } else if (["onForce", "onBlur", "onClick"].includes(methods)) {
      return "field";
    } else {
      return "";
    }
  }

  /**
   * 获取显示条件所有字段列表
   * item: 其他表单数据
   * result 最终的结果
   * fieldName 过滤当前选中表单的字段(显示规则不能根据自身的值进行展示)
   */
  public getFormDataList(item: AllFormItem, result: any = [], fieldName: string) {
    if (!item.layout) {
      if (item.data.fieldName != fieldName) {
        if (item.nameCn == "开关") {
          result.push({
            value: item?.data?.fieldName,
            label: item?.data?.label + "-" + item?.data?.fieldName,
            switch: true,
          });
          return;
        }
        if (item.data.itemConfig) {
          let multiple = false;
          if (Array.isArray(item.data.itemConfig.value)) {
            multiple = true;
          }
          const options = item.data.itemConfig.items;
          result.push({
            value: item?.data?.fieldName,
            label: item?.data?.label + "-" + item?.data?.fieldName,
            multiple,
            options,
          });
          return;
        }
        result.push({
          value: item?.data?.fieldName,
          label: item?.data?.label + "-" + item?.data?.fieldName,
        });
      }
    } else {
      if (item.data.fieldName != fieldName) {
        // 容器组件整个部分也可以作为显示条件的一部分
        result.push({
          value: item?.data?.fieldName,
          label: item?.data?.label + "-" + item?.data?.fieldName,
        });
        if (item.ControlType == "Grid" && item.data.columns) {
          item.data.columns.forEach((colItem: any) => {
            colItem.list.forEach((listItem: AllFormItem) => {
              this.getFormDataList(listItem, result, fieldName);
            });
          });
        } else if (item.ControlType == "TableLayout" && item.data.trs) {
          item.data.trs.forEach((trItem: any) => {
            trItem.tds.forEach((tdItem: any) => {
              tdItem.list.forEach((listItem: AllFormItem) => {
                this.getFormDataList(listItem, result, fieldName);
              });
            });
          });
        } else if ((item.ControlType == "Collapse" || item.ControlType == "Tabs") && item.data.items) {
          item.data.items.forEach((colItem: any) => {
            colItem.list.forEach((listItem: AllFormItem) => {
              this.getFormDataList(listItem, result, fieldName);
            });
          });
        }
      }
    }
  }
}

export default new Flex();
