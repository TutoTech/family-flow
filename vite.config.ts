import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";

const FALLBACK_BACKEND_URL = "https://fzstjebbxbejypgwamqx.supabase.co";
const FALLBACK_BACKEND_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6c3RqZWJieGJlanlwZ3dhbXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MzA5MzksImV4cCI6MjA4ODUwNjkzOX0.AGOYSP4H854nRCycl794WfNwJa1gX45UYI1iJoayvVQ";
const FALLBACK_BACKEND_PROJECT_ID = "fzstjebbxbejypgwamqx";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
      process.env.VITE_SUPABASE_URL ?? FALLBACK_BACKEND_URL
    ),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? FALLBACK_BACKEND_PUBLISHABLE_KEY
    ),
    "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(
      process.env.VITE_SUPABASE_PROJECT_ID ?? FALLBACK_BACKEND_PROJECT_ID
    ),
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    process.env.SENTRY_AUTH_TOKEN &&
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        ...(process.env.VITE_SENTRY_RELEASE
          ? { release: { name: process.env.VITE_SENTRY_RELEASE } }
          : {}),
        sourcemaps: { filesToDeleteAfterUpload: ["./dist/**/*.map"] },
      }),
  ].filter(Boolean),
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        /*
         * Isole les dépendances les plus volumineuses dans des chunks
         * séparés afin qu'elles soient mises en cache indépendamment du
         * code applicatif et chargées seulement lorsque c'est nécessaire.
         */
        manualChunks: {
          charts: ["recharts"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
}));
