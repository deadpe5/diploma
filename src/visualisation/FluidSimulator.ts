import { ComputeShader, Constants, Engine, Matrix, Nullable, Quaternion, StorageBuffer, TmpVectors, UniformBuffer, Vector3 } from "@babylonjs/core"
import { Hash } from "./Hash"
import { IParticleData } from "./types"
import {
    DEFAULT_DENSITY_REFERENCE,
    GRAVITY,
    DEFAULT_PRESSURE_CONSTANT,
    VISCOSITY,
    MAX_ACCELERATION,
    MAX_VELOCITY,
    MIN_TIME_STEP,
    SHAPE_COLLISION_RESTITUTION
} from "@/constants"
import { useVisualisationStore } from "@/stores/visualisationStore"

export class FluidSimulator {
    private engine: Engine
    private _particles: IParticleData[]
    private _numMaxParticles: number
    private _positions: Float32Array | undefined
    private _velocities: Float32Array | undefined
    private _hash: Hash
    private _smoothingRadius2: number
    private _poly6Constant: number
    private _spikyConstant: number
    private _viscConstant: number
    private _smoothingRadius: number = 0.2
    private visualisationStore = useVisualisationStore()
    private shapeCollisionRestitution: number

    private computeParams: Nullable<UniformBuffer> = null;
    private updateParams: Nullable<UniformBuffer> = null;
    private collisionParams: Nullable<UniformBuffer> = null;
    private _particlesArray: number[]
    private _particlesStorageBuffer: Nullable<StorageBuffer> = null;
    private _positionsStorageBuffer: Nullable<StorageBuffer> = null;
    private _velocitiesStorageBuffer: Nullable<StorageBuffer> = null;
    private _computeDensityAndPressureCS: Nullable<ComputeShader> = null;
    private _computeAccelerationCS: Nullable<ComputeShader> = null;
    private _updatePositionsCS: Nullable<ComputeShader> = null;
    private _checkCollisionsPlaneCS: Nullable<ComputeShader> = null;
    private _checkCollisionsBoxCS: Nullable<ComputeShader> = null;
    private _checkCollisionsSphereCS: Nullable<ComputeShader> = null;
    private _checkCollisionsCylinderCS: Nullable<ComputeShader> = null;

    get smoothingRadius() {
        return this._smoothingRadius
    }

    set smoothingRadius(radius: number) {
        this._smoothingRadius = radius
        this.computeConstants()
        this.updateParamBuffers()
    }

    public densityReference: number = DEFAULT_DENSITY_REFERENCE
    public pressureConstant: number = DEFAULT_PRESSURE_CONSTANT
    public viscosity: number = VISCOSITY
    public gravity: Vector3 = GRAVITY.clone()
    public minTimeStep: number = MIN_TIME_STEP
    public maxVelocity: number = MAX_VELOCITY
    public maxAcceleration: number = MAX_ACCELERATION
    public currentNumParticles: number
    private _mass: number

    get mass() {
        return this._mass
    }

    set mass(m: number) {
        if (this.visualisationStore.useWebGPU) {
            for (let i = 0; i < this._particlesArray.length; i += 6) {
                this._particlesArray[i] = m
            }

            this._particlesStorageBuffer?.update(this._particlesArray)
        } else {
            for (const particle of this._particles) {
                particle.mass = m
            }
        }
    }

    private computeConstants() {
        this._smoothingRadius2 = this._smoothingRadius * this._smoothingRadius
        this._poly6Constant =
            315 / (64 * Math.PI * Math.pow(this._smoothingRadius, 9))
        this._spikyConstant =
            -45 / (Math.PI * Math.pow(this._smoothingRadius, 6))
        this._viscConstant =
            45 / (Math.PI * Math.pow(this._smoothingRadius, 6))
        this._hash = new Hash(this._smoothingRadius, this._numMaxParticles)
    }

    private updateParamBuffers(deltaTime?: number) {
        if (
            !this.visualisationStore.useWebGPU || 
            !this.computeParams ||
            !this.updateParams ||
            !this.collisionParams
        ) {
            return
        }

        this.computeParams.updateFloat('pressureConstant', this.pressureConstant)
        this.computeParams.updateFloat('densityReference', this.densityReference)
        this.computeParams.updateFloat('smoothingRadius2', this._smoothingRadius2)
        this.computeParams.updateFloat('smoothingRadius', this.smoothingRadius)
        this.computeParams.updateFloat('poly6Constant', this._poly6Constant)
        this.computeParams.updateFloat('spikyConstant', this._spikyConstant)
        this.computeParams.updateFloat('viscConstant', this._viscConstant)
        this.computeParams.updateUInt('currentNumParticles', this.currentNumParticles)
        this.computeParams.updateVector3('gravity', this.gravity)
        this.computeParams.updateFloat('maxAcceleration', this.maxAcceleration)
        this.computeParams.updateFloat('viscosity', this.viscosity)
        this.computeParams.update()

        this.updateParams.updateFloat('deltaTime', deltaTime ? deltaTime : 1 / 100)
        this.updateParams.updateFloat('maxVelocity', this.maxVelocity)
        this.updateParams.updateUInt('currentNumParticles', this.currentNumParticles)
        this.updateParams.update()

        this.collisionParams.updateFloat('deltaTime', deltaTime ? deltaTime : 1 / 100)
        this.collisionParams.updateFloat('maxVelocity', this.maxVelocity)
        this.collisionParams.updateUInt('currentNumParticles', this.currentNumParticles)
        this.collisionParams.update()
    }

    get positions() {
        return this._positions
    }

    get velocities() {
        return this._velocities
    }

    get positionsBuffer() {
        return this._positionsStorageBuffer
    }

    get velocitiesBuffer() {
        return this._velocitiesStorageBuffer
    }

    get numMaxParticles() {
        return this._numMaxParticles
    }

