define(["require", "exports"], function (require, exports) {
    "use strict";
    class Player {
        constructor(scene, camera, loader) {
            this.scene = scene;
            this.camera = camera;
            this.loader = loader;
            this.playerMeshes = [];
            this.registerEvents();
        }
        load(playerObjFile = "WZ213.obj") {
            var that = this;
            var shouldSetCameraTarget = that.camera instanceof BABYLON.FollowCamera;
            var playerLoaded = function (task) {
                task.loadedMeshes.forEach(function (mesh) {
                    console.log("Loaded player mesh! " + mesh.name);
                    that.playerMeshes.push(mesh);
                    mesh.position = new BABYLON.Vector3(0, 1, 0);
                    mesh.rotation.y += Math.PI;
                    if (shouldSetCameraTarget && that.playerMeshes.length === 1) {
                        that.camera.target = mesh;
                    }
                });
            };
            this.loader.loadMesh(playerObjFile, playerLoaded, true);
        }
        initOnScene() {
        }
        update() {
            this.playerMeshes.forEach(function (mesh) {
                mesh.position.z += Player.MOVE_DELTA_Z;
            });
        }
        registerEvents() {
            var that = this;
            this.scene.actionManager = new BABYLON.ActionManager(this.scene);
            this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
                var key = evt.sourceEvent.key;
                switch (key) {
                    case "a":
                        this.playerMeshes.forEach(function (mesh) {
                            mesh.position.x -= Player.MOVE_DELTA_X;
                        });
                        break;
                    case "d":
                        this.playerMeshes.forEach(function (mesh) {
                            mesh.position.x += Player.MOVE_DELTA_X;
                        });
                        break;
                    case "z":
                        that.requestTurnLeft();
                        break;
                    case "c":
                        that.requestTurnRight();
                        break;
                    default:
                }
            }));
        }
        requestTurnLeft() {
        }
        requestTurnRight() {
        }
    }
    Player.MOVE_DELTA_X = 0.001;
    Player.MOVE_DELTA_Z = 0.1;
    exports.Player = Player;
});
