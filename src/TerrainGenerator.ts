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

    private routeWidth : number;
    private terrainWidth : number;
    private numVisibleTerrains : number;

    private lastTerrainUpdatePositionZ : number;
    private visibleGrounds : Dictionaries.DictionaryBucket;
    private invisibleGrounds : Dictionaries.DictionaryBucket;
    private turnVisible : boolean;

    constructor(scene : BABYLON.Scene, camera : BABYLON.TargetCamera, loader : Loader, player : Player, 
                routeWidth : number = 110, terrainWidth : number = 100, numVisibleTerrains : number = 5) {
        console.log("Initializing terrain generator");
        
        this.scene = scene;
        this.camera = camera;
        this.player = player;

        this.routeWidth = routeWidth;
        this.terrainWidth = terrainWidth;
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
            // mesh.checkCollisions = true;
        } 

        let endTime = new Date().getTime();
        console.log("Finished loading, loading took: " + (endTime - startTime) + " [ms]");
    }

    public initOnScene() {
        console.log("Init grounds on scene!");

        var posXLeft = -this.routeWidth/2, posY = 0, posZ = 0,
            posXRight = this.routeWidth/2;

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
                // this.makeTurn();
            }
        }    
    }

    private updateGroundsVisibility() {
        let it : Dictionaries.DictionaryBucketIterator = new Dictionaries.DictionaryBucketIterator(this.visibleGrounds);
        while (it.hasNext()) {
            var ground : BABYLON.AbstractMesh = it.next();
            // ground behind camera
            if (ground.position.z + ground.scaling.z/2 < this.camera.position.z) {
                var groundName = it.getCurrentKey();
                it.removeCurrent();
                this.invisibleGrounds.add(groundName, ground);
            }
        }
    }

    private makeTurn() {
        console.log("Making new turn!");
        let rnd : number = Utils.random(1, 2);
        var turnLeft : boolean = (rnd == 1), turnRight : boolean = (rnd == 2);
        var posXLeft = -this.routeWidth/2, posY = 0, posZ = this.lastTerrainUpdatePositionZ,
            posXRight = this.routeWidth/2;

        if (turnLeft) {
            this.pickTerrain(posXRight, posY, posZ);
        
            posZ += this.terrainWidth;

            this.pickTerrain(posXRight, posY, posZ);
            this.pickTerrain(0, posY, posZ, this.routeWidth);
            this.pickTerrain(posXLeft, posY, posZ);
        } else { // turnRight
            this.pickTerrain(posXLeft, posY, posZ);
        
            posZ += this.terrainWidth;

            this.pickTerrain(posXLeft, posY, posZ);
            this.pickTerrain(0, posY, posZ, this.routeWidth);
            this.pickTerrain(posXRight, posY, posZ);
        }

        this.turnVisible = true;
    }

    private continueRoute() {
        console.log("Continuing route!");

        var posXLeft = -this.routeWidth/2, posY = 0, posZ = this.lastTerrainUpdatePositionZ,
            posXRight = this.routeWidth/2;

        this.pickTerrain(posXLeft, posY, posZ);
        this.pickTerrain(posXRight, posY, posZ);    

        this.lastTerrainUpdatePositionZ += this.terrainWidth;
    }

    private pickTerrain(posX : number, posY : number, posZ : number, width : number = this.terrainWidth) : BABYLON.AbstractMesh {
        var terrainName = Utils.getRandomDictionaryBucketKey(this.invisibleGrounds);
        var ground = this.invisibleGrounds.pick(terrainName);

        // ground.scaling.z = width;
        ground.position = new BABYLON.Vector3(posX, posY, posZ);
        this.visibleGrounds.add(terrainName, ground);

        return ground;
    }
}

// export {TerrainGenerator};
// }    