/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

/**
 * Removes all duplicates from an array.
 * 
 * @param {Function} getId Function that takes each array item and returns a unique identifier for it
 * @returns This array with all duplicates removed
 * @type Array
 */
Array.prototype.toSet = function(getId) {
  let seen = {  };
  return this.filter((item) => {
    let id = getId(item);
    return id in seen ? false : seen[id] = true;
  });
}

/**
 * Returns a random item from an array.
 * 
 * @returns A value of this array
 */
Array.prototype.takeRandom = function() {
  return this[Math.floor(Math.random() * this.length)];
}

/**
 * Returns a random number within a range.
 * 
 * @param {Number} min Minimum possible value
 * @param {Number} max Maximum possible value
 * @returns A number in the range [min, max]
 */
Math.randomIn = function(min, max) {
  return (this.random() * (max - min)) + min;
}

/**
 * A wrapper for Math.randomIn that only returns integers.
 * 
 * @param {Number} min Minimum possible value
 * @param {Number} max Maximum possible value
 * @returns An integer int the range [min, max]
 */
Math.randomFloor = function(min, max) {
  return this.floor(this.randomIn(min, max));
}
