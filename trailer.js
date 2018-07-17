/**
 * Adds a tail to an object that follows the object's position.
 * NOTE: All offset parameters are relevant to position history and fps.
 */
class Trailer {

  constructor({
    target = { hist: [], offset: 0, spacing: 1 },
    quanta,
    length,
    cloneOptions,
    taper = true,
  }) {
    this.target = target;
    this.length = length || this.target.hist.length;
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
        child.material.color.setHex(rainbow.rainbow[
          c >= rainbow.length ? Math.floor(c / 2) : c
        ]);
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
        child.material.opacity = 1 - (c / children.length);
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