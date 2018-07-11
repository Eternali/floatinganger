const viewPort = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const eventHandler = new EventHandler();
const manager = new GameManager(
  clock = new THREE.Clock(),
  loadingManager = new THREE.LoadingManager(),
  renderer = new THREE.WebGLRenderer(),
  scene = new THREE.Scene()
);

let bodies = {
  ambientLight: new THREE.AmbientLight(0xffffff, 0.6),
  lights: [
    new THREE.PointLight(0xffffff, 1.1, 28),
  ],
  obstacles: [
    // new THREE.Mesh(
    //   new THREE.BoxGeometry(1,1,1),
    //   new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: false})
    // )
  ]
};
bodies.lights[0].position.set(0,13,0);
// bodies.obstacles[0].position.y += 2;
// bodies.obstacles[0].receiveShadow = true;
// bodies.obstacles[0].castShadow = true;

const player1 = new Player({
  color: 0xff0000,
  bindings: {
    forward: 87,
    fire: 68,
    look: 'mousemove',
  },
  dir: new THREE.Vector3(0, 0, 0),
});
const player2 = new Player({
  color: 0x0000ff,
  bindings: {
    forward: 38,
    fire: 39,
    // look: 'mousemove',
  },
  dir: new THREE.Vector3(0, 0, 0),
});

function setup() {
  // setup environment
  bodies.obstacles.push(player2.body);
  manager.addAll(Object.values(bodies));

  // player keybindings
  player1.bindControls(eventHandler);
  player2.bindControls(eventHandler);
  // spawn players
  player1.spawn({
    pos: new THREE.Vector3(10, 10, 10),
    scene: manager.scene,
    dims: viewPort,
  });
  player2.spawn({
    pos: new THREE.Vector3(-10, 10, -10),
    scene: manager.scene,
    dims: viewPort,
  });

  // finalize renderer and enter into main game loop
  manager.init(viewPort);
  manager.bind(document.body);
  draw();
}

function draw() {
  requestAnimationFrame(draw);

  // handle any ongoing events
  eventHandler.continuous();

  player1.update();
  player2.update();

  manager.render(player1.camera);
}

eventHandler.bind(window, setup);
