import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      // Se o backend está na MESMA máquina:
      '/api': 'http://localhost:3333',

      // Se o backend estiver em OUTRA máquina/VM da sua rede:
      // '/api': 'http://192.168.1.4:3333',
    }
  }
})
