import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// >>> REPLACE YOUR-GITHUB-REPOSITORY-NAME below with your exact GitHub repository name <<<
const REPO_NAME = 'YOUR-GITHUB-REPOSITORY-NAME';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Local dev uses '/', the production build (GitHub Pages) uses '/REPO_NAME/'
  base: command === 'build' ? `/${REPO_NAME}/` : '/',
}));
