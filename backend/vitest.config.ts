import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

config(); // charge le .env avant que les tests démarrent

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
    },
});