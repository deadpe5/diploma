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
    Nullable,
    FluidRenderer,
    IFluidRenderingRenderObject,
    Color3,
    VertexBuffer,
    TmpVectors,
} from "@babylonjs/core";
import RenderScene from "./RenderScene";
import {
    DEFAULT_BOX_OPACITY,
    DEFAULT_DENSITY_REFERENCE,
    DEFAULT_FLUID_VELOCITY,
    DEFAULT_PARTICLES_COUNT,
    DEFAULT_PARTICLE_SIZE,
    DEFAULT_PREASURE_CONSTANT,
    DEFAULT_SMOOTHING_RADIUS,
    MAX_ACCELERATION,
    PARTICLE_RADIUS,
    SHAPE_COLLISION_RESTITUTION,
    VISCOSITY,
} from "@/constants";
import { SDFHelper } from "./SDFHelper";
import { ParticleGenerator } from "./ParticleGenerator";
import { FluidSimulator } from "./FluidSimulator";

export class FluidVisualisation {
    // Rendering
    private renderScene: RenderScene
    private scene: Scene
    private engine: Engine
    private sceneRenderObserver: Nullable<Observer<Scene>>
    private sceneKeyboardObserver: Nullable<Observer<KeyboardInfo>>
    private sceneObserver: Nullable<Observer<Scene>>
    private fluidRenderer: Nullable<FluidRenderer>
    private numParticles: number
    private shapeCollisionRestitution: number
    private particleGenerator: Nullable<ParticleGenerator>
    private fluidRenderObject: IFluidRenderingRenderObject
    private fluidSimulation: FluidSimulator

    // Collision objects
    private collisionObjectPromises: any[]
    private collisionObjects: any[]

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

    private isPaused: boolean

    constructor(renderScene: RenderScene) {
        this.renderScene = renderScene
        this.scene = renderScene.scene
        this.engine = renderScene.engine
        this.fluidRenderer = this.scene.enableFluidRenderer()
        this.numParticles = DEFAULT_PARTICLES_COUNT

        this.sceneRenderObserver = null as any
        this.sceneKeyboardObserver = null as any
        this.sceneObserver = null as any
        this.shapeCollisionRestitution = SHAPE_COLLISION_RESTITUTION
        this.particleGenerator = null
        const particleRadius = PARTICLE_RADIUS
        const camera = this.scene.activeCameras?.[0] ?? this.scene.activeCamera

        this.fluidRenderObject = this.fluidRenderer!.addCustomParticles({}, 0, false, undefined, camera!)
        this.fluidRenderObject.targetRenderer.enableBlurDepth = true;
        this.fluidRenderObject.targetRenderer.blurDepthFilterSize = 20;
        this.fluidRenderObject.targetRenderer.blurDepthNumIterations = 5;
        this.fluidRenderObject.targetRenderer.blurDepthDepthScale = 10;
        this.fluidRenderObject.targetRenderer.fluidColor = new Color3(1 - 0.5, 1 - 0.2, 1 - 0.05);
        this.fluidRenderObject.targetRenderer.density = 2.2;
        this.fluidRenderObject.targetRenderer.refractionStrength = 0.02;
        this.fluidRenderObject.targetRenderer.specularPower = 150;
        this.fluidRenderObject.targetRenderer.blurThicknessFilterSize = 10;
        this.fluidRenderObject.targetRenderer.blurThicknessNumIterations = 2;
        this.fluidRenderObject.targetRenderer.dirLight = new Vector3(2, -1, 1);
        this.fluidRenderObject.object.particleSize = particleRadius * 2 * 2;
        this.fluidRenderObject.object.particleThicknessAlpha =
            this.fluidRenderObject.object.particleSize;
        this.fluidRenderObject.object.useVelocity =
            this.fluidRenderObject.targetRenderer.useVelocity;
        this.fluidRenderObject.targetRenderer.minimumThickness =
            this.fluidRenderObject.object.particleThicknessAlpha / 2;

        this.fluidSimulation = new FluidSimulator()
        this.fluidSimulation.smoothingRadius = particleRadius * 2
        this.fluidSimulation.maxVelocity = 3
        this.particleGenerator = new ParticleGenerator(this.scene)
        this.particleGenerator.particleRadius = particleRadius

        this.boxMax = new Vector3(1, 1, 1)
        this.boxMin = new Vector3(-1, -1, -1)
        this.particleGenerator.position.y = (this.boxMin.y + this.boxMax.y) / 2

        this.isPaused = false

        this.collisionObjectPromises = []
        this.collisionObjects = []

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
        for (let i = 0; i < this.origCollisionPlanes.length; ++i) {
            const plane = this.origCollisionPlanes[i]
            this.addCollisionPlane(plane.normal, plane.d, i === this.origCollisionPlanes.length - 1 ? 0.98 : undefined)
        }

        this.angleX = 0
        this.angleY = 0
        this.autoRotateBox = false
        this.prevTransform = Matrix.Identity()
    }

