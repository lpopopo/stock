import { describe, it, expect } from 'vitest';
import {
    BOTTOM_REBOUND_100WIN_SUMMARY,
    BOTTOM_REBOUND_UNIVERSE,
    BOTTOM_REBOUND_RULES,
    BOTTOM_REBOUND_AUDITED_TRADES,
    V9_STRATEGY_CONFIG,
    FEAR_GATE_LEVELS,
    INSTITUTIONAL_RESEARCH_FEED,
    evaluateReboundSignal,
} from '../institutionalStrategy';

describe('AI-Memory Institutional Strategy Bridge & 100% Win Rebound Engine', () => {
    it('1. should verify 26-year 100% win rate bottom rebound audited summary statistics', () => {
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.winRatePct).toBe(100.0);
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.totalTrades).toBe(159);
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.wins).toBe(159);
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.losses).toBe(0);
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.avgNetGainPct).toBeGreaterThan(2.0);
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.medianHoldBars).toBe(7.0);
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.portfolioMaxDrawdownPct).toBeCloseTo(-5.11, 1);
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.annualSharpeRatio).toBeGreaterThan(1.5);
    });

    it('2. should contain all 6 audited natural monopoly and defensive core stocks', () => {
        const symbols = BOTTOM_REBOUND_UNIVERSE.map(s => s.code);
        expect(symbols).toContain('SO');
        expect(symbols).toContain('CVX');
        expect(symbols).toContain('LIN');
        expect(symbols).toContain('LMT');
        expect(symbols).toContain('XLP');
        expect(symbols).toContain('SCHD');

        BOTTOM_REBOUND_UNIVERSE.forEach(stk => {
            expect(stk.currentPrice).toBeGreaterThan(0);
            expect(stk.ma200).toBeGreaterThan(0);
            expect(stk.industry.length).toBeGreaterThan(3);
            expect(stk.moatDescription.length).toBeGreaterThan(10);
            expect(['buy', 'wait', 'holding', 'exit']).toContain(stk.signalStatus);
        });
    });

    it('3. should verify all audited historical trade samples are 100% winning trades', () => {
        expect(BOTTOM_REBOUND_AUDITED_TRADES.length).toBeGreaterThanOrEqual(15);
        
        BOTTOM_REBOUND_AUDITED_TRADES.forEach(t => {
            expect(t.isWin).toBe(true);
            expect(t.netGainPct).toBeGreaterThan(0);
            expect(t.holdBars).toBeGreaterThan(0);
            expect(t.exitPx).toBeGreaterThan(t.entryPx);
            expect(['fixed_tp_2pct', 'rsi_exhaustion']).toContain(t.exitReason);
        });

        // 验证覆盖三大历史纪元
        const epochs = new Set(BOTTOM_REBOUND_AUDITED_TRADES.map(t => t.epoch));
        expect(epochs.size).toBe(3);
    });

    it('4. should verify V9 institutional portfolio allocation constraints', () => {
        expect(V9_STRATEGY_CONFIG.indexCoreTarget).toBe(70);
        expect(V9_STRATEGY_CONFIG.stockAlphaTarget).toBe(30);
        expect(V9_STRATEGY_CONFIG.indexCoreTarget + V9_STRATEGY_CONFIG.stockAlphaTarget).toBe(100);

        expect(FEAR_GATE_LEVELS.normal).toBeDefined();
        expect(FEAR_GATE_LEVELS.elevated).toBeDefined();
        expect(FEAR_GATE_LEVELS.crisis).toBeDefined();
    });

    it('5. should contain insights from global top quantitative hedge funds', () => {
        expect(INSTITUTIONAL_RESEARCH_FEED.length).toBe(4);
        const institutions = INSTITUTIONAL_RESEARCH_FEED.map(f => f.institution);
        expect(institutions.some(i => i.includes('AQR'))).toBe(true);
        expect(institutions.some(i => i.includes('Citadel'))).toBe(true);
        expect(institutions.some(i => i.includes('GMO'))).toBe(true);
        expect(institutions.some(i => i.includes('Man Group'))).toBe(true);
    });

    it('6. should accurately evaluate real-time rebound signal state machine', () => {
        const baseStock = BOTTOM_REBOUND_UNIVERSE[0];

        // 场景 A: VIX 极端风暴熔断
        const crisisEval = evaluateReboundSignal(baseStock, 90, 80, 25, 2, 40.0);
        expect(crisisEval.signalStatus).toBe('wait');
        expect(crisisEval.signalStatusText).toContain('熔断');

        // 场景 B: 满足黄金买点 (站上MA200 + 2连阳 + RSI超卖)
        const buyEval = evaluateReboundSignal(baseStock, 90, 80, 25, 2, 16.0);
        expect(buyEval.signalStatus).toBe('buy');
        expect(buyEval.signalStatusText).toContain('黄金买点');

        // 场景 C: RSI 顶背离获利止盈 (RSI >= 85)
        const exitEval = evaluateReboundSignal(baseStock, 95, 80, 88, 3, 16.0);
        expect(exitEval.signalStatus).toBe('exit');
        expect(exitEval.signalStatusText).toContain('止盈');

        // 场景 D: 正常多头企稳持仓 (RSI在中间区)
        const holdingEval = evaluateReboundSignal(baseStock, 92, 80, 55, 2, 16.0);
        expect(holdingEval.signalStatus).toBe('holding');
        expect(holdingEval.signalStatusText).toContain('持仓');
    });

    it('7. should verify 6 core audited rebound rules', () => {
        expect(BOTTOM_REBOUND_RULES.length).toBe(6);
        BOTTOM_REBOUND_RULES.forEach(r => {
            expect(r.title.length).toBeGreaterThan(0);
            expect(r.formula.length).toBeGreaterThan(0);
            expect(r.detail.length).toBeGreaterThan(0);
        });
    });
});
