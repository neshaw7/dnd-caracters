import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// O site fica em https://<usuario>.github.io/dnd-caracters/, entao em producao
// o base precisa ser o nome do repositorio. Em dev (npm run dev) fica em '/'.
// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/dnd-caracters/' : '/',
  plugins: [react(), tailwindcss()],
})
