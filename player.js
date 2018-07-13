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

class Tail {

  constructor({
    head,
    headOff,
    length,
    fidelity,
  }) {
    this.head = head;
    this.headOff = headOff;
    this.length = length;
    this.fidelity = fidelity;
  }

  init() {  }
  update(env) {  }

}

class BaseTail extends Tail {

  constructor({
    head,
    headOff,
    length,
    fidelity,
    colors,
  }) {
    super({ head, headOff, length, fidelity });
    this.colors = colors || genRainbow(fidelity);
    this.children = [...Array(this.fidelity)].map((_, b) => new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 24, 24),
      new THREE.MeshPhongMaterial({ color: this.colors[b], wireframe: false})
    ));
    this.children.forEach((body, b, arr) => {
      body.material.transparent = true;
      // body.material.opacity = 1 - (b / arr);
      body.scale.set(
        1 - (b + 1) / arr.length,
        1 - (b + 1) / arr.length,
        1 - (b + 1) / arr.length
      );
    });
  }

  init() {
    this.children.forEach((body, b, arr) => {
      body.position.set(0, 0, 0);
      body.rotation.set(...Object.values(this.head.rotation));
      body.translateZ(this.headOff + (b / arr.length) * this.length);
      this.head.add(body);
    });
  }

  update(env, vel) {
    for (let b = 0; b < this.children.length-1; b++) {
      this.children[b + 1].position.set(...Object.values(this.children[b].position));
    }
    this.children[0].position.set(...Object.values(vel));
    this.children[0].translateZ(this.headOff);
  }

}

class Player {

  constructor({
    color,
    bindings,
    vel = new THREE.Vector3(0, 0, -0.01),
    dvel = new THREE.Vector3(0, 0, 0),
    acc = new THREE.Vector3(0, 0, 0),
    rad = 1,
  }) {
    this.camera;
    this.color = color;
    this.bindings = bindings;
    this.vel = vel;
    this.dvel = dvel;
    this.acc = acc;
    this.rad = rad;

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

    this.tail = new BaseTail({
      head: this.body,
      headOff: 1.5,
      length: 6,
      fidelity: 12,
    });

    this.controls = {
      forward: () => {
        this.acc.setZ(-0.001);
      },
      fire: () => {
        console.log('fire');
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
    this.tail.init();

    this.body.position.set(...Object.values(pos));
    this.body.rotation.set(...Object.values(dir));

    this.camera.position.set(0, 5, 2);
    this.camera.lookAt(new THREE.Vector3(0, 2.1, 0));

    scene.add(this.body);
  }

  update(env) {
    if (this.vel.length() > 0.01) {
      this.acc.add(new THREE.Vector3(
        env.friction * (this.acc.x > 0 ? -1 : 1),
        env.friction * (this.acc.y > 0 ? -1 : 1),
        env.friction * (this.acc.z > 0 ? -1 : 1),
      ));
    } else this.acc.multiplyScalar(0.0);
    this.vel.add(this.acc);
    this.body.rotateX(this.dvel.x);
    this.body.rotateY(this.dvel.y);
    this.body.rotateZ(this.dvel.z);
    this.body.translateZ(this.vel.z);
    this.tail.update(env, this.vel);
  }

}
