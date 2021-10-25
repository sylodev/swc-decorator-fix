import { addHook } from "pirates";
import typescript from "typescript";
import { performance } from "perf_hooks";
import crypto from "crypto";
import { Cache } from "./cache";
import path from "path";
import { debug } from "./debug";
import os from "os";

const decoratorPattern = /\n *@[A-z]+/;
const useCache = !process.argv.includes("--no-cache");
const defaultCachePath = path.join(os.tmpdir(), ".swc-decorator-fix-cache");
const cachePath = process.env.SWC_DECORATOR_FIX_CACHE_PATH ?? defaultCachePath;
const cache = new Cache(cachePath);
let cachedConfigFile: typescript.ParsedCommandLine | undefined;

if (useCache) {
  debug("Using cache at", cachePath);
}

function getCodeHash(code: string): string {
  return crypto.createHash("md5").update(code).digest("hex");
}

function getConfigFile(): typescript.ParsedCommandLine {
  if (cachedConfigFile) return cachedConfigFile;
  const start = performance.now();
  const projectIndex = process.argv.indexOf("--project");
  const project = projectIndex !== -1 ? process.argv[projectIndex + 1] : "tsconfig.json";
  const configFilePath = typescript.findConfigFile("./", typescript.sys.fileExists, project);
  if (!configFilePath) {
    const error = "Could not find tsconfig path.";
    const showExtra = project !== "tsconfig.json";
    const extra = showExtra ? 'If it is not named "tsconfig.json", specify a name with "--project".' : "";
    throw new Error(error + extra);
  }

  const configFile = typescript.readConfigFile(configFilePath, typescript.sys.readFile);
  const duration = performance.now() - start;
  debug(`Loading ${project} took ${duration}ms`);
  cachedConfigFile = typescript.parseJsonConfigFileContent(configFile.config, typescript.sys, "./");
  return cachedConfigFile;
}

function transpile(code: string, filename: string): string {
  if (decoratorPattern.test(code)) {
    debug(`${filename} has decorators, using typescript to transpile…`);
    const start = performance.now();

    let cacheKey;
    if (useCache) {
      cacheKey = getCodeHash(code);
      const cached = cache.read(cacheKey);
      if (cached) {
        const duration = performance.now() - start;
        debug(`Transpiling ${filename} took ${duration}ms (hit)`);
        return cached;
      }
    }

    const config = getConfigFile();
    const compilerOptions = config.options;
    const { outputText } = typescript.transpileModule(code, { compilerOptions, fileName: filename });
    const duration = performance.now() - start;
    if (cacheKey) {
      cache.write(cacheKey, outputText);
    }

    debug(`Transpiling ${filename} took ${duration}ms (miss)`);
    return outputText;
  }

  return code;
}

addHook(transpile, { ignoreNodeModules: false, exts: [".ts"] });
