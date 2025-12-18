import vue from '@vitejs/plugin-vue';
import { URL, fileURLToPath } from 'node:url';
import AutoImport from 'unplugin-auto-import/vite';
import ElementPlus from 'unplugin-element-plus/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());
    const apiHost = new URL(env.VITE_API_HOST);

    return {
        plugins: [
            vue(),
            AutoImport({
                imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
                dts: 'src/auto-imports.d.ts',
            }),
            Components({
                resolvers: [ElementPlusResolver()],
                dts: 'src/components.d.ts',
            }),
            ElementPlus({
                defaultLocale: 'zh-CN',
            }),
        ],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        server: {
            host: '127.0.0.1',
            port: 5173,
            strictPort: true,
            proxy: {
                [apiHost.pathname]: {
                    target: apiHost.origin,
                    changeOrigin: true,
                },
            },
        },
    };
});
