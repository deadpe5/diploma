import { MESH_DEFAULT_ALPHA, MESH_TOGGLED_ALPHA, changableFluidParams, type fileTypes } from '@/constants'
import RenderScene from '@/visualisation/RenderScene'
import type { IBoxOptions, ICylinderOptions, ISphereOptions, ITorusOptions } from '@/visualisation/types'
import { Color4, Vector3 } from '@babylonjs/core'
import type { AbstractMesh } from '@babylonjs/core/Meshes'
import { defineStore } from 'pinia'

export const useVisualisationStore = defineStore('visulisationStore', {
  state: () => {
    return {
      renderScene: null as RenderScene | null,
      selectedMesh: null as AbstractMesh | null,
      meshToAdd: null as AbstractMesh | null,
      deselectable: true,
      isLoading: false,
      isPaused: false,
      sceneItems: [] as AbstractMesh[]
    }
  },

  actions: {
    init(canvas: HTMLCanvasElement) {
      this.renderScene = new RenderScene(canvas)
    },

    rotateCamera(alpha: number, beta: number) {
      if (this.renderScene) {
        this.renderScene.activeCamera.rotateCamera(alpha, beta)
      }
    },

    changeView(view: string) {
      if (this.renderScene) {
        this.renderScene.changeView(view)
      }
    },

    zoomToFit() {
      if (this.renderScene) {
        this.renderScene.activeCamera.zoomToFit()
      }
    },

    zoomToFitAddMesh() {
      if (this.renderScene) {
        this.renderScene.activeCamera.zoomToFitAddMesh()
      }
    },

    recenterSelectedMesh() {
      if (this.renderScene) {
        this.renderScene.meshManager.recenterSelectedMesh()
      }
    },

    moveSelectedMesh(axis: string, value: number, LCS: boolean) {
      if (this.renderScene) {
        this.renderScene.meshManager.moveSelectedMesh(axis, value, LCS)
      }
    },

    restoreSelectedMeshRotation() {
      if (this.renderScene) {
        this.renderScene.meshManager.restoreSelectedMeshRotation()
      }
    },

    rotateSelectedMesh(axis: string, value: number, LCS: boolean) {
      if (this.renderScene) {
        this.renderScene.meshManager.rotateSelectedMesh(axis, value, LCS)
      }
    },

    importMeshFromFile(fileType: fileTypes, url: string) {
      if (this.renderScene) {
        this.renderScene.meshManager.importMeshFromFile(fileType, url)
          .then(() => this.isLoading = false)
      }
    },

    disposeMeshToAdd() {
      if (this.renderScene) {
        this.renderScene.meshManager.disposeMeshToAdd()
      }
    },

    resetMeshToAdd() {
      if (this.meshToAdd) {
        this.sceneItems.push(this.meshToAdd)
        this.meshToAdd = null
      }
    },

    addBoxToScene(options: IBoxOptions) {
      if (this.renderScene) {
        this.renderScene.meshManager.addBoxToScene(options)
      }
    },

    addSphereToScene(options: ISphereOptions) {
      if (this.renderScene) {
        this.renderScene.meshManager.addSphereToScene(options)
      }
    },

    addCylinderToScene(options: ICylinderOptions) {
      if (this.renderScene) {
        this.renderScene.meshManager.addCylinderToScene(options)
      }
    },

    addTorusToScene(options: ITorusOptions) {
      if (this.renderScene) {
        this.renderScene.meshManager.addTorusToScene(options)
      }
    },

    deselect() {
      if (this.selectedMesh && this.renderScene) {
        this.renderScene.gizmoManager.attachToMesh(null)
        this.selectedMesh = null
      }
    },

    select(meshToSelect: AbstractMesh | null) {
      if (meshToSelect && this.renderScene) {
        this.renderScene.gizmoManager.attachToMesh(meshToSelect)
        this.selectedMesh = meshToSelect
      }
    },

    toggleVisibility(item: AbstractMesh) {
      if (item && item.material) {
        item.material.alpha = item.material.alpha === MESH_TOGGLED_ALPHA ? MESH_DEFAULT_ALPHA : MESH_TOGGLED_ALPHA
      }
    },

    removeSelectedSceneItem() {
      if (this.selectedMesh) {
        const selectedMeshId = this.selectedMesh.id
        const newArray = this.sceneItems.filter(item => item.id !== selectedMeshId)
        this.sceneItems = newArray
        this.selectedMesh.dispose()
        this.deselect()
      }
    },

    enableAutoRotateBox(isActive: boolean) {
      if (this.renderScene) {
        this.renderScene.fluidVisualisation.onAutoRotate(isActive)
      }
    },

    checkBounds(isActive: boolean) {
      if (this.renderScene) {
        this.renderScene.fluidVisualisation.onCheckBounds(isActive)
      }
    },

    changeBoxOpacity(value: number) {
      if (this.renderScene) {
        this.renderScene.fluidVisualisation.boxOpacity = value
      }
    },

    changeEnvironment(value: string) {
      if (this.renderScene) {
        this.renderScene.setEnvironment(value)
      }
    },

    pauseSimulation() {
      if (this.renderScene) {
        this.isPaused = !this.isPaused
        this.renderScene.fluidVisualisation.onPaused(this.isPaused)
      }
    },

    restartSimulation() {
      if (this.renderScene) {
        this.renderScene.fluidVisualisation.restart()
      }
    },

    changeFluidColor(color: Color4) {
      if (this.renderScene) {
        this.renderScene.fluidVisualisation.changeColor(color)
      }
    },

    changeParticlesCount(value: number) {
      if (this.renderScene) {
        this.renderScene.fluidVisualisation.changeParticlesCount(value)
      }
    },

    changeFluidParam(param: changableFluidParams, value: number) {
      if (this.renderScene) {
        this.renderScene.fluidVisualisation.changeFluidParam(param, value)
      }
    },

    changeBoxDimension(min: Vector3, max: Vector3) {
      if (this.renderScene) {
        this.renderScene.fluidVisualisation.changeBoxDimension(min, max)
      }
    }
  }
})
