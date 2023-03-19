import { ArcRotateCamera, Vector3, type Scene, Animation } from '@babylonjs/core'

class CameraWrapper {
  private readonly camera: ArcRotateCamera
  private readonly scene: Scene

  constructor(scene: Scene, canvas: HTMLCanvasElement) {
    this.camera = new ArcRotateCamera('camera', Math.PI / 4, Math.PI / 3, 10, Vector3.Zero(), scene)
    this.scene = scene
    this.camera.attachControl(canvas, true)
  }

  public rotateCamera(alpha: number, beta: number) {
    const speed = 75
    const framesCount = 60

    const currentAlpha = this.camera.alpha
    const currentBeta = this.camera.beta

    Animation.CreateAndStartAnimation(
      'camAlpha',
      this.camera,
      'alpha',
      speed,
      framesCount,
      currentAlpha,
      alpha,
      0,
      undefined,
      undefined,
      this.scene
    )

    Animation.CreateAndStartAnimation(
      'camBeta',
      this.camera,
      'beta',
      speed,
      framesCount,
      currentBeta,
      beta,
      0,
      undefined,
      undefined,
      this.scene
    )
  }

  public zoomToFit() {
    let maximumRadius = 0
    for (const mesh of this.scene.meshes) {
      const boundingSphere = mesh.getBoundingInfo().boundingSphere
      const distanceToCenter = Vector3.Distance(Vector3.ZeroReadOnly, boundingSphere.centerWorld)
      maximumRadius = Math.max(maximumRadius, distanceToCenter + boundingSphere.radiusWorld)
    }

    const aspectRatio = this.scene.getEngine().getAspectRatio(this.camera)
    let halfMinFov = this.camera.fov / 2
    if (aspectRatio < 1) {
      halfMinFov = Math.atan(aspectRatio * Math.tan(halfMinFov))
    }
    const viewRadius = Math.abs(maximumRadius / Math.sin(halfMinFov))
    this.camera.radius = viewRadius
  }
}

export default CameraWrapper
