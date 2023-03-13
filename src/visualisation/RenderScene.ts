import {
    Engine,
    Scene,
    FreeCamera,
    Vector3,
    MeshBuilder,
    StandardMaterial,
    Color3,
    HemisphericLight,
    Color4
} from "@babylonjs/core";

class RenderScene {
    private readonly canvas: HTMLCanvasElement
    private readonly engine: Engine
    private readonly scene: Scene

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
        this.engine = new Engine(this.canvas)
        this.scene = new Scene(this.engine)

        this.canvas.addEventListener('wheel', evt => evt.preventDefault())
        this.scene.clearColor = new Color4(1,1,1,1)
        
        const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), this.scene);
        camera.setTarget(Vector3.Zero());
        camera.attachControl(canvas, true);

        new HemisphericLight("light", Vector3.Up(), this.scene);

        const box = MeshBuilder.CreateBox("box", { size: 2 }, this.scene);
        const material = new StandardMaterial("box-material", this.scene);
        material.diffuseColor = Color3.Blue();
        box.material = material;

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    getScene(): Scene {
        return this.scene
    }
}

export default RenderScene