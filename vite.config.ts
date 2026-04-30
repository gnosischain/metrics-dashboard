import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_DEV_API_PROXY_TARGET || env.REACT_APP_DEV_API_PROXY_TARGET;
  const useLocalApiMiddleware = !proxyTarget;

  Object.entries(env).forEach(([key, value]) => {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  });

  if (process.env.NODE_ENV === undefined) {
    process.env.NODE_ENV = mode;
  }

  const localApiPlugin = useLocalApiMiddleware
    ? {
        name: 'local-api-middleware',
        configureServer(server) {
          const buildQuery = (searchParams: URLSearchParams) => {
            const query: Record<string, string | string[]> = {};
            searchParams.forEach((value, key) => {
              const existing = query[key];
              if (Array.isArray(existing)) {
                existing.push(value);
              } else if (existing !== undefined) {
                query[key] = [existing, value];
              } else {
                query[key] = value;
              }
            });
            return query;
          };

          const patchResponse = (res) => {
            res.status = (statusCode: number) => {
              res.statusCode = statusCode;
              return res;
            };
            res.json = (payload) => {
              if (!res.getHeader('Content-Type')) {
                res.setHeader('Content-Type', 'application/json');
              }
              res.end(JSON.stringify(payload));
              return res;
            };
            return res;
          };

          const loadApiHandler = (modulePath: string) => {
            const resolved = require.resolve(modulePath);
            delete require.cache[resolved];
            return require(resolved);
          };

          server.middlewares.use(async (req, res, next) => {
            const url = new URL(req.url || '/', 'http://localhost');
            const pathname = url.pathname;
            const handler =
              pathname === '/api/account-portfolio-search' ? loadApiHandler('./api/account-portfolio-search') :
              pathname === '/api/validator-explorer-search' ? loadApiHandler('./api/validator-explorer-search') :
              pathname === '/api/metrics' || pathname.startsWith('/api/metrics/') ? loadApiHandler('./api/metrics') :
              null;

            if (!handler) {
              next();
              return;
            }

            req.query = buildQuery(url.searchParams);
            patchResponse(res);

            try {
              await handler(req, res);
            } catch (error) {
              next(error);
            }
          });
        }
      }
    : null;

  return {
    plugins: [
      react({
        include: /\.[jt]sx?$/
      }),
      localApiPlugin
    ].filter(Boolean),
    envPrefix: ['VITE_', 'REACT_APP_'],
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.[jt]sx?$/,
      exclude: []
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx'
        }
      }
    },
    build: {
      outDir: 'build'
    },
    server: proxyTarget
      ? {
          proxy: {
            '/api': {
              target: proxyTarget,
              changeOrigin: true,
              secure: false
            }
          }
        }
      : undefined,
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setupTests.js',
      css: true,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html']
      }
    }
  };
});
