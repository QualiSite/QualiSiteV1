import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

config(); // charge le .env avant que les tests démarrent

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        // Le JS compilé dans dist/ contient aussi les *.test.js issus de src/ ;
        // sans exclusion explicite, Vitest les redécouvre et fait tourner
        // chaque test deux fois (une fois en .ts, une fois en .js compilé).
        exclude: ['node_modules', 'dist'],
    },
});