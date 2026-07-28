#!/usr/bin/env bun

/** Run reproducible cold-world Steel vs Fabric + Chunky benchmarks on Linux. */

import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import {
  copyFile,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { createInterface } from "node:readline";
import { spawn, spawnSync } from "node:child_process";

const SEED = "8500081009970950196";
const CHUNKY = {
  version: "1.5.3",
  url: "https://cdn.modrinth.com/data/fALzjamp/versions/4Eotm6ov/Chunky-Fabric-1.5.3.jar",
  filename: "Chunky-Fabric-1.5.3.jar",
  sha512:
    "b83bfe7b218d0aa6232af977ae741dc1f82b10e50cd12bb759f65cf416b8b62beccb543e587ef0b9670abe03815660f8e091bc6823624d65cf07300571573516",
};
const FABRIC_API = {
  version: "0.155.2+26.2",
  url: "https://cdn.modrinth.com/data/P7dR8mSH/versions/lVXlbH4w/fabric-api-0.155.2%2B26.2.jar",
  filename: "fabric-api-0.155.2+26.2.jar",
  sha512:
    "cc56984378a27c5bcd56374d6ffbb27a45c6bf3355add2ac6be9817ccac5854362249bf9d0147eb271a70fda2716129204e240d53c9aa876a2a7861f4c7f880f",
};

type Profile = "all" | "steel" | "fabric";
type Options = {
  steel: string;
  fabric: string;
  output: string;
  runs: number;
  side: number;
  sampleMs: number;
  cooldown: number;
  javaMinHeap: string;
  javaMaxHeap: string;
  cache: string;
  profile: Profile;
};
type Sample = {
  server: string;
  run: number;
  phase: "startup" | "benchmark";
  monotonic_seconds: number;
  benchmark_seconds: number | "";
  cpu_seconds: number;
  rss_bytes: number;
};
type Trial = {
  server: string;
  run: number;
  chunks: number;
  wall_seconds: number;
  chunks_per_second: number;
  reported_seconds: number | null;
  reported_chunks_per_second: number | null;
  cpu_seconds: number;
  average_cpu_cores: number;
  peak_rss_bytes: number;
  raw_log: string;
  samples: Sample[];
};
type Prepared = {
  work: string;
  command: string[];
  env: Record<string, string>;
};

const help = `Usage: bun run scripts/benchmarks/run.ts [options]

Required:
  --steel PATH             Steel repository
  --fabric PATH            Fabric server directory (required for Fabric profiles)
  --output PATH            Results directory

Options:
  --profile NAME           all, steel, or fabric (default: all)
  --runs N                 Trials per profile (default: 3)
  --side N                 Positive odd square side in chunks (default: 101)
  --sample-ms N            /proc sampling interval (default: 250)
  --cooldown SECONDS       Delay between trials (default: 5)
  --java-min-heap SIZE     Fabric initial heap (default: 512M)
  --java-max-heap SIZE     Fabric maximum heap (default: 8G)
  --cache PATH             Download cache (default: /tmp/steel-benchmark-cache)
  --help                    Show this help

Steel reads PREGEN_WINDOW_SIZE from the environment. PREGEN_SIZE is set from --side.
Example:
  PREGEN_WINDOW_SIZE=64 bun run benchmark -- --steel ../SteelMC \\
    --fabric ../fabric_server --output /tmp/steel-results --profile steel
`;

function parseArgs(argv: string[]): Options {
  if (argv.includes("--help")) {
    console.log(help);
    process.exit(0);
  }
  const values = new Map<string, string>();
  const validOptions = new Set([
    "--steel",
    "--fabric",
    "--output",
    "--profile",
    "--runs",
    "--side",
    "--sample-ms",
    "--cooldown",
    "--java-min-heap",
    "--java-max-heap",
    "--cache",
  ]);
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--") || value === undefined)
      throw new Error(`Invalid argument near ${key ?? "end of input"}`);
    if (!validOptions.has(key)) throw new Error(`Unknown option ${key}`);
    values.set(key, value);
  }
  const required = (key: string) => {
    const value = values.get(key);
    if (!value) throw new Error(`Missing required option ${key}`);
    return resolve(value);
  };
  const number = (key: string, fallback: number) => {
    const value = Number(values.get(key) ?? fallback);
    if (!Number.isFinite(value)) throw new Error(`${key} must be a number`);
    return value;
  };
  const profile = (values.get("--profile") ?? "all") as Profile;
  if (!["all", "steel", "fabric"].includes(profile))
    throw new Error(`Invalid --profile: ${profile}`);
  const options: Options = {
    steel: required("--steel"),
    fabric: values.get("--fabric") ? resolve(values.get("--fabric")!) : "",
    output: required("--output"),
    runs: number("--runs", 3),
    side: number("--side", 101),
    sampleMs: number("--sample-ms", 250),
    cooldown: number("--cooldown", 5),
    javaMinHeap: values.get("--java-min-heap") ?? "512M",
    javaMaxHeap: values.get("--java-max-heap") ?? "8G",
    cache: resolve(
      values.get("--cache") ?? join(tmpdir(), "steel-benchmark-cache"),
    ),
    profile,
  };
  if (
    !Number.isInteger(options.side) ||
    options.side <= 0 ||
    options.side % 2 === 0
  )
    throw new Error("--side must be a positive odd integer");
  if (!Number.isInteger(options.runs) || options.runs <= 0)
    throw new Error("--runs must be a positive integer");
  if (options.sampleMs <= 0 || options.cooldown < 0)
    throw new Error("Sampling and cooldown values must be non-negative");
  if (options.profile !== "steel" && !options.fabric)
    throw new Error("--fabric is required for Fabric profiles");
  return options;
}

