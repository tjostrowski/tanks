define(["require", "exports", "./TerrainGenerator"], function (require, exports, TerrainGenerator_1) {
    "use strict";
    window.addEventListener('DOMContentLoaded', () => {
        // get the canvas DOM element
        var canvas = document.getElementById('renderCanvas');
        // load the 3D engine
        var engine = new BABYLON.Engine(canvas, true);
        var scene = new BABYLON.Scene(engine);
        var playerTankMeshes = [];
        var terrainGenerator = new TerrainGenerator_1.TerrainGenerator();
        var camera;
        var meshesLoadedToZ = 0;
        var loadOffsetZ = 0;
        var grounds = [];
        var heightMapReady = function (mesh) {
            console.log("Height map loaded!");
            // m.position = new BABYLON.Vector3(0, 0, 50);
            // console.log("Height map " + namePrefix + " loaded!");
            // m.position = new BABYLON.Vector3(posX, posY, posZ);
        };
        var createHeightmap = function (namePrefix, width, height, posX, posY, posZ) {
            console.log("Loading: " + namePrefix);
            var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
            groundMaterial.diffuseTexture = new BABYLON.Texture("textures/" + namePrefix + "_txt.png", scene);
            var ground = BABYLON.Mesh.CreateGroundFromHeightMap("ground", "textures/" + namePrefix + ".png", width, height, 250, 0, 10, scene, false, heightMapReady);
            ground.material = groundMaterial;
            ground.position.x = posX;
            ground.position.y = posY;
            ground.position.z = posZ;
            grounds.unshift(ground);
        };
        // createScene function that creates and return the scene
        var createScene = function () {
            // create a basic BJS Scene object
            // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
            // var camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0, 5, -20), scene);
            // var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5,-20), scene);
            camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 5, -20), scene);
            // target the camera to scene origin
            // camera.setTarget(BABYLON.Vector3.Zero());
            // attach the camera to the canvas
            camera.attachControl(canvas, false);
            // create a basic light, aiming 0,1,0 - meaning, to the sky
            var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
            // // create a built-in "sphere" shape; its constructor takes 5 params: name, width, depth, subdivisions, scene
            // var sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, scene);
            // // move the sphere upward 1/2 of its height
            // sphere.position.y = 1;
            // create skybox
            // var skybox = BABYLON.Mesh.CreateBox("skyBox", 100.0, scene);
            // var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
            // skyboxMaterial.backFaceCulling = false;
            // skyboxMaterial.disableLighting = true;
            // skybox.material = skyboxMaterial;   
            // skybox.infiniteDistance = true;
            // skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
            // skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0); 
            // skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox", scene);
            // skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
            // var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
            // groundMaterial.diffuseTexture = new BABYLON.Texture("textures/terrain_01.png", scene);
            // var groundPlane = BABYLON.Mesh.CreatePlane("groundPlane", 200.0, scene);
            // groundPlane.material = groundMaterial;
            var posXLeft = -30, posY = 0, posZ = 0, posXRight = 30;
            for (var i = 0; i < 4; ++i) {
                createHeightmap("terrain_01", 50, 50, posXLeft, posY, posZ);
                createHeightmap("terrain_02", 50, 50, posXRight, posY, posZ);
                posZ += 50;
            }
            meshesLoadedToZ = posZ;
            loadOffsetZ = posZ;
            var loader = new BABYLON.AssetsManager(scene);
            var playerTankLoadTask = loader.addMeshTask("playerTank", "", "../assets/", "WZ213.obj");
            // var teapot = loader.addMeshTask("teapot", "", "../assets/", "teapot.obj");
            // var playerTank = loader.addMeshTask("tank1", "", "https://groups.csail.mit.edu/graphics/classes/6.837/F03/models/", "teapot.obj");
            var tankLoaded = function (task) {
                task.loadedMeshes.forEach(function (mesh) {
                    console.log("Loaded tank mesh! " + mesh.name);
                    playerTankMeshes.unshift(mesh);
                    //m.position.x -= position;
                    mesh.position = new BABYLON.Vector3(0, 1, 0);
                    mesh.rotation.y += 3.14;
                    camera.target = mesh;
                });
            };
            playerTankLoadTask.onSuccess = tankLoaded;
            loader.onFinish = function () {
                scene.registerBeforeRender(update);
                engine.runRenderLoop(function () {
                    scene.render();
                });
            };
            loader.load();
            // return the created scene
            return scene;
        };
        var update = function () {
            var cameraZ = camera.position.z;
            if (cameraZ > meshesLoadedToZ) {
                for (var ground of grounds) {
                    ground.position.z += loadOffsetZ;
                }
                meshesLoadedToZ += loadOffsetZ;
            }
            for (var mesh of playerTankMeshes) {
                // console.log("Updating player tank Z position: " + playerTank.position.z);
                // if (playerTank && playerTank.position) {
                mesh.position.z += 0.001;
            }
        };
        // call the createScene function
        var scene = createScene();
        // run the render loop
        engine.runRenderLoop(() => {
            scene.registerBeforeRender(update);
            scene.render();
        });
        // the canvas/window resize event handler
        window.addEventListener('resize', () => {
            engine.resize();
        });
    });
});