    setParticleData(positions: Float32Array, velocities: Float32Array) {
        this._positions = positions ?? new Float32Array()
        this._velocities = velocities ?? new Float32Array()

        this._numMaxParticles = this._positions.length / 3

        if (this.visualisationStore.useWebGPU) {
            this._positionsStorageBuffer?.dispose()
            this._positionsStorageBuffer = new StorageBuffer(this.engine, this._positions!.byteLength, Constants.BUFFER_CREATIONFLAG_VERTEX | Constants.BUFFER_CREATIONFLAG_READWRITE)
            this._positionsStorageBuffer.update(this._positions!)
            this._velocitiesStorageBuffer?.dispose()
            this._velocitiesStorageBuffer = new StorageBuffer(this.engine, this._velocities!.byteLength, Constants.BUFFER_CREATIONFLAG_VERTEX | Constants.BUFFER_CREATIONFLAG_READWRITE)
            this._velocitiesStorageBuffer.update(this._velocities!)

            for (let i = this._particlesArray.length / 6; i < this._numMaxParticles; ++i) {
                for (let j = 0; j < 6; ++j) {
                    this._particlesArray.push(j === 0 ? this.mass : 0)
                }
            }

            this._particlesStorageBuffer?.dispose()
            this._particlesStorageBuffer = new StorageBuffer(this.engine, 4 * this._particlesArray.length, Constants.BUFFER_CREATIONFLAG_VERTEX | Constants.BUFFER_CREATIONFLAG_READWRITE)
            this._particlesStorageBuffer.update(this._particlesArray)

            this._computeDensityAndPressureCS = new ComputeShader(
                'computeDensityAndPressure',
                this.engine,
                { computeSource: this.computeDensityAndPressureShader },
                {
                    bindingsMapping: {
                        "params": { group: 0, binding: 0 },
                        "positions": { group: 0, binding: 1 },
                        "particles": { group: 0, binding: 2 },
                    }
                }
            )

            this._computeDensityAndPressureCS.setUniformBuffer('params', this.computeParams!)
            this._computeDensityAndPressureCS.setStorageBuffer('positions', this._positionsStorageBuffer!)
            this._computeDensityAndPressureCS.setStorageBuffer('particles', this._particlesStorageBuffer!)

            this._computeAccelerationCS = new ComputeShader(
                'computeAcceleration',
                this.engine,
                { computeSource: this.computeAccelerationShader },
                {
                    bindingsMapping: {
                        "params": { group: 0, binding: 0 },
                        "positions": { group: 0, binding: 1 },
                        "velocities": { group: 0, binding: 2 },
                        "particles": { group: 0, binding: 3 },
                    }
                }
            )

            this._computeAccelerationCS.setUniformBuffer('params', this.computeParams!)
            this._computeAccelerationCS.setStorageBuffer('positions', this._positionsStorageBuffer!)
            this._computeAccelerationCS.setStorageBuffer('velocities', this._velocitiesStorageBuffer!)
            this._computeAccelerationCS.setStorageBuffer('particles', this._particlesStorageBuffer!)

            this._updatePositionsCS = new ComputeShader(
                'updatePositions',
                this.engine,
                { computeSource: this.updatePositionsShader },
                {
                    bindingsMapping: {
                        "params": { group: 0, binding: 0 },
                        "positions": { group: 0, binding: 1 },
                        "velocities": { group: 0, binding: 2 },
                        "particles": { group: 0, binding: 3 },
                    }
                }
            )

            this._updatePositionsCS.setUniformBuffer('params', this.updateParams!)
            this._updatePositionsCS.setStorageBuffer('positions', this._positionsStorageBuffer!)
            this._updatePositionsCS.setStorageBuffer('velocities', this._velocitiesStorageBuffer!)
            this._updatePositionsCS.setStorageBuffer('particles', this._particlesStorageBuffer!)
            
            this._checkCollisionsPlaneCS = new ComputeShader(
                'checkCollisionsPlane',
                this.engine,
                { computeSource: this.checkCollisionShaderPlane },
                {
                    bindingsMapping: {
                        "params": { group: 0, binding: 0 },
                        "positions": { group: 0, binding: 1 },
                        "velocities": { group: 0, binding: 2 },
                        "shape": { group: 0, binding: 3}
                    }
                }
            )

            this._checkCollisionsPlaneCS.setUniformBuffer('params', this.collisionParams!)
            this._checkCollisionsPlaneCS.setStorageBuffer('positions', this._positionsStorageBuffer!)
            this._checkCollisionsPlaneCS.setStorageBuffer('velocities', this._velocitiesStorageBuffer!)

            this._checkCollisionsBoxCS = new ComputeShader(
                'checkCollisionsBox',
                this.engine,
                { computeSource: this.checkCollisionShaderBox },
                {
                    bindingsMapping: {
                        "params": { group: 0, binding: 0 },
                        "positions": { group: 0, binding: 1 },
                        "velocities": { group: 0, binding: 2 },
                        "shape": { group: 0, binding: 3}
                    }
                }
            )

            this._checkCollisionsBoxCS.setUniformBuffer('params', this.collisionParams!)
            this._checkCollisionsBoxCS.setStorageBuffer('positions', this._positionsStorageBuffer!)
            this._checkCollisionsBoxCS.setStorageBuffer('velocities', this._velocitiesStorageBuffer!)

            this._checkCollisionsSphereCS = new ComputeShader(
                'checkCollisionsSphere',
                this.engine,
                { computeSource: this.checkCollisionShaderSphere },
                {
                    bindingsMapping: {
                        "params": { group: 0, binding: 0 },
                        "positions": { group: 0, binding: 1 },
                        "velocities": { group: 0, binding: 2 },
                        "shape": { group: 0, binding: 3}
                    }
                }
            )

            this._checkCollisionsSphereCS.setUniformBuffer('params', this.collisionParams!)
            this._checkCollisionsSphereCS.setStorageBuffer('positions', this._positionsStorageBuffer!)
            this._checkCollisionsSphereCS.setStorageBuffer('velocities', this._velocitiesStorageBuffer!)

            this._checkCollisionsCylinderCS = new ComputeShader(
                'checkCollisionsCylinder',
                this.engine,
                { computeSource: this.checkCollisionShaderCylinder },
                {
                    bindingsMapping: {
                        "params": { group: 0, binding: 0 },
                        "positions": { group: 0, binding: 1 },
                        "velocities": { group: 0, binding: 2 },
                        "shape": { group: 0, binding: 3}
                    }
                }
            )

            this._checkCollisionsCylinderCS.setUniformBuffer('params', this.collisionParams!)
            this._checkCollisionsCylinderCS.setStorageBuffer('positions', this._positionsStorageBuffer!)
            this._checkCollisionsCylinderCS.setStorageBuffer('velocities', this._velocitiesStorageBuffer!)
        } else {
            this._hash = new Hash(this._smoothingRadius, this._numMaxParticles)
            for (let i = this._particles.length; i < this._numMaxParticles; ++i) {
                this._particles.push({
                    mass: this.mass,
                    density: 0,
                    pressure: 0,
                    accelX: 0,
                    accelY: 0,
                    accelZ: 0
                })
            }
        }
    }