async function sha512(path: string): Promise<string> {
  const hash = createHash("sha512");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}

async function fetchArtifact(
  spec: typeof CHUNKY,
  cache: string,
): Promise<string> {
  await mkdir(cache, { recursive: true });
  const path = join(cache, spec.filename);
  try {
    if ((await sha512(path)) === spec.sha512) return path;
  } catch {}
  console.log(`Downloading ${spec.filename}...`);
  const response = await fetch(spec.url);
  if (!response.ok)
    throw new Error(`Download failed (${response.status}): ${spec.url}`);
  await writeFile(path, new Uint8Array(await response.arrayBuffer()));
  const actual = await sha512(path);
  if (actual !== spec.sha512) {
    await rm(path, { force: true });
    throw new Error(`Bad SHA-512 for ${spec.filename}: ${actual}`);
  }
  return path;
}

function commandOutput(command: string[], cwd?: string): string {
  const result = spawnSync(command[0], command.slice(1), {
    cwd,
    encoding: "utf8",
  });
  if (result.status !== 0)
    throw new Error(`${command.join(" ")} failed: ${result.stderr}`);
  return `${result.stdout}${result.stderr}`.trim();
}

function replaceToml(text: string, key: string, value: string): string {
  const pattern = new RegExp(`^(\\s*${key}\\s*=\\s*).*$`, "m");
  if (!pattern.test(text)) throw new Error(`Missing TOML key: ${key}`);
  return text.replace(pattern, `$1${value}`);
}

function replaceProperty(text: string, key: string, value: string): string {
  const pattern = new RegExp(`^${key}=.*$`, "m");
  return pattern.test(text)
    ? text.replace(pattern, `${key}=${value}`)
    : `${text.trimEnd()}\n${key}=${value}\n`;
}

async function prepareSteel(repo: string, port: number): Promise<Prepared> {
  const work = await mkdtemp(join(tmpdir(), "steel-benchmark-steel."));
  await cp(join(repo, "config"), join(work, "config"), { recursive: true });
  const configPath = join(work, "config/config.toml");
  let config = await readFile(configPath, "utf8");
  config = replaceToml(config, "server_port", String(port));
  config = replaceToml(config, "online_mode", "false");
  await writeFile(configPath, config);
  const worldsPath = join(work, "config/worlds.toml");
  await writeFile(
    worldsPath,
    replaceToml(await readFile(worldsPath, "utf8"), "seed", `"${SEED}"`),
  );
  return {
    work,
    command: [resolve(repo, "target/release/steel")],
    env: { PREGEN_SIZE: "{side}" },
  };
}

