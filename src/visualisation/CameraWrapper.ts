import { ArcRotateCamera, Vector3, type Scene, Animation, BoundingInfo } from '@babylonjs/core'

class RenderCamera extends ArcRotateCamera{

  constructor(scene: Scene, canvas: HTMLCanvasElement) {
    super('camera', -Math.PI / 4, Math.PI / 3, 10, Vector3.Zero(), scene)
    this.upVector = new Vector3(0, 0, 1)
    this.attachControl(canvas, true)
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

    for (const mesh of this.getScene().meshes) {
      const meshBoundingBox = mesh.getBoundingInfo().boundingBox
      minVec = Vector3.Minimize(meshBoundingBox.minimumWorld, minVec)
      maxVec = Vector3.Maximize(meshBoundingBox.maximumWorld, maxVec)
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
}

export default RenderCamera
