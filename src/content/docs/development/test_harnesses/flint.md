---
title: Flint
description: How to use steel-flint
---

:::note
This page only explains how to use Flint in Steel.
For more information about Flint, how to write tests, and how to run them against vanilla Minecraft, please see the Flint docs.
:::

Flint is a test framework for Minecraft behavior. A test describes a situation (for example, placing blocks) and the result you expect. Steel's test harness, `steel-flint`, runs these tests against the Steel server, so you can check that your block, item, or entity implementation behaves like vanilla.

### Setup

The test harness is already included in the Steel repository, but the tests are not. You need to add them and make a small configuration change. You will rarely need to change this configuration again, so it can stay as it is for a long time.

#### Tests

You have two options:

- Your own test folder.
- The tests provided by the Flint team ([FlintBenchmark](https://github.com/FlintTestMC/FlintBenchmark)).

If you use your own tests, create the folder anywhere you like. If you use FlintBenchmark, clone the repository. We recommend cloning it next to the Steel repository:

```
git clone https://github.com/FlintTestMC/FlintBenchmark
```

Remember the path to the test folder, because the Flint config needs it.

#### Configure the harness

Flint reads its settings from a `.env` file and a `.toml` file. Values in the `.env` file override the ones in the `.toml` file. To get started, the `.toml` file is enough.

Copy `flint.toml.example` (rename it to `flint.toml`) and place it in the same directory, then set the only important setting: `test_path`. It points to your test folder.

If you cloned FlintBenchmark next to the Steel repository, `flint.toml` should already be correct. Otherwise, we recommend an absolute path. A relative path works too, but an absolute path is easier to get right and less error-prone.

### Run flint

There are two ways to select tests, and three profiles to build with. The general command is the most flexible. The other commands are shortcuts that use a specific profile.

Flint has two tests you can run:

- `test_run_flint_selected`: runs the tests you select. Without any filters or selection, all tests run. With the filters in the `.toml` file, you can narrow the selection.
- `test_run_all_flint_benchmarks`: runs every test it can find.

Steel also has three profiles you can use for Flint:

- `flint`: compiles with debug symbols, so you can debug the code while a Flint test runs. Use this to check your block, item, or entity implementation.
- `dev`: the normal Steel profile. It compiles quickly but runs slower, so it is best for a small set of tests.
- `cicd`: inherits the `release` profile. It is the best choice for a big set of tests, but compiling takes a long time.

#### The general command

This runs the selected Flint tests in the `dev` profile, so you can modify the code and run again quickly:

```
cargo test --package steel-flint test_run_flint_selected -- --ignored
```

#### Specific commands

Each of these three commands runs the selected tests (`test_run_flint_selected`) with its own profile:

| Command | Profile |
| --- | --- |
| `cargo flint` | `flint` |
| `cargo flint-dev` | `dev` |
| `cargo flint-release` | `cicd` (inherits `release`) |

### Output

The output shows you which tests failed and gives you a link to Flint Viz. There you can see the tests in a graphical view, which helps you find out what went wrong in a failed test.

### Configuration reference

This is the full `flint.toml.example` from the `steel-flint` crate. Every setting is optional except `test_path`.

```toml
# Base URL of the flint-viz instance used in failure links.
# Default: https://flinttestmc.github.io/FlintViz
# viz_url = "http://localhost:7878"

# Directory containing the flint tests. Env: TEST_PATH
# Relative to the working directory (`cargo test` uses the crate dir, so this
# points at a FlintBenchmark checkout next to the steel repo). Default: ./test
test_path = "../../../FlintBenchmark/tests"

# Filter priority (first match wins):
#   test > tags (FLINT_TAGS, implemented_only, filter.tags) > pattern > all tests
[filter]
# Only run tests tagged with an implemented item, block or entity.
implemented_only = true

# Run a single test by file name (without `.json`). Env: FLINT_TEST
# test = "place_fence"

# Run tests whose file name matches a glob. Only `*` as prefix or suffix is
# supported ("fence_*", "*_wall", "*"). Env: FLINT_PATTERN
# pattern = "fence_*"

# Run tests with these tags (only `true` entries are used).
# Env: FLINT_TAGS="redstone,fence" (comma separated, replaces this table)
# Ignored when `implemented_only = true`.
# [filter.tags]
# redstone = true
# walls = false
# fence = true
```

#### Settings

| Setting | Environment variable | Default | Meaning |
| --- | --- | --- | --- |
| `viz_url` | `FLINT_VIZ_URL` | `https://flinttestmc.github.io/FlintViz` | Base URL of the Flint Viz instance. Failed tests print a link to this address. Set it to `http://localhost:7878` if you run Flint Viz yourself. |
| `test_path` | `TEST_PATH` | `./test` | Folder that contains the Flint test files. A relative path starts at the `steel-flint` crate directory, not at the repository root, because `cargo test` runs there. The example value points to a FlintBenchmark checkout next to the Steel repository. |
| `filter.implemented_only` | — | `false` | Only run tests that are tagged with an item, block, or entity that Steel has already implemented. Good default for daily work, because unfinished features do not fail. |
| `filter.test` | `FLINT_TEST` | — | Run exactly one test, selected by its file name without `.json` (for example `place_fence`). |
| `filter.pattern` | `FLINT_PATTERN` | — | Run all tests whose file name matches a glob. Only a `*` at the start or end is supported: `fence_*`, `*_wall`, or `*`. |
| `[filter.tags]` | `FLINT_TAGS` | — | A table of tag names. Tests with a tag set to `true` run. Entries set to `false` are ignored. `FLINT_TAGS="redstone,fence"` (comma separated) replaces the whole table. Has no effect while `implemented_only = true`. |

#### Filter priority

If you set more than one filter, only the first match in this order is used:

1. `test` (a single test)
2. tags (`FLINT_TAGS`, `implemented_only`, `filter.tags`)
3. `pattern`
4. all tests

For example, with `pattern = "fence_*"` and `implemented_only = true`, the pattern is ignored and the tag filter wins.

#### Environment variables

Environment variables (and values in your `.env` file) override `flint.toml`. This lets you change the selection for one run without editing the file:

```
FLINT_PATTERN="*_wall" cargo flint
```

### More information

More information is available in the [Flint docs](https://flinttestmc.github.io/FlintDocs/).
