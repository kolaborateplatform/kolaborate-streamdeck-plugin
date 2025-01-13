const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');

// Configuration
const EXTENSION_DIR = path.join(__dirname, '../chrome-extension');
const DIST_DIR = path.join(__dirname, '../dist/extension');
const TEST_DIR = path.join(__dirname, '../tests/extension');

// Ensure our build directories exist
function ensureDirectories() {
    [DIST_DIR, TEST_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}

// Build the extension
function buildExtension() {
    return new Promise((resolve, reject) => {
        // Copy files to dist directory
        try {
            // Copy manifest
            const manifest = require(path.join(EXTENSION_DIR, 'manifest.json'));
            // Update manifest for production
            manifest.name = 'Kolaborate Google Meet Controls';
            manifest.description = 'Control Google Meet from your Stream Deck';
            
            fs.writeFileSync(
                path.join(DIST_DIR, 'manifest.json'),
                JSON.stringify(manifest, null, 2)
            );

            // Copy other extension files
            ['background.js', 'content.js'].forEach(file => {
                fs.copyFileSync(
                    path.join(EXTENSION_DIR, file),
                    path.join(DIST_DIR, file)
                );
            });

            // Copy icons if they exist
            const iconDir = path.join(EXTENSION_DIR, 'icons');
            if (fs.existsSync(iconDir)) {
                fs.mkdirSync(path.join(DIST_DIR, 'icons'), { recursive: true });
                fs.readdirSync(iconDir).forEach(file => {
                    fs.copyFileSync(
                        path.join(iconDir, file),
                        path.join(DIST_DIR, 'icons', file)
                    );
                });
            }

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

// Run extension tests
function runTests() {
    return new Promise((resolve, reject) => {
        try {
            execSync('node node_modules/jest/bin/jest.js --config jest.config.js tests/extension', { 
                stdio: 'inherit',
                cwd: process.cwd()
            });
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

// Pack the extension for distribution
function packExtension() {
    return new Promise((resolve, reject) => {
        exec(
            `cd ${DIST_DIR} && zip -r ../kolaborate-meet-extension.zip ./*`,
            (error, stdout, stderr) => {
                if (error) {
                    console.error('Extension packaging failed:', stderr);
                    reject(error);
                } else {
                    console.log('Extension packaged successfully');
                    resolve();
                }
            }
        );
    });
}

// Main build process
async function main() {
    try {
        console.log('Building Chrome extension...');
        
        // Ensure directories exist
        ensureDirectories();
        
        // Build the extension
        await buildExtension();
        console.log('Extension built successfully');
        
        // Run tests
        console.log('Running extension tests...');
        await runTests();
        console.log('Tests completed successfully');
        
        // Package the extension
        console.log('Packaging extension...');
        await packExtension();
        
        console.log('Build process completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

// Run the build process
main();