import { addHook } from "pirates";

addHook(
  (code) => {
    return code.replace(/ +@[A-z]+\(.*\)\n +[A-z]+ ?!?: ?(?<type>.*);/g, (match, type) => {
      const replaced = match.replace(type, `${type} = undefined`);
      return replaced;
    });
  },
  { ignoreNodeModules: false, exts: [".ts"] }
);