    set boxOpacity(value: number) {
        this.boxMaterial.alpha = value
    }

    async run() {
        this.collisionObjects = await Promise.all(this.collisionObjectPromises);

        // Get collision meshes
        for (let i = 0; i < this.origCollisionPlanes.length; ++i) {
            this.collisionPlanes.push(this.collisionObjects[i]);
        }
        this.collisionPlanes[this.collisionPlanes.length - 1][1].disabled = true;

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
            if (this.isPaused) {
                return
            }

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

        this.fluidRenderObject.object.particleSize = DEFAULT_PARTICLE_SIZE
        this.fluidSimulation.smoothingRadius = DEFAULT_SMOOTHING_RADIUS
        this.fluidSimulation.densityReference = DEFAULT_DENSITY_REFERENCE
        this.fluidSimulation.pressureConstant = DEFAULT_PREASURE_CONSTANT
        this.fluidSimulation.viscosity = VISCOSITY * 2
        this.fluidSimulation.maxVelocity = DEFAULT_FLUID_VELOCITY
        this.fluidSimulation.maxAcceleration = MAX_ACCELERATION

        await this.generateParticles()

        this.sceneObserver = this.scene.onBeforeRenderObservable.add(() => {
            this.fluidSimulation.currentNumParticles = Math.min(this.numParticles, this.particleGenerator!.currNumParticles)
            this.fluidRenderObject.object.setNumParticles(this.fluidSimulation.currentNumParticles)

            if (!this.isPaused) {
                this.fluidSimulation.update(1 / 100)
                this.checkCollisions(this.fluidRenderObject.object.particleSize / 2)
            }

            if (this.fluidRenderObject &&
                this.fluidRenderObject.object.vertexBuffers['position']) {
                this.fluidRenderObject.object.vertexBuffers['position'].updateDirectly(this.fluidSimulation.positions!, 0)
                this.fluidRenderObject.object.vertexBuffers['velocity'].updateDirectly(this.fluidSimulation.velocities!, 0)
            }
        })
    }

    public addCollisionPlane(normal: Vector3, d: number, collisionRestitution: number | undefined) {
        const collisionShape = {
            params: [normal.clone(), d],
            sdEvaluate: SDFHelper.SDPlane,
            computeNormal: SDFHelper.ComputeSDFNormal,
            mesh: null,
            position: new Vector3(0, 0, 0),
            rotation: new Vector3(0, 0, 0),
            transf: Matrix.Identity(),
            scale: 1,
            invTransf: Matrix.Identity(),
            dragPlane: null,
            collisionRestitution,
        }

        const promise = Promise.resolve([null, collisionShape])
        this.collisionObjectPromises.push(promise)
        return promise
    }

    public rotateMeshes(angleX: number, angleY: number) {
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

        this.collisionPlanes[this.origCollisionPlanes.length - 1][1].params[1] = Math.abs(yMin) + 0.02
        for (let i = 0; i < this.origCollisionPlanes.length - 1; ++i) {
            const plane = this.origCollisionPlanes[i].transform(transform)
            this.collisionPlanes[i][1].params = [plane.normal, plane.d]
        }

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
        this.isPaused = value
        if (value) {
            this.autoRotateBox = false
        }
    }

    public restart() {
        this.angleX = 0
        this.angleY = 0
        this.autoRotateBox = false
        this.rotateMeshes(0, 0)
        this.generateParticles()
    }

    public onAutoRotate(value: boolean) {
        this.autoRotateBox = value
    }

    public onCheckBounds(value: boolean) {
        this.boxMesh?.setEnabled(value)
        this.boxMeshFront?.setEnabled(value)

        for (let i = 0; i < this.collisionPlanes.length; ++i) {
            this.collisionPlanes[i][1].disabled =
                (!value && i < this.collisionPlanes.length - 1) ||
                (value && i === this.collisionPlanes.length - 1)
        }

        if (!value) {
            this.autoRotateBox = false
        }
    }

