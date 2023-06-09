import {
  ElButton,
  ElCheckbox,
  ElCol,
  ElContainer,
  ElFooter,
  ElForm,
  ElFormItem,
  ElHeader,
  ElInput,
  ElLoading,
  ElMain,
  ElMenu,
  ElMenuItem,
  ElMessage,
  ElPagination,
  ElRow,
  ElTable,
  ElTableColumn,
  ElTooltip,
} from 'element-plus'
import type { UserModule } from '~/types'

// import ElementPlus from "element-plus";

// import 'element-theme-ink'
import 'element-plus/dist/index.css'

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
]

export const install: UserModule = ({ app }) => {
  // app.use(ElementPlus);
  components.forEach((component) => {
    app.use(component)
  })
}
