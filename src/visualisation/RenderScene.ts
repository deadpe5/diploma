import {
  Engine,
  Scene,
  Vector3,
  Color4,
  HemisphericLight,
  Matrix,
  GizmoManager,
  PointerEventTypes,
  PointLight,
} from '@babylonjs/core'
import RenderCamera from './CameraWrapper'
import { useVisualisationStore } from '@/stores/visualisationStore'
import MeshManager from './MeshManager'

class RenderScene {
  private readonly canvas: HTMLCanvasElement
  private readonly _engine: Engine
  private readonly _scene: Scene
  private readonly _camera: RenderCamera
  private readonly _gizmoManager: GizmoManager
  private readonly _meshManager: MeshManager
  private readonly visualisationStore = useVisualisationStore()
  private readonly sceneLight: HemisphericLight
  private readonly cameraLight: PointLight

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this._engine = new Engine(this.canvas)
    this._scene = new Scene(this._engine)
    this._scene.useRightHandedSystem = true
    this._gizmoManager = new GizmoManager(this._scene, 2)
    this._gizmoManager.positionGizmoEnabled = true
    this._gizmoManager.rotationGizmoEnabled = true
    this._gizmoManager.enableAutoPicking = false

    this.canvas.addEventListener('wheel', (evt) => evt.preventDefault())
    this._scene.clearColor = new Color4(0.7, 0.7, 0.7, 1)

    this._camera = new RenderCamera(this._scene, this.canvas)

    this.sceneLight = new HemisphericLight('sceneLight', new Vector3(0, 0, 1), this._scene)
    this.sceneLight.intensity = 0.3

    this.cameraLight = new PointLight('cameraLight', this._camera.position, this._scene)
    this.cameraLight.intensity = 1

    this._meshManager = new MeshManager(this._scene)

    this._engine.runRenderLoop(() => {
      this._scene.render()
    })

    if (window) {
      const resize = () => {
        this._scene.getEngine().resize()
      }

      window.addEventListener('resize', resize)
    }

    this.addOnPointerObservable()
  }

  public get scene(): Scene {
    return this._scene
  }

  public get engine(): Engine {
    return this._engine
  }

  public get activeCamera(): RenderCamera {
    return this._camera
  }

  public get meshManager(): MeshManager {
    return this._meshManager
  }

  public get gizmoManager(): GizmoManager {
    return this._gizmoManager
  }

  changeView(view: string) {
    const PI = Math.PI
    switch (view) {
      case '+X':
        this._camera.rotateCamera(0, PI / 2)
        return
      case '-X':
        this._camera.rotateCamera(PI, PI / 2)
        return
      case '+Z':
        this._camera.rotateCamera(PI / 2, PI / 2)
        return
      case '-Z':
        this._camera.rotateCamera(-PI / 2, PI / 2)
        return
      case '+Y':
        this._camera.rotateCamera(PI / 2, 0)
        return
      case '-Y':
        this._camera.rotateCamera(PI / 2, PI)
        return
      case 'XYZ':
        this._camera.rotateCamera(PI / 4, PI / 3)
        return
    }
  }

  private addOnPointerObservable() {
    let pointerX = 0
    let pointerY = 0
    this._scene.onPointerObservable.add((evt) => {
      if (evt.type === PointerEventTypes.POINTERDOWN) {
        pointerX = Math.round(evt.event.clientX)
        pointerY = Math.round(evt.event.clientY)
        return
      }

      if (evt.type === PointerEventTypes.POINTERUP) {
        if (Math.round(evt.event.clientX) === pointerX &&
          Math.round(evt.event.clientY) === pointerY) {
          const pickingRay = this._scene.createPickingRay(pointerX, pointerY, Matrix.Identity(), this._camera)
          const hitInfo = this._scene.pickWithRay(pickingRay)
          if (hitInfo && hitInfo.hit) {
            this.visualisationStore.select(hitInfo.pickedMesh)
          }
          else if (this.visualisationStore.deselectable) {
            this.visualisationStore.deselect()
          }
        }
      }
    })
  }
}

export default RenderScene
