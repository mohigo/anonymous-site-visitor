const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  try {
    // Read the SVG file
    const svgBuffer = fs.readFileSync(path.join(__dirname, '../public/icon.svg'));
    
    // Create favicon.ico (32x32)
    await sharp(svgBuffer)
      .resize(32, 32)
      .toFormat('png')
      .toBuffer()
      .then(buffer => {
        fs.writeFileSync(path.join(__dirname, '../app/favicon.ico'), buffer);
        console.log('✅ Generated favicon.ico');
      });

    // Create apple-icon.png (180x180)
    await sharp(svgBuffer)
      .resize(180, 180)
      .toFormat('png')
      .toBuffer()
      .then(buffer => {
        fs.writeFileSync(path.join(__dirname, '../public/apple-icon.png'), buffer);
        console.log('✅ Generated apple-icon.png');
      });

    // Create favicon-32x32.png
    await sharp(svgBuffer)
      .resize(32, 32)
      .toFormat('png')
      .toBuffer()
      .then(buffer => {
        fs.writeFileSync(path.join(__dirname, '../public/favicon-32x32.png'), buffer);
        console.log('✅ Generated favicon-32x32.png');
      });

    // Create favicon-16x16.png
    await sharp(svgBuffer)
      .resize(16, 16)
      .toFormat('png')
      .toBuffer()
      .then(buffer => {
        fs.writeFileSync(path.join(__dirname, '../public/favicon-16x16.png'), buffer);
        console.log('✅ Generated favicon-16x16.png');
      });

  } catch (error) {
    console.error('Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicon(); 