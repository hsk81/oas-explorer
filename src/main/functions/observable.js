function Observable({ get, set }) {
  this.get = function (key, value) {
    const item = get(key);
    if (item !== undefined) {
      return item;
    } else {
      return value;
    }
  };
  this.set = function (key, value) {
    set(key, value)
    return this;
  };
  this.on = function (key, handler) {
    this.set = on(this.set, (k, v) => {
      if (key === k) { handler(k, v); }
    });
    return this;
  };
  const on = (fn, gn) => {
    return (...args) => {
      if (gn(...args) !== false) {
        return fn(...args);
      }
    };
  };
};
exports.Observable = Observable;
