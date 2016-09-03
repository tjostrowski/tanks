import {Dictionaries} from "./DictionaryBucket";
import {Utils} from "./Utils";
import {Loader} from "./Loader";
import {Player} from "./Player";
// export module TerrainGenerator {

export class TerrainGenerator {

    private scene : BABYLON.Scene;
    private camera : BABYLON.TargetCamera;
    private loader : Loader;
    private player : Player;

    private loadedMeshes : Dictionaries.DictionaryBucket;

    private terrainWithRouteWidth : number;
    private terrainWidth : number;
    private routeWidth : number;
    private numVisibleTerrains : number;

    private lastTerrainUpdatePositionZ : number;
    private visibleGrounds : Dictionaries.DictionaryBucket;
    private invisibleGrounds : Dictionaries.DictionaryBucket;

    private turnVisible : boolean;
    private turnStartZ : number;
    private isTurnLeft : boolean;

    private invisiblePos : BABYLON.Vector3 = new BABYLON.Vector3(-1000, -1000, -1000);

    constructor(scene : BABYLON.Scene, camera : BABYLON.TargetCamera, loader : Loader, player : Player, 
                terrainWithRouteWidth : number = 130, terrainWidth : number = 100, numVisibleTerrains : number = 5) {
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
        this.loadedMeshes = new Dictionaries.DictionaryBucket();
        this.visibleGrounds = new Dictionaries.DictionaryBucket();
        this.invisibleGrounds = new Dictionaries.DictionaryBucket();
    }

    public load() {
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
            var clonedGroundMesh1 = this.loader.cloneMesh(groundMesh1, i+1, invisiblePos);
            this.loadedMeshes.add("terrain_01", clonedGroundMesh1);
            this.invisibleGrounds.add("terrain_01", clonedGroundMesh1);
            var clonedGroundMesh2 = this.loader.cloneMesh(groundMesh2, i+1, invisiblePos);
            this.loadedMeshes.add("terrain_02", clonedGroundMesh2);
            this.invisibleGrounds.add("terrain_02", clonedGroundMesh2);
            var clonedGroundMesh3 = this.loader.cloneMesh(groundMesh3, i+1, invisiblePos);
            this.loadedMeshes.add("terrain_03", clonedGroundMesh3);
            this.invisibleGrounds.add("terrain_03", clonedGroundMesh3);
        }

        var it : Dictionaries.DictionaryBucketIterator = new Dictionaries.DictionaryBucketIterator(this.invisibleGrounds);
        while (it.hasNext()) {
            var mesh : BABYLON.AbstractMesh = it.next();
            mesh.alwaysSelectAsActiveMesh = true;
            mesh.checkCollisions = true;
        } 