    constructor(engine: Engine, positions?: Float32Array, velocities?: Float32Array, mass: number = 1) {
        this.engine = engine
        this._positions = undefined
        this._velocities = undefined
        this._particles = []
        this._particlesArray = []
        this._numMaxParticles = 0
        this._mass = mass
        this.shapeCollisionRestitution = SHAPE_COLLISION_RESTITUTION

        if (positions && velocities) {
            this.setParticleData(positions, velocities)
        }

        this._hash = new Hash(this._smoothingRadius, this._numMaxParticles)
        this.currentNumParticles = this._numMaxParticles
        this._smoothingRadius2 = 0
        this._poly6Constant = 0
        this._spikyConstant = 0
        this._viscConstant = 0
        this.computeConstants()

        if (!this.visualisationStore.useWebGPU) {
            return
        }

        this.computeParams = new UniformBuffer(this.engine)

        this.computeParams.addUniform('pressureConstant', 1)
        this.computeParams.addUniform('densityReference', 1)
        this.computeParams.addUniform('smoothingRadius2', 1)
        this.computeParams.addUniform('smoothingRadius', 1)
        this.computeParams.addUniform('poly6Constant', 1)
        this.computeParams.addUniform('spikyConstant', 1)
        this.computeParams.addUniform('viscConstant', 1)
        this.computeParams.addVector3('gravity', this.gravity)
        this.computeParams.addUniform('maxAcceleration', 1)
        this.computeParams.addUniform('viscosity', 1)
        this.computeParams.addUniform('currentNumParticles', 1)

        this.updateParams = new UniformBuffer(this.engine)
        this.updateParams.addUniform('deltaTime', 1)
        this.updateParams.addUniform('maxVelocity', 1)
        this.updateParams.addUniform('currentNumParticles', 1)

        this.collisionParams = new UniformBuffer(this.engine)
        this.collisionParams.addUniform('deltaTime', 1)
        this.collisionParams.addUniform('maxVelocity', 1);
        this.collisionParams.addUniform('particleRadius', 1);
        this.collisionParams.addUniform('currentNumParticles', 1);

        this.updateParamBuffers(1 / 100)
    }

    public update(deltaTime: number, particleRadius: number, collisionObjects: any[]) {
        if (this.visualisationStore.useWebGPU) {
            this.updateParamBuffers(deltaTime)
            this._computeDensityAndPressureCS!.dispatchWhenReady(Math.ceil(this.currentNumParticles / 64))
            this._computeAccelerationCS!.dispatchWhenReady(Math.ceil(this.currentNumParticles / 64))
            this._updatePositionsCS!.dispatchWhenReady(Math.ceil(this.currentNumParticles / 64))
            this.checkCollisions(particleRadius, collisionObjects)
        } else {
            this._hash.create(this._positions!, this.currentNumParticles)
            this.computeDensityAndPressure()
            this.computeAcceleration()
            this.updatePositions(deltaTime)
            this.checkCollisions(particleRadius, collisionObjects)
        }
    }

    private computeDensityAndPressure() {
        for (let a = 0; a < this.currentNumParticles; ++a) {
            const pA = this._particles[a]
            const paX = this._positions![a * 3 + 0]
            const paY = this._positions![a * 3 + 1]
            const paZ = this._positions![a * 3 + 2]

            pA.density = 0
            this._hash.query(this._positions!, a, this._smoothingRadius)

            for (let ib = 0; ib < this._hash.querySize; ++ib) {
                const b = this._hash.queryIds[ib]

                const diffX = paX - this._positions![b * 3 + 0]
                const diffY = paY - this._positions![b * 3 + 1]
                const diffZ = paZ - this._positions![b * 3 + 2]
                const r2 = diffX * diffX + diffY * diffY + diffZ * diffZ

                if (r2 < this._smoothingRadius2) {
                    const w = this._poly6Constant * Math.pow(this._smoothingRadius2 - r2, 3)
                    pA.density += w
                }
            }

            pA.density = Math.max(this.densityReference, pA.density)
            pA.pressure = this.pressureConstant * (pA.density - this.densityReference)
        }
    }

