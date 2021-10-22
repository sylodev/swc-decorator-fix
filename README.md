# @sylo-digital/swc-decorator-fix

swc has some funky issues when it comes to decorators. This aims to fix them by falling back to tsc for any files that have decorators in them. This should fix [this issue](https://github.com/swc-project/swc/issues/2117) and a couple others I ran into until thy're fixed in swc. There is also persistent caching based on the hash of the file contents that speeds this process up considerably, so the performance impact of doing this should be minimal.

You can enable debug mode by setting `NODE_DEBUG` to `swc-decorator-fix`, this will log a lot of unnecessary info but will help see what it's actually doing behind the scenes and what files are cached.

**This script must run before @swc/register**, for example `node -r @sylo-digital/swc-decorator-fix -r @swc/register src/index.ts`.
