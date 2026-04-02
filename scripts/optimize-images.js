import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.resolve(__dirname, '../src/assets');
const images = [
    'perfil.jpg',
    'redes-do-vale.png',
    'twiniti.png',
    'metrifica.png',
    'delpupo-homes.png',
    'coffee.png'
];

async function convertImages() {
    console.log('Starting image conversion...');

    for (const image of images) {
        const inputPath = path.join(assetsDir, image);
        const outputPath = path.join(assetsDir, image.replace(/\.(png|jpg|jpeg)$/, '.webp'));

        if (fs.existsSync(inputPath)) {
            try {
                await sharp(inputPath)
                    .webp({ quality: 80 })
                    .toFile(outputPath);
                console.log(`Converted: ${image} -> ${path.basename(outputPath)}`);
            } catch (error) {
                console.error(`Error converting ${image}:`, error);
            }
        } else {
            console.warn(`File not found: ${inputPath}`);
        }
    }
}

convertImages();
