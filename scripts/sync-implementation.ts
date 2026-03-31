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

/**
 * Scans Rust source files for `#[block_behavior]` or `#[item_behavior]` annotations
 * and extracts the struct name (which is used as the class name).
 */
async function scanImplementedClasses(folder: string, annotation: string): Promise<Set<string>> {
  const dir = join(behaviorDir, folder);
  const classes = new Set<string>();

  // Match: #[block_behavior] (with optional whitespace/attributes between) pub struct Name
  const pattern = new RegExp(
    `#\\[${annotation}\\]` +   // the annotation
    `[\\s\\S]*?` +              // anything between (other attributes, comments, etc.)
    `pub\\s+struct\\s+(\\w+)`,  // pub struct StructName
    "g"
  );

  const files = await collectRsFiles(dir);
  for (const file of files) {
    const content = await readFile(file, "utf-8");
    let match;
    while ((match = pattern.exec(content)) !== null) {
      classes.add(match[1]);
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
  implementedClasses: Set<string>,
): Record<string, { implemented: boolean; entries: string[] }> {
  const groups: Record<string, { implemented: boolean; entries: string[] }> = {};
  for (const entry of entries) {
    if (!groups[entry.class]) {
      groups[entry.class] = {
        implemented: implementedClasses.has(entry.class),
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

console.log(`Wrote ${outPath}`);
console.log(`Blocks: ${implBlocks}/${totalBlocks} implemented`);
console.log(`Items:  ${implItems}/${totalItems} implemented`);
