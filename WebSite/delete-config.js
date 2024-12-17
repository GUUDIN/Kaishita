import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define o equivalente a __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho do arquivo a ser deletado
const filePath = path.join(__dirname, 'config.json');

// Função para deletar o arquivo
fs.unlink(filePath, (err) => {
    if (err) {
        console.error(`Erro ao deletar o arquivo: ${err.message}`);
    } else {
        console.log(`Arquivo deletado com sucesso: ${filePath}`);
    }
});
