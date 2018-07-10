class GameManager {

  constructor(clock, loadingManager, renderer, scene) {
    this.clock = clock;
    this.loadingManager = loadingManager;
    this.renderer = renderer;
    this.scene = scene;
    this.loaders = {  };
  }

  init(size) {
    this.loaders.textures = new THREE.TextureLoader(this.loadingManager);
    this.renderer.setSize(size.x, size.y);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;
  }

  bind(dom) {
    dom.appendChild(this.renderer.domElement);
  }

  render(camera) {
    this.renderer.render(this.scene, camera);
  }

  addAll(bodies) {
    bodies.forEach((body) => {
      if (Array.isArray(body)) this.addAll(body);
      else this.scene.add(body);
    });
  }

}
