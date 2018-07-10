class Key {

  constructor(
    name, code, onDown, onUp,
    whilePressed = null, isPressed = false
  ) {
    this.name = name;
    this.code = code;
    this.isPressed = isPressed;
    this.whilePressed = whilePressed;
    this.onDown = onDown;
    this.onUp = onUp;
  }

}

class EventHandler {

  constructor() {
    this.keyboard = {  };
  }

  bind(window, loader) {
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));

    window.onload = loader;
  }

  registerKey(key) {
    this.keyboard[key.code] = key;
  }

  continuous() {
    Object.values(this.keyboard)
      .filter((key) => key.whilePressed != null)
      .forEach((key) => key.whilePressed());
  }

  onKeyDown(event) {
    if (event.keyCode in this.keyboard) {
      this.keyboard[event.keyCode].isPressed = true;
      this.keyboard[event.keyCode].onDown();
    }
  }

  onKeyUp(event) {
    if (event.keyCode in this.keyboard) {
      this.keyboard[event.keyCode].isPressed = false;
      this.keyboard[event.keyCode].onUp();
    }
  }

}
