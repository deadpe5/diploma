import { useVisualisationStore } from '@/stores/visualisationStore'
import {
    MeshBuilder,
    StandardMaterial,
    Texture,
    Vector4,
    Scene,
    Vector3,
    Space,
    SceneLoader,
    VertexData,
    Mesh,
    DracoCompression,
} from '@babylonjs/core'
import { fileTypes } from '../constants'
import '@babylonjs/loaders/STL'
import '@babylonjs/loaders/OBJ'
import '@babylonjs/loaders/glTF'
import type { IBoxOptions, ISphereOptions } from './types'

export default class MeshManager {
    private readonly scene: Scene
    private readonly visualisationStore = useVisualisationStore()
    private readonly axisNameMap: Map<string, Vector3> = new Map<string, Vector3>()

    constructor(scene: Scene) {
        this.scene = scene
        this.axisNameMap.set('X', new Vector3(1, 0, 0))
        this.axisNameMap.set('Y', new Vector3(0, 1, 0))
        this.axisNameMap.set('Z', new Vector3(0, 0, 1))

        DracoCompression.Configuration = {
            decoder: {
                wasmUrl: '../../public/babylonDracoFiles/draco_wasm_wrapper_gltf.js',
                wasmBinaryUrl: '../../public/babylonDracoFiles/draco_decoder_gltf.wasm',
                fallbackUrl: '../../public/babylonDracoFiles/draco_decoder_gltf.js',
            }
        }
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

    public async importMeshFromFile(fileType: fileTypes, url: string) {
        const result = await SceneLoader.ImportMeshAsync('', url, '', this.scene, null, fileType)
        if (fileType === fileTypes.STL) {
            for (const mesh of result.meshes) {
                const positions = mesh.getPositionData()
                const indices = mesh.getIndices()
                const normals: any = []

                const vertexData = new VertexData()
                vertexData.positions = positions
                vertexData.indices = indices
                VertexData.ComputeNormals(positions, indices, normals)
                vertexData.normals = normals
                vertexData.applyToMesh(mesh as Mesh)
            }
        }
    }

    public addBoxToScene(options: IBoxOptions) {
        this.disposeMeshToAdd()

        const height = options.height
        const width = options.width
        const depth = options.depth
        this.visualisationStore.meshToAdd = MeshBuilder.CreateBox('box',
            {
                height: height, 
                width: width,
                depth: depth
            }, this.scene)
    }

    public addSphereToScene(options: ISphereOptions) {
        this.disposeMeshToAdd()

        const diameterX = options.diameterX
        const diameterY = options.diameterY
        const diameterZ = options.diameterZ
        const segments = options.segments
        console.log(segments)
        this.visualisationStore.meshToAdd = MeshBuilder.CreateSphere('sphere',
            {
                diameterX: diameterX,
                diameterY: diameterY,
                diameterZ: diameterZ,
                segments: segments
            }, this.scene)
    }

    public disposeMeshToAdd() {
        if (this.visualisationStore.meshToAdd) {
            this.visualisationStore.meshToAdd.dispose()
        }
    }
}