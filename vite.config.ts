import vue from '@vitejs/plugin-vue';
import { URL, fileURLToPath } from 'node:url';
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { type UserConfig, defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const config: UserConfig = {
        plugins: [
            vue(),
            AutoImport({
                imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
                dts: 'src/auto-imports.d.ts',
                resolvers: [
                    ElementPlusResolver({
                        importStyle: 'sass',
                    }),
                ],
            }),
            Components({
                resolvers: [
                    ElementPlusResolver({
                        importStyle: 'sass',
                    }),
                ],
                dts: 'src/components.d.ts',
            }),
        ],
        css: {
            preprocessorOptions: {
                scss: {
                    additionalData: (source: string, filePath: string) => {
                        if (filePath.endsWith('src/styles/element.scss')) {
                            return source;
                        }
                        return `@use "@/styles/element.scss" as *;\n${source}`;
                    },
                },
            },
        },
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        build: {
            chunkSizeWarningLimit: 512,
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            if (id.includes('echarts')) {
                                return 'echarts';
                            }
                        }
                    },
                },
            },
        },
        server: {
            host: '127.0.0.1',
            port: 5173,
            strictPort: true,
        },
    };

    try {
        const env = loadEnv(mode, process.cwd());
        const apiHost = new URL(env.VITE_API_HOST);
        if (config.server) {
            config.server.proxy = {
                [apiHost.pathname]: {
                    target: apiHost.origin,
                    changeOrigin: true,
                },
            };
        }
    } catch {}

    return config;
});
