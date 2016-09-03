define(["require", "exports"], function (require, exports) {
    "use strict";
    class Road {
        constructor(scene, player, routeWidth, terrainWidth, numVisibleGrounds = 4) {
            this.scene = scene;
            this.player = player;
            this.routeWidth = routeWidth;
            this.terrainWidth = terrainWidth;
            this.numVisibleGrounds = numVisibleGrounds;
            this.routeGrounds = [];
        }
        load() {
            var scene = this.scene;
            var routeMaterial1 = new BABYLON.StandardMaterial("routeMaterial1", scene);
            routeMaterial1.diffuseTexture = new BABYLON.Texture("textures/route.jpg", scene);
            for (var i = 0; i < this.numVisibleGrounds; ++i) {
                var routeGround = BABYLON.Mesh.CreateGround("route1", this.routeWidth, this.terrainWidth, 100, scene);
                routeGround.material = routeMaterial1;
                this.routeGrounds.push(routeGround);
            }
        }
        initOnScene() {
            var posZ = 0;
            for (var routeGround of this.routeGrounds) {
                routeGround.position = new BABYLON.Vector3(0, 0, posZ);
                posZ += this.terrainWidth;
            }
            this.routeGroundUnderTank = 0;
        }
        update() {
            var tolerance = 5;
            if (this.player.getPosition().z - this.routeGrounds[0].position.z >= this.terrainWidth / 2 + tolerance) {
                // current ground becomes last (in  furthest distance)
                var currentGroundUnderTank = this.routeGrounds.shift();
                currentGroundUnderTank.position.z += (this.numVisibleGrounds) * this.terrainWidth;
                this.routeGrounds.push(currentGroundUnderTank);
            }
        }
    }
    exports.Road = Road;
});