    private computeAcceleration() {
        // Pressure-based acceleration + viscosity-based acceleration computation
        for (let a = 0; a < this.currentNumParticles; ++a) {
            const pA = this._particles[a]

            const paX = this._positions![a * 3 + 0]
            const paY = this._positions![a * 3 + 1]
            const paZ = this._positions![a * 3 + 2]

            const vaX = this._velocities![a * 3 + 0]
            const vaY = this._velocities![a * 3 + 1]
            const vaZ = this._velocities![a * 3 + 2]

            let pressureAccelX = 0
            let pressureAccelY = 0
            let pressureAccelZ = 0

            let viscosityAccelX = 0
            let viscosityAccelY = 0
            let viscosityAccelZ = 0

            this._hash.query(this._positions!, a, this._smoothingRadius)

            for (let ib = 0; ib < this._hash.querySize; ++ib) {
                const b = this._hash.queryIds[ib]
                let diffX = paX - this._positions![b * 3 + 0]
                let diffY = paY - this._positions![b * 3 + 1]
                let diffZ = paZ - this._positions![b * 3 + 2]

                const r2 = diffX * diffX + diffY * diffY + diffZ * diffZ
                const r = Math.sqrt(r2)

                if (r > 0 && r2 < this._smoothingRadius2) {
                    const pB = this._particles[b]
                    diffX /= r
                    diffY /= r
                    diffZ /= r

                    const w = this._spikyConstant *
                        (this._smoothingRadius - r) *
                        (this._smoothingRadius - r)

                    const massRatio = pB.mass / pA.mass
                    const fp = w *
                        ((pA.pressure + pB.pressure) /
                            (2 * pA.density * pB.density)) *
                        massRatio

                    pressureAccelX -= fp * diffX
                    pressureAccelY -= fp * diffY
                    pressureAccelZ -= fp * diffZ

                    const w2 = this._viscConstant * (this._smoothingRadius - r)
                    const fv = w2 * (1 / pB.density) * massRatio * this.viscosity

                    viscosityAccelX += fv * (this._velocities![b * 3 + 0] - vaX)
                    viscosityAccelY += fv * (this._velocities![b * 3 + 1] - vaY)
                    viscosityAccelZ += fv * (this._velocities![b * 3 + 2] - vaZ)
                }
            }

            pA.accelX = pressureAccelX + viscosityAccelX
            pA.accelY = pressureAccelY + viscosityAccelY
            pA.accelZ = pressureAccelZ + viscosityAccelZ

            pA.accelX += this.gravity.x
            pA.accelY += this.gravity.y
            pA.accelZ += this.gravity.z

            const mag = Math.sqrt(
                pA.accelX * pA.accelX +
                pA.accelY * pA.accelY +
                pA.accelZ * pA.accelZ
            )

            if (mag > this.maxAcceleration) {
                pA.accelX = (pA.accelX / mag) * this.maxAcceleration
                pA.accelY = (pA.accelY / mag) * this.maxAcceleration
                pA.accelZ = (pA.accelZ / mag) * this.maxAcceleration
            }
        }
    }

    private updatePositions(deltaTime: number) {
        for (let a = 0; a < this.currentNumParticles; ++a) {
            const pA = this._particles[a]
            this._velocities![a * 3 + 0] += pA.accelX * deltaTime
            this._velocities![a * 3 + 1] += pA.accelY * deltaTime
            this._velocities![a * 3 + 2] += pA.accelZ * deltaTime

            const mag = Math.sqrt(
                this._velocities![a * 3 + 0] * this._velocities![a * 3 + 0] +
                this._velocities![a * 3 + 1] * this._velocities![a * 3 + 1] +
                this._velocities![a * 3 + 2] * this._velocities![a * 3 + 2]
            )

            if (mag > this.maxVelocity) {
                this._velocities![a * 3 + 0] = (this._velocities![a * 3 + 0] / mag) * this.maxVelocity
                this._velocities![a * 3 + 1] = (this._velocities![a * 3 + 1] / mag) * this.maxVelocity
                this._velocities![a * 3 + 2] = (this._velocities![a * 3 + 2] / mag) * this.maxVelocity
            }

            this._positions![a * 3 + 0] += deltaTime * this._velocities![a * 3 + 0]
            this._positions![a * 3 + 1] += deltaTime * this._velocities![a * 3 + 1]
            this._positions![a * 3 + 2] += deltaTime * this._velocities![a * 3 + 2]
        }
    }

