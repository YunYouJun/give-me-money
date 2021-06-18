import { UserModule } from "~/types";

// import ElementPlus from "element-plus";
import {
  ElContainer,
  ElHeader,
  ElMain,
  ElFooter,
  ElMenu,
  ElMenuItem,
  ElRow,
  ElCol,
  ElForm,
  ElFormItem,
  ElTable,
  ElTableColumn,
  ElButton,
  ElTooltip,
  ElInput,
  ElCheckbox,
  ElPagination,
  ElLoading,
  ElMessage,
} from "element-plus";

import "element-theme-ink";
// import "element-plus/lib/theme-chalk/index.css";

const components = [
  ElContainer,
  ElHeader,
  ElMain,
  ElFooter,
  ElMenu,
  ElMenuItem,
  ElRow,
  ElCol,
  ElForm,
  ElFormItem,
  ElTable,
  ElTableColumn,
  ElButton,
  ElTooltip,
  ElInput,
  ElCheckbox,
  ElPagination,
  ElLoading,
  ElMessage,
];

export const install: UserModule = ({ app }) => {
  // app.use(ElementPlus);
  components.forEach((component) => {
    app.use(component);
  });
};
