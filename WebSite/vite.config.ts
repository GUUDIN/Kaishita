import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { viteStaticCopy } from "vite-plugin-static-copy";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig(({ command }) => {
  const isBuild = command === "build"; // Verifica se o comando é 'npm run build'

  return {
    plugins: [
      remix({
        basename: "/",                   // Define o caminho base da aplicação
        buildDirectory: "build",          // Diretório onde será gerado o build
        serverBuildFile: "index.js",      // Arquivo final do servidor
        ignoredRouteFiles: ["**/*.css"],  // Ignora arquivos CSS ao gerar rotas
        routes(defineRoutes) {            // Rotas manuais
          return defineRoutes((route) => {
            // Definição de rotas pode ser colocada aqui
          });
        },
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
          v3_singleFetch: true,
          v3_lazyRouteDiscovery: true,
        },
      }),
      tsconfigPaths(),
      isBuild &&
        viteStaticCopy({
          targets: [
            {
              src: "config.json",
              dest: "" // Copia para a raiz do build
            },
            {
              src: "app/.server/data/*",
              dest: "data" // Copia a pasta data para build/data
            }
          ],
        }),
    ].filter(Boolean), // Remove plugins nulos (evita problemas)
  };
});