        let endTime = new Date().getTime();
        console.log("Finished loading, loading took: " + (endTime - startTime) + " [ms]");
    }

    public initOnScene() {
        console.log("Init grounds on scene!");

        var posXLeft = -this.terrainWithRouteWidth/2, posY = 0, posZ = 0,
            posXRight = this.terrainWithRouteWidth/2;

        for (var i = 0; i < this.numVisibleTerrains; ++i) {
            this.pickTerrain(posXLeft, posY, posZ);
            this.pickTerrain(posXRight, posY, posZ);
            posZ += this.terrainWidth;
        }

        this.lastTerrainUpdatePositionZ = posZ;
    }

    public update() {
        this.updateGroundsVisibility();
        if (this.shouldUpdateTerrain()) {
            this.updateTerrain();
        }
    }

    public requestTurn(isTurnLeft : boolean) : boolean {
        console.log("Requesting turn! " + ((isTurnLeft) ? "left" : "right"));
        if (!this.turnVisible) {
            return false;
        }

        var playerPosZ = this.player.getPosition().z;
        var tolerance = 7;
        if (Utils.boolsMatching(isTurnLeft, this.isTurnLeft)
            && playerPosZ >= this.turnStartZ - tolerance 
            && playerPosZ <= this.turnStartZ + this.routeWidth + tolerance) {

            console.log("Turn within range, turning! " + ((isTurnLeft) ? "left" : "right"));
            // first check, just rotate player, NOT WORKING!
            if (isTurnLeft) {
                this.player.rotateY(-Math.PI / 2);
            } else {
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

    private requestTurnLeft() {
        var posXLeft = -this.terrainWithRouteWidth/2, posY = 0, posZ = this.lastTerrainUpdatePositionZ - this.routeWidth,
            posXRight = this.terrainWithRouteWidth/2;
        var selectedMeshOnLeft, selectedMeshOnRight,
            selectedMeshOnLeftName, selectedMeshOnRightName;
        // posXRight, posY, posZ
        // posXLeft + this.routeWidth/2, posY, posZ, this.terrainWidth + this.routeWidth
        let it : Dictionaries.DictionaryBucketIterator = new Dictionaries.DictionaryBucketIterator(this.visibleGrounds);
        while (it.hasNext()) {
            var mesh : BABYLON.AbstractMesh = it.next();
            if (mesh.position.x === posXLeft + this.routeWidth/2 && mesh.position.z === posZ + this.routeWidth) {
                selectedMeshOnRight = mesh;
                selectedMeshOnRightName = it.getCurrentKey();
            } else if (mesh.position.x === posXLeft && mesh.position.z === posZ - this.terrainWidth) {
                selectedMeshOnLeft = mesh;
                selectedMeshOnLeftName = it.getCurrentKey();
            }
        }    

        if (selectedMeshOnLeft === undefined) {
            it = new Dictionaries.DictionaryBucketIterator(this.invisibleGrounds);
            while (it.hasNext()) {
                var mesh : BABYLON.AbstractMesh = it.next();
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
                  + " R=" + ((selectedMeshOnRight) ? "FOUND" : "NOT FOUND")  
        }
    
        console.log("Found meshes to clone on left and right!");

        this.player.resetToInitialPosition();

        it = new Dictionaries.DictionaryBucketIterator(this.visibleGrounds);
        while (it.hasNext()) {
            var mesh : BABYLON.AbstractMesh = it.next();
            mesh.position = this.invisiblePos;
            this.invisibleGrounds.add(it.getCurrentKey(), mesh);
        }
        it = new Dictionaries.DictionaryBucketIterator(this.invisibleGrounds);
        while (it.hasNext()) {
            var mesh : BABYLON.AbstractMesh = it.next();
            mesh.position = this.invisiblePos;
        }    
        this.visibleGrounds.clear();

        selectedMeshOnLeft.position = new BABYLON.Vector3(posXLeft, posY, 0);
        this.visibleGrounds.add(selectedMeshOnLeftName, selectedMeshOnLeft);
        selectedMeshOnRight.position = new BABYLON.Vector3(posXRight + this.routeWidth/2, posY, 0);
        this.visibleGrounds.add(selectedMeshOnRightName, selectedMeshOnRight);

        this.lastTerrainUpdatePositionZ = this.terrainWidth;
    }

    private requestTurnRight() {

        // posXLeft, posY, posZ
        // posXRight - this.routeWidth/2, posY, posZ, this.terrainWidth + this.routeWidth

    }

    private shouldUpdateTerrain() : boolean {
        var cameraZ = this.camera.position.z;
        var step = this.terrainWidth;
        return this.lastTerrainUpdatePositionZ - this.player.getPosition().z <= step;    
    }

    private updateTerrain() {
        if (!this.turnVisible) {
            let rnd : number = Utils.random(1, 10);
            if (rnd <= 7) {
                this.continueRoute();
            } else {
                this.makeTurn();
            }
        }    
    }

    private updateGroundsVisibility() {
        let it : Dictionaries.DictionaryBucketIterator = new Dictionaries.DictionaryBucketIterator(this.visibleGrounds);
        while (it.hasNext()) {
            var ground : BABYLON.AbstractMesh = it.next();
            // ground behind player
            if (ground.position.z + ground.scaling.z/2 < this.player.getPosition().z) {
                var groundName = it.getCurrentKey();
                it.removeCurrent();
                // ground.position = this.invisiblePos;
                this.invisibleGrounds.add(groundName, ground);
            }
        }
    }

    private makeTurn() {
        let rnd : number = Utils.random(1, 2);
        var isTurnLeft : boolean = (rnd >= 1), turnRight : boolean = (rnd === 2);
        var posXLeft = -this.terrainWithRouteWidth/2, posY = 0, posZ = this.lastTerrainUpdatePositionZ,
            posXRight = this.terrainWithRouteWidth/2;
        console.log("Making new turn! " + ((isTurnLeft) ? "left" : "right"));

        if (isTurnLeft) {
            this.pickTerrain(posXRight, posY, posZ);
            posZ += this.routeWidth;
            this.pickTerrain(posXLeft + this.routeWidth/2, posY, posZ, this.terrainWidth + this.routeWidth);
        } else { // turnRight
            this.pickTerrain(posXLeft, posY, posZ);
            posZ += this.routeWidth;
            this.pickTerrain(posXRight - this.routeWidth/2, posY, posZ, this.terrainWidth + this.routeWidth);
        }

        this.lastTerrainUpdatePositionZ = posZ;

        this.turnVisible = true;
        this.turnStartZ = posZ - this.routeWidth - this.terrainWidth / 2;
        this.isTurnLeft = isTurnLeft;
    }

    private continueRoute() {
        console.log("Continuing route!");

        var posXLeft = -this.terrainWithRouteWidth/2, posY = 0, posZ = this.lastTerrainUpdatePositionZ,
            posXRight = this.terrainWithRouteWidth/2;

        this.pickTerrain(posXLeft, posY, posZ);
        this.pickTerrain(posXRight, posY, posZ);    

        this.lastTerrainUpdatePositionZ += this.terrainWidth;
    }

    private pickTerrain(posX : number, posY : number, posZ : number, width : number = this.terrainWidth, height : number = this.terrainWidth) 
            : BABYLON.AbstractMesh {
        var terrainName = Utils.getRandomDictionaryBucketKey(this.invisibleGrounds);
        var ground : BABYLON.AbstractMesh = this.invisibleGrounds.pick(terrainName);

        ground.scaling.x = width / this.terrainWidth;
        ground.scaling.z = height / this.terrainWidth;
        ground.position = new BABYLON.Vector3(posX, posY, posZ);
        this.visibleGrounds.add(terrainName, ground);

        return ground;
    }

    public getRouteWidth() : number {
        return this.routeWidth;
    }

    public getTerrainWidth() : number {
        return this.terrainWidth;
    }

    public getNumVisibleTerrains() : number {
        return this.numVisibleTerrains;
    }
}

// export {TerrainGenerator};
// }    