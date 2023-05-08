import { MESH_DEFAULT_ALPHA, MESH_TOGGLED_ALPHA, RED_FPS, YELLOW_FPS, fileTypes } from '@/constants'
import RenderScene from '@/visualisation/RenderScene'
import type { IBoxOptions, ICylinderOptions, ISphereOptions, ITorusOptions } from '@/visualisation/types'
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
      fps: 0,
      fpsCounterColor: 'green',
      isFPSCounterEnabled: false,
      sceneItems: [] as AbstractMesh[]
    }
  },
  
  actions: {
    init(canvas: HTMLCanvasElement) {
      this.renderScene = new RenderScene(canvas)
    },

    rotateCamera(alpha: number, beta: number) {
      if (this.renderScene) {
        this.renderScene.getActiveCamera().rotateCamera(alpha, beta)
      }
    },

    changeView(view: string) {
      if (this.renderScene) {
        this.renderScene.changView(view)
      }
    },

    zoomToFit() {
      if (this.renderScene) {
        this.renderScene.getActiveCamera().zoomToFit()
      }
    },

    zoomToFitAddMesh() {
      if (this.renderScene) {
        this.renderScene.getActiveCamera().zoomToFitAddMesh()
      }
    },

    recenterSelectedMesh() {
      if (this.renderScene) {
        this.renderScene.getMeshManager().recenterSelectedMesh()
      }
    },

    moveSelectedMesh(axis: string, value: number, LCS: boolean) {
      if (this.renderScene) {
        this.renderScene.getMeshManager().moveSelectedMesh(axis, value, LCS)
      }
    },

    restoreSelectedMeshRotation() {
      if (this.renderScene) {
        this.renderScene.getMeshManager().restoreSelectedMeshRotation()
      }
    },

    rotateSelectedMesh(axis: string, value: number, LCS: boolean) {
      if (this.renderScene) {
        this.renderScene.getMeshManager().rotateSelectedMesh(axis, value, LCS)
      }
    },

    importMeshFromFile(fileType: fileTypes, url: string) {
      if (this.renderScene) {
        this.renderScene.getMeshManager().importMeshFromFile(fileType, url)
          .then(() => this.isLoading = false)
      }
    },

    disposeMeshToAdd() {
      if (this.renderScene) {
        this.renderScene.getMeshManager().disposeMeshToAdd()
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
        this.renderScene.getMeshManager().addBoxToScene(options)
      }
    },

    addSphereToScene(options: ISphereOptions) {
      if (this.renderScene) {
        this.renderScene.getMeshManager().addSphereToScene(options)
      }
    },

    addCylinderToScene(options: ICylinderOptions) {
      if (this.renderScene) {
        this.renderScene.getMeshManager().addCylinderToScene(options)
      }
    },

    addTorusToScene(options: ITorusOptions) {
      if (this.renderScene) {
        this.renderScene.getMeshManager().addTorusToScene(options)
      }
    },

    deselect() {
      if (this.selectedMesh && this.renderScene) {
        this.renderScene.getGizmoManager().attachToMesh(null)
        this.selectedMesh = null
      }
    },

    select(meshToSelect: AbstractMesh | null) {
      if (meshToSelect && this.renderScene) {
        this.renderScene.getGizmoManager().attachToMesh(meshToSelect)
        this.selectedMesh = meshToSelect
      }
    },

    setFPS(newFPS: number) {
      this.fps = newFPS
      if (this.fps < RED_FPS) {
        this.fpsCounterColor = 'red'
      } else if (this.fps < YELLOW_FPS) {
        this.fpsCounterColor = 'orange'
      } else {
        this.fpsCounterColor = 'green'
      }
    },

    toggleFPSCounter() {
      this.isFPSCounterEnabled = !this.isFPSCounterEnabled
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
    }
  }
})
