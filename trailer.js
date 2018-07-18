/**
 * Adds a tail to an object that follows the object's position.
 * NOTE: All offset parameters are relevant to position history and fps.
 */
class Trailer {

  constructor({
    target = { hist: [], offset: 0, spacing: 1 },
    length,
  }) {
    this.target = target;
    this.length = length || this.target.hist.length;
  }

  init(scene) {  }
  advance() {  }
}

class DiscreteTrailer extends Trailer {

  constructor({
    target = { hist: [], offset: 0, spacing: 1 },
    length,
    quanta,
    cloneOptions,
    taper = true,
  }) {
    super({ target, length });
    this.cloneOptions = cloneOptions;
    this.taper = taper;

    this.children = [...Array(Math.ceil(this.length / this.target.spacing ))].map((_) => quanta.clone());

    // in order for each child to have its own color, the materials need to be independant,
    // thus the base body must be cloned.
    if (this.cloneOptions) {
      let rainbow = new Rainbow(Math.floor(this.length / 2));
      let round = 1;
      this.children.forEach((child, c) => {
        child.material = quanta.material.clone();
        child.material.opacity = this.cloneOptions.colors.slice(
          -Math.floor(this.cloneOptions.colors.length / this.length) * c
        )[0];
        // child.material.color.setHex(rainbow.rainbow[
        //   c >= rainbow.length ? Math.floor(c / 2) : c
        // ]);
      });
    }
  }

  setChild(c) {
    this.children[c].position.set(...Object.values(this.target.hist[c * this.target.spacing]));
    this.children[c].translateZ(this.target.offset);
  }
  
  init(scene) {
    this.children.forEach((child, c, children) => {
      child.receiveShadow = true;
      child.castShadow = true;
      child.material.transparent = true;
      if (this.cloneOptions) {
        child.material.opacity = c / children.length;
      }
      if (this.taper) {
        child.scale.set(
          (c + 1) / (children.length + 1),
          (c + 1) / (children.length + 1),
          (c + 1) / (children.length + 1),
        );
      }
      scene.add(child);
    });
  }
  
  advance() {
    this.children.forEach((_, c) => this.setChild(c));
  }

}

class TubeTrailer extends Trailer {

  constructor({
    target = { hist: [], offset: 0, spacing: 1 },
    length,
    colors = [],
    rad = 0.2,
  }) {
    super({ target, length });
    this.rad = rad;
    this.geometry = new THREE.TubeBufferGeometry(
      new THREE.CatmullRomCurve3(this.target.hist),
      length, this.rad, 24, true
    );
    this.geometry.dynamic = true;
    this.body = new THREE.Mesh(
      this.geometry,
      new THREE.MeshPhongMaterial({ color: colors[0], wireframe: false })
    );
  }

  init(scene) {
    this.body.receiveShadow = true;
    this.body.castShadow = true;
    scene.add(this.body);
  }

  advance() {
    this.geometry.parameters.path.points.map((_, p) => this.target.hist[p]);
    this.geometry.copy(new THREE.TubeBufferGeometry(
      new THREE.CatmullRomCurve3(this.target.hist),
      length, this.rad, 24, true
    ));
    this.geometry.needsUpdate = true;
  }

}
