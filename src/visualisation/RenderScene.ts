import {
  Engine,
  Scene,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color4,
  Texture,
  Vector4,
  HemisphericLight,
  Matrix,
  GizmoManager,
  PointerEventTypes
} from '@babylonjs/core'
import RenderCamera from './CameraWrapper'
import { useVisualisationStore } from '@/stores/visualisationStore'

class RenderScene {
  private readonly canvas: HTMLCanvasElement
  private readonly engine: Engine
  private readonly scene: Scene
  private readonly camera: RenderCamera
  private readonly gizmoManager: GizmoManager
  private readonly visualisationStore = useVisualisationStore()

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.engine = new Engine(this.canvas)
    this.scene = new Scene(this.engine)
    this.gizmoManager = new GizmoManager(this.scene, 2)
    this.gizmoManager.positionGizmoEnabled = true
    this.gizmoManager.rotationGizmoEnabled = true
    this.gizmoManager.enableAutoPicking = false

    this.canvas.addEventListener('wheel', (evt) => evt.preventDefault())
    this.scene.clearColor = new Color4(1, 1, 1, 1)

    this.camera = new RenderCamera(this.scene, this.canvas)
    
    // TODO remove later
    new HemisphericLight('light', new Vector3(1, 1, 0), this.scene)

    this.addTestCube()

    this.engine.runRenderLoop(() => {
      this.scene.render()
    })

    if (window) {
      const resize = () => {
        this.scene.getEngine().resize()
      }

      window.addEventListener('resize', resize)
    }

    this.addOnPointerObservable()
  }

  changView(view: string) {
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

  addTestCube() {
    const material = new StandardMaterial('materialForTestCube')
    const texture = new Texture('https://assets.babylonjs.com/environments/numbers.jpg')
    material.diffuseTexture = texture

    const columns = 6
    const rows = 1
    const faceUV = new Array(6)

    for (let i = 0; i < columns; ++i) {
      faceUV[i] = new Vector4(i / columns, 0, (i + 1) / columns, 1 / rows)
    }

    const options = {
      faceUV: faceUV,
      wrap: true
    }

    const box = MeshBuilder.CreateBox('box', options, this.scene)
    box.material = material
  }

  getScene(): Scene {
    return this.scene
  }

  getActiveCamera(): RenderCamera {
    return this.camera
  }

  private addOnPointerObservable() {
    let pointerX = 0
    let pointerY = 0
    this.scene.onPointerObservable.add((evt) => {
      if (evt.type === PointerEventTypes.POINTERDOWN) {
        pointerX = evt.event.clientX
        pointerY = evt.event.clientY
        return
      }

      if (evt.type === PointerEventTypes.POINTERUP) {
        if (pointerX === evt.event.clientX &&
          pointerY === evt.event.clientY) {
          const pickingRay = this.scene.createPickingRay(pointerX, pointerY, Matrix.Identity(), this.camera)
          const hitInfo = this.scene.pickWithRay(pickingRay)
          if (hitInfo && hitInfo.hit) {
            this.gizmoManager.attachToMesh(hitInfo.pickedMesh)
            this.visualisationStore.selectedMesh = hitInfo.pickedMesh
          }
          else if (this.visualisationStore.deselectable) {
            this.visualisationStore.selectedMesh = null
            this.gizmoManager.attachToMesh(null)
          }
        }
      }

    })
  }
}

export default RenderScene
