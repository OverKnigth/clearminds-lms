import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adminFile = path.join(__dirname, 'src', 'pages', 'Admin.tsx');
let content = fs.readFileSync(adminFile, 'utf8');

const mkdir = (dir) => fs.mkdirSync(path.join(__dirname, 'src', 'pages', 'Admin', dir), { recursive: true });

mkdir('hooks');
mkdir('tabs');
mkdir('modals');

// 1. Extract Types
const typesRegex = /(type Tab = .*?;\n\ninterface.*\n\})\n\nexport default/s;
const typesMatch = content.match(typesRegex);
// Wait, the regex in this format is too brittle.
