import { useVisualisationStore } from "@/stores/visualisationStore";
import { Nullable, Observer, Scene, Vector3 } from "@babylonjs/core";

export class ParticleGenerator {
    private visualisationStore = useVisualisationStore()
    private scene: Scene
    private observer: Nullable<Observer<Scene>>
    private _currNumParticles: number
    private numCrossSection: number
    private numParticles: number = 0
    private _positions: Float32Array
    private _velocities: Float32Array
    public particleRadius: number
    public position: Vector3

    get currNumParticles() {
        return this._currNumParticles
    }

    get positions() {
        return this._positions
    }

    get velocities() {
        return this._velocities
    }

    constructor(scene: Scene) {
        this.scene = scene
        this._currNumParticles = 0
        this.numCrossSection = 0
        this._positions = new Float32Array()
        this._velocities = new Float32Array()
        this.particleRadius = 0
        this.position = Vector3.Zero()
        this.observer = scene.onBeforeRenderObservable.add(() => {
            if (this._currNumParticles === 0) {
                if (this._positions.length / 3 >= this.numCrossSection) {
                    this._currNumParticles = this.numCrossSection
                }
            }
            else if (this._currNumParticles < this.numParticles) {
                if (this.visualisationStore.useWebGPU) {
                    this._currNumParticles += this.numCrossSection
                } else {
                    const px1 = this._positions[this._currNumParticles * 3 + 0]
                    const py1 = this._positions[this._currNumParticles * 3 + 1]
                    const pz1 = this._positions[this._currNumParticles * 3 + 2]
    
                    const px2 = this._positions[(this._currNumParticles - this.numCrossSection) * 3 + 0]
                    const py2 = this._positions[(this._currNumParticles - this.numCrossSection) * 3 + 1]
                    const pz2 = this._positions[(this._currNumParticles - this.numCrossSection) * 3 + 2]
    
                    const dist = Math.sqrt(
                        (px1 - px2) * (px1 - px2) +
                        (py1 - py2) * (py1 - py2) +
                        (pz1 - pz2) * (pz1 - pz2)
                    )
    
                    if (dist > this.particleRadius * 2) {
                        this._currNumParticles += this.numCrossSection
                    }
                }
            }
        })
    }

    public generateParticles(numTotParticles: number, regenerateAll: boolean = true) {
        if (this.numParticles >= numTotParticles && !regenerateAll) {
            this.numParticles = numTotParticles
            this._currNumParticles = Math.min(this._currNumParticles, this.numParticles)
            return
        }

        const dimX = 12, dimY = 12
        const particlePos = []
        const particleVel = []
        const distance = this.particleRadius * 2
        const jitter = distance * 0.1
        const getJitter = () => Math.random() * jitter - jitter / 2;
        const particleStartIndex = regenerateAll ? 0 : this._currNumParticles;
        this.numParticles = particleStartIndex;

        while (this.numParticles <= numTotParticles - this.numCrossSection) {
            let yCoord = (dimY / 2) * distance
            this.numCrossSection = 0

            for (let y = 1; y < dimY - 1; ++y) {
                const angle = (y * Math.PI) / (dimY - 1)
                let x2 = ((Math.sin(angle) * dimX) / 2) * distance
                if (x2 < 0) {
                    x2 = 0
                }

                let xCoord = -x2
                while (xCoord <= x2) {
                    const xc = xCoord === -x2 || xCoord + distance > x2
                        ? xCoord
                        : xCoord + getJitter()

                    const yc = xCoord === -x2 || xCoord + distance > x2
                        ? yCoord
                        : yCoord + getJitter()

                    const zCoord = xCoord === -x2 || xCoord + distance > x2
                        ? 0.49
                        : 0.49 + getJitter()

                    particlePos.push(xc + this.position.x, yc + this.position.y, zCoord + this.position.z)
                    particleVel.push((Math.random() - 0.5) * 0.03, (Math.random() - 0.5) * 0.03, (Math.random() - 1.0) * 0.03 - 1.5)
                    xCoord += distance
                    this.numParticles++
                    this.numCrossSection++
                }

                yCoord += distance
            }
        }

        if (this.numParticles > this._positions.length / 3) {
            const newPositions = new Float32Array(this.numParticles * 3);
            const newVelocities = new Float32Array(this.numParticles * 3);
            newPositions.set(this._positions, 0);
            newVelocities.set(this._velocities, 0);
            this._positions = newPositions;
            this._velocities = newVelocities;
        }

        this._positions.set(particlePos, particleStartIndex * 3)
        this._velocities.set(particleVel, particleStartIndex * 3)
        this._currNumParticles = particleStartIndex
    }

    public dispose() {
        this.scene.onBeforeRenderObservable.remove(this.observer)
        this.observer = null
    }
}