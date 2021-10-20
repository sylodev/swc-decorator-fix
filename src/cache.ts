import fs from "fs";
import path from "path";
import { debug } from "./debug";

export class Cache {
  private readonly localCache = new Map<string, string>();
  constructor(readonly path: string) {
    fs.mkdirSync(path, { recursive: true });
  }

  read(key: string): string | null {
    if (this.localCache.has(key)) return key;
    try {
      const keyPath = this.getKeyPath(key);
      return fs.readFileSync(keyPath, "utf8");
    } catch {
      return null;
    }
  }

  write(key: string, content: string): void {
    this.localCache.set(key, content);
    const keyPath = this.getKeyPath(key);
    debug(`Writing ${key} to cache`);
    fs.writeFileSync(keyPath, content);
  }

  private getKeyPath(key: string): string {
    return path.join(this.path, key);
  }
}
