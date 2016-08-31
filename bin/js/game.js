define(["require", "exports", "./TerrainGenerator", "./Player", "./Loader"], function (require, exports, TerrainGenerator_1, Player_1, Loader_1) {
    "use strict";
    window.addEventListener('DOMContentLoaded', () => {
        // get the canvas DOM element
        var canvas = document.getElementById('renderCanvas');
        // load the 3D engine
        var engine = new BABYLON.Engine(canvas, true);
        var scene = new BABYLON.Scene(engine);
        var camera;
        var light;
        var loader;
        var terrainGenerator;
        var player;
        var useStaticScene = false;
        // createScene function that creates and return the scene
        var createScene = function () {
            camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0, 5, -20), scene);
            // camera = new BABYLON.FollowCamera("FollowCamera", new BABYLON.Vector3(0, 5, -20), scene);
            // camera.setTarget(BABYLON.Vector3.Zero());
            camera.attachControl(canvas, false);
            light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
            loader = new Loader_1.Loader(scene);
            terrainGenerator = new TerrainGenerator_1.TerrainGenerator(scene, camera, loader);
            player = new Player_1.Player(scene, camera, loader);
            terrainGenerator.load();
            player.load();
            terrainGenerator.initOnScene();
            player.initOnScene();
            loader.registerOnFinishTask(function () {
                scene.registerBeforeRender(update);
                engine.runRenderLoop(function () {
                    scene.render();
                });
            });
            return scene;
        };
        var update = function () {
            if (!useStaticScene) {
                player.update();
                terrainGenerator.update();
            }
        };
        // call the createScene function
        var scene = createScene();
        // the canvas/window resize event handler
        window.addEventListener('resize', () => {
            engine.resize();
        });
        // // run the render loop
        // engine.runRenderLoop(() => {
        //     scene.registerBeforeRender(update);
        //     scene.render();
        // });
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
        // Loading grounds!
        // groundLoader = new Loader(scene);
        // var groundMesh1 = groundLoader.importGround("textures/terrain_01.png", "textures/terrain_01_txt.png", 50, 50, 250, -10, 20);
        // var groundMesh2 = groundLoader.importGround("textures/terrain_02.png", "textures/terrain_02_txt.png", 50, 50, 250, -10, 20);
        // var posXLeft = -30, posY = 0, posZ = 0,
        //     posXRight = 30;
        // groundMesh1.position = new BABYLON.Vector3(posXLeft, posY, posZ);
        // groundMesh2.position = new BABYLON.Vector3(posXRight, posY, posZ);
        // for (var i = 0; i < 4; ++i) {
        //     posZ += 50;
        //     var clonedGroundMesh1 = groundLoader.cloneMesh(groundMesh1, i+1, new BABYLON.Vector3(posXLeft, posY, posZ));
        //     var clonedGroundMesh2 = groundLoader.cloneMesh(groundMesh2, i+1, new BABYLON.Vector3(posXRight, posY, posZ));
        // }    
        // var posXLeft = -30, posY = 0, posZ = 0,
        //     posXRight = 30;
        // for (var i = 0; i < 4; ++i) {
        //     createHeightmap("terrain_01", 50, 50, posXLeft, posY, posZ);
        //     createHeightmap("terrain_02", 50, 50, posXRight, posY, posZ);
        //     posZ += 50;
        // }  
        // meshesLoadedToZ = posZ;
        // loadOffsetZ = posZ;
        // var loader = new BABYLON.AssetsManager(scene);
        // var playerTankLoadTask = loader.addMeshTask("playerTank", "", "../assets/", "WZ213.obj"); 
        // // var teapot = loader.addMeshTask("teapot", "", "../assets/", "teapot.obj");
        // // var playerTank = loader.addMeshTask("tank1", "", "https://groups.csail.mit.edu/graphics/classes/6.837/F03/models/", "teapot.obj");
        // var tankLoaded = function(task) {
        //     task.loadedMeshes.forEach(function(mesh) {
        //         console.log("Loaded tank mesh! " + mesh.name);
        //         playerTankMeshes.unshift(mesh);
        //         //m.position.x -= position;
        //         mesh.position = new BABYLON.Vector3(0, 1, 0);
        //         mesh.rotation.y += 3.14;
        //         camera.target = mesh;
        //     });
        // };   
        // playerTankLoadTask.onSuccess = tankLoaded;
        // loader.onFinish = function() {
        //     scene.registerBeforeRender(update);
        //     engine.runRenderLoop(function () {
        //         scene.render();
        //     });
        // };
        // loader.load();
        // if (cameraZ > meshesLoadedToZ) {
        //             for (var ground of grounds) {
        //                 ground.position.z += loadOffsetZ;
        //             }    
        //             meshesLoadedToZ += loadOffsetZ;
        //             // var posXLeft = -30, posY = 0, posZ = meshesLoadedToZ,
        //             //     posXRight = 30;
        //             // for (var i = 0; i < 4; ++i) {
        //             //     createHeightmap("terrain_01", 50, 50, posXLeft, posY, posZ);
        //             //     createHeightmap("terrain_02", 50, 50, posXRight, posY, posZ);
        //             //     posZ += 50;
        //             // }  
        //             // meshesLoadedToZ = posZ;
        //         }
        //         for (var mesh of playerTankMeshes) {
        //         // console.log("Updating player tank Z position: " + playerTank.position.z);
        //         // if (playerTank && playerTank.position) {
        //             mesh.position.z += 0.001;
        //         }
    });
});
