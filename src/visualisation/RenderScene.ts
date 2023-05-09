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
  KeyboardEventTypes,
  CubeTexture,
} from '@babylonjs/core'
import RenderCamera from './CameraWrapper'
import { useVisualisationStore } from '@/stores/visualisationStore'
import MeshManager from './MeshManager'
import { FluidVisualisation } from './FluidVisualisation'

class RenderScene {
  private readonly canvas: HTMLCanvasElement
  private readonly engine: Engine
  private readonly scene: Scene
  private readonly camera: RenderCamera
  private readonly gizmoManager: GizmoManager
  private readonly meshManager: MeshManager
  private readonly visualisationStore = useVisualisationStore()
  private readonly sceneLight: HemisphericLight
  private readonly cameraLight: PointLight
  private readonly fluidVisualisation: FluidVisualisation

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.engine = new Engine(this.canvas)
    this.scene = new Scene(this.engine)
    this.scene.useRightHandedSystem = true
    this.setEnvironment()
    this.gizmoManager = new GizmoManager(this.scene, 2)
    this.gizmoManager.positionGizmoEnabled = true
    this.gizmoManager.rotationGizmoEnabled = true
    this.gizmoManager.enableAutoPicking = false

    this.canvas.addEventListener('wheel', (evt) => evt.preventDefault())
    this.scene.clearColor = new Color4(1, 1, 1, 1)

    this.camera = new RenderCamera(this.scene, this.canvas)

    this.sceneLight = new HemisphericLight('sceneLight', new Vector3(0, 0, 1), this.scene)
    this.sceneLight.intensity = 0.3

    this.cameraLight = new PointLight('cameraLight', this.camera.position, this.scene)
    this.cameraLight.intensity = 1

    this.meshManager = new MeshManager(this.scene)

    this.fluidVisualisation = new FluidVisualisation(this)
    this.fluidVisualisation.run()
    this.scene.onDisposeObservable.add(() => {
      this.fluidVisualisation.dispose()
    })

    this.engine.runRenderLoop(() => {
      const fps = this.engine.getFps()
      this.visualisationStore.setFPS(fps)
      this.scene.render()
    })

    this.scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type === KeyboardEventTypes.KEYUP && kbInfo.event.code === 'Backquote') {
        this.visualisationStore.toggleFPSCounter()
      }
    })

    if (window) {
      const resize = () => {
        this.scene.getEngine().resize()
      }

      window.addEventListener('resize', resize)
    }

    this.addOnPointerObservable()
  }

  public get getFluidVisualisation() {
    return this.fluidVisualisation
  }

  changeView(view: string) {
    const PI = Math.PI
    switch (view) {
      case '+X':
        this.camera.rotateCamera(0, PI / 2)
        return
      case '-X':
        this.camera.rotateCamera(PI, PI / 2)
        return
      case '+Y':
        this.camera.rotateCamera(-PI / 2, PI / 2)
        return
      case '-Y':
        this.camera.rotateCamera(PI / 2, PI / 2)
        return
      case '+Z':
        this.camera.rotateCamera(PI / 2, 0)
        return
      case '-Z':
        this.camera.rotateCamera(PI / 2, PI)
        return
      case 'XYZ':
        this.camera.rotateCamera(-PI / 4, PI / 3)
        return
    }
  }

  setEnvironment() {
    this.scene.environmentTexture =
      CubeTexture.CreateFromPrefilteredData("https://playground.babylonjs.com/textures/country.env", this.scene);

    const skybox = this.scene.createDefaultSkybox(this.scene.environmentTexture);
    skybox!.rotation.x = Math.PI / 2
  }
  
  getScene(): Scene {
    return this.scene
  }

  getEngine(): Engine {
    return this.engine
  }

  getActiveCamera(): RenderCamera {
    return this.camera
  }

  getMeshManager(): MeshManager {
    return this.meshManager
  }

  getGizmoManager(): GizmoManager {
    return this.gizmoManager
  }

  private addOnPointerObservable() {
    let pointerX = 0
    let pointerY = 0
    this.scene.onPointerObservable.add((evt) => {
      if (evt.type === PointerEventTypes.POINTERDOWN) {
        pointerX = Math.round(evt.event.clientX)
        pointerY = Math.round(evt.event.clientY)
        return
      }

      if (evt.type === PointerEventTypes.POINTERUP) {
        if (Math.round(evt.event.clientX) === pointerX &&
          Math.round(evt.event.clientY) === pointerY) {
          const pickingRay = this.scene.createPickingRay(pointerX, pointerY, Matrix.Identity(), this.camera)
          const hitInfo = this.scene.pickWithRay(pickingRay)
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
