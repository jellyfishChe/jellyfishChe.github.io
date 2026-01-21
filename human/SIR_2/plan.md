## 疾病模擬系統設計與實作計劃

目標：設計一個可互動、參數可調的個體（agent）級別疾病模擬環境，包含常數（出生率、死亡率、診斷率、康復率、再診斷率）可由使用者透過 UI（輸入欄位）調整；並模擬人群移動與基於距離的傳染。

一、模型概述（混合 SIR / agent-based）

	- Susceptible (S)
	- Infected (I) — 已感染但未必被診斷
	- Diagnosed (D) — 被診斷（可視為隔離或標記）
	- Recovered (R)

	- 出生率 `birthRate`（per unit time）
	- 死亡率 `deathRate`（per unit time，對所有個體或僅感染者可選）
	- 診斷率 `diagnosisRate`（感染者→診斷的速率）
	- 康復率 `recoveryRate`（感染者或診斷者→康復的速率）
	- 再診斷率 `reDiagnosisRate`（康復者失去免疫或復發回到感染/診斷的速率）
	- 基本傳染強度 `baseTransm`（影響近距離傳染機率的常數）
	- 傳染半徑 `infectRadius`（超過此距離傳染機率趨近 0）
	- 時間步長 `dt`（模擬每步時間）


二、個體運動與空間


三、傳染模型（基於距離）


	- 方案 A（線性衰減）: p_trans = baseTransm * (1 - d / infectRadius)
	- 方案 B（指數衰減）: p_trans = baseTransm * exp(-k * d)

	使用者可採用預設的線性衰減；最終傳染機率應限制於 [0,1]。

四、狀態轉移（離散事件）

	- 若狀態為 I：以 `diagnosisRate` 的單步機率轉為 D；以 `recoveryRate` 的機率轉為 R；以 `deathRate` 的機率死亡（移除或標記）。
	- 若狀態為 D：以 `recoveryRate` 的機率轉為 R；以 `deathRate` 的機率死亡。診斷者可被設定為較低或較高的傳染性。
	- 若狀態為 R：以 `reDiagnosisRate` 的機率失去免疫回到 S 或直接變成 I（視模型定義）。
	- 出生：以 `birthRate` 機率新增 S 個體（或固定速率新增）。

五、使用者介面設計（輸入欄位與控制）

	- 左側或上方 Canvas：即時個體運動圖示（顏色代表狀態）
	- 右側或下方圖表：S/I/D/R 隨時間之趨勢折線圖（可用簡易繪圖庫或自己繪製）
	- 即時數值：總人口、S、I、D、R、當前時間步

六、實作架構（檔案與模組）

	- SIR/index.html（介面與 Canvas）
	- SIR/style.css
	- SIR/script.js（模擬引擎、UI 綁定、視覺化）

	- Agent 類（位置、速度、狀態、時間戳）
	- World / Simulation 類（個體清單、參數、step()）
	- UI 綁定與事件處理（讀取輸入值並更新參數）
	- 繪圖與統計收集（時間序列陣列）

七、數值穩定性與效能考量


八、模擬步伐（偽碼）

初始化 population 個體
每個時間步：
	- 更新每個 agent 的位置
	- 建立空間索引（若啟用）
	- 對於每個感染者，檢查鄰近易感者並以距離計算傳染機率
	- 對每個 agent 執行診斷/康復/死亡/再診斷/出生的隨機事件
	- 收集並記錄 S/I/D/R 數值，更新圖表與 Canvas

九、驗證與測試


十、數學模型（連續與 agent-based 對應）

目標：將計劃中的參數與行為形式化，便於分析與在程式中一致實作。

1) 區室式（連續）模型變數與參數：


