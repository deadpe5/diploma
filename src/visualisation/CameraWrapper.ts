import { useVisualisationStore } from '@/stores/visualisationStore'
import { ArcRotateCamera, Vector3, type Scene, Animation, BoundingInfo } from '@babylonjs/core'

class RenderCamera extends ArcRotateCamera{
  private readonly visualisationStore = useVisualisationStore()

  constructor(scene: Scene, canvas: HTMLCanvasElement) {
    super('camera', Math.PI / 4, Math.PI / 3, 10, Vector3.Zero(), scene)
    this.fov = (60 * Math.PI) / 180
    this.lowerRadiusLimit = 1.618
    this.upperRadiusLimit = this.lowerRadiusLimit * 20
    this.attachControl(canvas, true)
    this.inputs.remove(this.inputs.attached.keyboard);
  }

  public rotateCamera(alpha: number, beta: number) {
    const speed = 75
    const framesCount = 60

    const currentAlpha = this.alpha
    const currentBeta = this.beta

    Animation.CreateAndStartAnimation(
      'camAlpha',
      this,
      'alpha',
      speed,
      framesCount,
      currentAlpha,
      alpha,
      0,
      undefined,
      undefined,
      this.getScene()
    )

    Animation.CreateAndStartAnimation(
      'camBeta',
      this,
      'beta',
      speed,
      framesCount,
      currentBeta,
      beta,
      0,
      undefined,
      undefined,
      this.getScene()
    )
  }

  public zoomToFit() {
    let maxVec = new Vector3(-Infinity, -Infinity, -Infinity);
    let minVec = new Vector3(Infinity, Infinity, Infinity);

    if (this.visualisationStore.sceneItems.length !== 0) {
      for (const mesh of this.visualisationStore.sceneItems) {
        const meshBoundingBox = mesh.getBoundingInfo().boundingBox
        minVec = Vector3.Minimize(meshBoundingBox.minimumWorld, minVec)
        maxVec = Vector3.Maximize(meshBoundingBox.maximumWorld, maxVec)
      }
    } else {
      minVec = Vector3.One().scale(-1)
      maxVec = Vector3.One()
    }

    const sceneBoundingInfo = new BoundingInfo(minVec, maxVec)
    const sceneBoundingSphere = sceneBoundingInfo.boundingSphere

    const aspectRatio = this.getScene().getEngine().getAspectRatio(this)
    let halfMinFov = this.fov / 2
    if (aspectRatio < 1) {
      halfMinFov = Math.atan(aspectRatio * Math.tan(halfMinFov))
    }
    const viewRadius = Math.abs(sceneBoundingSphere.radiusWorld / Math.sin(halfMinFov))
    const currentAlpha = this.alpha
    const currentBeta = this.beta
    
    this.setTarget(sceneBoundingSphere.centerWorld)
    this.alpha = currentAlpha
    this.beta = currentBeta
    this.radius = viewRadius
    
  }

  public zoomToFitAddMesh() {
    const meshToAdd = this.visualisationStore.meshToAdd
    if (!meshToAdd) {
      return
    }

    meshToAdd.position.y = 1000
    const boundingSphere = meshToAdd.getBoundingInfo().boundingSphere
    const aspectRatio = this.getScene().getEngine().getAspectRatio(this)
    let halfMinFov = this.fov / 2
    if (aspectRatio < 1) {
      halfMinFov = Math.atan(aspectRatio * Math.tan(halfMinFov))
    }
    const viewRadius = 1.618 * Math.abs(boundingSphere.radiusWorld / Math.sin(halfMinFov))
    const currentAlpha = this.alpha
    const currentBeta = this.beta
    
    this.setTarget(meshToAdd.position.clone())

    this.alpha = currentAlpha
    this.beta = currentBeta
    this.radius = viewRadius
  }
}

export default RenderCamera
