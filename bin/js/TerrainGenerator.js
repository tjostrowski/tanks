define(["require", "exports", "./DictionaryBucket", "./Utils"], function (require, exports, DictionaryBucket_1, Utils_1) {
    "use strict";
    // export module TerrainGenerator {
    class TerrainGenerator {
        constructor(scene, camera, loader, player, terrainWithRouteWidth = 130, terrainWidth = 100, numVisibleTerrains = 5) {
            this.invisiblePos = new BABYLON.Vector3(-1000, -1000, -1000);
            console.log("Initializing terrain generator");
            this.scene = scene;
            this.camera = camera;
            this.player = player;
            this.terrainWithRouteWidth = terrainWithRouteWidth;
            this.terrainWidth = terrainWidth;
            this.routeWidth = this.terrainWithRouteWidth - this.terrainWidth;
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
            var invisiblePos = this.invisiblePos;
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
            var it = new DictionaryBucket_1.Dictionaries.DictionaryBucketIterator(this.invisibleGrounds);
            while (it.hasNext()) {
                var mesh = it.next();
                mesh.alwaysSelectAsActiveMesh = true;
                mesh.checkCollisions = true;
            }
            let endTime = new Date().getTime();
            console.log("Finished loading, loading took: " + (endTime - startTime) + " [ms]");
        }
        initOnScene() {
            console.log("Init grounds on scene!");
            var posXLeft = -this.terrainWithRouteWidth / 2, posY = 0, posZ = 0, posXRight = this.terrainWithRouteWidth / 2;
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
        requestTurn(isTurnLeft) {
            console.log("Requesting turn! " + ((isTurnLeft) ? "left" : "right"));
            if (!this.turnVisible) {
                return false;
            }
            var playerPosZ = this.player.getPosition().z;
            var tolerance = 7;
            if (Utils_1.Utils.boolsMatching(isTurnLeft, this.isTurnLeft)
                && playerPosZ >= this.turnStartZ - tolerance
                && playerPosZ <= this.turnStartZ + this.routeWidth + tolerance) {
                console.log("Turn within range, turning! " + ((isTurnLeft) ? "left" : "right"));
                // first check, just rotate player, NOT WORKING!
                if (isTurnLeft) {
                    this.player.rotateY(-Math.PI / 2);
                }
                else {
                    this.player.rotateY(Math.PI / 2);
                }
                this.player.cameraFollowMe();
                // if (isTurnLeft) {
                //     this.requestTurnLeft();
                // } else {
                //     this.requestTurnRight();
                // }   
                this.turnVisible = false;
                return true;
            }
            return false;
        }
        requestTurnLeft() {
            var posXLeft = -this.terrainWithRouteWidth / 2, posY = 0, posZ = this.lastTerrainUpdatePositionZ - this.routeWidth, posXRight = this.terrainWithRouteWidth / 2;
            var selectedMeshOnLeft, selectedMeshOnRight, selectedMeshOnLeftName, selectedMeshOnRightName;
            // posXRight, posY, posZ
            // posXLeft + this.routeWidth/2, posY, posZ, this.terrainWidth + this.routeWidth
            let it = new DictionaryBucket_1.Dictionaries.DictionaryBucketIterator(this.visibleGrounds);
            while (it.hasNext()) {
                var mesh = it.next();
                if (mesh.position.x === posXLeft + this.routeWidth / 2 && mesh.position.z === posZ + this.routeWidth) {
                    selectedMeshOnRight = mesh;
                    selectedMeshOnRightName = it.getCurrentKey();
                }
                else if (mesh.position.x === posXLeft && mesh.position.z === posZ - this.terrainWidth) {
                    selectedMeshOnLeft = mesh;
                    selectedMeshOnLeftName = it.getCurrentKey();
                }
            }
            if (selectedMeshOnLeft === undefined) {
                it = new DictionaryBucket_1.Dictionaries.DictionaryBucketIterator(this.invisibleGrounds);
                while (it.hasNext()) {
                    var mesh = it.next();
                    if (mesh.position.x === posXLeft && mesh.position.z === posZ - this.terrainWidth) {
                        selectedMeshOnLeft = mesh;
                        selectedMeshOnLeftName = it.getCurrentKey();
                        break;
                    }
                }
            }
            if (selectedMeshOnLeft === undefined || selectedMeshOnRight === undefined) {
                throw "Cannot find mesh"
                    + " L=" + ((selectedMeshOnLeft) ? "FOUND" : "NOT FOUND")
                    + " R=" + ((selectedMeshOnRight) ? "FOUND" : "NOT FOUND");
            }
            console.log("Found meshes to clone on left and right!");
            this.player.resetToInitialPosition();
            it = new DictionaryBucket_1.Dictionaries.DictionaryBucketIterator(this.visibleGrounds);
            while (it.hasNext()) {
                var mesh = it.next();
                mesh.position = this.invisiblePos;
                this.invisibleGrounds.add(it.getCurrentKey(), mesh);
            }
            it = new DictionaryBucket_1.Dictionaries.DictionaryBucketIterator(this.invisibleGrounds);
            while (it.hasNext()) {
                var mesh = it.next();
                mesh.position = this.invisiblePos;
            }
            this.visibleGrounds.clear();
            selectedMeshOnLeft.position = new BABYLON.Vector3(posXLeft, posY, 0);
            this.visibleGrounds.add(selectedMeshOnLeftName, selectedMeshOnLeft);
            selectedMeshOnRight.position = new BABYLON.Vector3(posXRight + this.routeWidth / 2, posY, 0);
            this.visibleGrounds.add(selectedMeshOnRightName, selectedMeshOnRight);
            this.lastTerrainUpdatePositionZ = this.terrainWidth;
        }
        requestTurnRight() {
            // posXLeft, posY, posZ
            // posXRight - this.routeWidth/2, posY, posZ, this.terrainWidth + this.routeWidth
        }
        shouldUpdateTerrain() {
            var cameraZ = this.camera.position.z;
            var step = this.terrainWidth;
            return this.lastTerrainUpdatePositionZ - this.player.getPosition().z <= step;
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
                // ground behind player
                if (ground.position.z + ground.scaling.z / 2 < this.player.getPosition().z) {
                    var groundName = it.getCurrentKey();
                    it.removeCurrent();
                    // ground.position = this.invisiblePos;
                    this.invisibleGrounds.add(groundName, ground);
                }
            }
        }
        makeTurn() {
            let rnd = Utils_1.Utils.random(1, 2);
            var isTurnLeft = (rnd >= 1), turnRight = (rnd === 2);
            var posXLeft = -this.terrainWithRouteWidth / 2, posY = 0, posZ = this.lastTerrainUpdatePositionZ, posXRight = this.terrainWithRouteWidth / 2;
            console.log("Making new turn! " + ((isTurnLeft) ? "left" : "right"));
            if (isTurnLeft) {
                this.pickTerrain(posXRight, posY, posZ);
                posZ += this.routeWidth;
                this.pickTerrain(posXLeft + this.routeWidth / 2, posY, posZ, this.terrainWidth + this.routeWidth);
            }
            else {
                this.pickTerrain(posXLeft, posY, posZ);
                posZ += this.routeWidth;
                this.pickTerrain(posXRight - this.routeWidth / 2, posY, posZ, this.terrainWidth + this.routeWidth);
            }
            this.lastTerrainUpdatePositionZ = posZ;
            this.turnVisible = true;
            this.turnStartZ = posZ - this.routeWidth - this.terrainWidth / 2;
            this.isTurnLeft = isTurnLeft;
        }
        continueRoute() {
            console.log("Continuing route!");
            var posXLeft = -this.terrainWithRouteWidth / 2, posY = 0, posZ = this.lastTerrainUpdatePositionZ, posXRight = this.terrainWithRouteWidth / 2;
            this.pickTerrain(posXLeft, posY, posZ);
            this.pickTerrain(posXRight, posY, posZ);
            this.lastTerrainUpdatePositionZ += this.terrainWidth;
        }
        pickTerrain(posX, posY, posZ, width = this.terrainWidth, height = this.terrainWidth) {
            var terrainName = Utils_1.Utils.getRandomDictionaryBucketKey(this.invisibleGrounds);
            var ground = this.invisibleGrounds.pick(terrainName);
            ground.scaling.x = width / this.terrainWidth;
            ground.scaling.z = height / this.terrainWidth;
            ground.position = new BABYLON.Vector3(posX, posY, posZ);
            this.visibleGrounds.add(terrainName, ground);
            return ground;
        }
        getRouteWidth() {
            return this.routeWidth;
        }
        getTerrainWidth() {
            return this.terrainWidth;
        }
        getNumVisibleTerrains() {
            return this.numVisibleTerrains;
        }
    }
    exports.TerrainGenerator = TerrainGenerator;
});
// export {TerrainGenerator};
// }     
