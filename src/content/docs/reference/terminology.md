---
title: Terminology
description: Common Steel world, block and configuration terms
sidebar:
  order: 1
---

Steel uses a few terms differently from vanilla Minecraft and from Mojang's internal names. This page is a glossary for the world, block and configuration terms used in the docs.

## Quick Reference

| Term                                | Meaning                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------- |
| [Block State](#block-state)         | A block type with a particular set of property values                   |
| [Identifier](#identifier)           | A unique `namespace:path` name used for Minecraft and Steel values      |
| [Domain](#domain)                   | A collection of related worlds with shared player data and defaults     |
| [World](#world)                     | A playable map inside a domain                                          |
| [Dimension](#dimension)             | An in-game realm such as the Overworld, Nether or End                    |
| [Dimension Type](#dimension-type)   | A reusable definition of dimension-specific properties                 |
| [World Generator](#world-generator) | The system that creates terrain and chooses or accepts a dimension type |
| [Portal Target](#portal-target)     | The same-domain world a portal sends entities to                        |
| [Storage Backend](#storage-backend) | The system used to store world or player data                           |

## Block State

A **block state** is a block type together with the values of its properties, such as a direction or connection state. Different states of the same block type can have different behavior or appearance.

## Identifier

An **identifier** is a name made from a namespace and a path, written as `namespace:path`.

Examples include `minecraft:overworld`, `minecraft:flat`, `minecraft:stone`, `minecraft:stick` and `steel:disk`.

Steel uses identifiers for values such as world generators, dimension types, storage backends, blocks and items. An identifier should be unique in the registry or config context where it is used.

Domain names use the namespace-style part. World names use the path-style part.

## Domain

A **domain** is a collection of worlds that belong together. It is the highest level in `worlds.toml`.

Domain-level settings such as seed, default gamemode, difficulty and storage can be inherited by all worlds inside that domain. Player data is also tied to the domain. Switching domains is similar to switching servers because player data does not carry across domain boundaries.

Example: a vanilla-style setup usually has one `minecraft` domain containing the Overworld, Nether and End.

## World

A **world** is a playable map inside a domain.

In vanilla Minecraft this is often described as the Overworld, Nether or End. Steel can define more worlds than vanilla. For example, one domain can contain `overworld`, `overworld_2` and `testing`.

Each world selects a world generator. A world can also override inherited domain settings, such as seed, gamemode, difficulty or storage.

## Dimension

A **dimension** is an in-game realm such as the Overworld, Nether or End. Its properties, including height, sky, fog and other dimension-specific behavior, are defined by a dimension type.

The Overworld's dimension type sets a height of 384 blocks. The Nether's dimension type sets Nether fog, and the End's sets its skybox.

A dimension is not the same as a saved map. Multiple worlds can use the same dimension type.

## Dimension Type

A **dimension type** is a reusable definition of a dimension's properties and behavior, such as its height, sky and fog. A world generator selects a dimension type for a world; multiple worlds can use the same type.

## World Generator

A **world generator** creates the terrain for a world.

Some generators always target one dimension. For example, `minecraft:overworld` targets the Overworld dimension. Other generators can accept a dimension type through config. For example, `minecraft:flat` can create a flat world using the Overworld, Nether or End dimension properties.

## Portal Target

A **portal target** is the same-domain world that a portal sends an entity to.

Steel uses vanilla conventional names by default: `overworld`, `the_nether` and `the_end`. Worlds with custom names can override this with `nether_portal_target` and `end_portal_target` in `worlds.toml`.

## Storage Backend

A **storage backend** determines how world or player data is stored. Steel provides disk storage, which persists data, and RAM storage, which keeps data in memory and does not save it between runs.

## Related Pages

- [World configuration](../for-administrators/configuration/world-configuration.md)
