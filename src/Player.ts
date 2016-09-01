import {Loader} from "./Loader";

export class Player {
    private scene : BABYLON.Scene;
    private camera : BABYLON.TargetCamera;
    private loader : Loader;

    private playerMeshes : Array<BABYLON.AbstractMesh>;

    private static MOVE_DELTA_X : number = 0.1;
    private static MOVE_DELTA_Z : number = 1.6;

    constructor(scene : BABYLON.Scene, camera : BABYLON.TargetCamera, loader : Loader) {
        this.scene = scene;
        this.camera = camera;
        this.loader = loader;
        this.playerMeshes = [];
        this.registerEvents();
    }

    public load(playerObjFile : string = "WZ213.obj") {       
        var that = this;
        var shouldSetCameraTarget = that.camera instanceof BABYLON.FollowCamera; 
        var playerLoaded = function(task) {
            task.loadedMeshes.forEach(function(mesh) {
                console.log("Loaded player mesh! " + mesh.name);
                that.playerMeshes.push(mesh);
                mesh.position = new BABYLON.Vector3(0, 1, 0);
                mesh.rotation.y += Math.PI;

                if (shouldSetCameraTarget && that.playerMeshes.length === 1) {
                    (<BABYLON.FollowCamera>that.camera).target = mesh;
                }
            });
        };   

        this.loader.loadMesh(playerObjFile, playerLoaded, true);
    }

    public initOnScene() {
    }

    public update() {
        this.playerMeshes.forEach(function(mesh) {
            mesh.position.z += Player.MOVE_DELTA_Z;
        });    
    }

    public getPosition() : BABYLON.Vector3 {
        return this.playerMeshes[0].position;
    }

    private registerEvents() {
        var that = this;
        this.scene.actionManager = new BABYLON.ActionManager(this.scene);
        this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {    
            var key = evt.sourceEvent.key;
            switch (key) {
                case "a":   // move left
                    that.playerMeshes.forEach(function (mesh) {
                        mesh.position.x -= Player.MOVE_DELTA_X; 
                    });
                    break;
                case "d":   // move right
                    that.playerMeshes.forEach(function (mesh) {
                        mesh.position.x += Player.MOVE_DELTA_X; 
                    });
                    break;
                case "z":   // turn left
                    that.requestTurnLeft();
                    break;
                case "c":   // turn right
                    that.requestTurnRight();
                    break;
                default:                
            }    
        }));
    }

    private requestTurnLeft() {
    }

    private requestTurnRight() {
    }
}