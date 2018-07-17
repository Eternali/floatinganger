class Rainbow {

  constructor(length, sections = 6) {
    this.maxRGB = 255;
    this.sections = sections;
    this.rainbow = [...Array(length)].map((_, r) => this.getColor(r / length));
  }

  getColor(i) {
    let sec = Math.floor(i * this.sections);
    let start = (i - (sec / this.sections)) * this.sections;
    let end = 1 - start;

    let color;
    switch (sec) {
      case 0:
        color = [1, start, 0];
        break;
      case 1:
        color = [end, 1, 0];
        break;
      case 2:
        color = [0, 1, start];
        break;
      case 3:
        color = [0, end, 1];
        break;
      case 4:
        color = [start, 0, 1];
        break;
      case 5:
        color = [1, 0, end];
        break;
    }

    color = color.map((c) => (c * this.maxRGB).toString(16).padStart(2, '0'));
    color.unshift('0x');
    return Number.parseInt(color.join(''), 16);
  }

}