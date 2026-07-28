#!/usr/bin/env bun

/** Render tracked benchmark data as SVG charts, optionally replacing Steel trials. */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type Row = Record<string, string | number | null>;
type Results = { metadata: Record<string, unknown>; trials: Row[] };

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const defaultData = join(root, "src/data/benchmarks/2026-07-28-native-9950x");
const defaultScalingData = join(defaultData, "301x301");
const output = join(root, "src/assets/benchmarks");
const order = ["steel", "fabric"];
const labels: Record<string, string> = {
  steel: "Steel",
  fabric: "Fabric",
};
const colors: Record<string, string> = {
  steel: "#14b8a6",
  fabric: "#f59e0b",
};

function argument(name: string, fallback?: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  const fields = lines.shift()!.split(",");
  return lines.map((line) =>
    Object.fromEntries(
      line.split(",").map((value, index) => [fields[index], value]),
    ),
  );
}

function csv(rows: Row[], fields: string[]): string {
  const encode = (value: unknown) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  return `${fields.join(",")}\n${rows.map((row) => fields.map((field) => encode(row[field])).join(",")).join("\n")}\n`;
}

const mean = (values: number[]) =>
  values.reduce((sum, value) => sum + value, 0) / values.length;
const grouped = (trials: Row[], field: string) =>
  Object.fromEntries(
    order.map((server) => [
      server,
      trials
        .filter((row) => row.server === server)
        .map((row) => Number(row[field])),
    ]),
  );
const style = `<style>
  text { font-family: Inter, ui-sans-serif, system-ui, sans-serif; fill: #172033; }
  .muted { fill: #64748b; }
  .grid { stroke: #dbe3ef; stroke-width: 1; }
  .track { fill: #edf2f7; }
  @media (prefers-color-scheme: dark) {
    text { fill: #edf3fb; }
    .muted { fill: #9aacbf; }
    .grid { stroke: #334155; }
    .track { fill: #1e293b; }
  }
</style>`;
const document = (body: string, height = 440) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 ${height}" role="img">${style}${body}</svg>\n`;

async function barChart(
  trials: Row[],
  field: string,
  title: string,
  subtitle: string,
  unit: string,
  maximum: number,
  filename: string,
  labelsInside = true,
) {
  const values = grouped(trials, field);
  const left = 215,
    right = 905,
    width = right - left,
    firstRowY = 140,
    rowGap = 80,
    plotBottom = firstRowY + (order.length - 1) * rowGap + 32,
    tickY = plotBottom + 26;
  const parts = [
    `<text x="48" y="48" font-size="26" font-weight="700">${title}</text>`,
    `<text x="48" y="76" font-size="14" class="muted">${subtitle}</text>`,
  ];
  for (let tick = 0; tick < 5; tick++) {
    const value = (maximum * tick) / 4,
      x = left + (width * tick) / 4;
    parts.push(
      `<line x1="${x}" y1="104" x2="${x}" y2="${plotBottom}" class="grid"/>`,
    );
    parts.push(
      `<text x="${x}" y="${tickY}" text-anchor="middle" font-size="12" class="muted">${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}</text>`,
    );
  }
  order.forEach((server, index) => {
    const y = firstRowY + index * rowGap;
    const average = mean(values[server]);
    const barWidth = (width * average) / maximum;
    const markerXs = values[server].map(
      (value: number) => left + (width * value) / maximum,
    );
    parts.push(
      `<text x="48" y="${y + 7}" font-size="17" font-weight="650">${labels[server]}</text>`,
    );
    parts.push(
      `<rect x="${left}" y="${y - 16}" width="${width}" height="32" rx="8" class="track"/>`,
    );
    parts.push(
      `<rect x="${left}" y="${y - 16}" width="${barWidth.toFixed(1)}" height="32" rx="8" fill="${colors[server]}"/>`,
    );
    markerXs.forEach((x: number, trial: number) => {
      parts.push(
        `<circle cx="${x.toFixed(1)}" cy="${y + [-5, 0, 5][trial]}" r="4" fill="#ffffff" stroke="${colors[server]}" stroke-width="2"/>`,
      );
    });
    const inside = labelsInside && barWidth > width * 0.65;
    const labelX = inside
      ? Math.min(...markerXs) - 12
      : Math.max(left + barWidth, ...markerXs) + 12;
    parts.push(
      `<text x="${labelX.toFixed(1)}" y="${y + 6}" text-anchor="${inside ? "end" : "start"}" font-size="15" font-weight="700">${average.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ${unit}</text>`,
    );
  });
  await writeFile(
    join(output, filename),
    document(parts.join(""), tickY + 26),
  );
}

