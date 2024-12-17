import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';

// Função principal para adicionar arquivos e pastas ao ZIP
function createZipFromJson(jsonPath) {
  // Verifica se o JSON existe
  if (!fs.existsSync(jsonPath)) {
    console.error(`Arquivo JSON não encontrado: ${jsonPath}`);
    return;
  }

  // Lê e parseia o JSON
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  // Valida a estrutura do JSON
  if (!jsonData.files || !jsonData.output) {
    console.error('Estrutura inválida no JSON. Esperado: { files: [], output: "output.zip" }');
    return;
  }

  const zip = new AdmZip();

  // Adiciona arquivos ou pastas ao ZIP
  jsonData.files.forEach((item) => {
    const absolutePath = path.resolve(item);

    if (fs.existsSync(absolutePath)) {
      const stats = fs.statSync(absolutePath);

      if (stats.isDirectory()) {
        // Adiciona uma pasta inteira
        zip.addLocalFolder(absolutePath, path.basename(absolutePath));
        console.log(`Pasta adicionada: ${absolutePath}`);
      } else if (stats.isFile()) {
        // Adiciona um arquivo específico
        zip.addLocalFile(absolutePath);
        console.log(`Arquivo adicionado: ${absolutePath}`);
      }
    } else {
      console.warn(`Caminho não encontrado: ${absolutePath}`);
    }
  });

  // Escreve o arquivo ZIP no destino
  const outputZip = path.resolve(jsonData.output);
  zip.writeZip(outputZip);
  console.log(`Arquivo ZIP criado com sucesso: ${outputZip}`);
}

// Caminho do arquivo JSON passado via argumento
const jsonPath = process.argv[2] || 'files.json';

// Executa a função
createZipFromJson(jsonPath);
