class Quanta {

  constructor({
    body,
    hist,
  }) {
    this.body = body;
    this.hist = hist;
  }

  move(vel) {
    this.body.translateX(vel.x);
    this.body.translateY(vel.y;
    this.body.translateZ(vel.z);
  }

  advance(next) {
    this.hist.push({
      pos: this.body.position,
      rot: this.body.rotation,
    });
    this.body.rotation.set(...Object.values(next.hist[0].pos));
    this.body.position.set(...Object.values(next.hist[0].pos));
  }

}

class Trailer {

  constructor({
    target,
    offset,
    length,
    quantaBody,
  }) {
    this.target = target;
    this.offset = offset;
    this.length = length;
    this.quantaBody = quantaBody;
    this.children = [...Array(Math.ceil(this.length / this.offset ))]
      .map((_) => new Quanta({
        body: this.quantaBody,
        hist: [],
      }));
    this.children.forEach((child, c, children) => {
        child.body.material.transparent = true;
        // child.meterial.opacity = 1 - (c / children.length);
        child.body.scale.set(
          1 - (c + 1) / (children.length + 1),
          1 - (c + 1) / (children.length + 1),
          1 - (c + 1) / (children.length + 1),
        );
      });
  }

  init(scene) {
    this.children.forEach((child, c, children) => {
      child.body.position.set(...Object.values(this.target.position));
      child.body.rotation.set(...Object.values(this.target.rotation));

      scene.add(child.body);
    });
  }
  advance(vel) {
    for (let c = 1; c < this.children.length; c++) {
      this.children[c].advance(this.children[c - 1]);
    }
    this.children[0].move(vel);
  }

}