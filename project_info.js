import { readdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { join, resolve, extname } from "path";

// Extensions of files to include in the "File Contents" section
const includedExtensions = [".ts", ".js", ".json", ".css", ".scss", ".html"];

// Mapping file extensions to syntax highlighting languages for markdown
const syntaxHighlightingMap = {
  ".ts": "typescript",
  ".js": "javascript",
  ".json": "json",
  ".css": "css",
  ".scss": "scss",
  ".html": "html"
};

/**
 * Generate a tree structure for a directory.
 * Avoids adding extra empty lines for empty directories.
 * @param {string} dirPath - The directory path.
 * @param {string} prefix - The prefix for tree lines.
 * @returns {string} The tree structure.
 */
function generateTree(dirPath, prefix = "") {
  const entries = readdirSync(dirPath, { withFileTypes: true });
  const treeLines = [];

  // Filter entries to include only visible files and folders
  const visibleEntries = entries.filter((entry) => !entry.name.startsWith("."));

  visibleEntries.forEach((entry, index) => {
    const isLast = index === visibleEntries.length - 1;
    const line = `${prefix}${isLast ? "└── " : "├── "}${entry.name}`;
    treeLines.push(line);

    if (entry.isDirectory()) {
      const subDirPath = join(dirPath, entry.name);
      const subTree = generateTree(subDirPath, `${prefix}${isLast ? "    " : "│   "}`);

      // Add subTree only if it has meaningful content
      if (subTree.trim().length > 0) {
        treeLines.push(subTree);
      }
    }
  });

  return treeLines.join("\n");
}

/**
 * Generate the contents of all files with specified extensions in a directory.
 * @param {string} dirPath - The directory path.
 * @returns {string} The concatenated file contents in markdown format.
 */
function generateFileContents(dirPath) {
  const entries = readdirSync(dirPath, { withFileTypes: true });
  let fileContents = "";

  entries.forEach((entry) => {
    const fullPath = join(dirPath, entry.name);
    const extension = extname(entry.name).toLowerCase();

    if (entry.isFile() && includedExtensions.includes(extension)) {
      const content = readFileSync(fullPath, "utf8");
      const language = syntaxHighlightingMap[extension] || "";

      fileContents += `\n${entry.name}:\n\n\`\`\`${language}\n${content}\n\`\`\`\n`;
    } else if (entry.isDirectory()) {
      fileContents += generateFileContents(fullPath);
    }
  });

  return fileContents;
}

/**
 * Generate project information and save it to project_info.md.
 */
function generateProjectInfo() {
  const srcDir = resolve("src");
  const outputFilePath = resolve("project_info.md");

  if (!existsSync(srcDir)) {
    console.error("Error: src directory does not exist.");
    process.exit(1);
  }

  const treeStructure = generateTree(srcDir);
  const fileContents = generateFileContents(srcDir);

  const projectInfo = `# Project Information\n\n## Directory Structure\n\`\`\`\n${treeStructure}\n\`\`\`\n\n## File Contents\n${fileContents}`;

  writeFileSync(outputFilePath, projectInfo, "utf8");
  console.log(`Project information saved to ${outputFilePath}`);
}

// Run the script
generateProjectInfo();
