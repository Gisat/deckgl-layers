import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// barrels.styles.mjs

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, "src");

// Path to the src directory (the current directory, not parent)
const outputFile = path.resolve(__dirname, 'styles.css');

// Function to find all CSS files recursively
function findCssFiles(dir, cssFiles = []) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('node_modules')) {
            findCssFiles(filePath, cssFiles);
        } else if (file.endsWith('.css')) {
            // Get the relative path from src directory
            const relativePath = "src/" + path.relative(srcDir, filePath).split(path.sep).join('/');
            cssFiles.push(relativePath);
            console.log(`Found CSS file: ${relativePath}`);
        }
    }
    
    return cssFiles;
}

// Find all CSS files
const cssFiles = findCssFiles(srcDir);

// Generate the CSS with imports
const imports = cssFiles.map(file => `@import './${file}';`).join('\n');

// Write the output file
// Delete the file if it exists first
if (fs.existsSync(outputFile)) {
    fs.unlinkSync(outputFile);
}

// Then write the new content
fs.writeFileSync(outputFile, imports);

console.log(`Generated styles.css with ${cssFiles.length} CSS imports`);