import { MESH_DEFAULT_ALPHA, MESH_TOGGLED_ALPHA, type fileTypes } from '@/constants'
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
      sceneItems: [] as AbstractMesh[]
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

    toggleVisibility(item: AbstractMesh) {
      if (item && item.material) {
        item.material.alpha = item.material.alpha === MESH_TOGGLED_ALPHA ? MESH_DEFAULT_ALPHA : MESH_TOGGLED_ALPHA
      }
    }
  }
})
