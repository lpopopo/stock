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
    CROSS_MARKET_AI_MAPPING_MATRIX,
    CROSS_BORDER_LEAD_LAG_ENGINE,
    BATCH_TRADE_AUDIT_DATA,
    RESEARCH_SATURATION_BOUNDARY,
    PORTFOLIO_FOUR_DISPOSITIONS_SOP,
    BEHAVIORAL_FINANCE_GUARDRAIL,
    IMMUTABLE_PRODUCTION_AUDIT_TRAIL,
    CASH_EFFICIENCY_SWEEP_DATA,
    OPTIMAL_POSITION_SIZING_FRONTIER,
    V9_CORE_INSURANCE_COST_AUDIT,
    THEMATIC_CONCENTRATION_TIERS,
    ECONOMIC_FEE_GATE_PROTOCOL,
    POSITION_RECLASSIFICATION_INVARIANCE,
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

    it('19. should verify cross-market AI mapping matrix chains and stock pairs', () => {
        expect(CROSS_MARKET_AI_MAPPING_MATRIX.chains.length).toBe(4);

        const chainIds = CROSS_MARKET_AI_MAPPING_MATRIX.chains.map(c => c.chainId);
        expect(chainIds).toContain('chain-1-optics');
        expect(chainIds).toContain('chain-2-materials');
        expect(chainIds).toContain('chain-3-memory-cxl');
        expect(chainIds).toContain('chain-4-equipment');

        // 验证 Chain 1 光通信互联标的配对
        const opticsChain = CROSS_MARKET_AI_MAPPING_MATRIX.chains.find(c => c.chainId === 'chain-1-optics')!;
        expect(opticsChain.averageWinRatePct).toBeGreaterThan(85.0);
        expect(opticsChain.transmissionSpeed).toBe('中速 (3-10天)');

        const usOpticsSymbols = opticsChain.pairs.map(p => p.usSymbol);
        expect(usOpticsSymbols).toContain('NVDA');
        expect(usOpticsSymbols).toContain('AVGO');
        expect(usOpticsSymbols).toContain('CRDO');
        expect(usOpticsSymbols).toContain('ANET');

        const aOpticsCodes = opticsChain.pairs.map(p => p.aShareCode);
        expect(aOpticsCodes).toContain('300308.SZ'); // 中际旭创
        expect(aOpticsCodes).toContain('300502.SZ'); // 新易盛
        expect(aOpticsCodes).toContain('300394.SZ'); // 天孚通信
        expect(aOpticsCodes).toContain('601138.SH'); // 工业富联

        // 验证所有产业链中所有标的配对的字段完整性
        CROSS_MARKET_AI_MAPPING_MATRIX.chains.forEach(chain => {
            expect(chain.averageWinRatePct).toBeGreaterThan(75.0);
            expect(chain.leadLagMechanism.length).toBeGreaterThan(20);
            chain.pairs.forEach(pair => {
                expect(pair.usNameCn.length).toBeGreaterThan(1);
                expect(pair.aShareName.length).toBeGreaterThan(1);
                expect(pair.synergyLogic.length).toBeGreaterThan(15);
                expect(pair.crossMarketCatalyst.length).toBeGreaterThan(10);
                expect(pair.historicalLeadLagWinRatePct).toBeGreaterThan(75.0);
            });
        });
    });

    it('20. should verify cross-border lead-lag arbitrage engine and real-time signals', () => {
        expect(CROSS_BORDER_LEAD_LAG_ENGINE.overallSystemWinRatePct).toBeGreaterThan(80.0);
        expect(CROSS_BORDER_LEAD_LAG_ENGINE.medianTransmissionDays).toBeCloseTo(4.5, 1);
        expect(CROSS_BORDER_LEAD_LAG_ENGINE.strategyRules.length).toBe(3);

        const ruleNames = CROSS_BORDER_LEAD_LAG_ENGINE.strategyRules.map(r => r.strategyName);
        expect(ruleNames.some(n => n.includes('财报滞后反应'))).toBe(true);
        expect(ruleNames.some(n => n.includes('供应链订单逆向排雷'))).toBe(true);
        expect(ruleNames.some(n => n.includes('估值剪刀差'))).toBe(true);

        CROSS_BORDER_LEAD_LAG_ENGINE.strategyRules.forEach(rule => {
            expect(rule.historicalWinRatePct).toBeGreaterThan(75.0);
            expect(rule.coreMechanism.length).toBeGreaterThan(20);
            expect(rule.recommendedAction.length).toBeGreaterThan(20);
            expect(rule.riskBoundary.length).toBeGreaterThan(20);
        });

        // 验证实时套利信号
        expect(CROSS_BORDER_LEAD_LAG_ENGINE.realtimeArbitrageSignals.length).toBeGreaterThanOrEqual(3);
        CROSS_BORDER_LEAD_LAG_ENGINE.realtimeArbitrageSignals.forEach(signal => {
            expect(signal.confidencePct).toBeGreaterThan(75);
            expect(signal.estimatedWindowHours).toBeGreaterThan(0);
            expect(signal.signalText.length).toBeGreaterThan(10);
            expect(['lead_long', 'lead_short', 'hedge_divergence']).toContain(signal.signalType);
        });
    });

    it('21. should verify batch trade audit dataset for 10 focus stocks and verdicts', () => {
        expect(BATCH_TRADE_AUDIT_DATA.length).toBe(10);

        const symbols = BATCH_TRADE_AUDIT_DATA.map(d => d.symbol);
        expect(symbols).toContain('NVDA');
        expect(symbols).toContain('AVGO');
        expect(symbols).toContain('MRVL');
        expect(symbols).toContain('AMD');
        expect(symbols).toContain('GLW');
        expect(symbols).toContain('CRDO');
        expect(symbols).toContain('MU');
        expect(symbols).toContain('ORCL');
        expect(symbols).toContain('SO');
        expect(symbols).toContain('CVX');

        // 验证裁决分布：授权(2只自然垄断), 谨慎(4只), 否决(4只触犯不同禁令)
        const authorized = BATCH_TRADE_AUDIT_DATA.filter(d => d.verdict === 'authorized');
        const caution = BATCH_TRADE_AUDIT_DATA.filter(d => d.verdict === 'caution');
        const vetoed = BATCH_TRADE_AUDIT_DATA.filter(d => d.verdict === 'vetoed');

        expect(authorized.length).toBe(2);
        expect(caution.length).toBe(4);
        expect(vetoed.length).toBe(4);

        // 验证具体否决原因逻辑
        const nvda = BATCH_TRADE_AUDIT_DATA.find(d => d.symbol === 'NVDA')!;
        expect(nvda.verdict).toBe('vetoed');
        expect(nvda.crowdingScore).toBeGreaterThan(80); // 拥挤度超标否决

        const mrvl = BATCH_TRADE_AUDIT_DATA.find(d => d.symbol === 'MRVL')!;
        expect(mrvl.verdict).toBe('vetoed');
        expect(mrvl.currentThemeWeightPct).toBeGreaterThan(30); // 30% 预算超标否决

        const amd = BATCH_TRADE_AUDIT_DATA.find(d => d.symbol === 'AMD')!;
        expect(amd.verdict).toBe('vetoed');
        expect(amd.rsRating).toBeLessThan(80); // 动能不足与左侧接飞刀否决

        BATCH_TRADE_AUDIT_DATA.forEach(row => {
            expect(row.primaryReason.length).toBeGreaterThan(10);
            expect(row.fearGateScore).toBeGreaterThanOrEqual(0);
            expect(row.fearGateScore).toBeLessThanOrEqual(10);
            expect(row.crowdingScore).toBeGreaterThanOrEqual(0);
            expect(row.crowdingScore).toBeLessThanOrEqual(100);
        });
    });

    it('22. should verify 26-year research saturation boundary and 6 strict anti-fitting prohibitions', () => {
        expect(RESEARCH_SATURATION_BOUNDARY.totalBranches).toBe(27);
        expect(RESEARCH_SATURATION_BOUNDARY.closedOrRejectedCount).toBe(13);
        expect(RESEARCH_SATURATION_BOUNDARY.frozenShadowCount).toBe(2);
        expect(RESEARCH_SATURATION_BOUNDARY.saturationThesis.length).toBeGreaterThan(30);

        // 验证六大严厉科研禁区
        expect(RESEARCH_SATURATION_BOUNDARY.prohibitions.length).toBe(6);
        const prohibitIds = RESEARCH_SATURATION_BOUNDARY.prohibitions.map(p => p.id);
        expect(prohibitIds).toContain('prohibit-1-param-tweaks');
        expect(prohibitIds).toContain('prohibit-2-winner-holding');
        expect(prohibitIds).toContain('prohibit-3-partial-exits');
        expect(prohibitIds).toContain('prohibit-4-single-stock-dip');
        expect(prohibitIds).toContain('prohibit-5-allocation-churn');
        expect(prohibitIds).toContain('prohibit-6-naive-shorting');

        RESEARCH_SATURATION_BOUNDARY.prohibitions.forEach(p => {
            expect(p.verdict).toBe('Strictly Rejected');
            expect(p.description.length).toBeGreaterThan(15);
            expect(p.empiricalReason.length).toBeGreaterThan(20);
            expect(p.firstPrinciplesLogic.length).toBeGreaterThan(20);
            expect(p.affectedBranches.length).toBeGreaterThanOrEqual(2);
        });

        // 验证指数与单票不可偷换概念的核心警示
        const warn = RESEARCH_SATURATION_BOUNDARY.indexVsSingleStockWarning;
        expect(warn.title).toContain('100% 胜率');
        expect(warn.whyIndexSurvives).toContain('数学收敛性');
        expect(warn.whySingleStockFails).toContain('信用风险');
        expect(warn.hardRule).toContain('硬性止损');
    });

    it('23. should verify institutional four dispositions SOP governance framework (keep, repair, measure, next)', () => {
        expect(PORTFOLIO_FOUR_DISPOSITIONS_SOP.auditVerificationPassed).toBe(true);
        expect(PORTFOLIO_FOUR_DISPOSITIONS_SOP.governancePhilosophy.length).toBeGreaterThan(20);
        expect(PORTFOLIO_FOUR_DISPOSITIONS_SOP.auditStatus).toContain('Codex');
        expect(PORTFOLIO_FOUR_DISPOSITIONS_SOP.dispositions.length).toBe(4);

        const actions = PORTFOLIO_FOUR_DISPOSITIONS_SOP.dispositions.map(d => d.action);
        expect(actions).toContain('keep');
        expect(actions).toContain('repair');
        expect(actions).toContain('measure');
        expect(actions).toContain('next');

        PORTFOLIO_FOUR_DISPOSITIONS_SOP.dispositions.forEach(disp => {
            expect(disp.actionName.length).toBeGreaterThan(2);
            expect(disp.actionEn.length).toBeGreaterThan(4);
            expect(disp.motto.length).toBeGreaterThan(5);
            expect(disp.standardProcedures.length).toBeGreaterThanOrEqual(3);
            expect(disp.currentWeeklyExecution.length).toBeGreaterThan(15);
        });

        // 验证具体动作的内容完整性
        const keep = PORTFOLIO_FOUR_DISPOSITIONS_SOP.dispositions.find(d => d.action === 'keep')!;
        expect(keep.currentWeeklyExecution).toContain('63.93%');

        const repair = PORTFOLIO_FOUR_DISPOSITIONS_SOP.dispositions.find(d => d.action === 'repair')!;
        expect(repair.currentWeeklyExecution).toContain('MRVL');

        const measure = PORTFOLIO_FOUR_DISPOSITIONS_SOP.dispositions.find(d => d.action === 'measure')!;
        expect(measure.currentWeeklyExecution).toContain('$5,875.91');
    });

    it('24. should verify behavioral finance cognitive traps and momentum crash state machine', () => {
        expect(BEHAVIORAL_FINANCE_GUARDRAIL.traps.length).toBe(4);

        const trapIds = BEHAVIORAL_FINANCE_GUARDRAIL.traps.map(t => t.trapId);
        expect(trapIds).toContain('trap-1-cost-anchor');
        expect(trapIds).toContain('trap-2-breakeven');
        expect(trapIds).toContain('trap-3-peak-anchor');
        expect(trapIds).toContain('trap-4-disposition');

        BEHAVIORAL_FINANCE_GUARDRAIL.traps.forEach(trap => {
            expect(trap.nameCn.length).toBeGreaterThan(3);
            expect(trap.nameEn.length).toBeGreaterThan(3);
            expect(trap.psychologicalMechanism.length).toBeGreaterThan(20);
            expect(trap.disasterManifestation.length).toBeGreaterThan(20);
            expect(trap.institutionalAntidote.length).toBeGreaterThan(20);
            expect(['Critical', 'Severe', 'High']).toContain(trap.dangerSeverity);
        });

        // 验证动量崩溃 4 阶段演化状态机
        expect(BEHAVIORAL_FINANCE_GUARDRAIL.momentumCrashStages.length).toBe(4);
        const stageNames = BEHAVIORAL_FINANCE_GUARDRAIL.momentumCrashStages.map(s => s.stageName);
        expect(stageNames.some(n => n.includes('深度回撤'))).toBe(true);
        expect(stageNames.some(n => n.includes('暴力轧空'))).toBe(true);
        expect(stageNames.some(n => n.includes('逻辑分化'))).toBe(true);
        expect(stageNames.some(n => n.includes('健康趋势'))).toBe(true);

        // 验证慢速波动率缩放规则
        expect(BEHAVIORAL_FINANCE_GUARDRAIL.slowVolatilityScalingRule.windowDays).toBe(126);
        expect(BEHAVIORAL_FINANCE_GUARDRAIL.slowVolatilityScalingRule.maxLeverage).toBe(1.0);
    });

    it('25. should verify immutable dual-chain production audit trail and fail-closed architecture', () => {
        expect(IMMUTABLE_PRODUCTION_AUDIT_TRAIL.activeChains.decisionChainLength).toBeGreaterThanOrEqual(10);
        expect(IMMUTABLE_PRODUCTION_AUDIT_TRAIL.activeChains.brokerChainLength).toBeGreaterThanOrEqual(10);
        expect(IMMUTABLE_PRODUCTION_AUDIT_TRAIL.activeChains.hashDiscrepancy).toBe(0);

        expect(IMMUTABLE_PRODUCTION_AUDIT_TRAIL.failClosedPrinciples.length).toBe(4);
        expect(IMMUTABLE_PRODUCTION_AUDIT_TRAIL.failClosedPrinciples.some(p => p.includes('Fail-Closed'))).toBe(true);

        expect(IMMUTABLE_PRODUCTION_AUDIT_TRAIL.recentAuditBlocks.length).toBeGreaterThanOrEqual(4);
        IMMUTABLE_PRODUCTION_AUDIT_TRAIL.recentAuditBlocks.forEach(block => {
            expect(block.blockIndex).toBeGreaterThan(0);
            expect(block.accountNav).toContain('$');
            expect(block.hashVerification).toContain('MATCH');
            expect(['PASSED', 'HALTED']).toContain(block.failClosedCheck);
            expect(['decision', 'broker']).toContain(block.chainType);
            expect(block.event.length).toBeGreaterThan(15);
        });
    });

    it('26. should verify SGOV cash efficiency sweep yield enhancement data', () => {
        expect(CASH_EFFICIENCY_SWEEP_DATA.annualRiskFreeRatePct).toBe(5.25);
        expect(CASH_EFFICIENCY_SWEEP_DATA.sgovFullPeriodProxyReturnPct).toBe(12.12);
        expect(CASH_EFFICIENCY_SWEEP_DATA.coreMechanism.length).toBeGreaterThan(30);
        expect(CASH_EFFICIENCY_SWEEP_DATA.comparisons.length).toBe(4);

        // 验证全样本期 SGOV 清扫效果: 收益跃迁 +12.77%，夏普从 1.77 升至 2.83
        const fullPeriod = CASH_EFFICIENCY_SWEEP_DATA.comparisons.find(c => c.period.includes('全样本'))!;
        expect(fullPeriod.zeroYieldReturnPct).toBeCloseTo(18.11, 2);
        expect(fullPeriod.sgovSweepReturnPct).toBeCloseTo(30.88, 2);
        expect(fullPeriod.sgovSweepReturnPct - fullPeriod.zeroYieldReturnPct).toBeCloseTo(12.77, 2);
        expect(fullPeriod.zeroYieldSharpe).toBeCloseTo(1.77, 2);
        expect(fullPeriod.sgovSweepSharpe).toBeCloseTo(2.83, 2);
        expect(fullPeriod.sgovSweepMaxDDPct).toBeGreaterThanOrEqual(fullPeriod.zeroYieldMaxDDPct); // 回撤更优或相当
        expect(fullPeriod.earnedInterestUsd).toBeGreaterThan(700);

        // 验证所有周期的利息增厚均严格为正且夏普全部提升
        CASH_EFFICIENCY_SWEEP_DATA.comparisons.forEach(comp => {
            expect(comp.sgovSweepReturnPct).toBeGreaterThan(comp.zeroYieldReturnPct);
            expect(comp.sgovSweepSharpe).toBeGreaterThan(comp.zeroYieldSharpe);
            expect(comp.earnedInterestUsd).toBeGreaterThan(0);
        });

        expect(CASH_EFFICIENCY_SWEEP_DATA.operationalTakeaway).toContain('SGOV 自动清扫');
        expect(CASH_EFFICIENCY_SWEEP_DATA.operationalTakeaway).toContain('防御收益发生器');
    });

    it('27. should verify optimal 8% position sizing frontier and sizing cliff mechanics', () => {
        expect(OPTIMAL_POSITION_SIZING_FRONTIER.optimalWeightPct).toBe(8.0);
        expect(OPTIMAL_POSITION_SIZING_FRONTIER.optimalConcurrentNames).toBe(3);
        expect(OPTIMAL_POSITION_SIZING_FRONTIER.sizingRows.length).toBe(6);

        const weights = OPTIMAL_POSITION_SIZING_FRONTIER.sizingRows.map(r => r.targetWeightPct);
        expect(weights).toEqual([4.0, 6.0, 8.0, 10.0, 12.0, 15.0]);

        // 验证 8% 是帕累托最高夏普最优解
        const row8 = OPTIMAL_POSITION_SIZING_FRONTIER.sizingRows.find(r => r.targetWeightPct === 8.0)!;
        expect(row8.fullReturnPct).toBeCloseTo(17.81, 2);
        expect(row8.fullSharpe).toBeCloseTo(1.77, 2);
        expect(row8.fullMaxDDPct).toBeCloseTo(-2.33, 2);
        expect(row8.peakConcurrentNames).toBe(3);
        expect(row8.executionStability).toBe('Stable (Jaccard 1.0)');

        // 验证定寸悬崖 (Sizing Cliff)：>= 10% 导致并发萎缩与回撤恶化
        const row10 = OPTIMAL_POSITION_SIZING_FRONTIER.sizingRows.find(r => r.targetWeightPct === 10.0)!;
        const row15 = OPTIMAL_POSITION_SIZING_FRONTIER.sizingRows.find(r => r.targetWeightPct === 15.0)!;
        expect(row10.peakConcurrentNames).toBeLessThan(row8.peakConcurrentNames);
        expect(row15.peakConcurrentNames).toBeLessThan(row8.peakConcurrentNames);
        expect(row15.fullSharpe).toBeLessThan(row8.fullSharpe);
        expect(row15.fullMaxDDPct).toBeLessThan(row8.fullMaxDDPct); // -3.54% 比 -2.33% 更差

        expect(OPTIMAL_POSITION_SIZING_FRONTIER.sizingCliffExplanation).toContain('定寸悬崖');
        expect(OPTIMAL_POSITION_SIZING_FRONTIER.sizingCliffExplanation).toContain('大数定律');
    });

    it('28. should verify V9 core whipsaw audit and cost of disaster insurance thesis', () => {
        expect(V9_CORE_INSURANCE_COST_AUDIT.costOfInsuranceThesis).toContain('购买巨灾保险');
        expect(V9_CORE_INSURANCE_COST_AUDIT.april2026WhipsawBreakdown.spyGainMissedPct).toBeCloseTo(9.98, 2);
        expect(V9_CORE_INSURANCE_COST_AUDIT.april2026WhipsawBreakdown.qqqGainMissedPct).toBeCloseTo(15.38, 2);
        expect(V9_CORE_INSURANCE_COST_AUDIT.april2026WhipsawBreakdown.netMissedCoreReturnPct).toBeCloseTo(4.44, 2);
        expect(V9_CORE_INSURANCE_COST_AUDIT.april2026WhipsawBreakdown.whyExitWasDisciplined.length).toBeGreaterThan(20);
        expect(V9_CORE_INSURANCE_COST_AUDIT.april2026WhipsawBreakdown.counterfactualPenalty).toContain('3.08');

        // 验证 4 大挑战者变体全盘测试与否决
        expect(V9_CORE_INSURANCE_COST_AUDIT.variantsTested.length).toBe(5);
        const base = V9_CORE_INSURANCE_COST_AUDIT.variantsTested.find(v => v.verdict === 'BASE')!;
        expect(base.variantName).toContain('基准');
        expect(base.maxDD2025Pct).toBeCloseTo(-7.46, 2);

        const rejected = V9_CORE_INSURANCE_COST_AUDIT.variantsTested.filter(v => v.verdict === 'REJECTED');
        expect(rejected.length).toBe(4);

        // 变体 1 与 变体 2 均造成 2025 回撤暴增至 -10.54%
        rejected.forEach(v => {
            expect(v.rejectionReason.length).toBeGreaterThan(15);
        });
        const v1 = rejected.find(v => v.variantName.includes('进出均需 2 个月'))!;
        expect(v1.maxDD2025Pct).toBeCloseTo(-10.54, 2);
    });

    it('29. should verify thematic concentration tiers, ceiling boundaries, and velocity dampener', () => {
        expect(THEMATIC_CONCENTRATION_TIERS.themeExposureCeilingPct).toBe(55.0);
        expect(THEMATIC_CONCENTRATION_TIERS.subThemeExposureCeilingPct).toBe(25.0);
        expect(THEMATIC_CONCENTRATION_TIERS.maxSingleDayAdditionPct).toBe(15.0);
        expect(THEMATIC_CONCENTRATION_TIERS.empiricalOriginCase).toContain('2026-06-25');
        expect(THEMATIC_CONCENTRATION_TIERS.empiricalOriginCase).toContain('DRAM + MXL + MU');

        expect(THEMATIC_CONCENTRATION_TIERS.tiers.length).toBe(4);
        const zoneTypes = THEMATIC_CONCENTRATION_TIERS.tiers.map(t => t.zoneType);
        expect(zoneTypes).toEqual(['free', 'managed', 'rotation_only', 'hard_breaker']);

        // 验证 40~50% 集中管理区单日净增上限压缩至 5%
        const managedTier = THEMATIC_CONCENTRATION_TIERS.tiers.find(t => t.zoneType === 'managed')!;
        expect(managedTier.maxDailyNetAdditionPct).toBe(5.0);

        // 验证 50~55% 换仓区与 >55% 熔断区单日净增绝对冻结 (0%)
        const rotationTier = THEMATIC_CONCENTRATION_TIERS.tiers.find(t => t.zoneType === 'rotation_only')!;
        const breakerTier = THEMATIC_CONCENTRATION_TIERS.tiers.find(t => t.zoneType === 'hard_breaker')!;
        expect(rotationTier.maxDailyNetAdditionPct).toBe(0.0);
        expect(breakerTier.maxDailyNetAdditionPct).toBe(0.0);

        // 验证账户当前合规状态
        expect(THEMATIC_CONCENTRATION_TIERS.currentAccountStatus.complianceVerdict).toBe('COMPLIANT');
        expect(THEMATIC_CONCENTRATION_TIERS.currentAccountStatus.currentExposurePct).toBeLessThan(40.0);
    });

    it('30. should verify small-account economic fee gate protocol and asymmetric exit exemption', () => {
        expect(ECONOMIC_FEE_GATE_PROTOCOL.minNotionalUsd).toBe(200.0);
        expect(ECONOMIC_FEE_GATE_PROTOCOL.maxRoundTripFeeDragPct).toBe(1.0);
        expect(ECONOMIC_FEE_GATE_PROTOCOL.asymmetricExecutionThesis).toContain('非对称执行铁律');
        expect(ECONOMIC_FEE_GATE_PROTOCOL.rules.length).toBe(3);

        const ruleIds = ECONOMIC_FEE_GATE_PROTOCOL.rules.map(r => r.ruleId);
        expect(ruleIds).toContain('FEE-01-MIN-NOTIONAL');
        expect(ruleIds).toContain('FEE-02-DRAG-CEILING');
        expect(ruleIds).toContain('FEE-03-ASYMMETRIC-EXIT');

        // 验证压力测试用例：小额买入拦截，合规买入放行，小额止损平仓无论费率多高均 100% 豁免放行
        expect(ECONOMIC_FEE_GATE_PROTOCOL.stressScenarios.length).toBe(3);
        const blockedBuy = ECONOMIC_FEE_GATE_PROTOCOL.stressScenarios.find(s => s.orderType === 'BUY' && s.orderNotionalUsd < 200)!;
        expect(blockedBuy.systemAction).toBe('BLOCKED');
        expect(blockedBuy.feeDragPct).toBeGreaterThan(1.0);

        const allowedBuy = ECONOMIC_FEE_GATE_PROTOCOL.stressScenarios.find(s => s.orderType === 'BUY' && s.orderNotionalUsd >= 200)!;
        expect(allowedBuy.systemAction).toBe('ALLOWED');
        expect(allowedBuy.feeDragPct).toBeLessThanOrEqual(1.0);

        const exitExempt = ECONOMIC_FEE_GATE_PROTOCOL.stressScenarios.find(s => s.orderType === 'SELL')!;
        expect(exitExempt.systemAction).toBe('ALLOWED');
        expect(exitExempt.feeDragPct).toBeGreaterThan(3.0); // 即使费率高达 3.16%，依然豁免放行保命
        expect(exitExempt.actionReason).toContain('非对称生命线豁免');
    });

    it('31. should verify position horizon reclassification anti-ostrich invariance protocol', () => {
        expect(POSITION_RECLASSIFICATION_INVARIANCE.antiOstrichPhilosophy).toContain('鸵鸟心理');
        expect(POSITION_RECLASSIFICATION_INVARIANCE.mandatoryRequirements.length).toBe(4);

        const fields = POSITION_RECLASSIFICATION_INVARIANCE.mandatoryRequirements.map(r => r.field);
        expect(fields.some(f => f.includes('snapshot_hash'))).toBe(true);
        expect(fields.some(f => f.includes('new_horizon'))).toBe(true);
        expect(fields.some(f => f.includes('new_invalidation'))).toBe(true);
        expect(fields.some(f => f.includes('preserves_original_scores'))).toBe(true);

        // 验证 MRVL 逃避止损案例审计裁决为否决并强制执行止损
        const caseStudy = POSITION_RECLASSIFICATION_INVARIANCE.auditCaseStudy;
        expect(caseStudy.symbol).toBe('MRVL');
        expect(caseStudy.decisionVerdict).toBe('RECLASSIFICATION_VETOED_FORCE_STOP');
        expect(caseStudy.originalRecordSha256.length).toBe(64);
        expect(caseStudy.currentDrawdownPct).toBeLessThan(-8.0);
        expect(caseStudy.verdictExplanation).toContain('止损');
        expect(caseStudy.verdictExplanation).toContain('重分类被正式否决');

        // 验证四大不可动摇公理
        expect(POSITION_RECLASSIFICATION_INVARIANCE.unbreakableInvariants.length).toBe(4);
        expect(POSITION_RECLASSIFICATION_INVARIANCE.unbreakableInvariants.some(a => a.includes('前瞻生效'))).toBe(true);
        expect(POSITION_RECLASSIFICATION_INVARIANCE.unbreakableInvariants.some(a => a.includes('永久固化'))).toBe(true);
    });
});



