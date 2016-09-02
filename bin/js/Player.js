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
                    mesh.checkCollisions = true;
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
                // mesh.moveWithCollisions(new BABYLON.Vector3(0, 0, Player.MOVE_DELTA_Z));
                mesh.position.z += Player.MOVE_DELTA_Z;
            });
        }
        getPosition() {
            return this.playerMeshes[0].position;
        }
        registerEvents() {
            var that = this;
            this.scene.actionManager = new BABYLON.ActionManager(this.scene);
            this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
                var key = evt.sourceEvent.key;
                switch (key) {
                    case "a":
                        that.playerMeshes.forEach(function (mesh) {
                            mesh.position.x -= Player.MOVE_DELTA_X;
                        });
                        break;
                    case "d":
                        that.playerMeshes.forEach(function (mesh) {
                            mesh.position.x += Player.MOVE_DELTA_X;
                        });
                        break;
                    case "z":
                        that.requestTurn(true);
                        break;
                    case "c":
                        that.requestTurn(false);
                        break;
                    default:
                }
            }));
        }
        setTerrainGenerator(terrainGenerator) {
            this.terrainGenerator = terrainGenerator;
        }
        rotateY(angle) {
            this.playerMeshes.forEach(function (mesh) {
                mesh.rotation.y += angle;
            });
        }
        resetToInitialPosition() {
            this.playerMeshes.forEach(function (mesh) {
                mesh.position = new BABYLON.Vector3(0, 1, 0);
            });
        }
        requestTurn(isLeftTurn) {
            var turnSucceeded = this.terrainGenerator.requestTurn(isLeftTurn);
        }
    }
    Player.MOVE_DELTA_X = 0.1;
    Player.MOVE_DELTA_Z = 1.6;
    exports.Player = Player;
});
