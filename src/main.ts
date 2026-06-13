import type { UserModule } from './types'
import { setupLayouts } from 'virtual:generated-layouts'

import { ViteSSG } from 'vite-ssg'
import generatedRoutes from '~pages'
// import Previewer from 'virtual:vue-component-preview'
import App from './App.vue'

// your custom styles here
import './styles/main.scss'

import 'uno.css'

const routes = setupLayouts(generatedRoutes)

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(
  App,
  { routes, base: import.meta.env.BASE_URL },
  async (ctx) => {
    // install all modules under `modules/`
    for (const module of Object.values(import.meta.glob<{ install: UserModule }>('./modules/*.ts', { eager: true })))
      await module.install?.(ctx)
    // ctx.app.use(Previewer)
  },
)
