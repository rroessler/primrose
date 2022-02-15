/// Native Modules
const fs = require('fs');
const path = require('path');

// grab the root content
const content = fs.readFileSync(path.join(__dirname, '../dist/primrose.js'), 'utf-8');

// split the content by lines
const lines = content.split(/\r?\n/);

// splice in the starting exports
lines.splice(1, 0, // add after the "use strict" declaration
    'Object.defineProperty(exports, "__esModule", { value: true });',
    'exports.Primrose = void 0;');

// and the exports
lines.splice(-1, 0, "exports.Primrose = Primrose;");

// and save the modifications
fs.writeFileSync(path.join(__dirname, '../dist/primrose.cjs.js'), lines.join('\n'));