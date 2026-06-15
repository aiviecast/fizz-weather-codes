import { readFileSync } from "node:fs";
const mod = await WebAssembly.compile(readFileSync(new URL("../build/wx.wasm", import.meta.url)));
const imports = {}; for (const i of WebAssembly.Module.imports(mod)) (imports[i.module] ??= {})[i.name] = () => 0;
const { exports: ex } = await WebAssembly.instantiate(mod, imports); try { ex._start(); } catch {}
const enc = new TextEncoder(), dec = new TextDecoder();
const isQuery = (text) => { const b = enc.encode(text); const p = ex.in_alloc(b.length); new Uint8Array(ex.memory.buffer, Number(p), b.length).set(b); return ex.is_weather_query(); };
const label = (c) => { const len = ex.label_resolve(c); const p = ex.out_ptr(); return dec.decode(new Uint8Array(ex.memory.buffer, Number(p), Number(len))); };
let ok = true; const ck = (c, m) => { if (!c) { console.error("FAIL " + m); ok = false; } };
ck(label(0) === "快晴", "label 0: " + label(0));
ck(label(95) === "雷雨", "label 95");
ck(label(0) === "快晴", "label 0 repeat (no corrupt)");
ck(label(7) === "", "unknown label");
ck(ex.is_known(63) === 1, "is_known 63");
ck(isQuery("東京の天気は？") === 1, "weather query");
ck(isQuery("こんにちは") === 0, "non-query");
// 多重読み: 1 set で is_weather_query を複数回 + label を挟んでも安全 (almide#690 回避)
{ const b = enc.encode("今日の気温は"); const p = ex.in_alloc(b.length); new Uint8Array(ex.memory.buffer, Number(p), b.length).set(b);
  ck(ex.is_weather_query() === 1 && ex.is_weather_query() === 1, "multi-read query");
  ex.label_resolve(0);
  ck(ex.is_weather_query() === 1, "query after label (g_in intact)"); }
console.log(ok ? "wasm OK — labels + query (incl. multi-read) match native" : "FAIL"); if (!ok) process.exit(1);
