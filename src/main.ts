// register vue composition api globally
import { ViteSSG } from 'vite-ssg'
import generatedRoutes from 'virtual:generated-pages'
import { setupLayouts } from 'virtual:generated-layouts'
import App from './App.vue'

// windicss layers
import 'virtual:windi-base.css'
import 'virtual:windi-components.css'

// for element
import 'element-plus/dist/index.css'

// your custom styles here
import './styles/main.scss'

// windicss utilities should be the last style import
import 'virtual:windi-utilities.css'

// windicss devtools support (dev only)
import 'virtual:windi-devtools'

// app.config.productionTip = false;
const routes = setupLayouts(generatedRoutes)

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(
  App,
  { routes },
  (ctx) => {
    // install all modules under `modules/`
    Object.values(import.meta.globEager('./modules/*.ts')).map(i => i.install?.(ctx))
  },
)
