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
