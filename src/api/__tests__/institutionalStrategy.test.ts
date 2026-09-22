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
    V9_LIVE_FORWARD_PORTFOLIO,
    FEAR_GATE_DYNAMIC_MATRIX,
    MARKET_BREADTH_DIVERGENCE_DATA,
    PREREGISTERED_MECHANISMS,
    RSR2_MOMENTUM_SCREENER,
    REENTRY_EXECUTION_ENGINE,
    PORTFOLIO_RISK_BUDGET_DATA,
    AI_INFRASTRUCTURE_BOTTLENECK_MAP,
    THEME_CROWDING_RADAR,
    evaluateTradeChecklist,
    EMPIRICAL_HYPOTHESES_REGISTRY,
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

    it('8. should verify V9 live forward shadow portfolio data and weight conservation', () => {
        expect(V9_LIVE_FORWARD_PORTFOLIO.totalNav).toBeGreaterThan(5000);
        expect(V9_LIVE_FORWARD_PORTFOLIO.cashAmount).toBeGreaterThan(3000);
        expect(V9_LIVE_FORWARD_PORTFOLIO.cashWeightPct + V9_LIVE_FORWARD_PORTFOLIO.stockWeightPct).toBeCloseTo(100.0, 1);
        expect(V9_LIVE_FORWARD_PORTFOLIO.holdings.length).toBe(4);

        const holdingSymbols = V9_LIVE_FORWARD_PORTFOLIO.holdings.map(h => h.symbol);
        expect(holdingSymbols).toContain('MRVL');
        expect(holdingSymbols).toContain('MXL');
        expect(holdingSymbols).toContain('QCOM');
        expect(holdingSymbols).toContain('GLW');

        V9_LIVE_FORWARD_PORTFOLIO.holdings.forEach(h => {
            expect(h.shares).toBeGreaterThan(0);
            expect(h.currentPrice).toBeGreaterThan(0);
            expect(h.marketValue).toBeCloseTo(h.shares * h.currentPrice, 1);
            expect(h.navWeightPct).toBeGreaterThan(0);
        });
    });

    it('9. should verify Fear Gate dynamic multi-factor matrix and regime', () => {
        expect(FEAR_GATE_DYNAMIC_MATRIX.totalScore).toBe(5);
        expect(FEAR_GATE_DYNAMIC_MATRIX.maxScore).toBe(10);
        expect(FEAR_GATE_DYNAMIC_MATRIX.regimeLevel).toBe('elevated');
        expect(FEAR_GATE_DYNAMIC_MATRIX.termStructureRatio).toBeCloseTo(0.812, 3);
        expect(FEAR_GATE_DYNAMIC_MATRIX.factors.length).toBe(4);

        const sumFactorScores = FEAR_GATE_DYNAMIC_MATRIX.factors.reduce((acc, cur) => acc + cur.score, 0);
        expect(sumFactorScores).toBe(FEAR_GATE_DYNAMIC_MATRIX.totalScore);
    });

    it('10. should verify 518-stock market breadth divergence metrics', () => {
        expect(MARKET_BREADTH_DIVERGENCE_DATA.universeSize).toBe(518);
        expect(MARKET_BREADTH_DIVERGENCE_DATA.aboveMa20Pct).toBeLessThan(25.0);
        expect(MARKET_BREADTH_DIVERGENCE_DATA.aboveMa50Pct).toBeLessThan(35.0);

        const totalStocks =
            MARKET_BREADTH_DIVERGENCE_DATA.gainersCount +
            MARKET_BREADTH_DIVERGENCE_DATA.losersCount +
            MARKET_BREADTH_DIVERGENCE_DATA.unchangedCount;
        expect(totalStocks).toBe(518);

        expect(MARKET_BREADTH_DIVERGENCE_DATA.inverseEtfHedgeGuide.length).toBe(2);
        const inverseSymbols = MARKET_BREADTH_DIVERGENCE_DATA.inverseEtfHedgeGuide.map(g => g.symbol);
        expect(inverseSymbols).toContain('PSQ');
        expect(inverseSymbols).toContain('SH');
    });

    it('11. should verify 3 preregistered orthogonal research mechanisms', () => {
        expect(PREREGISTERED_MECHANISMS.length).toBe(3);
        const mechIds = PREREGISTERED_MECHANISMS.map(m => m.id);
        expect(mechIds).toContain('mech-1-factor-hedge');
        expect(mechIds).toContain('mech-2-cash-yield');
        expect(mechIds).toContain('mech-3-capex-bullwhip');

        PREREGISTERED_MECHANISMS.forEach(m => {
            expect(m.title.length).toBeGreaterThan(5);
            expect(m.economicLogic.length).toBeGreaterThan(20);
            expect(m.solvesProblem.length).toBeGreaterThan(15);
            expect(m.portfolioApplication.length).toBeGreaterThan(15);
            expect(m.failureRisk.length).toBeGreaterThan(15);
            expect(m.evidenceRequirement.length).toBeGreaterThan(15);
        });
    });

    it('12. should verify RSR2 momentum breakout screener parameters and top stocks', () => {
        expect(RSR2_MOMENTUM_SCREENER.rsThreshold).toBe(85);
        expect(RSR2_MOMENTUM_SCREENER.volumeThreshold).toBe(1.5);
        expect(RSR2_MOMENTUM_SCREENER.clvThreshold).toBe(0.75);
        expect(RSR2_MOMENTUM_SCREENER.profitFactor).toBeGreaterThan(2.0);
        expect(RSR2_MOMENTUM_SCREENER.stocks.length).toBeGreaterThanOrEqual(5);

        const symbols = RSR2_MOMENTUM_SCREENER.stocks.map(s => s.symbol);
        expect(symbols).toContain('NVDA');
        expect(symbols).toContain('AVGO');
        expect(symbols).toContain('ANET');

        RSR2_MOMENTUM_SCREENER.stocks.forEach(s => {
            expect(s.rsRating).toBeGreaterThanOrEqual(85);
            expect(s.volumeMultiplier).toBeGreaterThan(1.0);
            expect(s.closeLocationValue).toBeGreaterThan(0.7);
            expect(s.currentPrice).toBeGreaterThan(s.ma200);
        });
    });

    it('13. should verify Re-entry anti-whipsaw execution flow and historical cases', () => {
        expect(REENTRY_EXECUTION_ENGINE.observationWindowDays).toBe(5);
        expect(REENTRY_EXECUTION_ENGINE.historicalWhipsawRecoveryRatePct).toBeCloseTo(38.6, 1);
        expect(REENTRY_EXECUTION_ENGINE.avgGainImprovementPct).toBeGreaterThan(3.0);
        expect(REENTRY_EXECUTION_ENGINE.stepByStepFlow.length).toBe(4);

        REENTRY_EXECUTION_ENGINE.recentCaseStudies.forEach(c => {
            expect(c.savedCapitalUsd).toBeGreaterThan(0);
            expect(c.subsequentMaxGainPct).toBeGreaterThan(0);
            expect(c.reentryPrice).toBeGreaterThan(c.stopPrice);
        });
    });

    it('14. should verify portfolio risk budget factor limits and exit study metrics', () => {
        expect(PORTFOLIO_RISK_BUDGET_DATA.factorConstraints.length).toBe(3);

        const aiCapexConstraint = PORTFOLIO_RISK_BUDGET_DATA.factorConstraints.find(f => f.factorName.includes('AI Capex'));
        expect(aiCapexConstraint).toBeDefined();
        expect(aiCapexConstraint?.riskLevel).toBe('breach');
        expect(aiCapexConstraint?.currentWeightPct).toBeGreaterThan(30.0);

        expect(PORTFOLIO_RISK_BUDGET_DATA.exitMethodEmpiricalStudy.length).toBe(3);
        const winnerMethod = PORTFOLIO_RISK_BUDGET_DATA.exitMethodEmpiricalStudy[0];
        expect(winnerMethod.method).toContain('全额锁利');
        expect(winnerMethod.cagrPct).toBeGreaterThan(22.0);
        expect(winnerMethod.sharpeRatio).toBeGreaterThan(1.7);
    });

    it('15. should verify AI infrastructure 4-layer bottleneck map integrity and critical stocks', () => {
        expect(AI_INFRASTRUCTURE_BOTTLENECK_MAP.layers.length).toBe(4);

        const layerIds = AI_INFRASTRUCTURE_BOTTLENECK_MAP.layers.map(l => l.layerId);
        expect(layerIds).toContain('layer1_compute');
        expect(layerIds).toContain('layer2_interconnect');
        expect(layerIds).toContain('layer3_memory_equipment');
        expect(layerIds).toContain('layer4_cloud_power_edge');

        // 验证 Layer 1 算力芯片
        const l1 = AI_INFRASTRUCTURE_BOTTLENECK_MAP.layers.find(l => l.layerId === 'layer1_compute')!;
        expect(l1.bottleneckSeverity).toBe('Critical');
        const l1Symbols = l1.stocks.map(s => s.symbol);
        expect(l1Symbols).toContain('NVDA');
        expect(l1Symbols).toContain('AVGO');
        expect(l1Symbols).toContain('MRVL');
        expect(l1Symbols).toContain('AMD');

        // 验证 Layer 2 光互联
        const l2 = AI_INFRASTRUCTURE_BOTTLENECK_MAP.layers.find(l => l.layerId === 'layer2_interconnect')!;
        expect(l2.bottleneckSeverity).toBe('Severe');
        const l2Symbols = l2.stocks.map(s => s.symbol);
        expect(l2Symbols).toContain('GLW');
        expect(l2Symbols).toContain('CRDO');
        expect(l2Symbols).toContain('ALAB');
        expect(l2Symbols).toContain('MXL');
        expect(l2Symbols).toContain('ANET');

        // 验证所有标的属性完整性
        AI_INFRASTRUCTURE_BOTTLENECK_MAP.layers.forEach(layer => {
            expect(layer.leadTimeWeeks.length).toBeGreaterThan(0);
            expect(layer.physicalConstraint.length).toBeGreaterThan(10);
            layer.stocks.forEach(stk => {
                expect(stk.nameCn.length).toBeGreaterThan(1);
                expect(stk.role.length).toBeGreaterThan(5);
                expect(stk.competitiveMoat.length).toBeGreaterThan(5);
                expect(stk.keyMetricToWatch.length).toBeGreaterThan(5);
            });
        });
    });

    it('16. should verify theme crowding radar levels and contrarian risk directives', () => {
        expect(THEME_CROWDING_RADAR.overallHeatIndex).toBe(78);
        expect(THEME_CROWDING_RADAR.currentLevel).toBe('hyper_crowded');
        expect(THEME_CROWDING_RADAR.contrarianDirectives.length).toBe(4);
        expect(THEME_CROWDING_RADAR.crowdingLevels.length).toBe(4);

        const levelKeys = THEME_CROWDING_RADAR.crowdingLevels.map(l => l.level);
        expect(levelKeys).toContain('quiet_accumulation');
        expect(levelKeys).toContain('healthy_trend');
        expect(levelKeys).toContain('hyper_crowded');
        expect(levelKeys).toContain('flow_fragility');

        expect(THEME_CROWDING_RADAR.subThemes.length).toBe(5);
        THEME_CROWDING_RADAR.subThemes.forEach(theme => {
            expect(theme.crowdingScore).toBeGreaterThanOrEqual(0);
            expect(theme.crowdingScore).toBeLessThanOrEqual(100);
            expect(theme.actionDirective.length).toBeGreaterThan(5);
        });
    });

    it('17. should accurately execute 6-dimensional trade decision checklist dynamic evaluation engine', () => {
        // 场景 1: 全票通过授权 (Authorized)
        const perfectInput = {
            symbol: 'NVDA',
            fearGateScore: 3, // 正常
            crowdingScore: 60, // 适中
            rsRating: 90, // 强势
            trendAboveMa50: true,
            entryReclaimConfirmed: true,
            currentThemeWeightPct: 20, // 未超 30%
            plannedLossUnder1PctNav: true,
            hasHardStopPlan: true,
        };
        const res1 = evaluateTradeChecklist(perfectInput);
        expect(res1.overallVerdict).toBe('authorized');
        expect(res1.score).toBe(100);
        expect(res1.vetoReasons.length).toBe(0);

        // 场景 2: 警戒态/微拥挤减半授权 (Caution)
        const cautionInput = {
            ...perfectInput,
            crowdingScore: 75, // > 65
            fearGateScore: 5,   // Elevated
        };
        const res2 = evaluateTradeChecklist(cautionInput);
        expect(res2.overallVerdict).toBe('caution');
        expect(res2.vetoReasons.length).toBe(0);

        // 场景 3: 恐慌熔断否决 (Fear Gate = 8 > 6)
        const fearVetoInput = {
            ...perfectInput,
            fearGateScore: 8,
        };
        const res3 = evaluateTradeChecklist(fearVetoInput);
        expect(res3.overallVerdict).toBe('vetoed');
        expect(res3.vetoReasons.some(r => r.includes('恐慌'))).toBe(true);

        // 场景 4: 单因子超标否决 (40% > 30%)
        const weightVetoInput = {
            ...perfectInput,
            currentThemeWeightPct: 40,
        };
        const res4 = evaluateTradeChecklist(weightVetoInput);
        expect(res4.overallVerdict).toBe('vetoed');
        expect(res4.vetoReasons.some(r => r.includes('30%'))).toBe(true);

        // 场景 5: 裸奔未设止损否决
        const noStopVetoInput = {
            ...perfectInput,
            hasHardStopPlan: false,
        };
        const res5 = evaluateTradeChecklist(noStopVetoInput);
        expect(res5.overallVerdict).toBe('vetoed');
        expect(res5.vetoReasons.some(r => r.includes('止损'))).toBe(true);
    });

    it('18. should verify 26-year empirical hypotheses lifecycle registry from H1 to H17', () => {
        expect(EMPIRICAL_HYPOTHESES_REGISTRY.length).toBe(17);

        const ids = EMPIRICAL_HYPOTHESES_REGISTRY.map(h => h.id);
        for (let i = 1; i <= 17; i++) {
            expect(ids).toContain(`H${i}`);
        }

        // 验证 H16 100% 胜率低点战法假说
        const h16 = EMPIRICAL_HYPOTHESES_REGISTRY.find(h => h.id === 'H16')!;
        expect(h16.title).toContain('100% 胜率');
        expect(h16.status).toBe('validated');
        expect(h16.coreThesis).toContain('159 战 159 胜');
        expect(h16.keyFindings).toContain('159 笔全部止盈出场');

        // 验证 H9 趋势企稳优于抄底假说
        const h9 = EMPIRICAL_HYPOTHESES_REGISTRY.find(h => h.id === 'H9')!;
        expect(h9.title).toContain('顺势右侧支撑企稳');
        expect(h9.status).toBe('integrated_in_v9');

        EMPIRICAL_HYPOTHESES_REGISTRY.forEach(h => {
            expect(h.coreThesis.length).toBeGreaterThan(15);
            expect(h.empiricalMethod.length).toBeGreaterThan(10);
            expect(h.keyFindings.length).toBeGreaterThan(10);
            expect(h.actionImpact.length).toBeGreaterThan(10);
        });
    });
});

