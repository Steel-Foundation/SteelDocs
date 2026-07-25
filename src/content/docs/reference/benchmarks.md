---
title: Benchmarks
description: Reproducible performance benchmarks of SteelMC
---

Steel's first published benchmark focuses on the work it currently does best: generating terrain. We compared a native Steel build with a Fabric server using [Chunky](https://modrinth.com/plugin/chunky), both with and without [C2ME](https://modrinth.com/mod/c2me-fabric).

On this machine, Steel generated the repeated 10,201-chunk test area **18.8 times as fast as Fabric** and **4.81 times as fast as Fabric with C2ME**.

| Server        | Median time |  Mean throughput | Median peak RSS | Mean CPU use |
| ------------- | ----------: | ---------------: | --------------: | -----------: |
| Steel         |      3.96 s | 2,571.2 chunks/s |        1.79 GiB |   30.1 cores |
| Fabric + C2ME |     18.91 s |   534.4 chunks/s |        3.27 GiB |   13.8 cores |
| Fabric        |     74.55 s |   136.8 chunks/s |        2.49 GiB |    4.3 cores |

Times and memory figures are medians of three runs. Throughput and CPU use are arithmetic means. Higher throughput is better; lower time and memory are better.

![A horizontal bar chart showing Steel at 2,571.2 chunks per second, Fabric with C2ME at 534.4, and Fabric at 136.8.](../../../assets/benchmarks/chunk-generation-throughput.svg)

Parallelism is a large part of the result. Steel kept an average of 30.1 logical CPU cores busy during the measured interval. C2ME raised Fabric from 4.3 to 13.8 cores and improved its throughput by 3.91 times, but Steel still completed the area more than four times faster.

![A horizontal bar chart showing average CPU use of 30.1 cores for Steel, 13.8 for Fabric with C2ME, and 4.3 for Fabric.](../../../assets/benchmarks/chunk-generation-cpu.svg)

### Adjusted for CPU use

Dividing throughput by average CPU use gives a rough measure of work completed per CPU-second:

| Server        | Chunks per CPU-second | Relative to Fabric |
| ------------- | --------------------: | -----------------: |
| Steel         |                 85.40 |              2.69× |
| Fabric + C2ME |                 38.86 |              1.22× |
| Fabric        |                 31.74 |              1.00× |

This adjustment narrows the headline gap, but does not remove it: Steel generated about **2.20 times as many chunks per CPU-second as C2ME** and **2.69 times as many as Fabric**. It is not a substitute for wall-clock throughput—unused cores cannot make a generation job finish sooner—but it separates per-core efficiency from parallel scaling reasonably well for this CPU-bound test.

## Memory use

Peak resident memory was lowest for Steel in this test. Its median peak was 1.79 GiB, compared with 2.49 GiB for Fabric and 3.27 GiB for Fabric with C2ME.

The graph below uses the median-duration run from each configuration. A line ending earlier means that configuration finished generation earlier; it does not mean memory fell to zero.

![A line chart of resident memory over time. Steel finishes after about 4.0 seconds near 1.8 GiB, C2ME after about 18.9 seconds near 3.3 GiB, and Fabric after about 74.6 seconds near 2.5 GiB.](../../../assets/benchmarks/chunk-generation-memory.svg)

Resident set size measures the whole server process, not only live chunk data. For Java this includes the JVM and committed heap pages; for Steel it includes the native process and allocator. It is useful for measuring what the operating system actually kept resident during this workload, but it is not a direct comparison of Java heap usage with Rust allocations.

## Larger region

We also ran each configuration once over a 301-by-301 area: 90,601 chunks, or 8.88 times as much target terrain. The larger run gives the schedulers more time to warm up and is a better indication of sustained throughput, but a single trial does not provide the same confidence as the repeated 101-by-101 result.

