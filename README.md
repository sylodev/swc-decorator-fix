# @sylo-digital/swc-decorator-fix

swc has some funky issues when it comes to decorators. This aims to fix them by falling back to the regular typescript compiler for any files that have decorators in them. This should fix [this issue](https://github.com/swc-project/swc/issues/2117) and a couple others until thy're fixed in swc. 

**This script must run before @swc/register**, for example `node -r @sylo-digital/swc-decorator-fix -r @swc/register src/index.ts`.
