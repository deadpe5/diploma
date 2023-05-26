import ToolBarNavigation from '@/components/Tools/ToolBarNavigation.vue'
import AddMeshTool from '@/components/Tools/AddMesh/AddMeshTool.vue'
import AddBoxMesh from '@/components/Tools/AddMesh/AddBoxMesh.vue'
import AddCylinderMesh from '@/components/Tools/AddMesh/AddCylinderMesh.vue'
import AddCustomMesh from '@/components/Tools/AddMesh/AddCustomMesh.vue'
import AddSphereMesh from '@/components/Tools/AddMesh/AddSphereMesh.vue'
import AddTorusMesh from '@/components/Tools/AddMesh/AddTorusMesh.vue'
import FluidSettingsTool from '@/components/Tools/FluidSettingsTool.vue'
import RotateTool from '@/components/Tools/RotateTool.vue'
import MoveTool from '@/components/Tools/MoveTool.vue'
import { createRouter, createWebHistory } from 'vue-router'

enum RoutesName {
  Root = 'root',
  AddMeshTool = 'addMeshTool',
  FluidSettingsTool = 'fluidSettingsTool',
  RotateTool = 'rotateTool',
  MoveTool = 'moveTool',

  AddBoxMesh = 'addBoxMesh',
  AddCylinderMesh = 'addCylinderMesh',
  AddSphereMesh = 'addSphereMesh',
  AddTorusMesh = 'addTorusMesh',
  AddCustomMesh = 'addCustomMesh',
}

enum RoutesPath {
  Root = '/',
  AddMeshTool = '/addMesh',
  FluidSettingsTool = '/fluidSettings',
  RotateTool = '/rotate',
  MoveTool = '/move',

  AddBoxMesh = '/addMesh/addBoxMesh',
  AddCylinderMesh = '/addMesh/addCylinderMesh',
  AddSphereMesh = '/addMesh/addSphereMesh',
  AddTorusMesh = '/addMesh/addTorusMesh',
  AddCustomMesh = '/addMesh/addCustomMesh',
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: RoutesName.Root,
      path: RoutesPath.Root,
      component: ToolBarNavigation
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
      name: RoutesName.FluidSettingsTool,
      path: RoutesPath.FluidSettingsTool,
      component: FluidSettingsTool
    },
    {
      name: RoutesName.AddMeshTool,
      path: RoutesPath.AddMeshTool,
      component: AddMeshTool,
    },
    {
      name: RoutesName.AddBoxMesh,
      path: RoutesPath.AddBoxMesh,
      component: AddBoxMesh
    },
    {
      name: RoutesName.AddCylinderMesh,
      path: RoutesPath.AddCylinderMesh,
      component: AddCylinderMesh
    },
    {
      name: RoutesName.AddTorusMesh,
      path: RoutesPath.AddTorusMesh,
      component: AddTorusMesh
    },
    {
      name: RoutesName.AddSphereMesh,
      path: RoutesPath.AddSphereMesh,
      component: AddSphereMesh
    },
    {
      name: RoutesName.AddCustomMesh,
      path: RoutesPath.AddCustomMesh,
      component: AddCustomMesh
    }
  ]
})

export default router
