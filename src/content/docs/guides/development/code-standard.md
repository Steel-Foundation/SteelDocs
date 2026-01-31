---
title: Code Standard
description: This requirements needs to be followed
---

# Code standard

## General

- Usually vanilla is decent at naming stuff, so holding to the same names makes reading easier for the next person. Sometimes we want to deviate from this though in cases where names are bad or non descriptive, or we want a whole other solution to the system at hand. In that case we should add a doc comment above the struct, method or module that clearly states the differences so next time someone new picks it up they have an easy time understanding your system.
- We should try to minimize code duplication, but a few lines are usually fine.
- When working on foundation we must be extra sure we aren't taking any shortcuts or leaving stuff out, this can cause issues later down the line where a foundational system has to be completely redesigned. Foundational code is code like a system or interface other code depends on, an example being the block behavior trait, if that's badly designed from the start and we have 100 block implementations building off it good luck getting it changed. But this doesn't rule out future foundational changes if the first system was designed with longevity in mind. An example of this kind of foundation is our chunk scheduler where the chunk stages and rules on when they are executed are already designed. This means that swapping out the scheduler doesn't break the generation code.
- No workarounds. Don't be lazy and skip creating a helper function just cause you only needed it once for your use case.
- Try to not go deep in indentation, guard clauses are useful for this and rust has some really nice ⁨⁨⁨⁨⁨⁨⁨⁨⁨⁨`if let`⁩⁩⁩⁩⁩⁩⁩⁩⁩⁩ and ⁨⁨⁨⁨⁨⁨⁨⁨⁨⁨`let Some() = x else {return}`⁩⁩⁩⁩⁩⁩⁩⁩⁩⁩
- Don't use panics unless the case never happens or is fatal to the program. Otherwise try using Results
- Don't multithread something unless you can explain why it needs multithreading and can prove it's better with benchmarks
- Don't use async unless you need disk or network I/O, or mass use of low compute tasks that need awaiting (chunk dependencies, but the generation is ran on rayon). Always make sure to never run compute intensive code in an async runtime, bridge the gap using spawn_blocking or spawning a rayon task.
- Use [samply](https://github.com/mstange/samply) or [jaeger](https://www.jaegertracing.io/docs/latest/getting-started/) for profiling. Jaeger is best at timing using tracing spans and capturing context and averages. Samply is the best if you want a simple flame graph for seeing which internal function takes the most resources for world gen for example
- Don't add unnecessary dependencies. We are not javascript, we don't need is-even and left-pad
- If you haven't fully implemented a feature, make sure to add a // TODO: comment

## Registries

- We should only generate what is needed. Does minecraft use a hardcoded collision transfrom on entities in different states? Then so should we instead of extracting them.
- We should hand write registries with complex logic unless they have a lot of entries (30+). Something like data components and entity serializers include a lot of manual labor to get the serializers right and they only have a few entries so no reason to over complicate it with generation as well.
- We should use the extraction data from the minecraft data pack instead of generating a custom format if it exsists in there. This usually applies to what mojang calls reloadable registries, includes tags, worldgen data and such. Vanilla BuiltIn registries have to get extracted.
- We should design everything with modding and abi compatibility in mind for the future. No requirement to add a Other enum attribute type, but we must make sure it's designed to handle it in the future. We should hold the same standars as NeoForge when it comes to modding, so even block registries (vanilla Built In registries) should have this in mind

## Testing

- Add tests for advanced systems, code using unsafe (Always use // SAFETY comments) or code that needs to match vanilla determinism (ItemComponent hashing or worldgen)
- Only #[allow] clippy lints with a justification comment unless obvious. False positives and intentional deviations (e.g., function length for readability) are acceptable when explained.
