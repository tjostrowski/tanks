define(["require", "exports"], function (require, exports) {
    "use strict";
    class Loader {
        constructor(scene) {
            this.scene = scene;
            this.assetsLoader = new BABYLON.AssetsManager(this.scene);
        }
        importGround(heightmapFileName, heightmapTextureFileName, width, height, subdivisions = 250, minHeight = 0, maxHeight = 10) {
            console.log("Importing heightmap from file: " + heightmapFileName);
            var groundMaterial = new BABYLON.StandardMaterial("ground", this.scene);
            groundMaterial.diffuseTexture = new BABYLON.Texture(heightmapTextureFileName, this.scene);
            var groundMesh = BABYLON.Mesh.CreateGroundFromHeightMap("ground", heightmapFileName, width, height, subdivisions, minHeight, maxHeight, this.scene, false, this.onHeightMapReady);
            groundMesh.material = groundMaterial;
            return groundMesh;
        }
        cloneMesh(mesh, cloneIndex, clonedMeshPos) {
            console.log("Cloning mesh: " + cloneIndex);
            // var clonedMesh = mesh.clone("clone" + cloneIndex);
            var clonedMesh = mesh.createInstance("clone" + cloneIndex);
            clonedMesh.position = clonedMeshPos;
            return clonedMesh;
        }
        loadMesh(meshFile, onMeshFileLoaded, doLoad = true) {
            var meshLoadTask = this.assetsLoader.addMeshTask(meshFile.substr(meshFile.indexOf(".")), "", "../assets/", meshFile);
            meshLoadTask.onSuccess = onMeshFileLoaded;
            if (doLoad) {
                this.assetsLoader.load();
            }
        }
        registerOnFinishTask(onLoadFinished) {
            this.assetsLoader.onFinish = onLoadFinished;
        }
        onHeightMapReady(mesh) {
            console.log("Height map loaded ! with: [" + mesh._width + "," + mesh._height + "]");
        }
    }
    exports.Loader = Loader;
});
