// 簡易計算機邏輯（支援三角函數 / 開根號 / 次方 / 對數 / 正負切換）
(function () {
  const screen = document.querySelector('.screen');
  const keys = document.querySelector('.keys');
  let expr = '';

  function updateScreen() {
    const exprEl = document.querySelector('.expr');
    if (exprEl) exprEl.textContent = expr || '';
    // 嘗試即時評估表達式，若失敗則不顯示結果預覽
    try {
      if (expr && expr.trim() !== '') {
        const val = safeEval(expr);
        screen.value = String(val);
      } else {
        screen.value = '';
      }
    } catch (e) {
      screen.value = '';
    }
  }

  function mapFunctions(s) {
    let t = s;
    // 替換乘除符號與次方符號
    t = t.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**');
    // 把常用函數對應到 Math
    t = t.replace(/\bln\b/g, 'Math.log');
    t = t.replace(/\blog\b/g, 'Math.log10');
    t = t.replace(/\bsin\b/g, 'Math.sin');
    t = t.replace(/\bcos\b/g, 'Math.cos');
    t = t.replace(/\btan\b/g, 'Math.tan');
    t = t.replace(/\bsqrt\b/g, 'Math.sqrt');
    t = t.replace(/\bexp\b/g, 'Math.exp');
    // 先處理 exp 再處理常數，避免把 exp 的 e 替換掉
    t = t.replace(/\bpi\b/g, 'Math.PI');
    t = t.replace(/\be\b/g, 'Math.E');
    t = t.replace(/\babs\b/g, 'Math.abs');
    return t;
  }

  function safeEval(s) {
    // 先處理百分號（例如 50% -> (50/100)）
    let converted = s.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
    converted = mapFunctions(converted);
    // 基本安全檢查：只允許數字、Math、字母、運算符與括號
    if (!/^[0-9+\-*/(). %A-Za-z,]+$/.test(converted)) throw new Error('不接受的字元');
    // eslint-disable-next-line no-new-func
    return Function(`return ${converted}`)();
  }

  function applyPercent() {
    const m = expr.match(/(\d+(?:\.\d+)?)$/);
    if (m) {
      const before = expr.slice(0, m.index);
      expr = before + `(${m[0]}/100)`;
    }
  }

  function toggleNeg() {
    const m = expr.match(/(-?\d+(?:\.\d+)?)$/);
    if (m) {
      const before = expr.slice(0, m.index);
      const val = m[0];
      if (val.startsWith('(-') && val.endsWith(')')) {
        // unwrap
        const unwrapped = val.slice(2, -1);
        expr = before + unwrapped;
      } else if (val.startsWith('-')) {
        expr = before + val.slice(1);
      } else {
        expr = before + `(-${val})`;
      }
    } else {
      expr = '-' + expr;
    }
  }

  keys.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'clear') {
      expr = '';
      updateScreen();
      return;
    }
    if (action === 'back') {
      expr = expr.slice(0, -1);
      updateScreen();
      return;
    }
    if (action === 'percent') {
      applyPercent();
      updateScreen();
      return;
    }
    if (action === 'neg') {
      toggleNeg();
      updateScreen();
      return;
    }
    if (action === '=') {
      try {
        const result = safeEval(expr);
        expr = String(result);
      } catch (e) {
        expr = '錯誤';
      }
      updateScreen();
      return;
    }

    // 函數按鈕（sin, cos, tan, ln, log, sqrt, exp, abs）
    if (/^(sin|cos|tan|ln|log|sqrt|exp|abs)$/.test(action)) {
      expr += action + '(';
      updateScreen();
      return;
    }

    // 常數按鈕 π 與 e
    if (action === 'pi') {
      expr += 'pi';
      updateScreen();
      return;
    }
    if (action === 'e') {
      expr += 'e';
      updateScreen();
      return;
    }

    // 次方符號，用 ^ 表示，稍後會被 mapFunctions 轉為 **
    if (action === '^') {
      expr += '^';
      updateScreen();
      return;
    }

    // 數字或運算子或小數點或括號
    expr += String(action);
    updateScreen();
  });

  // 初始化
  if (screen) updateScreen();
})();
