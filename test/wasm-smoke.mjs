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
console.log(ok ? "wasm OK — weather labels + query detection match native" : "FAIL"); if (!ok) process.exit(1);
