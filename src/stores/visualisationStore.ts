import type { fileTypes } from '@/constants'
import RenderScene from '@/visualisation/RenderScene'
import type { AbstractMesh } from '@babylonjs/core/Meshes'
import { defineStore } from 'pinia'

export const useVisualisationStore = defineStore('visulisationStore', {
  state: () => {
    return {
      renderScene: null as RenderScene | null,
      selectedMesh: null as AbstractMesh | null,
      deselectable: true,
      isLoading: false,

    }
  },

  actions: {
    init(canvas: HTMLCanvasElement) {
      this.renderScene = new RenderScene(canvas)
    },

    getScene() {
      if (this.renderScene) {
        return this.renderScene.getScene()
      }
    },

    getEngine() {
      if (this.renderScene) {
        return this.renderScene.getEngine()
      }
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
          .then( () => this.isLoading = false)
      }
    }

  }
})
