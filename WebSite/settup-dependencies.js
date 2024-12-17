import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Define o equivalente a __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Garante que o path esteja definido no ES module
if (typeof path === 'undefined') {
    const path = await import('path');
}

// Função para verificar a existência da pasta node_modules e instalar dependências
function ensureDependencies() {
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    const packageLockPath = path.join(__dirname, 'package-lock.json');

    if (!fs.existsSync(nodeModulesPath)) {
        console.log('node_modules não encontrado. Instalando dependências...');
        execSync('npm install', { stdio: 'inherit' });
    } else {
        console.log('Verificando a integridade das dependências...');
        try {
            execSync('npm ci --audit=false', { stdio: 'inherit' });
            console.log('Todas as dependências estão atualizadas.');
        } catch (error) {
            console.error('Erro ao verificar dependências. Reinstalando...');
            execSync('npm install', { stdio: 'inherit' });
        }
    }
}

// Chama a função para garantir as dependências antes de iniciar
ensureDependencies();
