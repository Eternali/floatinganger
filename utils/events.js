let MouseKeys = Object.freeze({
  LEFT: 0,
  RIGHT: 2,
});

class Key {

  constructor({
    name,
    code,
    onDown = null,
    onUp = null,
    whilePressed = null,
    isPressed = false,
  } = {  }) {
    this.name = name;
    this.code = code;
    this.onDown = onDown;
    this.onUp = onUp;
    this.whilePressed = whilePressed;
    this.isPressed = isPressed;
  }

}

class MouseButton {

  constructor({
    key,
    onDown = null,
    onUp = null,
    whilePressed = null,
    isPressed = false,
  } = {  }) {
    this.key = key;
    this.onDown = onDown;
    this.onUp = onUp;
    this.whilePressed = whilePressed;
    this.isPressed = isPressed;
  }

}

class EventHandler {

  constructor(preventDefaults = true) {
    this.constraints = new THREE.Vector2();
    this.preventDefaults = preventDefaults;
    this.keyboard = {  };
    this.mouse = {
      // keep a history of the last 4 mouse positions
      pos: new Array(4).map((_) => new THREE.Vector2(0, 0)),
      keys: {  },
      onMove: null,
    };
  }

  consumeEvent(event) {
    if (this.preventDefaults) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  bind(window, dom, loader) {
    this.constraints.set(window.innerWidth, window.innerHeight);

    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
    window.addEventListener('mousedown', this.onMouseDown.bind(this));
    window.addEventListener('mouseup', this.onMouseUp.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    dom.addEventListener('mouseleave', this.onMouseLeave.bind(this));

    window.onload = loader;
  }

  registerKey(key) {
    if ('code' in key)
      this.keyboard[key.code] = key;
    else if ('key' in key && key.key in MouseKeys)
      this.mouse.keys[key.key] = key;
  }

  registerMouseMove(onMove) {
    this.mouse.onMove = onMove;
  }

  continuous() {
    Object.values(this.keyboard)
      .filter((key) => key.isPressed && key.whilePressed != null)
      .forEach((key) => key.whilePressed());
    Object.values(this.mouse.keys)
      .filter((key) => key.isPressed && key.whilePressed !== null)
      .forEach((key) => key.whilePressed());
  }

  onKeyDown(event) {
    if (!(event.keyCode in this.keyboard)) return;
    this.consumeEvent(event);
    this.keyboard[event.keyCode].isPressed = true;
    if (this.keyboard[event.keyCode].onDown !== null)
      this.keyboard[event.keyCode].onDown();
  }

  onKeyUp(event) {
    if (!(event.keyCode in this.keyboard)) return;
    this.consumeEvent(event);
    this.keyboard[event.keyCode].isPressed = false;
    if (this.keyboard[event.keyCode].onUp !== null)
      this.keyboard[event.keyCode].onUp();
  }

  onMouseDown(event) {
    if (!(event.button in this.mouse.keys)) return;
    this.consumeEvent(event);
    this.mouse.keys[event.button].isPressed = true;
    if (this.mouse.keys[event.button].onDown !== null)
      this.mouse.keys[event.button].onDown();
  }

  onMouseUp(event) {
    if (!(event.button in this.mouse.keys)) return;
    this.consumeEvent(event);
    this.mouse.keys[event.button].isPressed = false;
    if (this.mouse.keys[event.button].onUp !== null)
      this.mouse.keys[event.button].onUp();
  }

  onMouseMove(event) {
    if (this.mouse.onMove === null) return;
    this.consumeEvent(event);
    this.mouse.pos.shift();
    this.mouse.pos.push(new THREE.Vector2(
      (event.clientX / this.constraints.x) * 2 - 1,
      -(event.clientY / this.constraints.y) * 2 + 1,
    ));
    this.mouse.onMove(this.mouse.pos, false);
  }

  onMouseLeave(event) {
    if (this.mouse.onMove === null) return;
    this.consumeEvent(event);
    this.mouse.onMove(this.mouse.pos, true);
  }

}
