---
title: Start contributing
description: A guide to start contributing to SteelMC.
---

In this guide you will learn all the necessary things to start contributing to SteelMC.

:::note
This guide assumes you already have knowledge about how to use Git and GitHub
:::

## Before start

Before even start to prepare you need to know some key concepts of Steel's philosophy.

### Code philosophy

When you are writting code for Steel you have to have in mind that we want complete solutions not half-baked ones, an investigation about how should it work in vanilla and how to make it better is required for medium-big systems. We are building with good foundations in mind, which means that all the code must be readable, documented, cohesionated, and production ready. If you are working in a system with possibility of modding in the future, you should prepare it for the future.

### AI politics

We don't mind what use are you giving to the AI as long as you can ensure that you understand all the code in your pr, you can explain all decisions made while development, and what alternatives you didn't take before making the pull request.

### Code standards

You should also take a look at [our code standards](../code-standard).

## Preparations

Now that you know about our philosophy is time to start working on your pr, but first...

### Selecting what to do

To know what to do there's many methods, but we encourage to do this steps:

- Check [our open PRs](https://github.com/Steel-Foundation/SteelMC/pulls) to know what's been worked by others
- Check [our open issues](https://github.com/Steel-Foundation/SteelMC/issues) to see what can be fixed (Filter by the `good first issue` label is recommended)
- Check [our tracker](../../tracker) to see what's missing
- Ask inside #dev-work in [our discord](/discord) to confirm if you can implement something

### Creating a new branch

First, if you don't have a fork of SteelMC in your GitHub account, go [here to fork it](https://github.com/Steel-Foundation/SteelMC/fork).

Once in your fork, make a new branch specifiying in the name what feature are you implementing.

:::caution
Make sure to create your branch from our `main` or `dev` branch, not from a feature branch, unless you know what you're doing.
:::

Clone that branch into your device to start working.

## Coding

Since this guide is agnostic to what are you implementing we cannot guide you much here, but in any case you will need to learn [how to work with the minecraft java codebase](../decompile-minecraft).

We have multiple guides to help you with implementing some parts of the code:

- [How to work with the registries](../registries)
- [How to register blocks and items](../block_item_registration)
- [How to work with blocks](../blocks/overview)
- [How to work with items](../items/overview)
- [How to debug the network](../network/overview)
- [How to work with our extractor](../tools/steel_extractor)

## Once finished

Once your feature is completly implemented in the code, tested by you, ensured that all is updated to the last commit, and uploaded to your GitHub branch, you should open a PR with your branch to our original repository, but first let's make sure your code is ready to be reviewed.

:::note
We have checks to ensure the code quality, this commands will allow you to check if there's something failing in your code quality:

```bash
# To check code standards
cargo clippy -r --all-targets --all-features

# To check the format of the code
cargo fmt --all --check

# To search for typos (spell checking)
typos
```

You can find how to install `typos` [here](https://crates.io/crates/typos-cli#install)

We have a [Prek](https://prek.j178.dev/) configuration file in the codebase, with it you can run `prek` locally to automatically prepare your code to be reviewed.

```bash
prek run
```
:::

Fullfill your pull request name, and description following our template.

Adittionaly you can request a review from our maintainers directly on GitHub, or post the link of your PR in our `prs-ready-for-review` discord channel, to notify our lovely maintainers to review your code.

Our maintainers can request changes to you, if that happens you should change the requested code, or explain why you think it's better that way.

Eventually your code will be merged into our code, when that moment comes remember:\
**"Thank you and congratulations for your code"**