async function prepareFabric(
  options: Options,
  chunky: string,
  api: string,
  port: number,
): Promise<Prepared> {
  const work = await mkdtemp(join(tmpdir(), "steel-benchmark-fabric."));
  const entries = (await readdir(options.fabric)).filter((entry) =>
    /^fabric-server-.*\.jar$/.test(entry),
  );
  if (entries.length !== 1)
    throw new Error(`Expected one Fabric launcher in ${options.fabric}`);
  const launcher = entries[0];
  await copyFile(join(options.fabric, launcher), join(work, launcher));
  for (const directory of ["libraries", "versions"])
    await symlink(
      resolve(options.fabric, directory),
      join(work, directory),
      "dir",
    );
  try {
    await cp(join(options.fabric, ".fabric"), join(work, ".fabric"), {
      recursive: true,
    });
  } catch {}
  await mkdir(join(work, "mods"));
  for (const mod of [chunky, api])
    await copyFile(mod, join(work, "mods", basename(mod)));
  await writeFile(join(work, "eula.txt"), "eula=true\n");
  let properties = await readFile(
    join(options.fabric, "server.properties"),
    "utf8",
  );
  for (const [key, value] of Object.entries({
    "level-seed": SEED,
    "online-mode": "false",
    "server-port": String(port),
    "pause-when-empty-seconds": "-1",
    "sync-chunk-writes": "true",
    "generate-structures": "true",
    "level-name": "world",
  }))
    properties = replaceProperty(properties, key, value);
  await writeFile(join(work, "server.properties"), properties);
  return {
    work,
    command: [
      "java",
      `-Xms${options.javaMinHeap}`,
      `-Xmx${options.javaMaxHeap}`,
      "-XX:+UseG1GC",
      "-jar",
      launcher,
      "nogui",
    ],
    env: {},
  };
}

async function processStats(
  pid: number,
): Promise<{ cpu: number; rss: number } | null> {
  try {
    const rawStat = await readFile(`/proc/${pid}/stat`, "utf8");
    const fields = rawStat.slice(rawStat.lastIndexOf(")") + 2).split(/\s+/);
    const clockTicks = Number(commandOutput(["getconf", "CLK_TCK"]));
    const cpu = (Number(fields[11]) + Number(fields[12])) / clockTicks;
    const status = await readFile(`/proc/${pid}/status`, "utf8");
    const rss = Number(status.match(/^VmRSS:\s+(\d+)\s+kB$/m)?.[1] ?? 0) * 1024;
    return { cpu, rss };
  } catch {
    return null;
  }
}

const monotonic = () => Number(process.hrtime.bigint()) / 1e9;
const cleanAnsi = (line: string) =>
  line.replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "").replaceAll("\r", "");

