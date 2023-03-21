import AppVue from '@/App.vue'
import AddMeshTool from '@/components/Tools/AddMeshTool.vue'
import AddFluidTool from '@/components/Tools/AddFluidTool.vue'
import RotateTool from '@/components/Tools/RotateTool.vue'
import MoveTool from '@/components/Tools/MoveTool.vue'
import { createRouter, createWebHistory } from 'vue-router'

enum RoutesName {
  Root = 'root',
  AddMeshTool = 'addMeshTool',
  AddFluidTool = 'addFluidTool',
  RotateTool = 'rotateTool',
  MoveTool = 'moveTool',
}

enum RoutesPath {
  Root = '/',
  AddMeshTool = '/addMesh',
  AddFluidTool = '/addFluid',
  RotateTool = '/rotate',
  MoveTool = '/move',
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: RoutesName.Root,
      path: RoutesPath.Root,
      component: AppVue
    },
    {
      name: RoutesName.MoveTool,
      path: RoutesPath.MoveTool,
      component: MoveTool
    },
    {
      name: RoutesName.RotateTool,
      path: RoutesPath.RotateTool,
      component: RotateTool
    },
    {
      name: RoutesName.AddFluidTool,
      path: RoutesPath.AddFluidTool,
      component: AddFluidTool
    },
    {
      name: RoutesName.AddMeshTool,
      path: RoutesPath.AddMeshTool,
      component: AddMeshTool
    },
  ]
})

export default router
