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
    Color3,
    DracoCompression
} from '@babylonjs/core'
import { fileTypes } from '../constants'
import '@babylonjs/loaders/STL'
import '@babylonjs/loaders/OBJ'
import '@babylonjs/loaders/glTF'
import type { IBoxOptions, ICylinderMetadata, ICylinderOptions, ISphereMetadata, ISphereOptions, ITorusOptions } from './types'
import { v4 as uuid } from 'uuid'

export default class MeshManager {
    private readonly scene: Scene
    private readonly visualisationStore = useVisualisationStore()
    private readonly axisNameMap: Map<string, Vector3> = new Map<string, Vector3>()
    private readonly defaultMaterial: StandardMaterial

    constructor(scene: Scene) {
        this.scene = scene
        this.axisNameMap.set('X', new Vector3(1, 0, 0))
        this.axisNameMap.set('Y', new Vector3(0, 1, 0))
        this.axisNameMap.set('Z', new Vector3(0, 0, 1))

        this.defaultMaterial = new StandardMaterial('defaultMaterial')
        this.defaultMaterial.diffuseColor = new Color3(0.7, 0.7, 0.7)
        this.defaultMaterial.specularColor = Color3.Black()
        this.defaultMaterial.backFaceCulling = false
        this.defaultMaterial.sideOrientation = Mesh.DOUBLESIDE
        this.defaultMaterial.zOffset = 1

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
        const material = this.defaultMaterial.clone('materialForTestCube')
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

        const box = MeshBuilder.CreateBox('Test cube', options, this.scene)
        box.material = material
        box.id = uuid()
        this.visualisationStore.sceneItems.push(box)
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

                mesh.material = this.defaultMaterial.clone('STLMaterial')
            }
        }

        for (const mesh of result.meshes) {
            mesh.id = uuid()
            this.visualisationStore.sceneItems.push(mesh)
        }
    }

    public addBoxToScene(options: IBoxOptions) {
        this.disposeMeshToAdd()

        const height = options.height
        const width = options.width
        const depth = options.depth
        const box = MeshBuilder.CreateBox('Box',
            {
                height: height,
                width: width,
                depth: depth
            }, this.scene)
        box.id = uuid()
        box.material = this.defaultMaterial.clone('BoxMaterial')
        this.visualisationStore.meshToAdd = box
    }

    public addSphereToScene(options: ISphereOptions) {
        this.disposeMeshToAdd()

        const diameterX = options.diameterX
        const diameterY = options.diameterY
        const diameterZ = options.diameterZ
        const segments = options.segments
        const radius = Math.min(diameterX, diameterY, diameterZ) / 2

        const sphere = MeshBuilder.CreateSphere('Sphere',
            {
                diameterX: diameterX,
                diameterY: diameterY,
                diameterZ: diameterZ,
                segments: segments
            }, this.scene)
        sphere.id = uuid()
        sphere.material = this.defaultMaterial.clone('SphereMaterial')
        sphere.metadata = {
            radius
        } as ISphereMetadata

        this.visualisationStore.meshToAdd = sphere
    }

    public addCylinderToScene(options: ICylinderOptions) {
        this.disposeMeshToAdd()

        const diameterTop = options.diameterTop
        const diameterBottom = options.diameterBottom
        const height = options.height
        const segments = options.segments
        const radius = Math.min(diameterTop, diameterBottom) / 2
        const cylinder = MeshBuilder.CreateCylinder('Cylinder',
            {
                diameterTop: diameterTop,
                diameterBottom: diameterBottom,
                height: height,
                tessellation: segments,
            }, this.scene)
        cylinder.id = uuid()
        cylinder.material = this.defaultMaterial.clone('CylinderMaterial')
        cylinder.metadata = {
            radius: radius,
            height: height,
            segments: segments
        } as ICylinderMetadata
        this.visualisationStore.meshToAdd = cylinder
    }

    public addTorusToScene(options: ITorusOptions) {
        this.disposeMeshToAdd()

        const diameter = options.diameter
        const thickness = options.thickness
        const segments = options.segments

        const torus = MeshBuilder.CreateTorus('Torus',
            {
                diameter: diameter,
                thickness: thickness,
                tessellation: segments,
            }, this.scene)
        torus.id = uuid()
        torus.material = this.defaultMaterial.clone('TorusMaterial')
        this.visualisationStore.meshToAdd = torus
    }

    public disposeMeshToAdd() {
        if (this.visualisationStore.meshToAdd) {
            this.visualisationStore.meshToAdd.dispose()
        }
    }
}