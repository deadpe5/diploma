import {
  DEFAULT_DENSITY_REFERENCE,
  DEFAULT_PARTICLE_SIZE,
  DEFAULT_PRESSURE_CONSTANT,
  DEFAULT_SMOOTHING_RADIUS,
  DEFAULT_FLUID_VELOCITY,
  MESH_DEFAULT_ALPHA,
  MESH_TOGGLED_ALPHA,
  MIN_BOUNDING_BOX_DEPTH,
  MIN_BOUNDING_BOX_HEIGHT,
  MIN_BOUNDING_BOX_WIDTH,
  RED_FPS,
  YELLOW_FPS,
  changableFluidParams,
  fileTypes
} from '@/constants'
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
      selectable: true,
      isLoading: false,
      isPaused: false,
      sceneItems: [] as AbstractMesh[],
      fps: 0,
      fpsCounterColor: 'green',
      isFPSCounterEnabled: false,
      fluidSettings: {
        boxHeight: MIN_BOUNDING_BOX_HEIGHT,
        boxWidth: MIN_BOUNDING_BOX_WIDTH,
        boxDepth: MIN_BOUNDING_BOX_DEPTH,
        particleSize: DEFAULT_PARTICLE_SIZE,
        smoothingRadius: DEFAULT_SMOOTHING_RADIUS,
        densityReference: DEFAULT_DENSITY_REFERENCE,
        pressureConstant: DEFAULT_PRESSURE_CONSTANT,
        maxVelocity: DEFAULT_FLUID_VELOCITY
      }
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
        this.zoomToFit()
      }
    },

    resetMeshToAdd() {
      if (this.meshToAdd) {
        this.meshToAdd.position = Vector3.Zero()
        this.zoomToFit()
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
        const selectedMeshIndex = this.sceneItems.findIndex(item => item.id === selectedMeshId)
        this.sceneItems.splice(selectedMeshIndex, 1)
        this.renderScene?.fluidVisualisation.disposeCollisionObjectById(selectedMeshId)
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
        switch(param) {
          case changableFluidParams.particleSize:
            this.fluidSettings.particleSize = value
            break;
          case changableFluidParams.smoothingRadius:
            this.fluidSettings.smoothingRadius = value
            break;
          case changableFluidParams.densityReference:
            this.fluidSettings.densityReference = value
            break;
          case changableFluidParams.pressureConstant:
            this.fluidSettings.pressureConstant = value
            break;
          case changableFluidParams.maxVelocity:
            this.fluidSettings.maxVelocity = value
            break;
          default:
            return
        }
        this.renderScene.fluidVisualisation.changeFluidParam(param, value)
      }
    },

    changeBoxDimension(min: Vector3, max: Vector3) {
      if (this.renderScene) {
        this.fluidSettings.boxHeight = max.x - min.x
        this.fluidSettings.boxWidth = max.y - min.y
        this.fluidSettings.boxDepth = max.z - min.z
        this.renderScene.fluidVisualisation.changeBoxDimension(min, max)
      }
    },

    async addCollisionBox(box: AbstractMesh, collisionRestitution?: number) {
      if (this.renderScene) {
        await this.renderScene.fluidVisualisation.addCollisionBox(box, collisionRestitution)
      }
    },

    async addCollisionSphere(sphere: AbstractMesh, collisionRestitution?: number) {
      if (this.renderScene) {
        await this.renderScene.fluidVisualisation.addCollisionSphere(sphere, collisionRestitution)
      }
    },
    
    async addCollisionCylinder(cylinder: AbstractMesh, collisionRestitution?: number) {
      if (this.renderScene) {
        await this.renderScene.fluidVisualisation.addCollisionCylinder(cylinder, collisionRestitution)
      }
    },
  }
})
