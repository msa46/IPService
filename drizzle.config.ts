import {defineConfig} from 'drizzle-kit';

export default defineConfig({
    dialect: 'sqlite', // 'mysql' | 'postgesql' | 'turso'
    schema: './src/schema.ts'
  })