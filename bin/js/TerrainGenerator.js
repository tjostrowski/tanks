define(["require", "exports", "./DictionaryBucket", "./Utils"], function (require, exports, DictionaryBucket_1, Utils_1) {
    "use strict";
    // export module TerrainGenerator {
    class TerrainGenerator {
        constructor(scene, camera, loader, routeWidth = 60, terrainWidth = 50, numVisibleTerrains = 5) {
            console.log("Initializing terrain generator");
            this.scene = scene;
            this.camera = camera;
            this.routeWidth = routeWidth;
            this.terrainWidth = terrainWidth;
            this.numVisibleTerrains = numVisibleTerrains;
            this.turnVisible = false;
            this.loader = loader;
            this.loadedMeshes = new DictionaryBucket_1.Dictionaries.DictionaryBucket();
            this.visibleGrounds = new DictionaryBucket_1.Dictionaries.DictionaryBucket();
            this.invisibleGrounds = new DictionaryBucket_1.Dictionaries.DictionaryBucket();
        }
        load() {
            console.log("Loading meshes!");
            let startTime = new Date().getTime();
            this.visibleGrounds.clear();
            this.invisibleGrounds.clear();
            var invisiblePosZ = -200, invisiblePos = new BABYLON.Vector3(0, 0, invisiblePosZ);
            var tw = this.terrainWidth;
            var groundMesh1 = this.loader.importGround("textures/terrain_01.png", "textures/terrain_01_txt.png", tw, tw, 250, -10, 20);
            this.loadedMeshes.add("terrain_01", groundMesh1);
            this.invisibleGrounds.add("terrain_01", groundMesh1);
            var groundMesh2 = this.loader.importGround("textures/terrain_02.png", "textures/terrain_02_txt.png", tw, tw, 250, -10, 20);
            this.loadedMeshes.add("terrain_02", groundMesh2);
            this.invisibleGrounds.add("terrain_02", groundMesh2);
            var groundMesh3 = this.loader.importGround("textures/terrain_03.png", "textures/terrain_03_txt.png", tw, tw, 250, -10, 20);
            this.loadedMeshes.add("terrain_03", groundMesh3);
            this.invisibleGrounds.add("terrain_03", groundMesh3);
            groundMesh1.position = invisiblePos;
            groundMesh2.position = invisiblePos;
            groundMesh3.position = invisiblePos;
            for (var i = 0; i < this.numVisibleTerrains; ++i) {
                var clonedGroundMesh1 = this.loader.cloneMesh(groundMesh1, i + 1, invisiblePos);
                this.loadedMeshes.add("terrain_01", clonedGroundMesh1);
                this.invisibleGrounds.add("terrain_01", clonedGroundMesh1);
                var clonedGroundMesh2 = this.loader.cloneMesh(groundMesh2, i + 1, invisiblePos);
                this.loadedMeshes.add("terrain_02", clonedGroundMesh2);
                this.invisibleGrounds.add("terrain_02", clonedGroundMesh2);
                var clonedGroundMesh3 = this.loader.cloneMesh(groundMesh3, i + 1, invisiblePos);
                this.loadedMeshes.add("terrain_03", clonedGroundMesh3);
                this.invisibleGrounds.add("terrain_03", clonedGroundMesh3);
            }
            let endTime = new Date().getTime();
            console.log("Finished loading, loading took: " + (endTime - startTime) + " [ms]");
        }
        initOnScene() {
            console.log("Init grounds on scene!");
            var posXLeft = -this.routeWidth / 2, posY = 0, posZ = 0, posXRight = this.routeWidth / 2;
            for (var i = 0; i < this.numVisibleTerrains; ++i) {
                this.pickTerrain(posXLeft, posY, posZ);
                this.pickTerrain(posXRight, posY, posZ);
                posZ += this.terrainWidth;
            }
            this.lastTerrainUpdatePositionZ = posZ;
        }
        update() {
            this.updateGroundsVisibility();
            if (this.shouldUpdateTerrain()) {
                this.updateTerrain();
            }
        }
        shouldUpdateTerrain() {
            var cameraZ = this.camera.position.z;
            var step = this.terrainWidth;
            return cameraZ - this.lastTerrainUpdatePositionZ >= step;
        }
        updateTerrain() {
            if (!this.turnVisible) {
                let rnd = Utils_1.Utils.random(1, 10);
                if (rnd <= 7) {
                    this.continueRoute();
                }
                else {
                    this.makeTurn();
                }
            }
        }
        updateGroundsVisibility() {
            let it = new DictionaryBucket_1.Dictionaries.DictionaryBucketIterator(this.visibleGrounds);
            while (it.hasNext()) {
                var ground = it.next();
                // ground behind camera
                if (ground.position.z + ground.scaling.z / 2 < this.camera.position.z) {
                    var groundName = it.getCurrentKey();
                    it.removeCurrent();
                    this.invisibleGrounds.add(groundName, ground);
                }
            }
        }
        makeTurn() {
            console.log("Making new turn!");
            let rnd = Utils_1.Utils.random(1, 2);
            var turnLeft = (rnd == 1), turnRight = (rnd == 2);
            var posXLeft = -this.routeWidth / 2, posY = 0, posZ = this.lastTerrainUpdatePositionZ, posXRight = this.routeWidth / 2;
            if (turnLeft) {
                this.pickTerrain(posXRight, posY, posZ);
                posZ += this.terrainWidth;
                this.pickTerrain(posXRight, posY, posZ);
                this.pickTerrain(0, posY, posZ, this.routeWidth);
                this.pickTerrain(posXLeft, posY, posZ);
            }
            else {
                this.pickTerrain(posXLeft, posY, posZ);
                posZ += this.terrainWidth;
                this.pickTerrain(posXLeft, posY, posZ);
                this.pickTerrain(0, posY, posZ, this.routeWidth);
                this.pickTerrain(posXRight, posY, posZ);
            }
            this.turnVisible = true;
        }
        continueRoute() {
            console.log("Continuing route!");
            var posXLeft = -this.routeWidth / 2, posY = 0, posZ = this.lastTerrainUpdatePositionZ, posXRight = this.routeWidth / 2;
            this.pickTerrain(posXLeft, posY, posZ);
            this.pickTerrain(posXRight, posY, posZ);
            this.lastTerrainUpdatePositionZ += this.terrainWidth;
        }
        pickTerrain(posX, posY, posZ, width = this.terrainWidth) {
            var terrainName = Utils_1.Utils.getRandomDictionaryBucketKey(this.invisibleGrounds);
            var ground = this.invisibleGrounds.pick(terrainName);
            // ground.scaling.z = width;
            ground.position = new BABYLON.Vector3(posX, posY, posZ);
            this.visibleGrounds.add(terrainName, ground);
            return ground;
        }
    }
    exports.TerrainGenerator = TerrainGenerator;
});
// export {TerrainGenerator};
// }     
