# 2021 彰化公車網絡重製 / Changhua Transit Atlas

直接開啟 `index.html` 即可使用。無須 R、Node.js、伺服器或網路連線。
Open `index.html` directly. No R, Node.js, server, or internet connection is required.

## 功能 / Features

- 繁體中文 / English 切換。
- Leaflet 離線鄉鎮地圖，縮放、平移、點選鄉鎮及連結。
- Betweenness、Eigenvector、Burt's Constraint。
- 原始無加權、原始路線數加權、假設新增 10 條連結。
- 鄉鎮排名、無加權參照長條、單一鄉鎮三情境比較、鄰接鄉鎮。
- 桌面與行動裝置響應式介面。

## GitHub Pages

將本資料夾內容（`index.html`、`assets`、README 與可選的 `scripts`）上傳 GitHub 儲存庫。
在儲存庫 Settings → Pages 選擇發布分支的根目錄。所有資源使用相對路徑，可放在子路徑。
只上傳 `index.html` 不足以運作，請連同 `assets` 一起上傳。

Upload this folder's contents to a repository and publish its root with GitHub Pages. Keep `assets` next to `index.html`. No build step or backend is needed.

## 分析保真 / Analytical fidelity

沿用 `../2021netfinal/network/od.csv`（44 邊，Freq 合計 213）、`od_nobus.csv`（54 邊）、`nodeattribute.csv`（26 節點）及 `network/app/changhua.shp` 原始邊界。英文名稱取自原英文版 nodeattribute.csv，並核對座標一一相符。

指標由本機既有 R 4.1.2 / igraph 1.2.11 計算後寫入 `assets/data.js`：

- 無向圖；原有人工整理序列及權重不變。
- Betweenness：`normalized = FALSE`；加權仍直接使用 `Freq` 作為距離。未替換為倒數。
- Eigenvector：`scale = TRUE`，最大值為 1。
- Constraint：`igraph::constraint`，原始與 Freq 加權。
- 假設補線模式：對全部 54 條邊執行無加權算法。新增 10 邊的 Freq=0 不作成本使用。

Freq 是人工整理序列的路線連結計數，**不是每日班次**。原加權 Betweenness 將較大 Freq 當成較高成本，本重製刻意保留歷史作法。地圖線段是鄉鎮代表點連線，不是實際公車行駛路徑。人口年份為 2020 年。三種情境與指標切換時，地圖色階各自重新縮放。

All analytical definitions intentionally reproduce the original work, including Freq-as-distance weighted betweenness. These are structural metrics, not actual travel accessibility. Higher Constraint does not mean better service.

## 資料重建 / Rebuilding data

一般瀏覽不必執行任何腳本。要重新匯出分析資料，在本資料夾執行 `scripts/build-data.R`，需要 R、igraph、sf、jsonlite 與相鄰的原專案資料夾。Windows 舊版 R 編碼可使用 `scripts/build-data.py` 包装匯出，並以 `--rscript` 指定 Rscript 路徑。

原始資料檔未被修改；本資料夾不包含原專案的帳密、RData、部署憑證或全國 JSON。

## 核對 / Validation

`scripts/validate.py` 使用 numpy 與獨立的最短路徑實作，核對 234 個指標數值（誤差小於 `1e-8`），並檢查 HTML 引用、雙語標籤、邊界名稱及 Leaflet 官方 SHA-256。執行方式為 `python scripts/validate.py`，需先有 numpy。此檢查不包含瀏覽器視覺或互動操作測試。

## 地圖與來源 / Map & sources

- Leaflet 1.9.4，BSD-2-Clause；授權見 `assets/Leaflet-LICENSE.txt`。JS/CSS 內附，不依賴 CDN。
- 地圖使用原專案 TWD97 鄉鎮圖層，不向外部圖磚服務發出請求。
- 原研究：劉恒，2021 網絡分析期末專案。
- 原始站序來源：公共運輸整合資訊流通服務平台（PTX）；原專案 JSON 更新日期 2021-06-20／21。
- 本重製未重新授予原始資料權利；公開使用仍依原資料提供者授權。
