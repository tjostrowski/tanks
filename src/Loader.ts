export class Loader {
    private scene : BABYLON.Scene;
    private assetsLoader : BABYLON.AssetsManager;

    constructor(scene : BABYLON.Scene) {
        this.scene = scene;
        this.assetsLoader = new BABYLON.AssetsManager(this.scene);
    }

    public importGround(heightmapFileName : string, heightmapTextureFileName : string,
                        width : number, height : number, subdivisions : number = 250, minHeight : number = 0, maxHeight : number = 10) 
                    : BABYLON.GroundMesh {
        console.log("Importing heightmap from file: " + heightmapFileName);

        var groundMaterial = new BABYLON.StandardMaterial("ground", this.scene);
        groundMaterial.diffuseTexture = new BABYLON.Texture(heightmapTextureFileName, this.scene);

        var groundMesh = BABYLON.Mesh.CreateGroundFromHeightMap("ground", heightmapFileName, width, height, 
            subdivisions, minHeight, maxHeight, this.scene, false,  this.onHeightMapReady);     
        groundMesh.material = groundMaterial;

        return groundMesh;
    }

    public cloneMesh(mesh : BABYLON.Mesh, cloneIndex : number, clonedMeshPos : BABYLON.Vector3) : BABYLON.InstancedMesh {
        console.log("Cloning mesh: " + cloneIndex);
        // var clonedMesh = mesh.clone("clone" + cloneIndex);
        var clonedMesh = mesh.createInstance("clone" + cloneIndex);
        clonedMesh.position = clonedMeshPos;
        return clonedMesh;    
    }

    public loadMesh(meshFile : string, onMeshFileLoaded : (task: BABYLON.IAssetTask) => void, doLoad : boolean = true) {
        var meshLoadTask = this.assetsLoader.addMeshTask(meshFile.substr(meshFile.indexOf(".")), "", "../assets/", meshFile);
        meshLoadTask.onSuccess = onMeshFileLoaded;
        if (doLoad) {
            this.assetsLoader.load();
        }
    }

    public registerOnFinishTask(onLoadFinished : (tasks: BABYLON.IAssetTask[]) => void) {
        this.assetsLoader.onFinish = onLoadFinished;
    }

    private onHeightMapReady(mesh : BABYLON.GroundMesh) {
        console.log("Height map loaded ! with: [" + mesh._width + "," + mesh._height + "]");
    }

}