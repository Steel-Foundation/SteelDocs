/**
 * Scans the Steel repo's behavior source files and classes.json to determine
 * which blocks and items have Rust struct implementations.
 *
 * Usage:
 *   bun run scripts/sync-implementation.ts <path-to-steel-repo>
 *
 * Output:
 *   Writes public/data/implementation-status.json
 */

import { readdir, readFile, mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";

const STEEL_PATH = process.argv[2];
if (!STEEL_PATH) {
  console.error("Usage: bun run scripts/sync-implementation.ts <path-to-steel-repo>");
  process.exit(1);
}

const steelRoot = resolve(STEEL_PATH);
const behaviorDir = join(steelRoot, "steel-core/src/behavior");
const classesJsonPath = join(steelRoot, "steel-core/build/classes.json");

// --- Scan .rs files for annotated structs ---

async function collectRsFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectRsFiles(full)));
    } else if (entry.name.endsWith(".rs")) {
      files.push(full);
    }
  }
  return files;
}

interface ClassInfo {
  todos: string[];
}

/**
 * Scans Rust source files for `#[block_behavior]` or `#[item_behavior]` annotations.
 * Returns a map of class name -> { todos } where todos is the count of TODO/FIXME
 * comments attributed to that struct (based on proximity in the source file).
 */
async function scanImplementedClasses(folder: string, annotation: string): Promise<Map<string, ClassInfo>> {
  const dir = join(behaviorDir, folder);
  const classes = new Map<string, ClassInfo>();

  const structPattern = new RegExp(
    `#\\[${annotation}\\]` +
    `[\\s\\S]*?` +
    `pub\\s+struct\\s+(\\w+)`,
    "g"
  );

  const files = await collectRsFiles(dir);
  for (const file of files) {
    const content = await readFile(file, "utf-8");
    const lines = content.split("\n");

    // Find all annotated structs and their positions
    const structs: { name: string; pos: number }[] = [];
    let match;
    while ((match = structPattern.exec(content)) !== null) {
      structs.push({ name: match[1], pos: match.index });
    }
    if (structs.length === 0) continue;

    // Extract TODO/FIXME comments with their text and position
    const todoEntries: { pos: number; text: string }[] = [];
    const todoLinePattern = /\b(TODO|FIXME):?\s*(.*)/;
    for (let i = 0; i < lines.length; i++) {
      const lineMatch = lines[i].match(todoLinePattern);
      if (!lineMatch) continue;

      // Get the initial TODO text
      let text = lineMatch[2].trim();

      // Collect continuation lines (comment lines that follow without a gap)
      for (let j = i + 1; j < lines.length; j++) {
        const cont = lines[j].match(/^\s*\/\/\s{2,}(.*)/);
        if (!cont) break;
        text += " " + cont[1].trim();
      }

      // Calculate byte offset for attribution
      const bytePos = lines.slice(0, i).reduce((sum, l) => sum + l.length + 1, 0);
      todoEntries.push({ pos: bytePos, text });
    }

    // Attribute each TODO to the nearest preceding struct
    const todoLists = new Map<string, string[]>();
    for (const struct of structs) todoLists.set(struct.name, []);

    for (const todo of todoEntries) {
      let closest: string | null = null;
      for (const struct of structs) {
        if (struct.pos <= todo.pos) closest = struct.name;
      }
      if (!closest) closest = structs[0].name;
      todoLists.get(closest)!.push(todo.text);
    }

    for (const struct of structs) {
      classes.set(struct.name, { todos: todoLists.get(struct.name) ?? [] });
    }
  }

  return classes;
}

// --- Parse classes.json ---

interface ClassEntry {
  name: string;
  class: string;
  [key: string]: unknown;
}

interface ClassesJson {
  blocks: ClassEntry[];
  items: ClassEntry[];
}

// --- Main ---

const [classesRaw, implementedBlockClasses, implementedItemClasses] = await Promise.all([
  readFile(classesJsonPath, "utf-8").then((raw) => JSON.parse(raw) as ClassesJson),
  scanImplementedClasses("blocks", "block_behavior"),
  scanImplementedClasses("items", "item_behavior"),
]);

function groupByClass(
  entries: ClassEntry[],
  implementedClasses: Map<string, ClassInfo>,
): Record<string, { implemented: boolean; todos: string[]; entries: string[] }> {
  const groups: Record<string, { implemented: boolean; todos: string[]; entries: string[] }> = {};
  for (const entry of entries) {
    if (!groups[entry.class]) {
      const info = implementedClasses.get(entry.class);
      groups[entry.class] = {
        implemented: info !== undefined,
        todos: info?.todos ?? [],
        entries: [],
      };
    }
    groups[entry.class].entries.push(entry.name);
  }
  return groups;
}

const blocks = groupByClass(classesRaw.blocks, implementedBlockClasses);
const items = groupByClass(classesRaw.items, implementedItemClasses);

const output = { blocks, items };

const outDir = join(import.meta.dirname!, "../public/data");
await mkdir(outDir, { recursive: true });
const outPath = join(outDir, "implementation-status.json");
await Bun.write(outPath, JSON.stringify(output, null, 2));

const totalBlocks = classesRaw.blocks.length;
const implBlocks = classesRaw.blocks.filter((b) => implementedBlockClasses.has(b.class)).length;
const totalItems = classesRaw.items.length;
const implItems = classesRaw.items.filter((i) => implementedItemClasses.has(i.class)).length;
const partialBlocks = Object.values(blocks).filter((g) => g.implemented && g.todos.length > 0).length;
const partialItems = Object.values(items).filter((g) => g.implemented && g.todos.length > 0).length;

console.log(`Wrote ${outPath}`);
console.log(`Blocks: ${implBlocks}/${totalBlocks} implemented (${partialBlocks} partial)`);
console.log(`Items:  ${implItems}/${totalItems} implemented (${partialItems} partial)`);
