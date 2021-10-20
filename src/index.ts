import { addHook } from "pirates";
import {
  ParsedCommandLine,
  findConfigFile,
  transpileModule,
  parseJsonConfigFileContent,
  readConfigFile,
  sys,
} from "typescript";
import { debuglog } from "util";
import { performance } from "perf_hooks";

const debug = debuglog("swc-decorator-fix");
const decoratorPattern = /\n +@[A-z]+\(/g;
let cachedConfigFile: ParsedCommandLine | undefined;

function getConfigFile(): ParsedCommandLine {
  if (cachedConfigFile) return cachedConfigFile;
  const start = performance.now();
  const projectIndex = process.argv.indexOf("--project");
  const project = projectIndex !== -1 ? process.argv[projectIndex + 1] : "tsconfig.json";
  const configFilePath = findConfigFile("./", sys.fileExists, project);
  if (!configFilePath) {
    const error = "Could not find tsconfig path.";
    const showExtra = project !== "tsconfig.json";
    const extra = showExtra ? 'If it is not named "tsconfig.json", specify a name with "--project".' : "";
    throw new Error(error + extra);
  }

  const configFile = readConfigFile(configFilePath, sys.readFile);
  const duration = performance.now() - start;
  debug(`Loading ${project} took ${duration}ms`);
  cachedConfigFile = parseJsonConfigFileContent(configFile.config, sys, "./");
  return cachedConfigFile;
}

function transpile(code: string, filename: string): string {
  if (decoratorPattern.test(code)) {
    debug(`${filename} has decorators, using typescript to transpile…`);
    const start = performance.now();
    const config = getConfigFile();
    const compilerOptions = config.options;
    const { outputText } = transpileModule(code, { compilerOptions, fileName: filename });
    const duration = performance.now() - start;
    debug(`Transpiling ${filename} took ${duration}ms`);
    return outputText;
  }

  return code;
}

addHook(transpile, { ignoreNodeModules: false, exts: [".ts"] });
