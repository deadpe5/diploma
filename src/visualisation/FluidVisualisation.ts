import {
    Scene,
    Engine,
    Vector3,
    Mesh,
    Plane,
    PBRMaterial,
    MeshBuilder,
    Matrix,
    Quaternion,
    KeyboardEventTypes,
    Observer,
    KeyboardInfo,
    Nullable
} from "@babylonjs/core";
import RenderScene from "./RenderScene";
import { DEFAULT_BOX_OPACITY } from "@/constants";

// TODO: in constuctor add FluidSimulatiom class
export class FluidVisualisation {
    // Rendering
    private renderScene: RenderScene
    private scene: Scene
    private engine: Engine
    private sceneRenderObserver: Nullable<Observer<Scene>>
    private sceneKeyboardObserver: Nullable<Observer<KeyboardInfo>>

    // Bounding Box
    private boxMin: Vector3
    private boxMax: Vector3
    private boxMesh: Mesh
    private boxMeshFront: Mesh
    private boxMaterial: PBRMaterial
    private boxMaterialFront: PBRMaterial
    private origCollisionPlanes: Plane[]
    private collisionPlanes: any[]

    // Box rotation
    private angleX: number
    private angleY: number
    private autoRotateBox: boolean
    private prevTransform: Matrix

    private paused: boolean
    private checkBounds: boolean

    constructor(renderScene: RenderScene) {
        this.renderScene = renderScene
        this.scene = renderScene.scene
        this.engine = renderScene.engine
        this.sceneRenderObserver = null as any
        this.sceneKeyboardObserver = null as any

        this.paused = false
        this.checkBounds = true

        this.boxMax = new Vector3(1, 1, 1)
        this.boxMin = new Vector3(-1, -1, -1)
        this.boxMesh = null as any
        this.boxMeshFront = null as any
        this.boxMaterial = null as any
        this.boxMaterialFront = null as any
        this.origCollisionPlanes = [
            new Plane(0, 0, -1, Math.abs(this.boxMax.z)),
            new Plane(0, 0, 1, Math.abs(this.boxMin.z)),
            new Plane(1, 0, 0, Math.abs(this.boxMin.x)),
            new Plane(-1, 0, 0, Math.abs(this.boxMax.x)),
            new Plane(0, -1, 0, Math.abs(this.boxMax.y)),
            new Plane(0, 1, 0, Math.abs(this.boxMin.y)),
            new Plane(0, 1, 0, Math.abs(this.boxMin.y)),
        ]
        this.collisionPlanes = []

        this.angleX = 0
        this.angleY = 0
        this.autoRotateBox = false
        this.prevTransform = Matrix.Identity()
    }

    set boxOpacity(value: number) {
        this.boxMaterial.alpha = value
    }

    run() {
        // Box mesh
        this.boxMaterial = new PBRMaterial('boxMeshMat', this.scene)
        this.boxMaterial.metallic = 0.3
        this.boxMaterial.roughness = 0
        this.boxMaterial.alpha = DEFAULT_BOX_OPACITY
        this.boxMaterial.backFaceCulling = false
        this.boxMaterial.cullBackFaces = false
        this.boxMaterialFront = this.boxMaterial.clone('boxMeshFrontMat')
        this.boxMaterialFront.cullBackFaces = true

        this.boxMesh = MeshBuilder.CreateBox('boxMesh', {
            width: this.boxMax.x - this.boxMin.x,
            height: this.boxMax.y - this.boxMin.y,
            depth: this.boxMax.z - this.boxMin.z,
        })
        this.boxMesh.material = this.boxMaterial
        this.boxMesh.position.x = (this.boxMax.x + this.boxMin.x) / 2
        this.boxMesh.position.y = (this.boxMax.y + this.boxMin.y) / 2
        this.boxMesh.position.z = (this.boxMax.z + this.boxMin.z) / 2
        this.boxMesh.isPickable = false

        this.boxMeshFront = this.boxMesh.clone('boxMeshFront')
        this.boxMeshFront.material = this.boxMaterialFront
        this.boxMeshFront.layerMask = 0x10000000

        // Keyboard handling
        let arrowLeftDown = false
        let arrowRightDown = false
        let arrowUpDown = false
        let arrowDownDown = false
        this.sceneKeyboardObserver = this.scene.onKeyboardObservable.add(keyboardInfo => {
            switch (keyboardInfo.type) {
                case KeyboardEventTypes.KEYDOWN:
                    if (keyboardInfo.event.code === 'ArrowLeft') {
                        arrowLeftDown = true
                    }
                    if (keyboardInfo.event.code === 'ArrowRight') {
                        arrowRightDown = true
                    }
                    if (keyboardInfo.event.code === 'ArrowUp') {
                        arrowUpDown = true
                    }
                    if (keyboardInfo.event.code === 'ArrowDown') {
                        arrowDownDown = true
                    }
                    break
                case KeyboardEventTypes.KEYUP:
                    if (keyboardInfo.event.code === 'ArrowLeft') {
                        arrowLeftDown = false
                    }
                    if (keyboardInfo.event.code === 'ArrowRight') {
                        arrowRightDown = false
                    }
                    if (keyboardInfo.event.code === 'ArrowUp') {
                        arrowUpDown = false
                    }
                    if (keyboardInfo.event.code === 'ArrowDown') {
                        arrowDownDown = false
                    }
                    break
            }
        })

        this.sceneRenderObserver = this.scene.onBeforeRenderObservable.add(() => {
            if (arrowLeftDown) {
                this.angleX += (2 * 30) / 60
                this.rotateMeshes(this.angleX, this.angleY)
            }

            if (arrowRightDown) {
                this.angleX -= (2 * 30) / 60
                this.rotateMeshes(this.angleX, this.angleY)
            }

            if (arrowUpDown) {
                this.angleY -= (2 * 30) / 60
                this.rotateMeshes(this.angleX, this.angleY)
            }

            if (arrowDownDown) {
                this.angleY += (2 * 30) / 60
                this.rotateMeshes(this.angleX, this.angleY)
            }

            if (this.autoRotateBox) {
                const fps = this.engine.getFps()
                this.angleX += 20 / fps
                this.angleY += 30 / fps
                this.rotateMeshes(this.angleX, this.angleY)
            }
        })

        // TODO: fluid simulation
    }

