// weather-driver.js — weather-tool のグルー例。コード→ラベル/クエリ判定=Almide(wasm)、
// Open-Meteo HTTP=Node。
export async function loadWeatherCodes(wasmUrl) {
  const bytes = await (await fetch(wasmUrl)).arrayBuffer();
  const mod = await WebAssembly.compile(bytes);
  const imports = {}; for (const i of WebAssembly.Module.imports(mod)) (imports[i.module] ??= {})[i.name] = () => 0;
  const { exports: ex } = await WebAssembly.instantiate(mod, imports); try { ex._start(); } catch {}
  const enc = new TextEncoder(), dec = new TextDecoder();
  return {
    label(code) { const len = ex.label_resolve(code); const p = ex.out_ptr(); return dec.decode(new Uint8Array(ex.memory.buffer, Number(p), Number(len))); },
    isKnown(code) { return ex.is_known(code) === 1; },
    isWeatherQuery(text) { const b = enc.encode(text); const p = ex.in_alloc(b.length); new Uint8Array(ex.memory.buffer, Number(p), b.length).set(b); return ex.is_weather_query() === 1; },
  };
}
