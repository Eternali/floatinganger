class Trailer {

  constructor({
    target,
    offset,
    quanta,
    totalClone = false,
    length,
  }) {
    this.target = target;
    this.length = length || this.target.hist.length;
    this.offset = offset;
    this.totalClone = totalClone;
    this.children = [...Array(Math.ceil(this.length / this.offset ))].map((_) => quanta.clone());

    // in order for each child to have its own color, the materials need to be independant,
    // thus the base body must be cloned.
    if (totalClone) {
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
    this.children[c].position.set(...Object.values(this.target.hist[c * this.offset]));
  }
  
  init(scene) {
    this.children.forEach((child, c, children) => {
      child.receiveShadow = true;
      child.castShadow = true;
      child.material.transparent = true;
      if (this.totalClone) {
        child.material.opacity = 1 - (c / children.length);
      }
      // child.scale.set(
      //   1 - (c + 1) / (children.length + 1),
      //   1 - (c + 1) / (children.length + 1),
      //   1 - (c + 1) / (children.length + 1),
      // );
      // this.setChild(c);
      scene.add(child);
    });
  }
  
  advance() {
    this.children.forEach((_, c) => this.setChild(c));
  }

}