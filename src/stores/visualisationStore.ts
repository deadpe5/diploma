import RenderScene from '@/visualisation/RenderScene'
import type { AbstractMesh } from '@babylonjs/core/Meshes'
import { defineStore } from 'pinia'

export const useVisualisationStore = defineStore('visulisationStore', {
  state: () => {
    return {
      renderScene: null as RenderScene | null,
      selectedMesh: null as AbstractMesh | null,
      deselectable: true
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

    recenterSelectedMesh() {
      if (this.renderScene) {
        this.renderScene.getMeshManager().recenterSelectedMesh()
      }
    },

    moveSelectedMesh(axis: string, value: number) {
      if (this.renderScene) {
        this.renderScene.getMeshManager().moveSelectedMesh(axis, value)
      }
    },

    restoreSelectedMeshRotation() {
      if (this.renderScene) {
        this.renderScene.getMeshManager().restoreSelectedMeshRotation()
      }
    },

    rotateSelectedMesh(axis: string, value: number) {
      if (this.renderScene) {
        this.renderScene.getMeshManager().rotateSelectedMesh(axis, value)
      }
    }

  }
})
