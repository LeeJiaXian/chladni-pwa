# Chladni-PWA 圓形鼓皮克拉尼模擬器

圓形鼓皮克拉尼圖形模擬器 × Web Audio 五維心理聲學引擎，可離線安裝的 PWA。

**線上版**：https://leejiaxian.github.io/chladni-pwa/

## 檔案結構

```text
index.html           # 主程式（物理場引擎 + DSP），含 PWA 註冊與安裝按鈕
manifest.json        # PWA manifest
sw.js                # Service Worker（Cache-First + 背景更新，全部資源同源預快取）
assets/app.css       # Tailwind 預先 build 的產物（含 @font-face），需 commit
fonts/               # 自架 Inter / JetBrains Mono woff2（SIL OFL 1.1，授權見 OFL-*.txt）
icons/               # 192 / 512 PNG 圖示
src/input.css        # Tailwind 輸入檔（@font-face + @tailwind 指令）
tailwind.config.js   # Tailwind 設定（主題色、字型）
package.json         # 只有 build:css 指令，無相依套件
```

GitHub Pages 直接發布 `main` 根目錄，**沒有 CI build**，因此 `assets/app.css` 必須 build 後一起 commit。

## 修改樣式

`index.html` 新增或修改 Tailwind class 後，重新產生 CSS：

```bash
npm run build:css   # npx tailwindcss@3.4.17，版本鎖定與原 CDN 相同
```

## 本機執行

Service Worker 與麥克風權限需要 HTTPS 或 `localhost`：

```bash
python3 -m http.server 8000
# 開啟 http://localhost:8000
```

## 更新注意

修改任何快取檔案（HTML、CSS、字型、圖示）後，請同步調高 `sw.js` 內的 `CACHE_NAME` 版本號（目前 `chladni-pwa-v2`），使用者端才會換掉舊快取。新增的靜態資源也要加進 `PRECACHE_URLS`。
