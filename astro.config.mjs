import { defineConfig } from 'astro/config';

export default defineConfig({
    output: 'static',
    site: 'https://zmrfzn.pages.dev',
    build: {
        assets: '_assets'
    },
    vite: {
        build: {
            cssMinify: true
        }
    }
});
