document.addEventListener('DOMContentLoaded', () => {
    const range = document.getElementById('fontRange') as HTMLInputElement | null;
    const valueLabel = document.getElementById('fontValue') as HTMLElement | null;

    if (!range || !valueLabel) {
        console.warn('Не найдены элементы с id fontRange или fontValue');
    } else {
        const applyFontSize = (px: number): void => {
            document.documentElement.style.fontSize = `${px}px`;
            valueLabel.textContent = `${px}px`;
        };

        applyFontSize(Number(range.value));

        range.addEventListener('input', (ev: Event) => {
            const target = ev.target as HTMLInputElement;
            const v = Number(target.value);
            if (!Number.isNaN(v)) applyFontSize(v);
        });
    }

    const exprEl = document.getElementById('expr') as HTMLElement | null;
    const resEl = document.getElementById('res') as HTMLElement | null;
    const keysNodeList = document.querySelectorAll('.keys button');

    if (!exprEl || !resEl) {
        console.warn('Не найдены элементы дисплея калькулятора');
        return;
    }

    let expression: string = '';

    const updateView = (): void => {
        exprEl.textContent = expression || '\u00A0';
        try {
            const preview = previewEval(expression);
            resEl.textContent = preview === '' ? '0' : preview;
        } catch {
            resEl.textContent = expression ? '...' : '0';
        }
    };

    const previewEval = (expr: string): string => {
        if (!expr) return '';
        let e = expr.replace(/×/g, '*').replace(/÷/g, '/').trim();
        while (e.length && /[+\-*/.]$/.test(e)) e = e.slice(0, -1);
        if (!e) return '';
        if (!/^[0-9+\-*/().\s]+$/.test(e)) throw new Error('invalid chars');
        const result = Function('"use strict";return (' + e + ')')();
        if (!isFinite(result)) throw new Error('math error');
        return formatNum(result);
    };

    const formatNum = (n: number): string => {
        if (Math.abs(n - Math.round(n)) < 1e-12) return String(Math.round(n));
        return parseFloat(n.toFixed(12)).toString();
    };

    const appendValue = (v: string): void => {
        if (v === '×' || v === '÷') {
            v = v === '×' ? '*' : '/';
        }
        const ops = ['+', '-', '*', '/'];
        const last = expression.slice(-1);

        if (ops.includes(v)) {
            if (expression === '' && v !== '-') return;
            if (ops.includes(last)) {
                if (v === '-' && last !== '-') {
                    expression += v;
                } else {
                    expression = expression.slice(0, -1) + v;
                }
                updateView();
                return;
            }
        }

        if (v === '.') {
            const m = expression.match(/([0-9]*\.?[0-9]*)$/);
            const token = m ? m[0] : '';
            if (token.includes('.')) return;
            if (token === '') v = '0.';
        }

        expression += v;
        updateView();
    };

    const clearAll = (): void => {
        expression = '';
        updateView();
    };

    const backspace = (): void => {
        expression = expression.slice(0, -1);
        updateView();
    };

    const evaluate = (): void => {
        try {
            const r = previewEval(expression);
            expression = r === '' ? '' : String(r);
            updateView();
        } catch {
            resEl.textContent = 'Error';
        }
    };

    keysNodeList.forEach((node) => {
        const btn = node as HTMLButtonElement;
        btn.addEventListener('click', () => {
            const v = btn.getAttribute('data-value');
            const action = btn.getAttribute('data-action');
            if (action) {
                if (action === 'clear') clearAll();
                if (action === 'back') backspace();
                if (action === 'equals') evaluate();
            } else if (v) {
                appendValue(v);
            }
        });
    });

    window.addEventListener('keydown', (ev: KeyboardEvent) => {
        const k = ev.key;
        if (/^[0-9]$/.test(k) || k === '.') { appendValue(k); ev.preventDefault(); return; }
        if (k === '+' || k === '-' || k === '*' || k === '/') { appendValue(k); ev.preventDefault(); return; }
        if (k === 'Enter' || k === '=') { evaluate(); ev.preventDefault(); return; }
        if (k === 'Backspace') { backspace(); ev.preventDefault(); return; }
        if (k === 'Escape') { clearAll(); ev.preventDefault(); return; }
        if (k === '(' || k === ')') { appendValue(k); ev.preventDefault(); return; }
    });

    updateView();
});
