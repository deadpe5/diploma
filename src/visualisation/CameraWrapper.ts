import { ArcRotateCamera, Vector3, type Scene, Animation } from '@babylonjs/core'

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
    let maximumRadius = 0
    for (const mesh of this.getScene().meshes) {
      const boundingSphere = mesh.getBoundingInfo().boundingSphere
      const distanceToCenter = Vector3.Distance(Vector3.ZeroReadOnly, boundingSphere.centerWorld)
      maximumRadius = Math.max(maximumRadius, distanceToCenter + boundingSphere.radiusWorld)
    }

    const aspectRatio = this.getScene().getEngine().getAspectRatio(this)
    let halfMinFov = this.fov / 2
    if (aspectRatio < 1) {
      halfMinFov = Math.atan(aspectRatio * Math.tan(halfMinFov))
    }
    const viewRadius = Math.abs(maximumRadius / Math.sin(halfMinFov))
    this.radius = viewRadius
  }
}

export default RenderCamera
