/**
 * Calculates the angle body a should be set to point directly at body b.
 * @param {THREE.Vector3} a  - position of first body
 * @param {THREE.Vector3} b  - position of second body
 */
let angleFromPos = (a, b) => new THREE.Vector3(
  Math.atan((a.y - b.y) / (a.z - b.z)),
  Math.atan((a.x - b.x) / (a.z - b.z)),
  Math.atan((a.x - b.x) / (a.y - b.y)),
);

/**
 * 
 * @param {THREE.Vector3} pos  - position of the body
 * @param {THREE.Vector2} mouse  - normalized position of the mouse on the screen
 * @param {Number} incline  - how closely do we want to follow the mouse
 */
let angleFromMouse = (pos, mouse, incline) => new THREE.Vector3(
  ,
  pos.y - mouse.y,
  ,
);

class Player {

  constructor({ color, bindings, vel, acc = new THREE.Vector3(0, 0, 0), rad = 1 }) {
    this.camera;
    this.color = color;
    this.bindings = bindings;
    this.vel = vel || new THREE.Vector3(0, 0, 0);
    this.acc = acc;
    this.rad = rad;

    this.body = new THREE.Mesh(
      new THREE.BoxGeometry(this.rad, this.rad, this.rad), // , 48, 48),
      new THREE.MeshPhongMaterial({ color: this.color, wireframe: false})
    );
    this.body.receiveShadow = true;
    this.body.castShadow = true;

    this.controls = {
      forward() {
        this.acc.setZ(2);
      },
      fire() {
        console.log('fire');
      },
      look(pos) {
        // console.log(pos);
      }
    };
  }

  bindControls(handler) {
    Object.entries(this.bindings)
      .filter(([_, key]) => typeof key === 'number')
      .forEach(([name, key]) => {
        handler.registerKey(key in MouseKeys
          ? new MouseButton({
            key: key,
            whilePressed: this.controls[name]
          }) : new Key({
            name: name,
            code: key,
            whilePressed: this.controls[name]
          })
        );
      });
    if (Object.values(this.bindings).indexOf('mousemove') >= 0)
      handler.registerMouseMove(this.controls.look);
  }

  spawn({ pos, dir, scene, dims }) {
    this.camera = new THREE.PerspectiveCamera(
      90,
      dims.width / dims.height,
      0.1,
      1000
    );
    this.body.add(this.camera);

    this.body.position.set(...Object.values(pos));
    this.body.rotation.set(...Object.values(dir));

    this.camera.position.set(0, 3, 1);
    this.camera.lookAt(new THREE.Vector3(0, 2.1, 0));

    scene.add(this.body);
  }

  updateCamera() {
    // this.camera.translateX(this.dir.x * -0.2);
    // this.camera.translateY(this.dir.y * 0.3);
    // this.camera.translateZ(this.dir.z * -0.2);
  }

  update() {
    this.vel.add(this.acc);
    // this.body.rotation.set(...Object.values(this.dir));
    this.body.translateZ(this.vel.z);
  }

}
