import vue from '@vitejs/plugin-vue';
import { URL, fileURLToPath } from 'node:url';
import AutoImport from 'unplugin-auto-import/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import Components from 'unplugin-vue-components/vite';
import { type UserConfig, defineConfig, loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());

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
            chunkSizeWarningLimit: 1024,
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
            proxy: {},
        },
    };

    try {
        const apiHost = new URL(env.VITE_API_HOST);
        if (config.server?.proxy) {
            config.server.proxy[apiHost.pathname] = {
                target: apiHost.origin,
                changeOrigin: true,
            };
        }
    } catch {}

    try {
        const trackerHost = new URL(env.VITE_ADS_HOST);
        if (config.server?.proxy) {
            config.server.proxy[trackerHost.pathname] = {
                target: trackerHost.origin,
                changeOrigin: true,
            };
        }
    } catch {}

    return config;
});