async function memoryChart(trials: Row[], samples: Record<string, string>[]) {
  const medianRuns = Object.fromEntries(
    order.map((server) => {
      const rows = trials
        .filter((row) => row.server === server)
        .sort((a, b) => Number(a.wall_seconds) - Number(b.wall_seconds));
      return [server, Number(rows[Math.floor(rows.length / 2)].run)];
    }),
  );
  const left = 90,
    right = 910,
    top = 105,
    bottom = 325;
  const width = right - left,
    height = bottom - top;
  const longest = Math.max(
    ...order.map((server) =>
      Number(
        trials.find(
          (row) =>
            row.server === server &&
            Number(row.run) === medianRuns[server],
        )?.wall_seconds ?? 0,
      ),
    ),
  );
  const maxSeconds = Math.ceil(longest / 15) * 15,
    maxGib = 4;
  const parts = [
    '<text x="48" y="48" font-size="26" font-weight="700">Resident memory during generation</text>',
    '<text x="48" y="76" font-size="14" class="muted">Median-duration run for each server · process RSS sampled every 250 ms</text>',
  ];
  for (let tick = 0; tick < 6; tick++) {
    const seconds = (maxSeconds * tick) / 5,
      x = left + (width * tick) / 5;
    parts.push(
      `<line x1="${x}" y1="${top}" x2="${x}" y2="${bottom}" class="grid"/>`,
    );
    parts.push(
      `<text x="${x}" y="354" text-anchor="middle" font-size="12" class="muted">${seconds.toFixed(0)}s</text>`,
    );
  }
  for (let tick = 0; tick < 5; tick++) {
    const gib = (maxGib * tick) / 4,
      y = bottom - (height * tick) / 4;
    parts.push(
      `<line x1="${left}" y1="${y}" x2="${right}" y2="${y}" class="grid"/>`,
    );
    parts.push(
      `<text x="72" y="${y + 4}" text-anchor="end" font-size="12" class="muted">${gib} GiB</text>`,
    );
  }
  order.forEach((server) => {
    const rows = samples
      .filter(
        (row) =>
          row.server === server &&
          Number(row.run) === medianRuns[server] &&
          row.phase === "benchmark" &&
          row.benchmark_seconds !== "",
      )
      .sort(
        (a, b) => Number(a.benchmark_seconds) - Number(b.benchmark_seconds),
      );
    const points = rows.map((row) => {
      const x =
        left +
        (width * Math.min(Number(row.benchmark_seconds), maxSeconds)) /
          maxSeconds;
      const y =
        bottom -
        (height * Math.min(Number(row.rss_bytes) / 1024 ** 3, maxGib)) / maxGib;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    parts.push(
      `<polyline points="${points.join(" ")}" fill="none" stroke="${colors[server]}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`,
    );
    if (points.length) {
      const [x, y] = points.at(-1)!.split(",");
      parts.push(
        `<circle cx="${x}" cy="${y}" r="5" fill="${colors[server]}"/>`,
      );
    }
  });
  [385, 570].forEach((x, index) => {
    const server = order[index];
    parts.push(
      `<line x1="${x}" y1="388" x2="${x + 28}" y2="388" stroke="${colors[server]}" stroke-width="4"/>`,
    );
    parts.push(
      `<text x="${x + 38}" y="393" font-size="14">${labels[server]}</text>`,
    );
  });
  await writeFile(
    join(output, "chunk-generation-memory.svg"),
    document(parts.join(""), 415),
  );
}

async function scalingChart(shortTrials: Row[], longTrials: Row[]) {
  const left = 215,
    right = 905,
    width = right - left,
    maximum = 3500,
    plotBottom = 292;
  const parts = [
    '<text x="48" y="48" font-size="26" font-weight="700">Throughput at larger region sizes</text>',
    '<text x="48" y="76" font-size="14" class="muted">101×101: mean of three cold runs · 301×301: one cold run</text>',
  ];
  for (let tick = 0; tick < 5; tick++) {
    const value = (maximum * tick) / 4,
      x = left + (width * tick) / 4;
    parts.push(
      `<line x1="${x}" y1="104" x2="${x}" y2="${plotBottom}" class="grid"/>`,
    );
    parts.push(
      `<text x="${x}" y="320" text-anchor="middle" font-size="12" class="muted">${value.toLocaleString("en-US")}</text>`,
    );
  }
  order.forEach((server, index) => {
    const short = mean(
      shortTrials
        .filter((row) => row.server === server)
        .map((row) => Number(row.chunks_per_second)),
    );
    const long = mean(
      longTrials
        .filter((row) => row.server === server)
        .map((row) => Number(row.chunks_per_second)),
    );
    const y = 145 + index * 105;
    parts.push(
      `<text x="48" y="${y + 13}" font-size="17" font-weight="650">${labels[server]}</text>`,
    );
    for (const [value, offset, opacity, size] of [
      [short, -13, 0.55, "101×101"],
      [long, 17, 1, "301×301"],
    ] as const) {
      const barWidth = (width * value) / maximum;
      const labelX = left + barWidth + 9;
      parts.push(
        `<rect x="${left}" y="${y + offset - 10}" width="${barWidth.toFixed(1)}" height="20" rx="5" fill="${colors[server]}" opacity="${opacity}"/>`,
      );
      parts.push(
        `<text x="${labelX.toFixed(1)}" y="${y + offset + 5}" text-anchor="start" font-size="12" font-weight="650">${value.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} · ${size}</text>`,
      );
    }
  });
  parts.push(
    '<text x="560" y="354" text-anchor="middle" font-size="12" class="muted">chunks per second</text>',
  );
  await writeFile(
    join(output, "chunk-generation-scaling.svg"),
    document(parts.join(""), 374),
  );
}

async function main() {
  const data = resolve(argument("--data", defaultData)!);
  const scalingData = resolve(argument("--scaling-data", defaultScalingData)!);
  const replacement = argument("--replace-steel");
  const results: Results = JSON.parse(
    await readFile(join(data, "results.json"), "utf8"),
  );
  const scalingResults: Results = JSON.parse(
    await readFile(join(scalingData, "results.json"), "utf8"),
  );
  let samples = parseCsv(await readFile(join(data, "samples.csv"), "utf8"));
  if (replacement) {
    const incoming: Results = JSON.parse(
      await readFile(join(resolve(replacement), "results.json"), "utf8"),
    );
    const steelTrials = incoming.trials.filter((row) => row.server === "steel");
    if (steelTrials.length !== 3)
      throw new Error(
        `Expected 3 Steel replacement trials, found ${steelTrials.length}`,
      );
    results.trials = [
      ...steelTrials,
      ...results.trials.filter((row) => row.server !== "steel"),
    ];
    samples = [
      ...parseCsv(
        await readFile(join(resolve(replacement), "samples.csv"), "utf8"),
      ).filter((row) => row.server === "steel"),
      ...samples.filter((row) => row.server !== "steel"),
    ];
    for (const key of [
      "created_at",
      "steel_commit",
      "steel_binary_sha512",
      "steel_binary_modified_at",
      "steel_pregen_window_size",
    ]) {
      if (key in incoming.metadata)
        results.metadata[key] = incoming.metadata[key];
    }
    const windowSize = argument("--steel-window-size");
    if (windowSize)
      results.metadata.steel_pregen_window_size = Number(windowSize);
  }
  results.trials = results.trials.map(({ raw_log: _, ...row }) => row);
  await mkdir(output, { recursive: true });
  const throughputMax =
    Math.ceil(
      Math.max(...results.trials.map((row) => Number(row.chunks_per_second))) /
        0.8 /
        500,
    ) * 500;
  await barChart(
    results.trials,
    "chunks_per_second",
    "Chunk generation throughput",
    "10,201 chunks · mean of three cold runs · dots show individual runs",
    "chunks/s",
    throughputMax,
    "chunk-generation-throughput.svg",
    false,
  );
  await barChart(
    results.trials,
    "average_cpu_cores",
    "CPU parallelism during generation",
    "Mean process CPU time divided by wall time · 32 logical CPUs available",
    "cores",
    32,
    "chunk-generation-cpu.svg",
  );
  await memoryChart(results.trials, samples);
  await scalingChart(results.trials, scalingResults.trials);
  await writeFile(
    join(data, "results.json"),
    `${JSON.stringify(results, null, 2)}\n`,
  );
  await writeFile(
    join(data, "results.csv"),
    csv(results.trials, Object.keys(results.trials[0])),
  );
  await writeFile(
    join(data, "samples.csv"),
    csv(samples, [
      "server",
      "run",
      "phase",
      "monotonic_seconds",
      "benchmark_seconds",
      "cpu_seconds",
      "rss_bytes",
    ]),
  );
  scalingResults.trials = scalingResults.trials.map(
    ({ raw_log: _, ...row }) => row,
  );
  await writeFile(
    join(scalingData, "results.json"),
    `${JSON.stringify(scalingResults, null, 2)}\n`,
  );
  await writeFile(
    join(scalingData, "results.csv"),
    csv(scalingResults.trials, Object.keys(scalingResults.trials[0])),
  );
}

await main();