async function runTrial(
  server: string,
  run: number,
  options: Options,
  prepared: Prepared,
): Promise<Trial> {
  const rawRelative = `raw/${server}-${run}.log`;
  const rawPath = join(options.output, rawRelative);
  const samples: Sample[] = [];
  let raw = "";
  let benchmarkStart: number | null = null;
  let benchmarkEnd: number | null = null;
  let startCpu: number | null = null;
  let endCpu: number | null = null;
  let reportedSeconds: number | null = null;
  let reportedCps: number | null = null;
  let reportedChunks: number | null = null;
  let chunkyStarted = false;

  console.log(`Starting ${server} run ${run} in ${prepared.work}`);
  const env = {
    ...process.env,
    ...Object.fromEntries(
      Object.entries(prepared.env).map(([key, value]) => [
        key,
        value.replace("{side}", String(options.side)),
      ]),
    ),
  };
  const child = spawn(prepared.command[0], prepared.command.slice(1), {
    cwd: prepared.work,
    env,
    stdio: ["pipe", "pipe", "pipe"],
  });
  const addSample = async (phase?: "startup" | "benchmark") => {
    const stats = await processStats(child.pid!);
    if (!stats) return;
    const now = monotonic();
    samples.push({
      server,
      run,
      phase:
        phase ??
        (benchmarkStart !== null && benchmarkEnd === null
          ? "benchmark"
          : "startup"),
      monotonic_seconds: now,
      benchmark_seconds:
        benchmarkStart === null ? "" : Math.max(0, now - benchmarkStart),
      cpu_seconds: stats.cpu,
      rss_bytes: stats.rss,
    });
  };
  const begin = async () => {
    const stats = await processStats(child.pid!);
    benchmarkStart = monotonic();
    startCpu = stats?.cpu ?? null;
    if (stats)
      samples.push({
        server,
        run,
        phase: "benchmark",
        monotonic_seconds: benchmarkStart,
        benchmark_seconds: 0,
        cpu_seconds: stats.cpu,
        rss_bytes: stats.rss,
      });
  };
  const end = async () => {
    const stats = await processStats(child.pid!);
    benchmarkEnd = monotonic();
    endCpu = stats?.cpu ?? null;
    if (stats)
      samples.push({
        server,
        run,
        phase: "benchmark",
        monotonic_seconds: benchmarkEnd,
        benchmark_seconds: benchmarkEnd - benchmarkStart!,
        cpu_seconds: stats.cpu,
        rss_bytes: stats.rss,
      });
  };
  const consumeLine = async (line: string) => {
    raw += `${line}\n`;
    const clean = cleanAnsi(line);
    console.log(`[${server} ${run}] ${clean}`);
    if (server === "steel" && clean.includes("Preparing spawn area:"))
      await begin();
    const steelDone = clean.match(
      /Spawn area prepared: (\d+) chunks in ([\d.]+)s \(([\d.]+) chunks\/s\)/,
    );
    if (server === "steel" && steelDone) {
      await end();
      reportedChunks = Number(steelDone[1]);
      reportedSeconds = Number(steelDone[2]);
      reportedCps = Number(steelDone[3]);
      child.kill("SIGTERM");
    }
    if (
      server.startsWith("fabric") &&
      clean.includes("Done (") &&
      !chunkyStarted
    ) {
      const radius = ((options.side - 1) / 2) * 16;
      for (const command of [
        "chunky quiet 1",
        "chunky shape square",
        "chunky center 0 0",
        `chunky radius ${radius}`,
        "chunky start",
      ])
        child.stdin.write(`${command}\n`);
      chunkyStarted = true;
    } else if (
      server.startsWith("fabric") &&
      clean.includes("[Chunky] Task started")
    ) {
      await begin();
    } else if (
      server.startsWith("fabric") &&
      clean.includes("[Chunky] Task finished")
    ) {
      await end();
      const progress = clean.match(
        /Processed: (\d+) chunks .* Rate: ([\d.]+) cps/,
      );
      if (progress) {
        reportedChunks = Number(progress[1]);
        reportedCps = Number(progress[2]);
      }
      child.stdin.write("stop\n");
    }
  };
  const readers = [child.stdout, child.stderr].map((stream) => {
    const lines = createInterface({ input: stream });
    lines.on("line", (line) => void consumeLine(line));
    return lines;
  });
  const sampler = setInterval(() => void addSample(), options.sampleMs);
  const exitCode = await new Promise<number | null>((resolveExit, reject) => {
    child.once("error", reject);
    child.once("close", resolveExit);
  });
  clearInterval(sampler);
  readers.forEach((reader) => reader.close());
  await writeFile(rawPath, raw);
  try {
    if (exitCode !== 0)
      throw new Error(`${server} run ${run} exited with ${exitCode}`);
    if (
      benchmarkStart === null ||
      benchmarkEnd === null ||
      startCpu === null ||
      endCpu === null
    )
      throw new Error(
        `Could not identify benchmark interval for ${server} run ${run}`,
      );
    const wall = benchmarkEnd - benchmarkStart;
    const cpu = endCpu - startCpu;
    const benchmarkSamples = samples.filter(
      (sample) => sample.phase === "benchmark",
    );
    return {
      server,
      run,
      chunks: reportedChunks ?? options.side ** 2,
      wall_seconds: wall,
      chunks_per_second: (reportedChunks ?? options.side ** 2) / wall,
      reported_seconds: reportedSeconds,
      reported_chunks_per_second: reportedCps,
      cpu_seconds: cpu,
      average_cpu_cores: cpu / wall,
      peak_rss_bytes: Math.max(
        ...benchmarkSamples.map((sample) => sample.rss_bytes),
      ),
      raw_log: rawRelative,
      samples,
    };
  } finally {
    await rm(prepared.work, { recursive: true, force: true });
  }
}

function csv(rows: Record<string, unknown>[], fields: string[]): string {
  const encode = (value: unknown) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  };
  return `${fields.join(",")}\n${rows.map((row) => fields.map((field) => encode(row[field])).join(",")).join("\n")}\n`;
}

