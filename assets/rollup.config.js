const resolve = require('@rollup/plugin-node-resolve');
const typescript = require('@rollup/plugin-typescript');
const commonjs = require('@rollup/plugin-commonjs');
const path = require('path');
const glob = require('glob');
const fs = require('fs');

/**
 * Moves the generated TypeScript declaration files to the correct location.
 * The typescript plugin places .d.ts in dist/dist/ due to outDir resolution;
 * this plugin moves them back to dist/ and removes the leftover directory.
 */
const moveTypescriptDeclarationsPlugin = () => ({
    name: 'move-ts-declarations',
    writeBundle: async () => {
        const wrongDir = path.join(__dirname, 'dist', 'dist');
        const files = glob.sync(path.join(wrongDir, '**/*.d.ts'));
        files.forEach((file) => {
            const targetFile = path.join(__dirname, 'dist', path.basename(file));
            fs.renameSync(file, targetFile);
        });

        if (fs.existsSync(wrongDir)) {
            fs.rmSync(wrongDir, { recursive: true });
        }
    },
});

const peerDependencies = ['@hotwired/stimulus', 'tom-select'];

module.exports = {
    input: 'src/controller.ts',
    output: {
        file: 'dist/controller.js',
        format: 'esm',
    },
    external: peerDependencies,
    plugins: [
        resolve(),
        typescript({
            include: ['src/**/*.ts'],
            compilerOptions: {
                outDir: 'dist',
                declaration: true,
                emitDeclarationOnly: true,
            },
        }),
        commonjs(),
        moveTypescriptDeclarationsPlugin(),
    ],
};
