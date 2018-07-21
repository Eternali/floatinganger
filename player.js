/**
 * Calculates the angle a body should be set to point directly at body b.
 * @param {THREE.Vector3} a  - position of first body
 * @param {THREE.Vector3} b  - position of second body
 */
let angleFromPos = (a, b) => new THREE.Vector3(
  Math.atan((a.y - b.y) / (a.z - b.z)),
  Math.atan((a.x - b.x) / (a.z - b.z)),
  Math.atan((a.x - b.x) / (a.y - b.y)),
);

/**
 * Calculates the angle a body should change by according to the mouse's position
 * @param {THREE.Vector2} mouse  - normalized position of the mouse on the screen
 * @param {THREE.Vector3} sensitivity  - how closely do we want to follow the mouse
 */
let angleFromMouse = (mouse, sensitivity) => new THREE.Vector3(
  mouse.y * Math.PI * sensitivity.x,
  -mouse.x * Math.PI * sensitivity.y,
  mouse.x * Math.abs(mouse.y) * Math.PI * sensitivity.z,
);

/**
 * Calculates the velocity and angle a projectile should be launched at according
 * to the mouse's position.
 * @param {Three.Vector2} mouse  - normalized position of the mouse on the screen
 */
let targetFromMouse = (mouse) => new THREE.Vector3(
  
);

/**
 * Generates an array of colors
 * @param {Number} length  - number of colors in array
 * @returns An array of length {length}
 */
let genRainbow = (length) => {
  let sinToHex = (i, p) =>
    (Math.floor(Math.sin(Math.PI / length * 2 * i + p) * 127) + 128).toString(16);

  return [...Array(length)]
    .map((_, c) => {
      let red = sinToHex(c, 0);
      let green = sinToHex(c,  Math.PI * (2 / 3));
      let blue = sinToHex(c, 2 * Math.PI * (2 / 3));

      return Number.parseInt('0x' + red + green + blue);
    });
};

class Player {

