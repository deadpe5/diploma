import { ComputeShader, Engine, StorageBuffer, UniformBuffer, Vector3 } from "@babylonjs/core"
import { Hash } from "./Hash"
import { IParticleData } from "./types"
import {
    DEFAULT_DENSITY_REFERENCE,
    GRAVITY,
    DEFAULT_PRESSURE_CONSTANT,
    VISCOSITY,
    MAX_ACCELERATION,
    MAX_VELOCITY,
    MIN_TIME_STEP
} from "@/constants"
import { useVisualisationStore } from "@/stores/visualisationStore"

export class FluidSimulator {
    private engine: Engine
    private _particlesArray: number[]
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

    private computeParams: UniformBuffer;
    private updateParams: UniformBuffer;
    private _positionsStorageBuffer: StorageBuffer | undefined;
    private _velocitiesStorageBuffer: StorageBuffer | undefined;

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
        for (const particle of this._particles) {
            particle.mass = m
        }

        for (let i = 0; i < this._particlesArray.length; i += 6) {
            this._particlesArray[i] = m
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

    private updateParamBuffers() {
        if (!this.visualisationStore.useWebGPU) {
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

        this.updateParams.updateFloat('maxVelocity', this.maxVelocity)
        this.updateParams.updateUInt('currentNumParticles', this.currentNumParticles)
        this.updateParams.update()
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

        if (this.visualisationStore.useWebGPU) {
            this._positionsStorageBuffer?.dispose()
            this._positionsStorageBuffer = new StorageBuffer(this.engine, this._positions!.byteLength)
            this._positionsStorageBuffer.update(this._positions!)
            this._velocitiesStorageBuffer?.dispose()
            this._velocitiesStorageBuffer = new StorageBuffer(this.engine, this._velocities!.byteLength)
            this._velocitiesStorageBuffer.update(this._velocities!)
        }

        this._numMaxParticles = this._positions.length / 3
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

        for (let i = this._particlesArray.length / 6; i < this._numMaxParticles; ++i) {
            for (let j = 0; j < 6; ++j) {
                this._particlesArray.push(j === 0 ? this.mass : 0)
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

        this.updateParamBuffers()
    }

    public async update(deltaTime: number) {
        if (this.visualisationStore.useWebGPU) {
            this.updateParamBuffers()
            this.computeDensityAndPressureGPU()
            this.computeAccelerationGPU()
            this.updatePositions(deltaTime)
        } else {
            this._hash.create(this._positions!, this.currentNumParticles)
            this.computeDensityAndPressure()
            this.computeAcceleration()
            this.updatePositions(deltaTime)
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

    public computeDensityAndPressureGPU() {
        const particleStorageBuffer = new StorageBuffer(this.engine, 4 * this._particlesArray.length)
        particleStorageBuffer.update(this._particlesArray)

        const cs = new ComputeShader(
            'computeDensityAndPressure',
            this.engine,
            { computeSource: this.computeDensityAndPressureShader },
            {
                bindingsMapping: {
                    "params": {group: 0, binding: 0},
                    "positions": { group: 0, binding: 1 },
                    "particles": { group: 0, binding: 2 },
                }
            }
        )
        
        cs.setUniformBuffer('params', this.computeParams)
        cs.setStorageBuffer('positions', this._positionsStorageBuffer!)
        cs.setStorageBuffer('particles', particleStorageBuffer)
        
        cs.dispatchWhenReady(Math.ceil(this.currentNumParticles / 256)).then(() => {
            particleStorageBuffer.read().then((res) => {
                const array = new Float32Array(res.buffer)
                this._particlesArray = Array.from(array)
                for (let i = 0; i < array.length / 6; ++i) {
                    this._particles[i].density = array[i * 6 + 1]
                    this._particles[i].pressure = array[i * 6 + 2]
                }
            })
        });
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

    private computeAccelerationGPU() { 
        const particleStorageBuffer = new StorageBuffer(this.engine, 4 * this._particlesArray.length)
        particleStorageBuffer.update(this._particlesArray)

        const cs = new ComputeShader(
            'computeAcceleration',
            this.engine,
            { computeSource: this.computeAccelerationShader },
            {
                bindingsMapping: {
                    "params": {group: 0, binding: 0},
                    "positions": { group: 0, binding: 1 },
                    "velocities": { group: 0, binding: 2 },
                    "particles": { group: 0, binding: 3 },
                }
            }
        )
        
        cs.setUniformBuffer('params', this.computeParams)
        cs.setStorageBuffer('positions', this._positionsStorageBuffer!)
        cs.setStorageBuffer('velocities', this._velocitiesStorageBuffer!)
        cs.setStorageBuffer('particles', particleStorageBuffer)
        
        cs.dispatchWhenReady(Math.ceil(this.currentNumParticles / 256)).then(() => {
            particleStorageBuffer.read().then((res) => {
                const array = new Float32Array(res.buffer)
                this._particlesArray = Array.from(array)
                for (let i = 0; i < array.length / 6; ++i) {
                    this._particles[i].accelX = array[i * 6 + 3]
                    this._particles[i].accelY = array[i * 6 + 4]
                    this._particles[i].accelZ = array[i * 6 + 5]
                }
            })
        });
    }

    // WEBGPU LOW PRIORITY
    private calculateTimeStep(): number {
        let maxVelocity = 0
        let maxAcceleration = 0
        let maxSpeedOfSound = 0

        for (let a = 0; a < this.currentNumParticles; ++a) {
            const pA = this._particles[a]
            const velSq =
                this._velocities![a * 3 + 0] * this._velocities![a * 3 + 0] +
                this._velocities![a * 3 + 1] * this._velocities![a * 3 + 1] +
                this._velocities![a * 3 + 2] * this._velocities![a * 3 + 2]

            const accSq =
                pA.accelX * pA.accelX +
                pA.accelY * pA.accelY +
                pA.accelZ * pA.accelZ

            const spsSq = pA.density < 0.00001 ? 0 : pA.pressure / pA.density
            if (velSq > maxVelocity) {
                maxVelocity = velSq
            }

            if (accSq > maxAcceleration) {
                maxAcceleration = accSq
            }

            if (spsSq > maxSpeedOfSound) {
                maxSpeedOfSound = spsSq
            }
        }

        maxVelocity = Math.sqrt(maxVelocity)
        maxAcceleration = Math.sqrt(maxAcceleration)
        maxSpeedOfSound = Math.sqrt(maxSpeedOfSound)

        const velStep = (0.4 * this.smoothingRadius) / Math.max(1, maxVelocity)
        const accStep = 0.4 * Math.sqrt(this.smoothingRadius / maxAcceleration)
        const spsStep = this.smoothingRadius / maxSpeedOfSound

        return Math.max(this.minTimeStep, Math.min(velStep, accStep, spsStep))
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

    private updatePositionsGPU(deltaTime: number) {
        const particleStorageBuffer = new StorageBuffer(this.engine, 4 * this._particlesArray.length)
        particleStorageBuffer.update(this._particlesArray)

        const cs = new ComputeShader(
            'updatePositions',
            this.engine,
            { computeSource: this.updatePositionsShader },
            {
                bindingsMapping: {
                    "params": {group: 0, binding: 0},
                    "positions": { group: 0, binding: 1 },
                    "velocities": { group: 0, binding: 2 },
                    "particles": { group: 0, binding: 3 },
                }
            }
        )

        this.updateParams.updateFloat('deltaTime', deltaTime)
        this.updateParams.update()

        cs.setUniformBuffer('params', this.updateParams)
        cs.setStorageBuffer('positions', this._positionsStorageBuffer!)
        cs.setStorageBuffer('velocities', this._velocitiesStorageBuffer!)
        cs.setStorageBuffer('particles', particleStorageBuffer)

        cs.dispatchWhenReady(Math.ceil(this.currentNumParticles / 256))
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

        @compute @workgroup_size(256, 1, 1)
        fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
            let index = global_id.x;

            if (index >= params.currentNumParticles) {
                return;
            }
            
            let paX = positions[index * 3 + 0];
            let paY = positions[index * 3 + 1];
            let paZ = positions[index * 3 + 2];

            particles[index].density = 0;

            for (var b = 0u; b < arrayLength(&particles); b = b + 1u) {
                if (b == index) {
                    continue;
                }

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

        @compute @workgroup_size(256, 1, 1)
        fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
            let index = global_id.x;

            if (index >= params.currentNumParticles) {
                return;
            }
            
            let paX = positions[index * 3 + 0];
            let paY = positions[index * 3 + 1];
            let paZ = positions[index * 3 + 2];

            let vaX = positions[index * 3 + 0];
            let vaY = positions[index * 3 + 1];
            let vaZ = positions[index * 3 + 2];

            var pressureAccelX = f32(0);
            var pressureAccelY = f32(0);
            var pressureAccelZ = f32(0);

            var viscosityAccelX = f32(0);
            var viscosityAccelY = f32(0);
            var viscosityAccelZ = f32(0);

            for (var b = 0u; b < arrayLength(&particles); b = b + 1u) {
                if (b == index) {
                    continue;
                }

                var diffX = paX - positions[b * 3 + 0];
                var diffY = paY - positions[b * 3 + 1];
                var diffZ = paZ - positions[b * 3 + 2];

                let r2 = diffX * diffX + diffY * diffY + diffZ * diffZ;
                let r = sqrt(r2);

                if (r > 0 && r2 < params.smoothingRadius2) {
                    diffX /= r;
                    diffY /= r;
                    diffZ /= r;

                    // TODO costil
                    if (particles[index].pressure == 0 || particles[index].density == 0 || particles[b].pressure == 0 || particles[b].density == 0) {
                        continue;
                    }

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

    @compute @workgroup_size(256, 1, 1)
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
}