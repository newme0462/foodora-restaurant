import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// >>> REPLACE YOUR-GITHUB-REPOSITORY-NAME below with your exact GitHub repository name <<<
const REPO_NAME = 'foodora-restaurant';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Local dev uses '/', the production build (GitHub Pages) uses '/REPO_NAME/'
  base: command === 'build' ? `/${REPO_NAME}/` : '/',
}));
