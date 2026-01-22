[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)
[![SteelMC](https://dcbadge.limes.pink/api/server/MwChEHnAbh?style=social)](https://discord.gg/MwChEHnAbh)

<div align="center">

# Steel Docs

   <p align="center" width="66%">
     <img src="https://i.imgur.com/lFQ6jH2.png" alt="Logo" width="66%">
   </p>

This is the main repository for the [SteelMC](https://github.com/Steel-Foundation/SteelMC) documentation, made using [Astro Starlight](https://starlight.astro.build/).

</div>

---

## 📖 Table of Contents

- [How to contribute](#contribute)
  - [Identify](#identify)
  - [Fork](#fork)
  - [Install](#installation)
  - [Commit](#commit)
  - [Internationalization](#internationalization)
- [How to use](#how-to-use)
  - [Commands](#commands)
- [Project structure](#project-structure)

---

## Contribute

> [!NOTE]
> All the following steps require you to have a version of [git](https://git-scm.com/) and [bun](https://bun.sh/) running on your system.

Starlight looks for `.md` or `.mdx` files in the `src/content/docs/` directory. Each file is exposed as a route based on its file name.
Images can be added to `src/assets/` and embedded in Markdown with a relative link.
Static assets, like favicons, can be placed in the `public/` directory.

## Identify

... a feature you'd like to add or an issue to work on. You should always create an issue or a draft-pr describing what you want, before considering adding a major feature.

## Fork

... the `main` branch of this repository, so you can prepare your changes on there locally. Clone it to your system by running the command

```gitattributes
git clone https://github.com/{your-name}/SteelDocs
```

in your directory of choice. And don't forget to set this repository as it's upstream by running the following command

```gitattributes
git remote add upstream https://github.com/Steel-Foundation/SteelDocs.git
```

in said directory. To test if it has succeeded, type

```gitattributes
git remote -v
```

which should yield the following.

```gitattributes
origin   https://github.com/{your-name}/SteelDocs.git (fetch)
origin   https://github.com/{your-name}/SteelDocs.git (push)
upstream https://github.com/Steel-Foundation/SteelDocs.git (fetch)
upstream https://github.com/Steel-Foundation/SteelDocs.git (push)
```

Now set-up a new feature branch by running

```gitattributes
git checkout -b feat-{feature-name}
```

from the `main` branch.

## Installation

To install the dependencies, run the following command inside the root folder of the project:

```
bun install
```

## Commit

... your changes to your fork and use the following commands in its directory:

```gitattributes
git add .
git commit -m "{your-message}"
git push origin {your-branch}
```

Then you may open a pull-request by comparing on the github website.

> [!NOTE]
> This project strictly enforces the use of the [conventional commits standard](https://www.conventionalcommits.org/en/v1.0.0/) in the commit messages.
> Also please remember to stricktly use **relative paths**!

## Internationalization

Starlight uses a particular folder structure to automatically fetch and correctly link translated markdown files.
For this reason, if you want to add a new language, you should create a new folder
with the correct international prefix into to `docs` folder, where both the german and spanish translations already reside. The english originals are also stored in the `docs` folder, but don't require another wrapper folder,
such that it can be used as fallback. Otherwise, the only thing you should look out for are:

Articles are written in `.md` (markdown) files and contain a front-matter like this:

```
---
title: Feature Flags
description: Complete reference of all compile-time feature flags in SteelMC
sidebar:
  order: 1
---
```

Here, useful information about the article is stored.

Furthermore side-bar slugs are translated by adding an entry to the `translations` array inside the `sidebar` object, which can be found at `astro.config.mjs`, like this:

```mjs
label: 'Getting started',
translations: {
    es: 'Primeros pasos',
    de: 'Erste Schritte'
},
```

## How to use

Inside the project folder run `bun dev` for hosting it locally. Keep in mind that this will sometimes mask errors, which will only be present when hosted somewhere like gh pages (fuck js).
The rest should be handled by the `main` workflow.

```
SteelDocs
├─ astro.config.ts
├─ bun.lock
├─ package.json
├─ public
│  └─ favicon.svg
├─ README.md
├─ src
│  ├─ assets
│  │  └─ houston.webp
│  ├─ content
│  │  └─ docs
│  │     ├─ guides
│  │     │  └─ example.md
│  │     ├─ index.mdx
│  │     └─ reference
│  │        └─ example.md
│  └─ content.config.ts
└─ tsconfig.json

```
