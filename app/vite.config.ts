import reactRefresh from '@vitejs/plugin-react-refresh'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  base: './',
  build: { rollupOptions: {
    input: {
      main: './index.html',
      secure: './index-secure.html'
    }
  }}
})
