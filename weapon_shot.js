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
      new THREE.SphereGeometry(0.1, 8, 8),
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

  detectCollisions(meshes) {
    let ray = new THREE.Raycaster();
    let localv, globalv, direction, results;
    for (let i = 0; i < this.body.geometry.vertices.length; i++) {
      localv = this.body.geometry.vertices[i].clone();
      globalv = localv.applyMatrix4(this.body.matrix);
      direction = globalv.sub(this.body.position);
      ray.set(this.body.position.clone(), direction.clone().normalize());
      results = ray.intersectObjects(meshes);
      if (results.length > 0 && results[0].distance < direction.length()) return true;
    }
    return false;
  }

  update(obstacles) {
    this.body.translateZ(this.speed);
    if (this.body.position.length() > this.maxdist) {
      this.destroy();
      return -2;
    }
    obstacles.forEach((obj, o) => {
      if (this.detectCollisions([obj])) return o;
    });

    return -1;
  }

}