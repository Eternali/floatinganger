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
    this.children.forEach((child) => {
      if (totalClone) {
        child.material = quanta.material.clone();
      }
    });
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
      child.scale.set(
        1 - (c + 1) / (children.length + 1),
        1 - (c + 1) / (children.length + 1),
        1 - (c + 1) / (children.length + 1),
      );
      // this.setChild(c);
      scene.add(child);
    });
  }
  
  advance() {
    // console.log(this.target.hist[99].z === this.target.hist[50].z);
    this.children.forEach((_, c) => this.setChild(c));
    // console.log(this.children[0].position.x == this.target.hist[0].x)
  }

}