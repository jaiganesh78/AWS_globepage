/**
 * Texture Analysis Utility - Inspects pixel dimensions, color channels, and equator alignment.
 */
const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('frontend/public/textures/world-map.png')
  .pipe(new PNG())
  .on('parsed', function() {
    console.log('Width:', this.width);
    console.log('Height:', this.height);
    console.log('Color type:', this.colorType);
    console.log('Bit depth:', this.bitDepth);
    console.log('Channels:', this.channels);
    console.log('Has alpha:', this.alpha);
    
    const data = this.data;
    console.log('\nPixel samples (RGBA) at grid positions:');
    for (let y = 0; y < this.height; y += Math.floor(this.height / 5)) {
      for (let x = 0; x < this.width; x += Math.floor(this.width / 5)) {
        const idx = (y * this.width + x) * 4;
        console.log(`  (${x},${y}): R=${data[idx]} G=${data[idx+1]} B=${data[idx+2]} A=${data[idx+3]}`);
      }
    }
    
    // Check if it's grayscale (R=G=B)
    let isGrayscale = true;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== data[i+1] || data[i] !== data[i+2]) {
        isGrayscale = false;
        break;
      }
    }
    console.log('\nIs grayscale (R=G=B):', isGrayscale);
    
    // Sample horizontal line at middle (equator) to see land/water pattern
    const midY = Math.floor(this.height / 2);
    console.log(`\nHorizontal line at y=${midY} (equator):`);
    let line = '';
    for (let x = 0; x < this.width; x += Math.floor(this.width / 80)) {
      const idx = (midY * this.width + x) * 4;
      const val = data[idx];
      line += val > 128 ? '#' : '.';
    }
    console.log(line);
    
    // Sample vertical line at middle (prime meridian expected at center)
    const midX = Math.floor(this.width / 2);
    console.log(`\nVertical line at x=${midX} (center):`);
    for (let y = 0; y < this.height; y += Math.floor(this.height / 20)) {
      const idx = (y * this.width + midX) * 4;
      const val = data[idx];
      console.log(`  y=${y}: ${val > 128 ? '#' : '.'} (val=${val})`);
    }
    
    // Sample vertical line at x=0 (left edge = -180° in Three.js UV)
    console.log(`\nVertical line at x=0 (left edge / -180°):`);
    for (let y = 0; y < this.height; y += Math.floor(this.height / 20)) {
      const idx = (y * this.width + 0) * 4;
      const val = data[idx];
      console.log(`  y=${y}: ${val > 128 ? '#' : '.'} (val=${val})`);
    }
    
    // Sample vertical line at x=width-1 (right edge = +180° in Three.js UV)
    console.log(`\nVertical line at x=${this.width-1} (right edge / +180°):`);
    for (let y = 0; y < this.height; y += Math.floor(this.height / 20)) {
      const idx = (y * this.width + (this.width-1)) * 4;
      const val = data[idx];
      console.log(`  y=${y}: ${val > 128 ? '#' : '.'} (val=${val})`);
    }
  });