| Server        |    Time |       Throughput | Peak RSS | Average CPU use | Chunks per CPU-second |
| ------------- | ------: | ---------------: | -------: | --------------: | --------------------: |
| Steel         | 32.14 s | 2,819.2 chunks/s | 4.09 GiB |      29.3 cores |                 96.12 |
| Fabric + C2ME | 2:09.44 |   700.0 chunks/s | 3.42 GiB |      12.2 cores |                 57.19 |
| Fabric        | 8:42.01 |   173.6 chunks/s | 2.88 GiB |       4.2 cores |                 41.62 |

Steel was **16.24 times as fast as Fabric** and **4.03 times as fast as C2ME** in this run. After dividing by average CPU use, Steel completed **2.31 times as many chunks per CPU-second as Fabric** and **1.68 times as many as C2ME**.

All three configurations posted higher throughput over the larger area: Steel improved by 9.6%, C2ME by 31.0%, and Fabric by 26.9% relative to their 101-by-101 means. Peak RSS is not directly comparable across region sizes because larger runs keep more generated and pending chunk data resident.

![A grouped horizontal bar chart comparing mean 101-by-101 throughput with one 301-by-301 run for Steel, Fabric with C2ME, and Fabric.](../../../assets/benchmarks/chunk-generation-scaling.svg)

## Methodology

The primary benchmark generated a fresh 101-by-101 square of fully generated overworld chunks centered on chunk 0,0. That is 10,201 target chunks covering approximately 2.61 square kilometres. The scaling check used a 301-by-301 square, or 90,601 target chunks covering approximately 23.19 square kilometres. The benchmark used the seed from Steel's `worlds.toml`:

```text
8500081009970950196
```

The common settings were:

- Minecraft Java Edition 26.2
- structures enabled
- no connected players
- a new world directory for every run
- world storage on the same `tmpfs` filesystem
- three cold runs per configuration at 101-by-101, plus one cold run at 301-by-301
- process CPU time and RSS sampled every 250 milliseconds
- Steel pregeneration window size set to 64 chunks (`PREGEN_WINDOW_SIZE=64`)

Putting the worlds on `tmpfs` removes the particular storage device from the comparison. Chunk serialization, compression, and saving still run, but physical disk latency and throughput do not dominate the result.

Steel's measured interval starts at `Preparing spawn area` and ends at `Spawn area prepared`. The Fabric intervals start when Chunky reports `Task started` and end at `Task finished`. Startup, registry loading, spawn selection, and shutdown are outside the measured interval for all three configurations.

### Software

| Component     | Version                                                                                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Steel         | commit `2199ddb65613f0cea03941c84f7ac874ee842d14`, clean worktree                                                                                          |
| Steel binary  | native release, SHA-512 `792d414ae39ada85599c4550891003472cc6ed9f2e999f418a63d36b7c1a2d4860a30cd7fb6289fcb970e0eee4035464b0974274938bf3fbca735c97b9c468b2` |
| Fabric Loader | 0.19.3                                                                                                                                                     |
| Fabric API    | 0.155.2+26.2                                                                                                                                               |
| Chunky        | 1.5.3                                                                                                                                                      |
| C2ME          | 0.4.1-beta.1.0+26.2                                                                                                                                        |
| Java          | OpenJDK 25.0.4, G1GC, 512 MiB initial and 8 GiB maximum heap                                                                                               |

The unoptimized Fabric configuration contained only Fabric Loader, Fabric API, and Chunky. The C2ME configuration added only C2ME. ScalableLux, Lithium, and other optimization mods were not installed.

### Hardware

| Component | Test system                              |
| --------- | ---------------------------------------- |
| CPU       | AMD Ryzen 9 9950X, 16 cores / 32 threads |
| Memory    | 123.4 GiB system memory                  |
| OS        | Arch Linux, kernel 7.1.4-arch1-1         |
| Storage   | `tmpfs` for generated worlds             |

### Reproducing the benchmark

The benchmark harness and chart renderer are tracked TypeScript files and run with Bun. From the documentation repository:

```sh
PREGEN_WINDOW_SIZE=64 bun run benchmark -- \
  --steel ../SteelMC \
  --fabric ../fabric_server \
  --c2me-jar /path/to/c2me-fabric-mc26.2-0.4.1-beta.1.0.jar \
  --output /tmp/steel-benchmark \
  --runs 3 --side 101
```