    private checkCollisions(particleRadius: number, collisionObjects: any[]) {
        if (collisionObjects.length === 0) {
            return
        }

        const positions = this.positions!
        const velocities = this.velocities!
        const tmpQuat = TmpVectors.Quaternion[0]
        const tmpScale = TmpVectors.Vector3[0]
        tmpScale.copyFromFloats(1, 1, 1)

        for (let i = 0; i < collisionObjects.length; ++i) {
            const shape = collisionObjects[i][1]
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

        for (let i = 0; i < collisionObjects.length; ++i) {
            const shape = collisionObjects[i][1]
            if (shape.disabled) {
                continue
            }

            if (this.visualisationStore.useWebGPU) {
                this.collisionParams!.updateFloat('particleRadius', particleRadius)
                this.collisionParams!.update()

                const restitution = shape.collisionRestitution ?? this.shapeCollisionRestitution
                // It is plane
                if (!shape.mesh) {
                    const shapeBuffer = new UniformBuffer(this.engine)
                    shapeBuffer.addUniform('restitution', 1)
                    shapeBuffer.addVector3('normal', Vector3.Zero())
                    shapeBuffer.addUniform('h', 1)
    
                    shapeBuffer.updateFloat('restitution', restitution)
                    shapeBuffer.updateVector3('normal', shape.params[0])
                    shapeBuffer.updateFloat('h', shape.params[1])
                    shapeBuffer.update()
    
                    this._checkCollisionsPlaneCS!.setUniformBuffer('shape', shapeBuffer)
                    this._checkCollisionsPlaneCS!.dispatchWhenReady(Math.ceil(this.currentNumParticles / 64))
                } else if (shape.mesh.name === 'Box') {
                    const shapeBuffer = new UniformBuffer(this.engine)
                    shapeBuffer.addUniform('restitution', 1)
                    shapeBuffer.addMatrix('transf', Matrix.Zero())
                    shapeBuffer.addMatrix('invTransf', Matrix.Zero())
                    shapeBuffer.addVector3('extend', Vector3.Zero())
    
                    shapeBuffer.updateFloat('restitution', restitution)
                    shapeBuffer.updateMatrix('transf', shape.transf)
                    shapeBuffer.updateMatrix('invTransf', shape.invTransf)
                    shapeBuffer.updateVector3('extend', shape.params[0])
                    shapeBuffer.update()
    
                    this._checkCollisionsBoxCS!.setUniformBuffer('shape', shapeBuffer)
                    this._checkCollisionsBoxCS!.dispatchWhenReady(Math.ceil(this.currentNumParticles / 64))
                } else if (shape.mesh.name === 'Sphere') {
                    const shapeBuffer = new UniformBuffer(this.engine)
                    shapeBuffer.addUniform('restitution', 1)
                    shapeBuffer.addMatrix('transf', Matrix.Zero())
                    shapeBuffer.addMatrix('invTransf', Matrix.Zero())
                    shapeBuffer.addUniform('radius', 1)
    
                    shapeBuffer.updateFloat('restitution', restitution)
                    shapeBuffer.updateMatrix('transf', shape.transf)
                    shapeBuffer.updateMatrix('invTransf', shape.invTransf)
                    shapeBuffer.updateFloat('radius', shape.params[0])
                    shapeBuffer.update()
    
                    this._checkCollisionsSphereCS!.setUniformBuffer('shape', shapeBuffer)
                    this._checkCollisionsSphereCS!.dispatchWhenReady(Math.ceil(this.currentNumParticles / 64))
                } else if (shape.mesh.name === 'Cylinder') {
                    const shapeBuffer = new UniformBuffer(this.engine)
                    shapeBuffer.addUniform('restitution', 1)
                    shapeBuffer.addMatrix('transf', Matrix.Zero())
                    shapeBuffer.addMatrix('invTransf', Matrix.Zero())
                    shapeBuffer.addUniform('radius', 1)
                    shapeBuffer.addUniform('height', 1)
    
                    shapeBuffer.updateFloat('restitution', restitution)
                    shapeBuffer.updateMatrix('transf', shape.transf)
                    shapeBuffer.updateMatrix('invTransf', shape.invTransf)
                    shapeBuffer.updateFloat('radius', shape.params[0])
                    shapeBuffer.updateFloat('height', shape.params[1])
                    shapeBuffer.update()
    
                    this._checkCollisionsCylinderCS!.setUniformBuffer('shape', shapeBuffer)
                    this._checkCollisionsCylinderCS!.dispatchWhenReady(Math.ceil(this.currentNumParticles / 64))
                }
            } else {
                for (let a = 0; a < this.currentNumParticles; ++a) {
                    const px = positions[a * 3 + 0]
                    const py = positions[a * 3 + 1]
                    const pz = positions[a * 3 + 2]
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

    private computeDensityAndPressureShader: string =
    `
        struct Partile {
            mass: f32,
            density: f32,
            pressure: f32,
            accelX: f32,
            accelY: f32,
            accelZ: f32,
        };

        struct Params {
            pressureConstant: f32,
            densityReference: f32,
            smoothingRadius2: f32,
            smoothingRadius: f32,
            poly6Constant: f32,
            spikyConstant: f32,
            viscConstant: f32,
            gravity: vec3<f32>,
            maxAcceleration: f32,
            viscosity: f32,
            currentNumParticles: u32,
        };

        @group(0) @binding(0) var<uniform> params : Params;
        @group(0) @binding(1) var<storage, read> positions : array<f32>;
        @group(0) @binding(2) var<storage, read_write> particles : array<Partile>;

        @compute @workgroup_size(64, 1, 1)
        fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
            let index = global_id.x;

            if (index >= params.currentNumParticles) {
                return;
            }
            
            let paX = positions[index * 3 + 0];
            let paY = positions[index * 3 + 1];
            let paZ = positions[index * 3 + 2];

            particles[index].density = 0;

            for (var b = 0u; b < params.currentNumParticles; b = b + 1u) {
                let diffX = paX - positions[b * 3 + 0]; 
                let diffY = paY - positions[b * 3 + 1]; 
                let diffZ = paZ - positions[b * 3 + 2];
                let r2 = diffX * diffX + diffY * diffY + diffZ * diffZ;

                if (r2 < params.smoothingRadius2) {
                    let w = params.poly6Constant * pow(params.smoothingRadius2 - r2, 3);
                    particles[index].density += w;
                }
            }

            particles[index].density = max(params.densityReference, particles[index].density);
            particles[index].pressure = params.pressureConstant * (particles[index].density - params.densityReference);
        }
    `
    private computeAccelerationShader: string =
    `
        struct Partile {
            mass: f32,
            density: f32,
            pressure: f32,
            accelX: f32,
            accelY: f32,
            accelZ: f32,
        };

        struct Params {
            pressureConstant: f32,
            densityReference: f32,
            smoothingRadius2: f32,
            smoothingRadius: f32,
            poly6Constant: f32,
            spikyConstant: f32,
            viscConstant: f32,
            gravity: vec3<f32>,
            maxAcceleration: f32,
            viscosity: f32,
            currentNumParticles: u32,
        };

        @group(0) @binding(0) var<uniform> params : Params;
        @group(0) @binding(1) var<storage, read> positions : array<f32>;
        @group(0) @binding(2) var<storage, read> velocities : array<f32>;
        @group(0) @binding(3) var<storage, read_write> particles : array<Partile>;

        @compute @workgroup_size(64, 1, 1)
        fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
            let index = global_id.x;

            if (index >= params.currentNumParticles) {
                return;
            }
            
            let paX = positions[index * 3 + 0];
            let paY = positions[index * 3 + 1];
            let paZ = positions[index * 3 + 2];

            let vaX = velocities[index * 3 + 0];
            let vaY = velocities[index * 3 + 1];
            let vaZ = velocities[index * 3 + 2];

            var pressureAccelX = f32(0);
            var pressureAccelY = f32(0);
            var pressureAccelZ = f32(0);

            var viscosityAccelX = f32(0);
            var viscosityAccelY = f32(0);
            var viscosityAccelZ = f32(0);

            for (var b = 0u; b < params.currentNumParticles; b = b + 1u) {
                var diffX = paX - positions[b * 3 + 0];
                var diffY = paY - positions[b * 3 + 1];
                var diffZ = paZ - positions[b * 3 + 2];

                let r2 = diffX * diffX + diffY * diffY + diffZ * diffZ;
                let r = sqrt(r2);

                if (r > 0 && r2 < params.smoothingRadius2) {
                    diffX /= r;
                    diffY /= r;
                    diffZ /= r;

                    let w = params.spikyConstant * (params.smoothingRadius - r) * (params.smoothingRadius - r);
                    let massRatio = particles[b].mass / particles[index].mass;
                    let fp = w * ((particles[index].pressure + particles[b].pressure) / (2 * particles[index].density * particles[b].density)) * massRatio;
                
                    pressureAccelX -= fp * diffX;
                    pressureAccelY -= fp * diffY;
                    pressureAccelZ -= fp * diffZ;

                    let w2 = params.viscConstant * (params.smoothingRadius - r);
                    let fv = w2 * (1 / particles[b].density) * massRatio * params.viscosity;

                    viscosityAccelX += fv * (velocities[b * 3 + 0] - vaX);
                    viscosityAccelY += fv * (velocities[b * 3 + 1] - vaY);
                    viscosityAccelZ += fv * (velocities[b * 3 + 2] - vaZ);
                }
            }

            particles[index].accelX = pressureAccelX + viscosityAccelX;
            particles[index].accelY = pressureAccelY + viscosityAccelY;
            particles[index].accelZ = pressureAccelZ + viscosityAccelZ;

            particles[index].accelX += params.gravity.x;
            particles[index].accelY += params.gravity.y;
            particles[index].accelZ += params.gravity.z;

            let mag = sqrt(
                particles[index].accelX * particles[index].accelX +
                particles[index].accelY * particles[index].accelY + 
                particles[index].accelZ * particles[index].accelZ
            );

            if (mag > params.maxAcceleration) {
                particles[index].accelX = (particles[index].accelX / mag) * params.maxAcceleration;
                particles[index].accelY = (particles[index].accelY / mag) * params.maxAcceleration;
                particles[index].accelZ = (particles[index].accelZ / mag) * params.maxAcceleration;
            }
        }
    `
    private updatePositionsShader: string =
    `
    struct Partile {
        mass: f32,
        density: f32,
        pressure: f32,
        accelX: f32,
        accelY: f32,
        accelZ: f32,
    };

    struct Params {
        deltaTime: f32,
        maxVelocity: f32,
        currentNumParticles: u32,
    };

    @group(0) @binding(0) var<uniform> params : Params;
    @group(0) @binding(1) var<storage, read_write> positions : array<f32>;
    @group(0) @binding(2) var<storage, read_write> velocities : array<f32>;
    @group(0) @binding(3) var<storage, read> particles : array<Partile>;

    @compute @workgroup_size(64, 1, 1)
    fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
        let index = global_id.x;

        if (index >= params.currentNumParticles) {
            return;
        }

        velocities[index * 3 + 0] += particles[index].accelX * params.deltaTime;
        velocities[index * 3 + 1] += particles[index].accelY * params.deltaTime;
        velocities[index * 3 + 2] += particles[index].accelZ * params.deltaTime;

        let mag = sqrt(
            velocities[index * 3 + 0] * velocities[index * 3 + 0] +
            velocities[index * 3 + 1] * velocities[index * 3 + 1] +
            velocities[index * 3 + 2] * velocities[index * 3 + 2]
        );

        if (mag > params.maxVelocity) {
            velocities[index * 3 + 0] = (velocities[index * 3 + 0] / mag) * params.maxVelocity;
            velocities[index * 3 + 1] = (velocities[index * 3 + 1] / mag) * params.maxVelocity;
            velocities[index * 3 + 2] = (velocities[index * 3 + 2] / mag) * params.maxVelocity;
        }

        positions[index * 3 + 0] += params.deltaTime * velocities[index * 3 + 0];
        positions[index * 3 + 1] += params.deltaTime * velocities[index * 3 + 1];
        positions[index * 3 + 2] += params.deltaTime * velocities[index * 3 + 2];
    }
    `
    private checkCollisionShaderPlane: string =
    `
    struct Params {
        deltaTime: f32,
        maxVelocity: f32,
        particleRadius: f32,
        currentNumParticles: u32,
    };

    struct Shape {
        restitution: f32,
        normal: vec3<f32>,
        h: f32
    };

    @group(0) @binding(0) var<uniform> params : Params;
    @group(0) @binding(1) var<storage, read_write> positions : array<f32>;
    @group(0) @binding(2) var<storage, read_write> velocities : array<f32>;
    @group(0) @binding(3) var<uniform> shape : Shape;

    const eps = 0.0001;
    const eps1 = vec4<f32>(eps, -eps, -eps, 1);
    const eps2 = vec4<f32>(-eps, -eps, eps, 1);
    const eps3 = vec4<f32>(-eps, eps, -eps, 1);
    const eps4 = vec4<f32>(eps, eps, eps, 1);

    const dir1 = vec4<f32>(1, -1, -1, 0);
    const dir2 = vec4<f32>(-1, -1, 1, 0);
    const dir3 = vec4<f32>(-1, 1, -1, 0);
    const dir4 = vec4<f32>(1, 1, 1, 0);

    fn computeNormal(pos: vec4<f32>) -> vec4<f32> {
        var normal = vec4<f32>(0, 0, 0, 0);

        normal += SDPlane(pos + eps1) * dir1;   
        normal += SDPlane(pos + eps2) * dir2;   
        normal += SDPlane(pos + eps3) * dir3;   
        normal += SDPlane(pos + eps4) * dir4;

        return normalize(normal);
    }

    fn SDPlane(pos: vec4<f32>) -> f32 {
        let n = vec4<f32>(shape.normal, 0);
        let h = shape.h;
        return dot(pos, n) + h;
    }

    @compute @workgroup_size(64, 1, 1)
    fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
        let index = global_id.x;

        if (index >= params.currentNumParticles) {
            return;
        }

        let px = positions[index * 3 + 0];
        let py = positions[index * 3 + 1];
        let pz = positions[index * 3 + 2];

        let pos = vec4<f32>(px, py, pz, 1);
        let dist = SDPlane(pos) - params.particleRadius;

        if (dist < 0) {
            let normal = computeNormal(pos);
            let dotvn = 
                velocities[index * 3 + 0] * normal.x +
                velocities[index * 3 + 1] * normal.y +
                velocities[index * 3 + 2] * normal.z;

            velocities[index * 3 + 0] = (velocities[index * 3 + 0] - 2 * dotvn * normal.x) * shape.restitution;
            velocities[index * 3 + 1] = (velocities[index * 3 + 1] - 2 * dotvn * normal.y) * shape.restitution;
            velocities[index * 3 + 2] = (velocities[index * 3 + 2] - 2 * dotvn * normal.z) * shape.restitution;

            positions[index * 3 + 0] -= normal.x * dist;
            positions[index * 3 + 1] -= normal.y * dist;
            positions[index * 3 + 2] -= normal.z * dist;
        }
    }
    `
    private checkCollisionShaderBox: string =
    `
    struct Params {
        deltaTime: f32,
        maxVelocity: f32,
        particleRadius: f32,
        currentNumParticles: u32,
    };

    struct Shape {
        restitution: f32,
        transf: mat4x4<f32>,
        invTransf: mat4x4<f32>,
        extend: vec3<f32>,
    };

    @group(0) @binding(0) var<uniform> params : Params;
    @group(0) @binding(1) var<storage, read_write> positions : array<f32>;
    @group(0) @binding(2) var<storage, read_write> velocities : array<f32>;
    @group(0) @binding(3) var<uniform> shape : Shape;

    const eps = 0.0001;
    const eps1 = vec4<f32>(eps, -eps, -eps, 1);
    const eps2 = vec4<f32>(-eps, -eps, eps, 1);
    const eps3 = vec4<f32>(-eps, eps, -eps, 1);
    const eps4 = vec4<f32>(eps, eps, eps, 1);

    const dir1 = vec4<f32>(1, -1, -1, 0);
    const dir2 = vec4<f32>(-1, -1, 1, 0);
    const dir3 = vec4<f32>(-1, 1, -1, 0);
    const dir4 = vec4<f32>(1, 1, 1, 0);

    fn computeNormal(pos: vec4<f32>) -> vec4<f32> {
        var normal = vec4<f32>(0, 0, 0, 0);

        normal += SDBox(pos + eps1) * dir1;   
        normal += SDBox(pos + eps2) * dir2;   
        normal += SDBox(pos + eps3) * dir3;   
        normal += SDBox(pos + eps4) * dir4;

        normal = shape.transf * normal;

        return normalize(normal);
    }

    fn SDBox(pos: vec4<f32>) -> f32 {
        var q = vec3<f32>(abs(pos.x), abs(pos.y), abs(pos.z));
        q -= shape.extend;

        let tmp = min(max(q.x, max(q.y, q.z)), 0);
        q.x = max(q.x, 0);
        q.y = max(q.y, 0);
        q.z = max(q.z, 0);

        return length(q) + tmp;
    }

    @compute @workgroup_size(64, 1, 1)
    fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
        let index = global_id.x;

        if (index >= params.currentNumParticles) {
            return;
        }

        let px = positions[index * 3 + 0];
        let py = positions[index * 3 + 1];
        let pz = positions[index * 3 + 2];

        let pos = shape.invTransf * vec4<f32>(px, py, pz, 1);
        let dist = SDBox(pos) - params.particleRadius;

        if (dist < 0) {
            let normal = computeNormal(pos);
            let dotvn = 
                velocities[index * 3 + 0] * normal.x +
                velocities[index * 3 + 1] * normal.y +
                velocities[index * 3 + 2] * normal.z;

            velocities[index * 3 + 0] = (velocities[index * 3 + 0] - 2 * dotvn * normal.x) * shape.restitution;
            velocities[index * 3 + 1] = (velocities[index * 3 + 1] - 2 * dotvn * normal.y) * shape.restitution;
            velocities[index * 3 + 2] = (velocities[index * 3 + 2] - 2 * dotvn * normal.z) * shape.restitution;

            positions[index * 3 + 0] -= normal.x * dist;
            positions[index * 3 + 1] -= normal.y * dist;
            positions[index * 3 + 2] -= normal.z * dist;
        }
    }
    `
    private checkCollisionShaderSphere: string =
    `
    struct Params {
        deltaTime: f32,
        maxVelocity: f32,
        particleRadius: f32,
        currentNumParticles: u32,
    };

    struct Shape {
        restitution: f32,
        transf: mat4x4<f32>,
        invTransf: mat4x4<f32>,
        radius: f32
    };

    @group(0) @binding(0) var<uniform> params : Params;
    @group(0) @binding(1) var<storage, read_write> positions : array<f32>;
    @group(0) @binding(2) var<storage, read_write> velocities : array<f32>;
    @group(0) @binding(3) var<uniform> shape : Shape;

    const eps = 0.0001;
    const eps1 = vec4<f32>(eps, -eps, -eps, 1);
    const eps2 = vec4<f32>(-eps, -eps, eps, 1);
    const eps3 = vec4<f32>(-eps, eps, -eps, 1);
    const eps4 = vec4<f32>(eps, eps, eps, 1);

    const dir1 = vec4<f32>(1, -1, -1, 0);
    const dir2 = vec4<f32>(-1, -1, 1, 0);
    const dir3 = vec4<f32>(-1, 1, -1, 0);
    const dir4 = vec4<f32>(1, 1, 1, 0);

    fn computeNormal(pos: vec4<f32>) -> vec4<f32> {
        var normal = vec4<f32>(0, 0, 0, 0);

        normal += SDSphere(pos + eps1) * dir1;   
        normal += SDSphere(pos + eps2) * dir2;   
        normal += SDSphere(pos + eps3) * dir3;   
        normal += SDSphere(pos + eps4) * dir4;

        normal = shape.transf * normal;

        return normalize(normal);
    }

    fn SDSphere(pos: vec4<f32>) -> f32 {
        let r = shape.radius;
        let q = vec3<f32>(pos.x, pos.y, pos.z);
        return length(q) - r; 
    }

    @compute @workgroup_size(64, 1, 1)
    fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
        let index = global_id.x;

        if (index >= params.currentNumParticles) {
            return;
        }

        let px = positions[index * 3 + 0];
        let py = positions[index * 3 + 1];
        let pz = positions[index * 3 + 2];

        let pos = shape.invTransf * vec4<f32>(px, py, pz, 1);
        let dist = SDSphere(pos) - params.particleRadius;

        if (dist < 0) {
            let normal = computeNormal(pos);
            let dotvn = 
                velocities[index * 3 + 0] * normal.x +
                velocities[index * 3 + 1] * normal.y +
                velocities[index * 3 + 2] * normal.z;

            velocities[index * 3 + 0] = (velocities[index * 3 + 0] - 2 * dotvn * normal.x) * shape.restitution;
            velocities[index * 3 + 1] = (velocities[index * 3 + 1] - 2 * dotvn * normal.y) * shape.restitution;
            velocities[index * 3 + 2] = (velocities[index * 3 + 2] - 2 * dotvn * normal.z) * shape.restitution;

            positions[index * 3 + 0] -= normal.x * dist;
            positions[index * 3 + 1] -= normal.y * dist;
            positions[index * 3 + 2] -= normal.z * dist;
        }
    }
    `
    private checkCollisionShaderCylinder: string =
    `
    struct Params {
        deltaTime: f32,
        maxVelocity: f32,
        particleRadius: f32,
        currentNumParticles: u32,
    };

    struct Shape {
        restitution: f32,
        transf: mat4x4<f32>,
        invTransf: mat4x4<f32>,
        radius: f32,
        height: f32,
    };

    @group(0) @binding(0) var<uniform> params : Params;
    @group(0) @binding(1) var<storage, read_write> positions : array<f32>;
    @group(0) @binding(2) var<storage, read_write> velocities : array<f32>;
    @group(0) @binding(3) var<uniform> shape : Shape;

    const eps = 0.0001;
    const eps1 = vec4<f32>(eps, -eps, -eps, 1);
    const eps2 = vec4<f32>(-eps, -eps, eps, 1);
    const eps3 = vec4<f32>(-eps, eps, -eps, 1);
    const eps4 = vec4<f32>(eps, eps, eps, 1);

    const dir1 = vec4<f32>(1, -1, -1, 0);
    const dir2 = vec4<f32>(-1, -1, 1, 0);
    const dir3 = vec4<f32>(-1, 1, -1, 0);
    const dir4 = vec4<f32>(1, 1, 1, 0);

    fn computeNormal(pos: vec4<f32>) -> vec4<f32> {
        var normal = vec4<f32>(0, 0, 0, 0);

        normal += SDVerticalCylinder(pos + eps1) * dir1;   
        normal += SDVerticalCylinder(pos + eps2) * dir2;   
        normal += SDVerticalCylinder(pos + eps3) * dir3;   
        normal += SDVerticalCylinder(pos + eps4) * dir4;

        normal = shape.transf * normal;

        return normalize(normal);
    }

    fn SDVerticalCylinder(pos: vec4<f32>) -> f32 {
        // radius and height
        let r = shape.radius;
        let h = shape.height;
        let dx = abs(sqrt(pos.x * pos.x + pos.z * pos.z)) - r;
        let dy = abs(pos.y) - h / 2.;
        let dx2 = max(dx, 0);
        let dy2 = max(dy, 0);
        return (min(max(dx, dy),0) + sqrt(dx2 * dx2 + dy2 * dy2));
    }

    @compute @workgroup_size(64, 1, 1)
    fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
        let index = global_id.x;

        if (index >= params.currentNumParticles) {
            return;
        }

        let px = positions[index * 3 + 0];
        let py = positions[index * 3 + 1];
        let pz = positions[index * 3 + 2];

        let pos = shape.invTransf * vec4<f32>(px, py, pz, 1);
        let dist = SDVerticalCylinder(pos) - params.particleRadius;

        if (dist < 0) {
            let normal = computeNormal(pos);
            let dotvn = 
                velocities[index * 3 + 0] * normal.x +
                velocities[index * 3 + 1] * normal.y +
                velocities[index * 3 + 2] * normal.z;

            velocities[index * 3 + 0] = (velocities[index * 3 + 0] - 2 * dotvn * normal.x) * shape.restitution;
            velocities[index * 3 + 1] = (velocities[index * 3 + 1] - 2 * dotvn * normal.y) * shape.restitution;
            velocities[index * 3 + 2] = (velocities[index * 3 + 2] - 2 * dotvn * normal.z) * shape.restitution;

            positions[index * 3 + 0] -= normal.x * dist;
            positions[index * 3 + 1] -= normal.y * dist;
            positions[index * 3 + 2] -= normal.z * dist;
        }
    }
    `
}