系統方程（ODE）：
$$
\begin{aligned}
\frac{dS}{dt} &= \mu_b N - \beta\,\frac{S\,(I + qD)}{N} + \rho\,R - \mu_d S,\\[4pt]
\frac{dI}{dt} &= \beta\,\frac{S\,(I + qD)}{N} - (\delta + \gamma + \mu_d)\,I,\\[4pt]
\frac{dD}{dt} &= \delta\,I - (\gamma + \mu_d)\,D,\\[4pt]
\frac{dR}{dt} &= \gamma\,(I + D) - \rho\,R - \mu_d R.
\end{aligned}
$$

補充：上式是「均勻混合（well-mixed）」近似，未顯式包含人與人距離。若要把距離納入連續模型，可改用空間/距離核函數（kernel）的版本。

1b) 空間/距離版本（連續；kernel SIR/SDIR）

令空間位置為 $\mathbf{x}\in\Omega\subset\mathbb{R}^2$，用密度函數 $s(\mathbf{x},t),i(\mathbf{x},t),d(\mathbf{x},t),r(\mathbf{x},t)$ 表示各狀態在位置上的分布，且 $n(\mathbf{x},t)=s+i+d+r$。

定義距離核 $K(\|\mathbf{x}-\mathbf{y}\|)$（例如線性/指數衰減，且可在半徑 $r$ 外為 0）。則位置 $\mathbf{x}$ 的感染危險率（force of infection）為：
$$
\Lambda(\mathbf{x},t)=\beta_0\int_{\Omega} K(\|\mathbf{x}-\mathbf{y}\|)\,\big(i(\mathbf{y},t)+q\,d(\mathbf{y},t)\big)\,d\mathbf{y}.
$$

對應的易感者變化（示意；若加入移動/擾動可再加上輸運或擴散項）：
$$
\frac{\partial s}{\partial t}=\mu_b\,n- s\,\Lambda(\mathbf{x},t)+\rho\,r-\mu_d s.
$$
其餘 $i,d,r$ 的方程可沿用 SDIR 的診斷/康復/死亡/失免轉移項，只需把感染項替換為 $s\,\Lambda(\mathbf{x},t)$。

基本再生數（近似）：
$$
R_0 \approx \frac{\beta}{\delta + \gamma + \mu_d}.
$$

2) 離散化（模擬時間步 $dt$）

將連續率轉成單步事件機率，避免直接用率值造成數值偏差：
$$
p = 1 - e^{-\text{rate}\cdot dt}.
$$
例如單步診斷機率 $p_{\rm diag}=1-e^{-\delta dt}$，單步康復 $p_{\rm rec}=1-e^{-\gamma dt}$，單步死亡 $p_{\rm death}=1-e^{-\mu_d dt}$，單步失免 $p_{\rm loss}=1-e^{-\rho dt}$。

3) Agent-based（基於距離）傳染規則

	- 線性衰減： $f(d)=1-\dfrac{d}{r}$（$d\le r$），否則 $0$；
	- 指數衰減： $f(d)=e^{-k d}$。

	單步傳染機率：
$$
p_{\rm trans}(d)=1-\exp\big(-\beta_0 f(d)\,dt\big).
$$
若感染者為診斷者，將 $\beta_0$ 乘上 $q$ 或使用不同係數以表現隔離/降低接觸。

4) 個體運動（離散時間更新）

每個 agent 擁有位置 $\mathbf{x}$ 與速度向量 $\mathbf{v}$（速率為常數 $v$，方向可隨時間小幅改變）：
$$
\mathbf{x}\leftarrow \mathbf{x} + \mathbf{v}\,dt.
$$
邊界處理可採 wrap-around（模運算）或 bounce（翻轉速度分量）。

5) 每步事件順序（實作參考）

	- 更新位置；
	- 建立鄰域索引（格網或四叉樹）；
	- 對每個感染者檢查鄰近 S，採用 $p_{\rm trans}(d)$ 抽樣傳染；
	- 對每個 agent 以離散化機率抽樣診斷／康復／死亡／失免事件；
	- 若實作出生過程，依 Poisson($\mu_b N dt$) 或單步機率新增 S；

	- 紀錄並輸出 S/I/D/R 統計以更新視覺化。
