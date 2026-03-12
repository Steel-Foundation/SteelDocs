> don't mess with that code pls - Filou

the convex folder is basically the repository of your backend and your db. The schema.ts file is your table definitions, the names of the files are pretty much self explanatory.

Basically, it's a file that isn't deployed with github pages, because it's a serverless backend deployed separately that the frontend calls instead of the github deployment, since github pages doesn't have a stateful backend.

The _generated folder is the result of convex (our db/backend framework)'s CLI toolchain that generates types out of our table schemas and queries so that we can call it from the frontend. It's just some typescript wizardry.