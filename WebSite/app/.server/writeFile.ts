import fs from 'fs';

// Função que salva valores em um arquivo
export function saveValueToFile(filePath: string, value: string): void {
    // Se o arquivo for acessado pela primeira vez, ele será limpo
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '');
    }

    // Lê o conteúdo atual do arquivo
    const existingContent = fs.readFileSync(filePath, 'utf-8');

    // Adiciona o novo valor no topo
    const newContent = `${value}\n${existingContent}`;

    // Salva o conteúdo atualizado no arquivo
    fs.writeFileSync(filePath, newContent, 'utf-8');

    // console.log(`Valor salvo com sucesso no arquivo: ${filePath}`);
}