// Kiểm chứng dữ liệu cứng: chạy lại code TS/Java trong src/data/code/*.ts
// và so sánh với output đã lưu. Không dùng khi build — chỉ để bảo trì.
//   node scripts/verify-examples.mjs          (cần Node ≥ 22.18, JDK ≥ 21 cho Java)
import { execFileSync } from "node:child_process";
import { mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const dir = join(import.meta.dirname, "..", "src", "data", "code");
const tmp = mkdtempSync(join(tmpdir(), "dp-verify-"));
let hasJava = true;
try {
  execFileSync("java", ["-version"], { stdio: "ignore" });
} catch {
  hasJava = false;
  console.warn("⚠ Không tìm thấy java — bỏ qua phần Java");
}

let failed = 0;
for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts") && f !== "index.ts").sort()) {
  const slug = file.slice(0, -3);
  const mod = await import(pathToFileURL(join(dir, file)).href);
  const ex = Object.values(mod)[0];
  const tsFile = join(tmp, `${slug}.ts`);
  writeFileSync(tsFile, ex.typescript + "\n\nexport {};\n");
  const tsOut = execFileSync(process.execPath, ["--no-warnings", tsFile], { encoding: "utf8" }).trimEnd();
  const okTs = tsOut === ex.tsOutput.join("\n");
  let okJava = true;
  if (hasJava) {
    const javaFile = join(tmp, ex.javaFile);
    writeFileSync(javaFile, ex.java + "\n");
    okJava = execFileSync("java", [javaFile], { encoding: "utf8" }).trimEnd() === ex.javaOutput.join("\n");
  }
  if (!okTs || !okJava) failed++;
  console.log(`${okTs ? "✓" : "✗"} ts  ${hasJava ? (okJava ? "✓" : "✗") : "-"} java  ${slug}`);
}
if (failed) {
  console.error(`\n${failed} ví dụ có output khác dữ liệu đã lưu`);
  process.exit(1);
}
console.log("\nTất cả output khớp dữ liệu cứng.");
