const stats = new Stats();

const viewPort = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const friction = 0.01;
let rainbow = new Rainbow(6).rainbow;
let timedelta = 0.0;

const eventHandler = new EventHandler();
const manager = new GameManager(
  clock = new THREE.Clock(),
  loadingManager = new THREE.LoadingManager(),
  renderer = new THREE.WebGLRenderer({ antialias: true }),
  scene = new THREE.Scene()
);

const lightPool = [
  () => new THREE.PointLight(0xffffff, 1.1, 28),
  () => new THREE.PointLight(0xffff00, 1.4, 32),
  () => new THREE.PointLight(0xffcc66, 0.8, 20),
];
const obstaclePool = [
  (size, color, complexity) => { // asteroid
    let mesh = new THREE.Mesh(
      new THREE.BoxGeometry(size, size, size),
      new THREE.MeshPhongMaterial({ color: color, wireframe: false })
    );
    mesh.receiveShadow = true;
    mesh.castShadow = true;

    return mesh;
  },
  (size, color) => { // star
    let mesh = new THREE.Mesh(
      new THREE.SphereGeometry(size, size * 32, size * 32),
      new THREE.MeshPhongMaterial({ color: color, wireframe: false })
    );
    mesh.receiveShadow = true;
    mesh.castShadow = true;

    return mesh;
  },
  (size, color, complexity) => { // cloud
    let mesh = new THREE.Mesh(
      new THREE.SphereGeometry(size, size * 32, size * 32),
      new THREE.MeshPhongMaterial({ color: color, wireframe: false })
    );
    mesh.receiveShadow = true;
    mesh.castShadow = true;

    return mesh;
  },
];
let envPool = {
  lights: lightPool,
  obstacles: obstaclePool,
};

let bodies = {
  ambientLight: new THREE.AmbientLight(0xffffff, 0.6),
  lights: [  ],
  obstacles: [  ],
};

const player1 = new Player({
  firedelay: 0.2,
  color: 0xff0000,
  bindings: {
    forward: 87,
    fire: 68,
    look: 'mousemove',
  },
});
const player2 = new Player({
  firedelay: 0.2,
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
    envPool,
  });
  player2.spawn({
    pos: new THREE.Vector3(0, 0, 0),
    dir: new THREE.Vector3(Math.PI / 4, Math.PI / 4, 0),
    scene: manager.scene,
    dims: viewPort,
    envPool,
  });
  // player keybindings
  player1.bindControls(eventHandler, scene);
  player2.bindControls(eventHandler, scene);
  
  // finalize renderer and enter into main game loop
  manager.init(viewPort);
  manager.bind(document.body);
  draw();
}

function draw() {
  stats.begin();

  timedelta = manager.getFrameTime();
  // handle any ongoing events
  eventHandler.continuous();

  player1.update({ friction, timedelta, obstacles: [ player2.body ], envPool });
  player2.update({ friction, timedelta, obstacles: [ player2.body ], envPool });

  manager.render(player1.camera);

  stats.end();
  requestAnimationFrame(draw);  
}

eventHandler.bind(window, document, document.body, setup, () => {
  viewPort.width = window.innerWidth;
  viewPort.height = window.innerHeight;
  player1.envResized(viewPort);
  player2.envResized(viewPort);
  manager.resize(viewPort);
});
eventHandler.trapPointer(document.body);