async function writeOutputs(
  output: string,
  metadata: Record<string, unknown>,
  trials: Trial[],
) {
  const serializable = trials.map(({ samples: _, ...trial }) => trial);
  await writeFile(
    join(output, "results.json"),
    `${JSON.stringify({ metadata, trials: serializable }, null, 2)}\n`,
  );
  if (!trials.length) return;
  await writeFile(
    join(output, "results.csv"),
    csv(serializable, Object.keys(serializable[0])),
  );
  const sampleRows = trials.flatMap((trial) => trial.samples);
  await writeFile(
    join(output, "samples.csv"),
    csv(sampleRows, [
      "server",
      "run",
      "phase",
      "monotonic_seconds",
      "benchmark_seconds",
      "cpu_seconds",
      "rss_bytes",
    ]),
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await mkdir(join(options.output, "raw"), { recursive: true });
  const needsFabric = options.profile !== "steel";
  const chunky = needsFabric ? await fetchArtifact(CHUNKY, options.cache) : "";
  const api = needsFabric ? await fetchArtifact(FABRIC_API, options.cache) : "";
  const steelBinary = join(options.steel, "target/release/steel");
  const binaryStat = await stat(steelBinary);
  const steelStatus = commandOutput(
    ["git", "status", "--porcelain"],
    options.steel,
  );
  const steelDiff = spawnSync("git", ["diff", "--binary", "HEAD"], {
    cwd: options.steel,
    encoding: "utf8",
  });
  if (steelDiff.status !== 0)
    throw new Error(
      `Could not capture Steel worktree diff: ${steelDiff.stderr}`,
    );
  const cpuInfo = await readFile("/proc/cpuinfo", "utf8");
  const memInfo = await readFile("/proc/meminfo", "utf8");
  const metadata: Record<string, unknown> = {
    created_at: new Date().toISOString(),
    minecraft: "26.2",
    seed: SEED,
    side_chunks: options.side,
    target_chunks: options.side ** 2,
    runs_per_server: options.runs,
    sample_interval_ms: options.sampleMs,
    world_storage: `${tmpdir()} (fresh directory for every trial)`,
    steel_commit: commandOutput(["git", "rev-parse", "HEAD"], options.steel),
    steel_worktree_dirty: steelStatus.length > 0,
    steel_worktree_diff_sha512: createHash("sha512")
      .update(steelDiff.stdout)
      .digest("hex"),
    steel_binary_sha512: await sha512(steelBinary),
    steel_binary_modified_at: binaryStat.mtime.toISOString(),
    steel_pregen_window_size: process.env.PREGEN_WINDOW_SIZE ?? "Steel default",
    fabric_loader: "0.19.3",
    chunky: CHUNKY.version,
    fabric_api: FABRIC_API.version,
    java_min_heap: options.javaMinHeap,
    java_max_heap: options.javaMaxHeap,
    machine: {
      os: commandOutput(["uname", "-srm"]),
      kernel: commandOutput(["uname", "-r"]),
      cpu: cpuInfo.match(/^model name\s*:\s*(.+)$/m)?.[1] ?? "unknown",
      logical_cpus: Number(commandOutput(["nproc"])),
      memory_bytes:
        Number(memInfo.match(/^MemTotal:\s+(\d+)\s+kB$/m)?.[1] ?? 0) * 1024,
      java: commandOutput(["java", "-version"]),
      filesystem: commandOutput([
        "findmnt",
        "-n",
        "-o",
        "FSTYPE,SOURCE",
        tmpdir(),
      ]),
    },
  };
  const trials: Trial[] = [];
  for (let run = 1; run <= options.runs; run++) {
    let order: Exclude<Profile, "all">[];
    if (options.profile !== "all") {
      order = [options.profile];
    } else {
      const profiles: Exclude<Profile, "all">[] = ["steel", "fabric"];
      const offset = (run - 1) % profiles.length;
      order = [...profiles.slice(offset), ...profiles.slice(0, offset)];
    }
    for (const [index, server] of order.entries()) {
      const port = 25700 + run * 2 + index;
      const prepared =
        server === "steel"
          ? await prepareSteel(options.steel, port)
          : await prepareFabric(options, chunky, api, port);
      trials.push(await runTrial(server, run, options, prepared));
      await writeOutputs(options.output, metadata, trials);
      const finalTrial = run === options.runs && index === order.length - 1;
      if (options.cooldown && !finalTrial)
        await new Promise((resolveSleep) =>
          setTimeout(resolveSleep, options.cooldown * 1000),
        );
    }
  }
  console.log(`Results written to ${options.output}`);
}

await main();
