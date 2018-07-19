class WeaponShot {

  constructor(scene, {
    color,
    speed,
    maxdist = 500,
    pos = THREE.Vector3(0, 0, 0),
    dir = Three.Vector3(0, 0, 0),
  }) {
    this.scene = scene;
    this.speed = speed;
    this.maxdist = maxdist;
    this.body = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 6, 6),
      new THREE.MeshPhongMaterial({ color: color, wireframe: false })
    );
    this.body.position.set(...Object.values(pos));
    this.body.rotation.set(...Object.values(dir));

    this.spawn();
  }

  spawn() {
    this.scene.add(this.body);
  }

  destroy() {
    this.scene.remove(this.body);
  }

  update(env) {
    this.body.translateZ(this.speed);
    if (this.body.position.length() > this.maxdist) {
      this.destroy();
      return true;
    }
    return false;
  }

}