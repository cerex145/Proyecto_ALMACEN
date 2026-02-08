const fs = require('fs');
const https = require('https');
const path = require('path');

const fonts = [
    { name: 'Roboto-Regular.ttf', url: 'https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Regular.ttf' },
    { name: 'Roboto-Medium.ttf', url: 'https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Medium.ttf' },
    { name: 'Roboto-Italic.ttf', url: 'https://github.com/google/fonts/raw/main/apache/roboto/Roboto-Italic.ttf' },
    { name: 'Roboto-MediumItalic.ttf', url: 'https://github.com/google/fonts/raw/main/apache/roboto/Roboto-MediumItalic.ttf' }
];

const destDir = path.join(__dirname, 'src', 'assets', 'fonts');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

fonts.forEach(font => {
    const file = fs.createWriteStream(path.join(destDir, font.name));
    https.get(font.url, function (response) {
        response.pipe(file);
        file.on('finish', function () {
            file.close(() => console.log(`Downloaded ${font.name}`));
        });
    }).on('error', function (err) {
        fs.unlink(path.join(destDir, font.name));
        console.error(`Error downloading ${font.name}: ${err.message}`);
    });
});
