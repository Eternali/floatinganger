const eventHandler = new EventHandler();
const manager = new GameManager(
  clock = new THREE.Clock(),
  loadingManager = new THREE.LoadingManager(),
  renderer = new THREE.WebGLRenderer(),
  scene = new THREE.Scene()
);

let bodies = {
  ambientLight: new THREE.AmbientLight(0xffffff, 0.4),
  lights: [
    new THREE.PointLight(0xffffff, 1.1, 28),
  ],
  floor: new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20, 10, 10),
    new THREE.MeshPhongMaterial({ color: 0xdd0000, side: THREE.DoubleSide })
  )
};
bodies.floor.rotation.x -= Math.PI / 2;
bodies.floor.receiveShadow = true;

const player1 = new Player(
  0xff0000,
  { x: 20, y: 20, z: 20 },
  new THREE.Vector3(0, 0, 0),
);
const player2 = new Player(
  0x0000ff,
  { x: 40, y: 40, z: 40 },
  { x: 0, y: 0, z: 0 },
);

function setup() {
  // setup environment
  manager.addAll(Object.values(bodies));
  // manager.scene.add(bodies.ambientLight);
  // manager.scene.add(bodies.lights[0]);
  // manager.scene.add(bodies.floor);

  // spawn players
  player1.spawn(manager.scene, manager.renderer);
  player2.spawn(manager.scene, manager.renderer);

  // finalize renderer and enter into main game loop
  manager.init({ x: 800, y: 600 });
  manager.bind(document.body);
  draw();
}

function draw() {
  requestAnimationFrame(draw);

  // player1.update();
  // player2.update();

  manager.render(player1.camera);
}

eventHandler.bind(window, setup);
