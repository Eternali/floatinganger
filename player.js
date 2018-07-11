class Player {

  constructor({ color, bindings, dir, vel, acc = new THREE.Vector3(0, 0, 0), rad = 1 }) {
    this.camera;
    this.color = color;
    this.bindings = bindings;
    this.dir = dir;
    this.vel = vel || new THREE.Vector3(0, 0, 0);
    this.acc = acc;
    this.rad = rad;

    this.body = new THREE.Mesh(
      new THREE.SphereGeometry(this.rad, 48, 48),
      new THREE.MeshPhongMaterial({ color: this.color, wireframe: false})
    );
    this.body.receiveShadow = true;
    this.body.castShadow = true;

    this.controls = {
      forward() {
        console.log('forward');
      },
      fire() {
        console.log('fire');
      },
      look(pos) {
        console.log(pos);
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

  spawn({ pos, scene, dims }) {
    this.body.position.set(...Object.values(pos));
    this.body.rotation.set(...Object.values(this.dir));
    this.camera = new THREE.PerspectiveCamera(
      90,
      dims.width / dims.height,
      0.1,
      1000
    );
    this.camera.position.set(
      pos.x - (this.dir.x % Math.PI) * 2,
      pos.y + (this.dir.y % Math.PI) * 2,
      pos.z - (this.dir.z % Math.PI) * 2
    );
    this.camera.lookAt(pos);

    scene.add(this.body);
  }

  updateCamera() {
    this.camera.translateX(this.dir.x * -0.2);
    this.camera.translateY(this.dir.y * 0.3);
    this.camera.translateZ(this.dir.z * -0.2);
  }

  update() {
    this.vel.addVectors(this.vel, this.acc);
    this.body.translateZ(this.vel.z);
  }

}
