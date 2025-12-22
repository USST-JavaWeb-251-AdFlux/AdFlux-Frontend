import { createApp } from 'vue';
import { createPinia } from 'pinia';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import App from '@/App.vue';
import router from '@/router';
import '@/styles/element.scss';
import '@/styles/index.scss';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
app.mount('#app');
