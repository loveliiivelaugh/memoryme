import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(viteConfig, defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
        exclude: [
            'node_modules/**',
            'dist/**',
            'src/components/custom/ReusableNavbar/ReusableNavbar.test.tsx',
            'src/components/Auth/AuthForm.test.js',
            'src/components/Mui/Drawer/Drawer.spec.tsx'
        ]
    }
}));
