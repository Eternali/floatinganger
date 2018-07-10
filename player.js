class Player {

  constructor(color, pos, dir, vel = { x: 0, y: 0, z: 0 }, rad = 10) {
    this.camera;
    this.color = color;
    this.pos = pos;
    this.dir = dir;
    this.vel = vel;
    this.rad = rad;

    this.body = new THREE.Mesh(
      new THREE.SphereGeometry(this.rad, 100, 100),
      new THREE.MeshBasicMaterial({ color: this.color })
    );
    this.body.receiveShadow = true;
    this.body.castShadow = true;

  }

  spawn(scene, renderer) {
    this.body.position.set(this.pos);
    this.camera = new THREE.PerspectiveCamera(
      90,
      renderer.getSize().width / renderer.getSize().height,
      0.1,
      1000
    );
    this.camera.position.set(this.pos);
    this.camera.lookAt(this.dir);

    scene.add(this.body);
  }

}