    rotateMeshes(angleX: number, angleY: number) {
        const transform = Matrix.RotationYawPitchRoll(0, angleX * Math.PI / 180, angleY * Math.PI / 180)
        const boxVertices = [
            new Vector3(this.boxMin.x, this.boxMin.y, this.boxMin.z),
            new Vector3(this.boxMin.x, this.boxMax.y, this.boxMin.z),
            new Vector3(this.boxMin.x, this.boxMax.y, this.boxMax.z),
            new Vector3(this.boxMin.x, this.boxMin.y, this.boxMax.z),
            new Vector3(this.boxMax.x, this.boxMin.y, this.boxMin.z),
            new Vector3(this.boxMax.x, this.boxMax.y, this.boxMin.z),
            new Vector3(this.boxMax.x, this.boxMax.y, this.boxMax.z),
            new Vector3(this.boxMax.x, this.boxMin.y, this.boxMax.z),
        ]

        let yMin = Number.MAX_VALUE
        for (const boxVertex of boxVertices) {
            const v = Vector3.TransformCoordinates(boxVertex, transform)
            yMin = Math.min(yMin, v.y)
        }

        // this.collisionPlanes[this.origCollisionPlanes.length - 1][1].params[1] = Math.abs(yMin) + 0.02
        // for (let i = 0; i < this.origCollisionPlanes.length - 1; ++i) {
        //     const plane = this.origCollisionPlanes[i].transform(transform)
        //     this.collisionPlanes[i][1].params = [plane.normal, plane.d]
        // }

        // TODO: Add rotation to all items?

        const quat = Quaternion.FromRotationMatrix(transform)
        if (this.boxMesh && this.boxMeshFront) {
            this.boxMesh.rotationQuaternion = quat
            this.boxMeshFront.rotationQuaternion = quat
            this.boxMesh.position.x = (this.boxMin.x + this.boxMax.x) / 2
            this.boxMesh.position.y = (this.boxMin.y + this.boxMax.y) / 2
            this.boxMesh.position.z = (this.boxMin.z + this.boxMax.z) / 2
            this.boxMesh.position = Vector3.TransformCoordinates(this.boxMesh.position, transform)
            this.boxMeshFront.position = this.boxMesh.position
        }
        this.prevTransform.copyFrom(transform)
    }

    public onPaused(value: boolean) {
        this.paused = value
        if (value) {
            this.autoRotateBox = false
        }
    }

    public restart() {
        this.angleX = 0
        this.angleY = 0
        this.autoRotateBox = false
        this.rotateMeshes(0, 0)
        // generate particles
    }

    public onAutoRotate(value: boolean) {
        this.autoRotateBox = value
    }

    public onCheckBounds(value: boolean) {
        this.checkBounds = value
        this.boxMesh?.setEnabled(value)
        this.boxMeshFront?.setEnabled(value)

        // for (let i = 0; i < this.collisionPlanes.length; ++i) {
        //     this.collisionPlanes[i][1].disabled =
        //         (!value && i < this.collisionPlanes.length - 1) ||
        //         (value && i === this.collisionPlanes.length - 1)
        // }

        if (!value) {
            this.autoRotateBox = false
        }
    }

    dispose() {
        this.scene.onBeforeRenderObservable.remove(this.sceneRenderObserver)
        this.scene.onKeyboardObservable.remove(this.sceneKeyboardObserver)
        this.boxMesh?.dispose()
        this.boxMeshFront?.dispose()
        this.boxMaterial?.dispose()
        this.boxMaterialFront?.dispose()
    }
}