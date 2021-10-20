import { addHook } from "pirates";

const pattern = /\n +@[A-z]+\(.*\)\n +[A-z]+ ?!?: ?(?<type>.*);/g;

addHook(
  (code) => {
    return code.replace(pattern, (match, type) => {
      const replaced = match.replace(type, `${type} = undefined`);
      return replaced;
    });
  },
  { ignoreNodeModules: false, exts: [".ts"] }
);
