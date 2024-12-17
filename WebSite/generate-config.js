import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Define o equivalente a __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Função para substituir palavras no conteúdo do JSON
function replacePaths(jsonContent, replacements) {
    let jsonString = JSON.stringify(jsonContent);

    for (const [original, replacement] of Object.entries(replacements)) {
        const regex = new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'); // Escapa caracteres especiais para o RegExp
        jsonString = jsonString.replace(regex, replacement);
    }

    return JSON.parse(jsonString);
}

// Caminhos dos arquivos
const inputFilePath = path.join(__dirname, 'app/.server/config/config.json');
const replacementFilePath = path.join(__dirname, 'prebuild.json');
const outputFilePath = path.join(__dirname, 'config.json');

// Leitura e manipulação dos arquivos JSON
try {
    // Lê o arquivo de entrada
    const inputData = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));

    // Lê o arquivo de substituições
    const replacements = JSON.parse(fs.readFileSync(replacementFilePath, 'utf8'));

    // Realiza as substituições
    const updatedData = replacePaths(inputData, replacements);

    // Salva o resultado em um novo arquivo
    fs.writeFileSync(outputFilePath, JSON.stringify(updatedData, null, 4), 'utf8');

    console.log(`Novo arquivo JSON criado em: ${outputFilePath}`);
} catch (error) {
    console.error('Erro ao processar os arquivos:', error.message);
}