    public dispose() {
        while (this.collisionObjects.length > 1) {
            this.disposeCollisionObject(0)
        }
        this.scene.onBeforeRenderObservable.remove(this.sceneRenderObserver)
        this.scene.onBeforeRenderObservable.remove(this.sceneObserver)
        this.scene.onKeyboardObservable.remove(this.sceneKeyboardObserver)
        this.boxMesh?.dispose()
        this.boxMeshFront?.dispose()
        this.boxMaterial?.dispose()
        this.boxMaterialFront?.dispose()
    }

    public disposeCollisionObject(index: number) {
        const shape = this.collisionObjects[index][1]
        shape?.mesh?.material?.dispose()
        shape?.mesh?.dispose()
        this.collisionObjects.splice(index, 1)
        this.collisionObjectPromises.splice(index, 1)
    }

    private async generateParticles(regenerateAll: boolean = true) {
        await this.particleGenerator?.generateParticles(this.numParticles, regenerateAll)

        if (this.fluidSimulation &&
            this.particleGenerator &&
            this.fluidSimulation.positions !== this.particleGenerator.positions) {
            this.fluidSimulation.setParticleData(this.particleGenerator.positions, this.particleGenerator.velocities)

            this.fluidRenderObject.object.vertexBuffers['position']?.dispose()
            this.fluidRenderObject.object.vertexBuffers['velocity']?.dispose()

            this.fluidRenderObject.object.vertexBuffers['position'] =
                new VertexBuffer(this.engine, this.fluidSimulation.positions!, VertexBuffer.PositionKind, true, false, 3, true)

            this.fluidRenderObject.object.vertexBuffers['velocity'] =
                new VertexBuffer(this.engine, this.fluidSimulation.velocities!, 'velocity', true, false, 3, true)
        }
    }

    private checkCollisions(particleRadius: number) {
        if (this.collisionObjects.length === 0) {
            return
        }

        const positions = this.fluidSimulation.positions!
        const velocities = this.fluidSimulation.velocities!
        const tmpQuat = TmpVectors.Quaternion[0]
        const tmpScale = TmpVectors.Vector3[0]
        tmpScale.copyFromFloats(1, 1, 1)

        for (let i = 0; i < this.collisionObjects.length; ++i) {
            const shape = this.collisionObjects[i][1]
            const quat = shape.mesh?.rotationQuaternion ??
                shape.rotationQuaternion ??
                Quaternion.FromEulerAnglesToRef(
                    shape.mesh?.rotation.x ?? shape.rotation.x,
                    shape.mesh?.rotation.y ?? shape.rotation.y,
                    shape.mesh?.rotation.z ?? shape.rotation.z,
                    tmpQuat
                )

            Matrix.ComposeToRef(tmpScale, quat, shape.mesh?.position ?? shape.position, shape.transf)
            shape.transf.invertToRef(shape.invTransf)
        }

        const pos = TmpVectors.Vector3[4]
        const normal = TmpVectors.Vector3[7]
        for (let a = 0; a < this.fluidSimulation.currentNumParticles; ++a) {
            const px = positions[a * 3 + 0]
            const py = positions[a * 3 + 1]
            const pz = positions[a * 3 + 2]
            for (let i = 0; i < this.collisionObjects.length; ++i) {
                const shape = this.collisionObjects[i][1]
                if (shape.disabled) {
                    continue
                }

                pos.copyFromFloats(px, py, pz)
                Vector3.TransformCoordinatesToRef(pos, shape.invTransf, pos)
                pos.scaleInPlace(1 / shape.scale)
                const dist = shape.scale * shape.sdEvaluate(pos, ...shape.params) - particleRadius

                if (dist < 0) {
                    shape.computeNormal(pos, shape, normal)
                    const restitution = shape.collisionRestitution ?? this.shapeCollisionRestitution
                    const dotvn =
                        velocities[a * 3 + 0] * normal.x +
                        velocities[a * 3 + 1] * normal.y +
                        velocities[a * 3 + 2] * normal.z

                    velocities[a * 3 + 0] = (velocities[a * 3 + 0] - 2 * dotvn * normal.x) * restitution
                    velocities[a * 3 + 1] = (velocities[a * 3 + 1] - 2 * dotvn * normal.y) * restitution
                    velocities[a * 3 + 2] = (velocities[a * 3 + 2] - 2 * dotvn * normal.z) * restitution

                    positions[a * 3 + 0] -= normal.x * dist
                    positions[a * 3 + 1] -= normal.y * dist
                    positions[a * 3 + 2] -= normal.z * dist
                }
            }
        }

    }
}