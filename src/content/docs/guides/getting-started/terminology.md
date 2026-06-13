---
title: Terminology
description: Common Steel world and configuration terms
---

Steel uses a few terms differently from vanilla Minecraft and from Mojang's internal names. This page is a short glossary for the world and configuration terms used in the docs.

## Quick Reference

| Term | Meaning |
|------|---------|
| [Domain](#domain) | A collection of related worlds with shared player data and defaults |
| [World](#world) | A playable map inside a domain |
| [Dimension](#dimension) | The rule set and visual properties used by a world |
| [World Generator](#world-generator) | The system that creates terrain and chooses or accepts a dimension type |
| [Identifier](#identifier) | A unique `namespace:path` name used for Minecraft and Steel values |

## Domain

A **domain** is a collection of worlds that belong together. It is the highest level in `worlds.toml`.

Domain-level settings such as seed, default gamemode, difficulty and storage can be inherited by all worlds inside that domain. Player data is also tied to the domain. Switching domains is similar to switching servers because player data does not carry across domain boundaries.

Example: a vanilla-style setup usually has one `minecraft` domain containing the Overworld, Nether and End.

## World

A **world** is a playable map inside a domain.

In vanilla Minecraft this is often described as the Overworld, Nether or End. Steel can define more worlds than vanilla. For example, one domain can contain `overworld`, `overworld_2` and `testing`.

Each world selects a world generator. A world can also override inherited domain settings, such as seed, gamemode, difficulty or storage.

## Dimension

A **dimension** describes the properties used by a world. This includes things like height, sky, fog and other dimension-specific behavior.

The Overworld dimension has a height of 384 blocks. The Nether has Nether fog. The End has an End skybox.

A dimension is not the same as a saved map. Multiple worlds can use the same dimension type.

## World Generator

A **world generator** creates the terrain for a world.

Some generators always target one dimension. For example, `minecraft:overworld` targets the Overworld dimension. Other generators can accept a dimension type through config. For example, `minecraft:flat` can create a flat world using the Overworld, Nether or End dimension properties.

## Identifier

An **identifier** is a name made from a namespace and a path, written as `namespace:path`.

Examples include `minecraft:overworld`, `minecraft:flat`, `minecraft:stone`, `minecraft:stick` and `steel:disk`.

Steel uses identifiers for values such as world generators, dimension types, storage backends, blocks and items. An identifier should be unique in the registry or config context where it is used.

Domain names use the namespace-style part. World names use the path-style part.

## Related Pages

- [World configuration](../../configuration/world-configuration)
