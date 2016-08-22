window.addEventListener('DOMContentLoaded', function () {
    // get the canvas DOM element
    var canvas = document.getElementById('renderCanvas');
    // load the 3D engine
    var engine = new BABYLON.Engine(canvas, true);
    // createScene function that creates and return the scene
    var createScene = function () {
        // create a basic BJS Scene object
        var scene = new BABYLON.Scene(engine);
        // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
        var camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -20), scene);
        // target the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());
        // attach the camera to the canvas
        camera.attachControl(canvas, false);
        // create a basic light, aiming 0,1,0 - meaning, to the sky
        var light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
        // // create a built-in "sphere" shape; its constructor takes 5 params: name, width, depth, subdivisions, scene
        // var sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, scene);
        // // move the sphere upward 1/2 of its height
        // sphere.position.y = 1;
        // create skybox
        var skybox = BABYLON.Mesh.CreateBox("skyBox", 100.0, scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;
        skybox.infiniteDistance = true;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("textures/skybox", scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        // create a built-in "ground" shape; its constructor takes the same 5 params as the sphere's one
        var ground = BABYLON.Mesh.CreateGround('ground1', 60, 60, 2, scene);
        var loader = new BABYLON.AssetsManager(scene);
        var playerTank = loader.addMeshTask("playerTank", "", "../assets/", "WZ213.obj");
        // var teapot = loader.addMeshTask("teapot", "", "../assets/", "teapot.obj");
        // var playerTank = loader.addMeshTask("tank1", "", "https://groups.csail.mit.edu/graphics/classes/6.837/F03/models/", "teapot.obj");
        var pos = function (t) {
            t.loadedMeshes.forEach(function (m) {
                //m.position.x -= position;
                m.position = new BABYLON.Vector3(0, 0, 15);
                m.rotation.y += 3.14;
            });
        };
        playerTank.onSuccess = pos;
        loader.onFinish = function () {
            engine.runRenderLoop(function () {
                scene.render();
            });
        };
        loader.load();
        // return the created scene
        return scene;
    };
    // call the createScene function
    var scene = createScene();
    // run the render loop
    engine.runRenderLoop(function () {
        scene.render();
    });
    // the canvas/window resize event handler
    window.addEventListener('resize', function () {
        engine.resize();
    });
});
