import { useVisualisationStore } from '@/stores/visualisationStore'
import { MeshBuilder, StandardMaterial, Texture, Vector4, Scene, Vector3, Space } from '@babylonjs/core'

export default class MeshManager {
    private readonly scene: Scene
    private readonly visualisationStore = useVisualisationStore()
    private readonly axisNameMap: Map<string, Vector3> = new Map<string, Vector3>()
    
    constructor(scene: Scene) {
        this.scene = scene
        this.axisNameMap.set('X', new Vector3(1, 0, 0))
        this.axisNameMap.set('Y', new Vector3(0, 1, 0))
        this.axisNameMap.set('Z', new Vector3(0, 0, 1))
    }

    public recenterSelectedMesh() {
        const selectedMesh = this.visualisationStore.selectedMesh
        if (selectedMesh) {
            selectedMesh.position = Vector3.Zero()
        }
    }

    public moveSelectedMesh(axisName: string, value: number, LCS: boolean) {
        const selectedMesh = this.visualisationStore.selectedMesh
        const axis = this.axisNameMap.get(axisName)
        if (selectedMesh && axis) {
            selectedMesh.translate(axis, value, LCS ? Space.LOCAL : Space.WORLD)
        }
    }

    public restoreSelectedMeshRotation() {
        const selectedMesh = this.visualisationStore.selectedMesh
        if (selectedMesh) {
            selectedMesh.rotation = Vector3.Zero()
        }
    }

    public rotateSelectedMesh(axisName: string, value: number, LCS: boolean) {
        const selectedMesh = this.visualisationStore.selectedMesh
        const axis = this.axisNameMap.get(axisName)
        if (selectedMesh && axis) {
            selectedMesh.rotate(axis, value, LCS ? Space.LOCAL : Space.WORLD)
        }
    }

    public addTestCube() {
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
}