  constructor({
    color,
    bindings,
    envBounds = [ 10, 40 ],
    // The first is the probability that when an item leaves the valid range, a new item will
    // be generated to replace it, the second is the probability that a new item will be generated
    // on each render frame, keep in mind the hard limits of [envBounds] will always be respected.
    envGenFreq = [ 0.99, 0.0001 ],
    envSize = { lights: [2, 4], obstacles: [10, 14] },
    firedelay = 100,
    vel = new THREE.Vector3(0, 0, -0.01),
    dvel = new THREE.Vector3(0, 0, 0),
    acc = new THREE.Vector3(0, 0, 0),
    rad = 1,
  }) {
    this.firedelay = firedelay;
    this.sincefire = 0;
    this.camera;
    this.color = color;
    this.bindings = bindings;
    this.vel = vel;
    this.dvel = dvel;
    this.acc = acc;
    this.rad = rad;
    this.hist = [...Array(300)].fill(new THREE.Vector3(0, 0, 0));
    this.shots = [];
    this.controls = {};

    this.vel.clamp(
      new THREE.Vector3(-2, -2, -2),
      new THREE.Vector3(2, 2, 2),
    );
    this.acc.clamp(
      new THREE.Vector3(-4, -4, -4),
      new THREE.Vector3(4, 4, 4),
    );

    this.body = new THREE.Mesh(
      new THREE.SphereGeometry(this.rad, 48, 48),
      new THREE.MeshPhongMaterial({ color: this.color, wireframe: false})
    );
    this.body.receiveShadow = true;
    this.body.castShadow = true;

    this.trail = new DiscreteTrailer({
      target: {
        hist: this.hist,
        offset: 0.2,
        spacing: 12,
      },
      quanta: new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 24, 24),
        new THREE.MeshPhongMaterial({ color: 0xaaaaaa, wireframe: false })
      ),
      cloneOptions: {
        colors: genRainbow(100),
      },
      taper: true,
    });
    // this.trail = new TubeTrailer({
    //   target: {
    //     hist: this.hist,
    //     offset: 0,
    //   },
    //   colors: [0xffffff],
    // });

    this.envBounds = envBounds;
    this.envGenFreq = envGenFreq;
    this.envSize = envSize;
    this.envField = Object.entries(envSize)
      .reduce((acc, [k, _]) => { acc[k] = []; return acc; }, {});
  }

  bindControls(handler, scene) {
    this.controls = {
      forward: () => {
        this.vel.setZ(this.vel.z - 0.001);
      },
      fire: (_, mouse) => {
        if (this.firedelay > this.sincefire) return;
        this.shots.push(new WeaponShot(scene, {
          color: this.color,
          speed: this.vel.z * 24,
          pos: this.body.position,
          dir: this.body.rotation, // angleFromMouse(mouse.pos[0], new THREE.Vector3(1, 1, 1)),
        }));
        this.sincefire = 0;
      },
      look: (pos, hasLeft) => {
        this.dvel = hasLeft
          ? new THREE.Vector3(0, 0, 0)
          : angleFromMouse(
            pos.slice(-1)[0],
            new THREE.Vector3(0.008, 0.008, 0.012),
          );
      }
    };

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

  genEnvItem(item) {
    item.position.set(
      (Math.random() >= 0.5 ? 1 : -1) * Math.randomIn(...this.envBounds) + this.body.position.x,
      (Math.random() >= 0.5 ? 1 : -1) * Math.randomIn(...this.envBounds) + this.body.position.y,
      (Math.random() >= 0.5 ? 1 : -1) * Math.randomIn(...this.envBounds) + this.body.position.z,
    );
    scene.add(item);
    return item;
  }

  spawn({ pos, dir, scene, dims, envPool }) {
    this.camera = new THREE.PerspectiveCamera(
      90,
      dims.width / dims.height,
      0.1,
      1000
    );
    this.body.add(this.camera);
    
    this.body.position.set(...Object.values(pos));
    this.body.rotation.set(...Object.values(dir));
    this.hist.fill(pos.clone());
    
    this.camera.position.set(0, 5, 2);
    this.camera.lookAt(new THREE.Vector3(0, 2.1, 0));
    
    this.trail.init(scene);
    scene.add(this.body);

    // generate a random number of elements for each class of environmental element
    // and take a random mesh from the pool of possible meshes for the given class of element.
    Object.keys(this.envField).forEach((k) => {
      this.envField[k] = [...Array(Math.randomFloor(...this.envSize[k]))]
        .map((_) => envPool[k].takeRandom()(Math.randomFloor(0, 2) + 0.1, 0x66ff44, 4).clone());
      this.envField[k].forEach((el) => this.genEnvItem(el));
    });
  }

  update({ friction, timedelta, obstacles, envPool }) {
    this.sincefire += timedelta;

    if (Math.abs(this.vel.z) > 0.01) {
      this.vel.multiplyScalar(1 - friction);
    }
    
    // update body movement
    this.body.rotateX(this.dvel.x);
    this.body.rotateY(this.dvel.y);
    this.body.rotateZ(this.dvel.z);
    this.body.translateZ(this.vel.z);

    // update camera movement
    this.camera.rotateX(this.acc.x);
    this.camera.rotateY(this.acc.y);
    this.camera.rotateZ(this.acc.z);

    // update trail movement
    this.hist.shift();
    this.hist.push(this.body.position.clone());
    this.trail.advance();

    // update obstacles in the environment
    Object.entries(this.envField).forEach(([ty, els]) => els.map((el) =>
      (
        (this.body.position.x - el.position.x) > this.envBounds[1] ||
        (this.body.position.y - el.position.y) > this.envBounds[1] ||
        (this.body.position.z - el.position.z) > this.envBounds[1]
      ) ? Math.random() > this.envGenFreq[0]
        ? (() => {
          scene.remove(el);
          return this.genEnvItem(envPool[ty].takeRandom()(Math.randomFloor(0, 2) + 0.1, 0x66ff44, 4).clone());
        })() : (() => {
          scene.remove(el);
          return null;
        })() : el
    ).filter((el) => el !== null));
    // if (Math.random() > this.envGenFreq[1]) 

    // check collisions
    let collisions = this.shots.map((shot) => shot.update(obstacles) !== -1);
    // -1 is the only value returned if the shot hasn't collided with anything
    this.shots.filter((_, s) => collisions[s] === -1);

    return collisions;
  }

  envResized(constraints) {
    this.camera.aspect = constraints.width / constraints.height;
    this.camera.updateProjectionMatrix();
  }

}