For the single larger-region run, change the last line to `--runs 1 --side 301` and use a separate output directory.

The runner creates a new temporary world for every trial, verifies pinned Chunky and Fabric API downloads by SHA-512, samples Linux `/proc`, and writes raw logs plus JSON and CSV results. When `--c2me-jar` is supplied, the default `all` profile rotates the order of Steel, Fabric + C2ME, and Fabric between runs. Use `--profile steel`, `fabric`, or `fabric-c2me` to run one configuration.

To regenerate the tracked charts from the tracked data:

```sh
bun run benchmark:render
```

## Individual runs

| Server        | Run |     Time |       Throughput | Peak RSS | Average CPU use |
| ------------- | --: | -------: | ---------------: | -------: | --------------: |
| Steel         |   1 |  3.962 s | 2,574.8 chunks/s | 1.79 GiB |     30.14 cores |
| Steel         |   2 |  3.979 s | 2,563.6 chunks/s | 1.79 GiB |     30.06 cores |
| Steel         |   3 |  3.961 s | 2,575.3 chunks/s | 1.79 GiB |     30.13 cores |
| Fabric + C2ME |   1 | 18.909 s |   539.5 chunks/s | 3.25 GiB |     13.58 cores |
| Fabric + C2ME |   2 | 18.786 s |   543.0 chunks/s | 3.27 GiB |     13.49 cores |
| Fabric + C2ME |   3 | 19.593 s |   520.7 chunks/s | 3.35 GiB |     14.23 cores |
| Fabric        |   1 | 74.550 s |   136.8 chunks/s | 2.23 GiB |      4.38 cores |
| Fabric        |   2 | 74.155 s |   137.6 chunks/s | 2.76 GiB |      4.25 cores |
| Fabric        |   3 | 74.987 s |   136.0 chunks/s | 2.49 GiB |      4.30 cores |

The 301-by-301 table above contains one run per server, so it is not repeated here.

The machine-readable source data used for the tables and graphs is stored alongside the documentation as `results.csv`, `results.json`, and `samples.csv`.

## Limitations

:::caution[Read this before quoting the results]
This is a focused world-generation benchmark, not a claim that Steel is 18.8 times faster at every server workload.
:::

- **The repeated area is intentionally modest.** The 101-by-101 test was chosen so vanilla Fabric could be repeated three times. The 301-by-301 result demonstrates warmup effects, but it is only one run and should not be treated as a stable average.
- **The generated work is not perfectly identical.** Steel currently disables the entity-spawning generation stage because most generated entities are not implemented. Vanilla Fabric performs that stage. Both configurations otherwise request fully generated chunks with structures and lighting.
- **These are performance results, not parity results.** C2ME logged `unsafe terrain read during worldgen` diagnostics for the `sculk_patch_deep_dark` feature in one 101-by-101 run and the larger run; vanilla also logged the diagnostic in its larger run. All runs completed, but we have not block-compared their output with Steel, so these timings do not establish correctness.
- **The C2ME build is a beta.** It was the latest non-dev C2ME build available for Minecraft 26.2 at the time of testing. Startup also logged warnings for optional ScalableLux integration classes because ScalableLux was not installed.
- **The benchmark favours CPU work.** `tmpfs`, an idle server, and no players reduce disk and gameplay interference. A live server on persistent storage will behave differently.
- **This is one machine, seed, dimension, and server revision.** Results should be reproduced on other hardware and expanded to the Nether, the End, chunk loading, chunk sending, ticking, and player concurrency before drawing broader conclusions.

## Future benchmarks

The next useful additions are:

- repeated 301-by-301 generation on additional machines
- physical NVMe storage, including world size and bytes written
- the Nether and the End
- generated-chunk loading from disk
- chunk sending to one and multiple clients
- tick time and memory under simulated players
- parity checks of the exact worlds produced by each optimized configuration
