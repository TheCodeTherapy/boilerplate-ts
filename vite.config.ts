import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { createHtmlPlugin } from "vite-plugin-html";
import { Plugin } from "vite";
import { optimize } from "svgo";
import fs from "fs";
import path from "path";
import mime from "mime-types";

const execDir = process.cwd();

function viteBase64ImagePlugin(): Plugin {
  return {
    name: "vite-base64-image-plugin",
    enforce: "pre",
    load(id: string) {
      if (
        id.startsWith("vite:") ||
        !id.startsWith("/") ||
        id.includes("\x00")
      ) {
        return null; // Skip handling non-filesystem or virtual paths
      }

      const extension = path.extname(id);
      const mimeType = mime.lookup(extension) || "application/octet-stream";

      if (extension === ".svg") {
        const svgContent = fs.readFileSync(id, "utf8");
        let optimized: string | null = null;
        try {
          const optimizedContent = optimize(svgContent, {
            plugins: [
              {
                name: "preset-default",
                params: { overrides: { removeViewBox: false } },
              },
              "removeComments",
              "cleanupIds",
            ],
            multipass: true,
          });
          optimized = optimizedContent.data;
        } catch (error) {
          console.log(
            `Couldn't optimize ${id} SVG file. Using unoptimized version.`
          );
        }
        const svg = optimized !== null ? optimized : svgContent;
        const encodedSvgContent = encodeURIComponent(svg)
          .replace(/'/g, "%27")
          .replace(/"/g, "%22");
        return `export default "data:image/svg+xml;charset=utf-8,${encodedSvgContent}"`;
      } else {
        if ([".png", ".jpg", ".jpeg", ".gif"].includes(extension)) {
          const fileBuffer = fs.readFileSync(id);
          const base64String = `data:${mimeType};base64,${fileBuffer.toString(
            "base64"
          )}`;
          return `export default "${base64String}"`;
        }
      }
    },
  };
}

function viteStripCommentsPlugin(): Plugin {
  return {
    name: "vite-strip-comments",
    enforce: "post",
    renderChunk(code) {
      const licenseCommentRegex = /\/\*\*[\s\S]*?@license[\s\S]*?\*\/\n/g;
      const newCode = code.replace(licenseCommentRegex, "");
      return { code: newCode, map: null };
    },
  };
}

function removeGitKeepPlugin(): Plugin {
  return {
    name: "remove-gitkeep",
    apply: "build",
    closeBundle() {
      const directory = path.resolve(__dirname, "dist");
      function removeGitKeep(directory: string) {
        fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
          const fullPath = path.join(directory, entry.name);
          if (entry.isDirectory()) {
            removeGitKeep(fullPath);
          } else if (entry.isFile() && entry.name === ".gitkeep") {
            fs.unlinkSync(fullPath);
          }
        });
      }
      removeGitKeep(directory);
    },
  };
}

export default defineConfig({
  plugins: [
    viteSingleFile(),
    createHtmlPlugin({ minify: true }),
    viteBase64ImagePlugin(),
    viteStripCommentsPlugin(),
    removeGitKeepPlugin(),
  ],
  build: {
    minify: "terser",
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    terserOptions: {
      mangle: {
        eval: true,
        keep_fnames: false,
        module: true,
        toplevel: true,
        safari10: false,
      },
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
