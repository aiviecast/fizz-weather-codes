# fizz-weather-codes

Fizz の **WMO 天気コード→日本語ラベル + 天気クエリ検出**(§10 weather-tool)。

Open-Meteo の WMO weather code を配信読み上げ(TTS)用の自然な日本語ラベルに変換し、
視聴者コメントが天気を尋ねているか(`天気/気温/温度`)を判定する。Open-Meteo の HTTP
取得・geocoding は Node、対応表とキーワード判定は Almide=単一の正本。移植元:
openaituber `src/chat/weatherTool.ts`。

## API

`label(code) -> String`(未知は `""`)/ `is_known(code) -> Bool` /
`is_weather_query(text) -> Bool`。コードは Open-Meteo WMO(0=快晴 … 95=雷雨 … 99=…)。

## native

```sh
almide build src/main.almd -o build/fizz-weather-codes
./build/fizz-weather-codes
# {"c0":"快晴","c63":"雨","c95":"雷雨","q1":true,"q2":false}
```

## wasm

```sh
almide build src/bridge.almd --target wasm -o build/wx.wasm
```

`in_alloc(len)`+`is_weather_query()`(text→Bool)/ `label_resolve(code)`+`out_ptr()`
(code→ラベル文字列)/ `is_known(code)`。グルー例
[`browser/weather-driver.js`](./browser/weather-driver.js)。CI で wasm↔native 一致を検証。

ツールチェーン: [almide](https://github.com/almide/almide) v0.27.6+。依存なし。
