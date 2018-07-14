class Trailer {

  constructor({
    target,
    offset,
    length,
    quanta,
  }) {
    this.target = target;
    this.offset = offset;
    this.length = length;
    this.quanta = quanta;
    this.children = [...Array(Math.ceil(this.length / this.offset ))]
      .map((_) => this.quanta.clone())
    this.children.forEach((child, c, children) => {
        child.material.transparent = true;
        // child.meterial.opacity = 1 - (c / children.length);
        child.scale.set(
          1 - (c + 1) / (children.length + 1),
          1 - (c + 1) / (children.length + 1),
          1 - (c + 1) / (children.length + 1),
        );
      });
  }

  init(scene) {
    this.children.forEach((child, c, children) => {
      child.position.set(...Object.values(this.target.position));
      child.rotation.set(...Object.values(this.target.rotation));

      scene.add(child);
    });
  }
  advance(vel) {
    for (let c = 1; c < this.children.length; c++) {
      this.children[c].rotation.set(...Object.values(this.children[c - 1].rotation));
      this.children[c].position.set(...Object.values(this.children[c - 1].position));
    }
    this.children[0].translateX(vel.x);
    this.children[0].translateY(vel.y);
    this.children[0].translateZ(vel.z);
  }

}