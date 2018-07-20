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

/**
 * This handles all user interaction through the keyboard and mouse (and any other input
 * that generates events). Each callback that is registered will receive the keyboard state and
 * the mouse state as parameters (with the exception of events related to mouse movement).
 */
class EventHandler {

  constructor(preventDefaults = true) {
    this.constraints = new THREE.Vector2(0, 0);
    this.preventDefaults = preventDefaults;
    this.keyboard = {  };
    this.mouse = {
      // keep a history of the last 4 mouse positions
      pos: Array(4).fill(new THREE.Vector2(0, 0)),
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

  bind(window, dom, loader, winResize) {
    this.constraints.set(window.innerWidth, window.innerHeight);

    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
    window.addEventListener('mousedown', this.onMouseDown.bind(this));
    window.addEventListener('mouseup', this.onMouseUp.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    dom.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    window.addEventListener('resize', winResize);

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
      .forEach((key) => key.whilePressed(this.keyboard, this.mouse));
    Object.values(this.mouse.keys)
      .filter((key) => key.isPressed && key.whilePressed !== null)
      .forEach((key) => key.whilePressed(this.keyboard, this.mouse));
  }

  onKeyDown(event) {
    if (!(event.keyCode in this.keyboard)) return;
    this.consumeEvent(event);
    this.keyboard[event.keyCode].isPressed = true;
    if (this.keyboard[event.keyCode].onDown !== null)
      this.keyboard[event.keyCode].onDown(this.keyboard, this.mouse);
  }

  onKeyUp(event) {
    if (!(event.keyCode in this.keyboard)) return;
    this.consumeEvent(event);
    this.keyboard[event.keyCode].isPressed = false;
    if (this.keyboard[event.keyCode].onUp !== null)
      this.keyboard[event.keyCode].onUp(this.keyboard, this.mouse);
  }

  onMouseDown(event) {
    if (!(event.button in this.mouse.keys)) return;
    this.consumeEvent(event);
    this.mouse.keys[event.button].isPressed = true;
    if (this.mouse.keys[event.button].onDown !== null)
      this.mouse.keys[event.button].onDown(this.keyboard, this.mouse);
  }

  onMouseUp(event) {
    if (!(event.button in this.mouse.keys)) return;
    this.consumeEvent(event);
    this.mouse.keys[event.button].isPressed = false;
    if (this.mouse.keys[event.button].onUp !== null)
      this.mouse.keys[event.button].onUp(this.keyboard, this.mouse);
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
