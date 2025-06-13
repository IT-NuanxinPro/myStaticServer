import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/assets/styles/global.scss";`
        }
      },
      postcss: {
        plugins: [
          require('postcss-px-to-viewport-update')({
            unitToConvert: 'px',
            viewportWidth: 375,
            unitPrecision: 5,
            propList: ['*', '!font-size'],
            viewportUnit: 'vw',
            fontViewportUnit: 'vw',
            selectorBlackList: [],
            minPixelValue: 1,
            mediaQuery: false,
            replace: true,
            exclude: [],
            include: undefined,
            landscape: false,
            landscapeUnit: 'vw',
            landscapeWidth: 568
          })
        ]
      }
    },
    server: {
      proxy: {
        '/api-list': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true
        }
      }
    }
  }
})