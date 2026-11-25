# Chladni-PWA 圓形鼓皮克拉尼模擬器

圓形鼓皮克拉尼圖形模擬器 × Web Audio 五維心理聲學引擎，可離線安裝的 PWA。

**線上版**：https://leejiaxian.github.io/chladni-pwa/

## 檔案結構

```text
index.html      # 主程式（物理場引擎 + DSP），含 PWA 註冊與安裝按鈕
manifest.json   # PWA manifest
sw.js           # Service Worker（Cache-First + 背景更新）
icons/          # 192 / 512 PNG 圖示
```

## 本機執行

Service Worker 與麥克風權限需要 HTTPS 或 `localhost`：

```bash
python3 -m http.server 8000
# 開啟 http://localhost:8000
```

## 更新注意

修改任何快取檔案後，請同步調高 `sw.js` 內的 `CACHE_NAME` 版本號（如 `chladni-pwa-v2`），使用者端才會換掉舊快取。
