const stats = new Stats();

const viewPort = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const env = {
  friction: 0.01,
};

const eventHandler = new EventHandler();
const manager = new GameManager(
  clock = new THREE.Clock(),
  loadingManager = new THREE.LoadingManager(),
  renderer = new THREE.WebGLRenderer({ antialias: true }),
  scene = new THREE.Scene()
);

let rainbow = new Rainbow(6).rainbow;
let bodies = {
  ambientLight: new THREE.AmbientLight(0xffffff, 0.6),
  lights: [
    new THREE.PointLight(0xffffff, 1.1, 28),
  ],
  obstacles: [
    new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20, 10, 10),
      new THREE.MeshPhongMaterial({ color: rainbow[0], wireframe: false})
    )
  ]
};
bodies.lights[0].position.set(0,13,0);
bodies.obstacles[0].rotation.x -= Math.PI / 2;
bodies.obstacles[0].receiveShadow = true;
// bodies.obstacles[0].castShadow = true;

const player1 = new Player({
  color: 0xff0000,
  bindings: {
    forward: 87,
    fire: 68,
    look: 'mousemove',
  },
});
const player2 = new Player({
  color: 0x0000ff,
  bindings: {
    forward: 38,
    fire: 39,
    // look: 'mousemove',
  },
});

function setup() {
  // setup stats
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
  // setup environment
  manager.addAll(Object.values(bodies));

  // spawn players
  player1.spawn({
    pos: new THREE.Vector3(10, 10, 10),
    dir: new THREE.Vector3(0, Math.PI / 4, 0),
    scene: manager.scene,
    dims: viewPort,
  });
  player2.spawn({
    pos: new THREE.Vector3(0, 0, 0),
    dir: new THREE.Vector3(Math.PI / 4, Math.PI / 4, 0),
    scene: manager.scene,
    dims: viewPort,
  });
  // player keybindings
  player1.bindControls(eventHandler);
  player2.bindControls(eventHandler);
  
  // finalize renderer and enter into main game loop
  manager.init(viewPort);
  manager.bind(document.body);
  draw();
}

function draw() {
  stats.begin();

  // handle any ongoing events
  eventHandler.continuous();

  player1.update(env);
  player2.update(env);

  manager.render(player1.camera);

  stats.end();
  requestAnimationFrame(draw);  
}

eventHandler.bind(window, document.body, setup);
