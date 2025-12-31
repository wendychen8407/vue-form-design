/* eslint-disable no-useless-escape */
// 数字校验规则
const validateNumber = `(rule, value, callback) => {
  console.log(rule);
  
  if (value === "" || value == null) {
    callback();
  } else if (!/^[0-9]*$/.test(value)) {
    callback(new Error("必须为数字"));
  }
  callback();
}`;
// 数字校验规则（小数点保留两位）
const validateNumberD2 = `(rule, value, callback) => {
    if (value === "" || value == null) {
      callback();
    } else if (!/^([1-9]+[\d]*(.[0-9]{1,2})?)$/.test(value)) {
      callback(new Error("必须为数字,且小数点最多两位"));
    }
    callback();
  }`;

// 电话号码校验规则
const validatePhone = `(rule, value, callback) => {
    if (value === "" || value == null) {
      callback();
      return;
    }
    var re = /^1[3,4,5,6,7,8,9][0-9]{9}$/;
    
    if (!re.test(value)) {
      callback(new Error("请输入正确的11位手机号码"));
      return;
    }
    callback();
  }`;

// 身份证校验规则
const validateIdCard = `(rule, value, callback) => {
    if (value === "" || value == null) {
      callback();
    } else if (!/^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$/.test(value)) {
      callback(new Error("请输入正确的身份证号"));
    }
    callback();
  }`;

// 邮箱校验规则
const validateEmail = `
  (rule, value, callback) => {
    if (value === "" || value == null) {
      callback();
    } else if (!/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)) {
      callback(new Error("请输入正确的邮箱"));
    }
    callback();
  }`;

// 大写字母单个校验
const validateBigEn = `
  (rule, value, callback) => {
    if (value === "" || value == null) {
      callback();
    } else if (!/^[A-Z]$/.test(value)) {
      callback(new Error("只能是大写字母"));
    }
    callback();
  }`;

const ruleList = [
  {
    label: "数字校验规则",
    validator: validateNumber,
  },
  {
    label: "数字校验规则（小数点保留两位）",
    validator: validateNumberD2,
  },
  {
    label: "身份证校验规则",
    validator: validateIdCard,
  },
  {
    label: "电话号码校验规则",
    validator: validatePhone,
  },
  {
    label: "邮箱校验规则",
    validator: validateEmail,
  },
  {
    label: "大写字母单个校验",
    validator: validateBigEn,
  },
];
export default ruleList;
