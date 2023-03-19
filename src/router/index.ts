import AppVue from '@/App.vue'
import { createRouter, createWebHistory } from 'vue-router'

enum RoutesName {
  Root = 'root'
}

enum RoutesPath {
  Root = '/'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: RoutesName.Root,
      path: RoutesPath.Root,
      component: AppVue
    }
  ]
})

export default router
