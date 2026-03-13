// tests/setup.js
class MockElement {
  constructor() {
    this.classList = {
      _classes: new Set(),
      toggle: (cls, val) => {
        if (val === undefined) {
          if (this.classList._classes.has(cls)) this.classList._classes.delete(cls);
          else this.classList._classes.add(cls);
        } else {
          if (val) this.classList._classes.add(cls);
          else this.classList._classes.delete(cls);
        }
      },
      add: (cls) => this.classList._classes.add(cls),
      remove: (cls) => this.classList._classes.delete(cls),
      contains: (cls) => this.classList._classes.has(cls)
    };
    this.style = {
      _props: {},
      setProperty: (prop, val) => { this.style._props[prop] = val; },
      display: '',
      animation: ''
    };
    this.textContent = '';
    this.src = '';
    this.offsetHeight = 0;
  }
  pause() {}
  play() { return Promise.resolve(); }
  appendChild() {}
  addEventListener() {}
}

const elements = {};

global.document = {
  getElementById: (id) => {
    if (!elements[id]) elements[id] = new MockElement();
    return elements[id];
  },
  documentElement: new MockElement(),
  createElement: (tag) => new MockElement(),
  head: {
    appendChild: () => {}
  }
};

global.window = {
  __NODE_TEST__: true
};

global.MockElement = MockElement;
global.domElements = elements;
