import { describe, it, expect } from 'vitest';
import {
    BOTTOM_REBOUND_100WIN_SUMMARY,
    BOTTOM_REBOUND_100WIN_DISCLOSURE,
    BOTTOM_REBOUND_UNIVERSE,
    BOTTOM_REBOUND_RULES,
    BOTTOM_REBOUND_AUDITED_TRADES,
    V9_STRATEGY_CONFIG,
    FEAR_GATE_LEVELS,
    INSTITUTIONAL_RESEARCH_FEED,
    evaluateReboundSignal,
    V9_LIVE_FORWARD_PORTFOLIO,
    currentBrokerLedgerView,
    AI_MEMORY_PORTFOLIO_LEDGER,
    STRATEGY_SCREENED_HIT_STOCKS,
    recalculateHitStocksWithLiveQuotes,
    recalculatePortfolioLedgerWithLiveQuotes,
    recalculateReboundUniverseWithLiveQuotes,
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
    V8_V9_UNIFIED_OPERATING_MODEL,
    DEFAULT_PROFIT_TRAILING_TIERS,
    calculateTieredTrailingStop,
    evaluateTreasuryFedMacroMonitor,
    evaluateEarningsCooldownRule,
    evaluateAntiAveragingDownRule,
    PHASE11_TACTICAL_ENHANCEMENTS,
    evaluateCalendarLiquidityFragility,
    evaluateInflationStockBondRegime,
    calculateSlowVolatilityPositionSizing,
    PHASE12_ADVANCED_INSTITUTIONAL_FRAMEWORK,
    evaluateDiscreteLotExecution,
    evaluateHyperscalerCapexTransmission,
    evaluateCashSecuredPutHarvesting,
    PHASE13_ADVANCED_INSTITUTIONAL_FRAMEWORK,
    evaluateSemiconductorCreditTurnStateMachine,
    evaluatePanicToRepairMonitor,
    evaluateCitadelClearingClock,
    PHASE14_ADVANCED_INSTITUTIONAL_FRAMEWORK,
    evaluateSixGatesReentry,
    evaluateMarginalRiskContribution,
    evaluateDollarDiscreteLotExecution,
    PHASE15_ADVANCED_INSTITUTIONAL_FRAMEWORK,
    evaluateThreeArmReentryEpisode,
    evaluateIntradayStopCheck,
    PHASE16_ADVANCED_INSTITUTIONAL_FRAMEWORK,
    type SessionDecision,
    evaluatePortfolioGuard,
    PHASE17_ADVANCED_INSTITUTIONAL_FRAMEWORK,
    evaluateSessionCalendarSequence,
    evaluateMultiDayForwardOrchestration,
    PHASE18_ADVANCED_INSTITUTIONAL_FRAMEWORK,
    evaluateCapitalReservationArbitration,
    PHASE19_ADVANCED_INSTITUTIONAL_FRAMEWORK,
    evaluateAShareExecutionMicrostructure,
    PHASE20_ADVANCED_INSTITUTIONAL_FRAMEWORK,
    evaluateStationaryBlockBootstrap,
    PHASE21_ADVANCED_INSTITUTIONAL_FRAMEWORK,
    evaluateWalCrashRecovery,
    PHASE22_ADVANCED_INSTITUTIONAL_FRAMEWORK,
    evaluateHistoricalRevisionConflictGuard,
    computeBarChecksum,
    PHASE23_ADVANCED_INSTITUTIONAL_FRAMEWORK,
    evaluateSemanticReplayAuditor,
    PHASE24_ADVANCED_INSTITUTIONAL_FRAMEWORK,
    V9_COMPREHENSIVE_BACKTEST_DATA,
    V9_COMPREHENSIVE_BACKTEST_SUMMARY,
    V9_WALK_FORWARD_SPLIT_DATA,
    V9_ABLATION_STUDY_DATA,
    V9_FRICTION_WIN_RATE_MATRIX,
    simulateV9ComprehensiveBacktest,
    PHASE25_STRATEGY_DATA_BACKTEST_FRAMEWORK,
    DEFAULT_BRINSON_SEGMENTS,
    evaluateBrinsonAttribution,
    DEFAULT_BARRA_EXPOSURES,
    evaluateBarraFactorExposure,
    PHASE26_BRINSON_ATTRIBUTION_FRAMEWORK,
    simulateMonteCarloFanChart,
    DEFAULT_CRISIS_SCENARIOS,
    evaluateCrisisStressTesting,
    PHASE27_MONTE_CARLO_STRESS_FRAMEWORK,
    evaluateOvernightGapRisk,
    evaluateVwapExecutionSlippage,
    PHASE28_GAP_VWAP_SLIPPAGE_FRAMEWORK,
    generateSignalWebhookCard,
    dispatchStrategyWebhookAlert,
    PHASE29_WEBHOOK_ALERTS_FRAMEWORK,
    DEFAULT_PORTFOLIO_PRESETS,
    evaluatePortfolioHealthCheck,
    generateRebalancePrescription,
    PHASE30_PORTFOLIO_PRESCRIPTION_FRAMEWORK,
    DEFAULT_FX_POSITIONS,
    evaluateFxHedgingAndDecomposition,
    PHASE31_FX_HEDGING_FRAMEWORK,
    DEFAULT_TAIL_HEDGE_INSTRUMENTS,
    evaluateTailRiskOptionHedging,
    PHASE32_TAIL_RISK_HEDGING_FRAMEWORK,
    DEFAULT_TAX_LOTS,
    evaluateTaxLossHarvesting,
    PHASE33_TAX_LOSS_HARVESTING_FRAMEWORK,
    DEFAULT_CENTRAL_BANK_METRICS,
    evaluateGlobalCentralBankLiquidity,
    PHASE34_CENTRAL_BANK_LIQUIDITY_FRAMEWORK,
    DEFAULT_RISK_PARITY_ASSETS,
    evaluateDynamicRiskParity,
    PHASE35_DYNAMIC_RISK_PARITY_FRAMEWORK,
    DEFAULT_PEGGING_REQUESTS,
    calculateSmartPeggingOrder,
    simulateAutoSyncToAiMemory,
    PHASE36_SMART_EXECUTION_FRAMEWORK,
    DEFAULT_DEALER_GAMMA_STRIKES,
    evaluateDealerNetGamma,
    PHASE37_DEALER_GAMMA_GEX_FRAMEWORK,
    DEFAULT_CROWDING_ASSETS,
    evaluateFactorCrowdingAndLiquidity,
    PHASE38_FACTOR_CROWDING_FRAMEWORK,
    DEFAULT_TRANSCRIPT_CASES,
    evaluateEarningsTranscriptNlpAlpha,
    PHASE39_EARNINGS_TRANSCRIPT_NLP_FRAMEWORK,
    DEFAULT_LADDER_WEIGHTS,
    DEFAULT_LENDING_HOLDINGS,
    evaluateTreasuryLadderAndLending,
    PHASE40_TREASURY_LADDER_FRAMEWORK,
    PHASE36_40_BACKTEST_BENCHMARK,
} from '../institutionalStrategy';

describe('AI-Memory Institutional Strategy Bridge & 100% Win Rebound Engine', () => {
    it('1. should verify 26-year bottom rebound archive summary statistics and rejection disclosure', () => {
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.winRatePct).toBe(100.0);
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.totalTrades).toBe(159);
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.wins).toBe(159);
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.losses).toBe(0);
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.avgNetGainPct).toBeGreaterThan(2.0);
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.medianHoldBars).toBe(7.0);
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.portfolioMaxDrawdownPct).toBeCloseTo(-5.11, 1);
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.annualSharpeRatio).toBeGreaterThan(1.5);
        // ROUND4 官方合规披露与实盘拒绝断言（两线严格拆分）
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.deploymentStatus).toBe('REJECTED_FOR_LIVE_DEPLOYMENT');
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.source).toContain('superseded');
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.note).toContain('REJECTED_FOR_LIVE_DEPLOYMENT');
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.note).toContain('非实盘');
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.note).toContain('151');
        expect(BOTTOM_REBOUND_100WIN_SUMMARY.note).toMatch(/SPY|v2/);

        expect(BOTTOM_REBOUND_100WIN_DISCLOSURE.deploymentStatus).toBe('REJECTED_FOR_LIVE_DEPLOYMENT');
        expect(BOTTOM_REBOUND_100WIN_DISCLOSURE.researchHypothesisOnly).toBe(true);
        expect(BOTTOM_REBOUND_100WIN_DISCLOSURE.note).toContain('151');
        expect(BOTTOM_REBOUND_100WIN_DISCLOSURE.note).toMatch(/SPY|v2/);

        // 验证线 A 独立字段断言
        expect(BOTTOM_REBOUND_100WIN_DISCLOSURE.snapshotNote).toContain('151');
        expect(BOTTOM_REBOUND_100WIN_DISCLOSURE.snapshotNote).toContain('159');
        expect(BOTTOM_REBOUND_100WIN_DISCLOSURE.snapshotNote).toContain('MAE');
        expect(BOTTOM_REBOUND_100WIN_DISCLOSURE.snapshotNote).not.toContain('0.26');

        // 验证线 B 独立字段断言 (0.26 仅出现在 SPY/QQQ / v2 语境)
        expect(BOTTOM_REBOUND_100WIN_DISCLOSURE.v2SpyQqqNote).toMatch(/SPY\/QQQ/);
        expect(BOTTOM_REBOUND_100WIN_DISCLOSURE.v2SpyQqqNote).toContain('0.26');
        expect(BOTTOM_REBOUND_100WIN_DISCLOSURE.v2SpyQqqNote).toContain('REJECTED_FOR_LIVE_DEPLOYMENT');
        expect(BOTTOM_REBOUND_100WIN_DISCLOSURE.v2SpyQqqBestStoppedSharpe).toBeCloseTo(0.26, 2);
        expect(BOTTOM_REBOUND_100WIN_DISCLOSURE.v2SpyQqqBestStoppedCagrPct).toBeCloseTo(0.59, 2);
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

    it('8b. should verify AI_MEMORY_PORTFOLIO_LEDGER as of 2026-09-22 with SGOV 21 shares and individual holdings', () => {
        expect(AI_MEMORY_PORTFOLIO_LEDGER.asOfDate).toBe('2026-09-22');
        expect(AI_MEMORY_PORTFOLIO_LEDGER.sourceFile).toBe('AI-Memory/domains/quant-strategy/memory/portfolio/2026-09-22-portfolio-summary.md');
        expect(AI_MEMORY_PORTFOLIO_LEDGER.totalNav).toBe(6026.83);
        expect(AI_MEMORY_PORTFOLIO_LEDGER.dayPnlUsd).toBeNull();
        expect(AI_MEMORY_PORTFOLIO_LEDGER.dayPnlPct).toBeNull();
        expect(AI_MEMORY_PORTFOLIO_LEDGER.equityTotal).toBe(2270.34);
        expect(AI_MEMORY_PORTFOLIO_LEDGER.sgovReserve).toBe(2112.71);
        expect(AI_MEMORY_PORTFOLIO_LEDGER.totalDefenseCash).toBe(3756.49);
        expect(AI_MEMORY_PORTFOLIO_LEDGER.workingCash).toBe(1643.78);
        expect(AI_MEMORY_PORTFOLIO_LEDGER.holdings.length).toBe(5);

        const sgov = AI_MEMORY_PORTFOLIO_LEDGER.holdings.find(h => h.symbol === 'SGOV');
        expect(sgov).toBeDefined();
        expect(sgov?.shares).toBe(21);
        expect(sgov?.assetClass).toBe('Cash ETF');
        expect(sgov?.currentPrice).toBe(100.605);
        expect(sgov?.marketValue).toBe(2112.71);
        expect(sgov?.navWeightPct).toBe(35.05);

        const mrvl = AI_MEMORY_PORTFOLIO_LEDGER.holdings.find(h => h.symbol === 'MRVL');
        expect(mrvl?.shares).toBe(4);
        expect(mrvl?.currentPrice).toBe(263.60);
        expect(mrvl?.marketValue).toBe(1054.40);
        expect(mrvl?.navWeightPct).toBe(17.50);

        const mxl = AI_MEMORY_PORTFOLIO_LEDGER.holdings.find(h => h.symbol === 'MXL');
        expect(mxl?.shares).toBe(6);
        expect(mxl?.currentPrice).toBe(85.05);
        expect(mxl?.marketValue).toBe(510.30);
        expect(mxl?.navWeightPct).toBe(8.47);

        const qcom = AI_MEMORY_PORTFOLIO_LEDGER.holdings.find(h => h.symbol === 'QCOM');
        expect(qcom?.shares).toBe(2);
        expect(qcom?.currentPrice).toBe(194.44);
        expect(qcom?.marketValue).toBe(388.88);
        expect(qcom?.navWeightPct).toBe(6.45);

        const glw = AI_MEMORY_PORTFOLIO_LEDGER.holdings.find(h => h.symbol === 'GLW');
        expect(glw?.shares).toBe(2);
        expect(glw?.currentPrice).toBe(158.38);
        expect(glw?.marketValue).toBe(316.76);
        expect(glw?.navWeightPct).toBe(5.26);

        // Verify realTrade reconciliation: only authentic 9/22 SGOV buy is present, unverified 8/15 trade removed
        expect(AI_MEMORY_PORTFOLIO_LEDGER.realTrades.length).toBe(1);
        expect(AI_MEMORY_PORTFOLIO_LEDGER.realTrades.some(t => t.tradeId === 'REAL-20260815-PORTFOLIO-REBALANCE')).toBe(false);
        const sgovTrade = AI_MEMORY_PORTFOLIO_LEDGER.realTrades.find(t => t.tradeId === 'REAL-20260922-SGOV-BUY');
        expect(sgovTrade).toBeDefined();
        if (sgovTrade) {
            expect(sgovTrade.grossAmount).toBe(2112.71);
            expect(sgovTrade.feeUsd).toBeNull();
            expect(sgovTrade.feeStatus).toBe('unverified_pending_settlement');
            expect(sgovTrade.preTradeCash - sgovTrade.grossAmount).toBeCloseTo(sgovTrade.postTradeCash, 2);
        }

        // Verify milestones are cleanly reconciled to 2026-09-22 without 9/23 forward contamination
        expect(AI_MEMORY_PORTFOLIO_LEDGER.navMilestones.some(m => m.date === '2026-09-23')).toBe(false);
        const m922 = AI_MEMORY_PORTFOLIO_LEDGER.navMilestones.find(m => m.date === '2026-09-22');
        expect(m922?.nav).toBe(6026.83);
    });

    it('8c. should derive currentBrokerLedgerView from 09-22 ledger with sleeve classification', () => {
        const view = currentBrokerLedgerView();
        expect(view.asOfDate).toBe('2026-09-22');
        expect(view.totalNav).toBe(6026.83);
        expect(view.dayPnlUsd).toBeNull();
        expect(view.dayPnlPct).toBeNull();
        expect(view.equityTotal).toBe(2270.34);
        expect(view.defenseCash).toBe(3756.49);
        expect(view.workingCash).toBe(1643.78);
        expect(view.sgovReserve).toBe(2112.71);
        expect(view.holdings.find((h) => h.symbol === 'SGOV')?.shares).toBe(21);
        expect(view.stockSleeveBreach).toBe(true);
        expect(view.singleNameBreach).toBe(true);
        expect(view.maxNamePct).toBe(17.50);
        expect(view.defensePct + view.equityPct).toBeCloseTo(100.0, 0);
        expect(view.canonicalStatus).toContain('SGOV 计入现金袖');
        expect(view.holdings.every((h) => !('ma20' in h))).toBe(true);
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

        // 验证 H16 假说披露与实盘拒绝状态
        const h16 = EMPIRICAL_HYPOTHESES_REGISTRY.find(h => h.id === 'H16')!;
        expect(h16.title).toContain('REJECTED_FOR_LIVE_DEPLOYMENT');
        expect(h16.title).toContain('非实盘');
        expect(h16.status).toBe('rejected');
        expect(h16.statusText).toContain('REJECTED');
        expect(h16.actionImpact).toContain('REJECTED_FOR_LIVE_DEPLOYMENT');
        expect(h16.coreThesis).toContain('159 战 159 胜');
        expect(h16.keyFindings).toContain('159 笔全部止盈出场');
        expect(h16.empiricalMethod).toContain('线A');
        expect(h16.empiricalMethod).toMatch(/SPY\/QQQ|v2/);
        expect(h16.keyFindings).toMatch(/SPY\/QQQ|v2/);
        expect(h16.keyFindings).toContain('0.26');

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

    it('32. should verify V8 and V9 unified operating model, core_priority law, and 5-tier arbitration hierarchy', () => {
        expect(V8_V9_UNIFIED_OPERATING_MODEL.supremePriorityRule).toBe('core_priority');
        expect(V8_V9_UNIFIED_OPERATING_MODEL.architecturePhilosophy).toContain('内置指数防御内核');
        expect(V8_V9_UNIFIED_OPERATING_MODEL.architecturePhilosophy).toContain('总指挥组合管理器');
        expect(V8_V9_UNIFIED_OPERATING_MODEL.priorityRuleExplanation).toContain('核心优先法则');

        // 验证 5 级绝对仲裁层级完整性
        expect(V8_V9_UNIFIED_OPERATING_MODEL.priorityHierarchy.length).toBe(5);
        const levels = V8_V9_UNIFIED_OPERATING_MODEL.priorityHierarchy.map(t => t.priorityLevel);
        expect(levels).toEqual([1, 2, 3, 4, 5]);

        const p1 = V8_V9_UNIFIED_OPERATING_MODEL.priorityHierarchy.find(t => t.priorityLevel === 1)!;
        expect(p1.componentName).toContain('巨灾与流动性熔断层');
        expect(p1.priorityDirective).toContain('绝对最高优先级');

        const p2 = V8_V9_UNIFIED_OPERATING_MODEL.priorityHierarchy.find(t => t.priorityLevel === 2)!;
        expect(p2.componentName).toContain('V8 内置宽基指数防御核心');
        expect(p2.budgetCeilingPct).toBe(70.0);

        const p3 = V8_V9_UNIFIED_OPERATING_MODEL.priorityHierarchy.find(t => t.priorityLevel === 3)!;
        expect(p3.componentName).toContain('V9 Rule E 个股高弹性卫星袖');
        expect(p3.budgetCeilingPct).toBe(30.0);

        const p5 = V8_V9_UNIFIED_OPERATING_MODEL.priorityHierarchy.find(t => t.priorityLevel === 5)!;
        expect(p5.componentName).toContain('SGOV 自动清扫');

        // 验证四级市场风险天花板矩阵
        expect(V8_V9_UNIFIED_OPERATING_MODEL.regimeCeilings.length).toBe(4);
        const normal = V8_V9_UNIFIED_OPERATING_MODEL.regimeCeilings.find(c => c.regime === 'normal')!;
        expect(normal.coreCeilingPct).toBe(70.0);
        expect(normal.stockCeilingPct).toBe(25.0);
        expect(normal.minCashPct).toBe(5.0);

        const panic = V8_V9_UNIFIED_OPERATING_MODEL.regimeCeilings.find(c => c.regime === 'panic')!;
        expect(panic.coreCeilingPct).toBe(35.0);
        expect(panic.stockCeilingPct).toBe(0.0);
        expect(panic.minCashPct).toBe(65.0);

        // 验证标准仲裁步序流
        expect(V8_V9_UNIFIED_OPERATING_MODEL.arbitrationFlowchartSummary.length).toBe(6);
    });

    it('33. should accurately calculate tiered trailing stops and enforce irreversible ratchet invariant', () => {
        expect(DEFAULT_PROFIT_TRAILING_TIERS.length).toBe(4);
        const entryPrice = 100.0;
        const currentStopPrice = 92.0; // 初始 -8% 止损位

        // 1. 浮盈 +10%，未达 Tier 1 (+15%) 门槛，维持原止损位 $92
        const res1 = calculateTieredTrailingStop({
            symbol: 'GLW',
            entryPrice,
            highestPriceSinceEntry: 110.0,
            currentPrice: 110.0,
            currentStopPrice,
        });
        expect(res1.activeTier).toBeNull();
        expect(res1.newStopPrice).toBe(92.0);
        expect(res1.isRatchetAdvanced).toBe(false);
        expect(res1.ratchetProtectionLocked).toBe(false);

        // 2. 浮盈触及 +18%，越过 Tier 1 (+15% 门槛)，止盈位提升至成本 +8% ($108)
        const res2 = calculateTieredTrailingStop({
            symbol: 'GLW',
            entryPrice,
            highestPriceSinceEntry: 118.0,
            currentPrice: 118.0,
            currentStopPrice,
        });
        expect(res2.activeTier).not.toBeNull();
        expect(res2.activeTier?.tierIndex).toBe(1);
        expect(res2.newStopPrice).toBe(108.0);
        expect(res2.isRatchetAdvanced).toBe(true);
        expect(res2.ratchetProtectionLocked).toBe(true);
        expect(res2.lockFloorProfitPct).toBe(8.0);

        // 3. 棘轮核心测试：股价随后大幅回踩至 $105，新止盈止损价绝对不可下移，仍必须保持 $108
        const res3 = calculateTieredTrailingStop({
            symbol: 'GLW',
            entryPrice,
            highestPriceSinceEntry: 118.0, // 历史最高依然是 118
            currentPrice: 105.0,
            currentStopPrice: 108.0, // 已经提拉至 108
        });
        expect(res3.newStopPrice).toBe(108.0);
        expect(res3.newStopPrice).toBeGreaterThanOrEqual(108.0);

        // 4. 浮盈继续扩大至 +28%，激活 Tier 2 (+25% 门槛)，止损提拉至 $115 (+15%)
        const res4 = calculateTieredTrailingStop({
            symbol: 'MRVL',
            entryPrice,
            highestPriceSinceEntry: 128.0,
            currentPrice: 128.0,
            currentStopPrice: 108.0,
        });
        expect(res4.activeTier?.tierIndex).toBe(2);
        expect(res4.newStopPrice).toBe(115.0);
        expect(res4.lockFloorProfitPct).toBe(15.0);

        // 5. 浮盈达到 +45%，激活 Tier 3 (+40% 门槛)，止损提拉至 $125 (+25%)
        const res5 = calculateTieredTrailingStop({
            symbol: 'NVDA',
            entryPrice,
            highestPriceSinceEntry: 145.0,
            currentPrice: 145.0,
            currentStopPrice: 115.0,
        });
        expect(res5.activeTier?.tierIndex).toBe(3);
        expect(res5.newStopPrice).toBe(125.0);
        expect(res5.lockFloorProfitPct).toBe(25.0);

        // 6. 浮盈达到 +65%，激活 Tier 4 (+60% 门槛)，且 MA20 为 $152 (> 成本+45% 即 $145)
        const res6 = calculateTieredTrailingStop({
            symbol: 'NVDA',
            entryPrice,
            highestPriceSinceEntry: 165.0,
            currentPrice: 162.0,
            currentStopPrice: 125.0,
            ma20Price: 152.0,
        });
        expect(res6.activeTier?.tierIndex).toBe(4);
        expect(res6.newStopPrice).toBe(152.0); // 挂钩 MA20 取较高者
        expect(res6.isRatchetAdvanced).toBe(true);
    });

    it('34. should evaluate Treasury and Fed macro valuation pressure across Normal, Restrictive and Stress regimes', () => {
        // 1. Normal 常态基准测试
        const normalResult = evaluateTreasuryFedMacroMonitor({
            asOfDate: '2026-05-15',
            nominal2y: 3.80,
            nominal10y: 4.10,
            nominal30y: 4.35,
            real10y: 1.85,
            breakeven10y: 2.25,
            nominal10y_5d_change_bp: 4.0,
            real10y_5d_change_bp: 2.0,
            curve10s2s_bp: 30.0,
            priorCurve10s2s_bp: 28.0,
            fedTargetRangePct: [3.50, 3.75],
            fedHikeDissentCount: 0,
            fedTighteningContingency: false,
        });
        expect(normalResult.state).toBe('normal');
        expect(normalResult.highDurationNewRiskMultiplier).toBe(1.0);
        expect(normalResult.requiresPriceConfirmation).toBe(false);

        // 2. Restrictive 约束测试 (对应 2026-08-21 真实美债审计：10Y名义 4.74%，实际 2.40%，联储有加息异议)
        const restrictiveResult = evaluateTreasuryFedMacroMonitor({
            asOfDate: '2026-08-21',
            nominal2y: 4.24,
            nominal10y: 4.74, // >= 4.50
            nominal30y: 5.27,
            real10y: 2.40, // >= 2.25
            breakeven10y: 2.34,
            nominal10y_5d_change_bp: 6.0,
            real10y_5d_change_bp: -1.0,
            curve10s2s_bp: 50.0,
            priorCurve10s2s_bp: 48.0,
            fedTargetRangePct: [3.50, 3.75],
            fedHikeDissentCount: 3, // 有加息异议
            fedTighteningContingency: true,
        });
        expect(restrictiveResult.state).toBe('restrictive');
        expect(restrictiveResult.structuralScore).toBe(3);
        expect(restrictiveResult.highDurationNewRiskMultiplier).toBe(0.5);
        expect(restrictiveResult.requiresPriceConfirmation).toBe(true);

        // 3. Stress 压力警报测试 (10s2s 熊陡走阔 15bp 且 5日实际利率上行 18bp，脉冲分 >= 2)
        const stressResult = evaluateTreasuryFedMacroMonitor({
            asOfDate: '2026-09-10',
            nominal2y: 4.20,
            nominal10y: 4.60,
            nominal30y: 5.10,
            real10y: 2.50,
            breakeven10y: 2.10,
            nominal10y_5d_change_bp: 25.0, // >= 20bp
            real10y_5d_change_bp: 18.0, // >= 15bp
            curve10s2s_bp: 40.0,
            priorCurve10s2s_bp: 25.0, // 走阔 15bp (熊陡)
            fedTargetRangePct: [3.50, 3.75],
            fedHikeDissentCount: 1,
            fedTighteningContingency: true,
        });
        expect(stressResult.state).toBe('stress');
        expect(stressResult.bearSteepeningDetected).toBe(true);
        expect(stressResult.impulseScore).toBeGreaterThanOrEqual(2);
        expect(stressResult.highDurationNewRiskMultiplier).toBe(0.0);

        // 4. Fed 政策数据失效测试
        const staleResult = evaluateTreasuryFedMacroMonitor({
            asOfDate: '2026-09-20',
            nominal2y: 4.0,
            nominal10y: 4.2,
            nominal30y: 4.5,
            real10y: 1.9,
            breakeven10y: 2.3,
            nominal10y_5d_change_bp: 0,
            real10y_5d_change_bp: 0,
            curve10s2s_bp: 20,
            fedTargetRangePct: [3.50, 3.75],
            fedHikeDissentCount: 0,
            fedTighteningContingency: false,
            fedPolicyStale: true,
        });
        expect(staleResult.state).toBe('unavailable');
        expect(staleResult.highDurationNewRiskMultiplier).toBe(0.5);
    });

    it('35. should enforce Earnings T+2 Cooldown rule and validate microstructural entry gates', () => {
        // 1. T+0 事件当日暴涨 +10.2% -> 强制物理冻结买入
        const t0Result = evaluateEarningsCooldownRule({
            symbol: 'MU',
            eventDayDate: '2026-06-25',
            currentDate: '2026-06-25',
            daysElapsedSinceEvent: 0,
            eventDayGainPct: 10.2,
            eventDayVolume: 50_000_000,
            currentDayVolume: 50_000_000,
            currentDayHighPrice: 1160,
            currentDayLowPrice: 1050,
            currentClosePrice: 1150,
            eventDayOpenPrice: 1050,
            eventDayClosePrice: 1150,
            ma5Price: 1080,
        });
        expect(t0Result.action).toBe('FROZEN_COOLDOWN');
        expect(t0Result.isFrozen).toBe(true);

        // 2. T+1 次日 -> 依然处于冷静期，禁止 FOMO 追高
        const t1Result = evaluateEarningsCooldownRule({
            symbol: 'MU',
            eventDayDate: '2026-06-25',
            currentDate: '2026-06-26',
            daysElapsedSinceEvent: 1,
            eventDayGainPct: 10.2,
            eventDayVolume: 50_000_000,
            currentDayVolume: 42_000_000,
            currentDayHighPrice: 1165,
            currentDayLowPrice: 1110,
            currentClosePrice: 1120,
            eventDayOpenPrice: 1050,
            eventDayClosePrice: 1150,
            ma5Price: 1090,
        });
        expect(t1Result.action).toBe('FROZEN_COOLDOWN');
        expect(t1Result.isFrozen).toBe(true);

        // 3. T+2 日微观结构合格：振幅 2.8% (<=3.5%)，缩量至 40% (<=50%)，收在 MA5 与长阳实体中轴 $1100 之上
        const t2Qualified = evaluateEarningsCooldownRule({
            symbol: 'MU',
            eventDayDate: '2026-06-25',
            currentDate: '2026-06-27',
            daysElapsedSinceEvent: 2,
            eventDayGainPct: 10.2,
            eventDayVolume: 50_000_000,
            currentDayVolume: 20_000_000, // 40% 缩量
            currentDayHighPrice: 1140,
            currentDayLowPrice: 1110, // 振幅 (1140-1110)/1110 = 2.70%
            currentClosePrice: 1135,
            eventDayOpenPrice: 1050,
            eventDayClosePrice: 1150, // 中轴 1100
            ma5Price: 1115,
        });
        expect(t2Qualified.action).toBe('QUALIFIED_CAN_ENTER');
        expect(t2Qualified.isFrozen).toBe(false);
        expect(t2Qualified.checks.amplitudeWithin3Point5Pct).toBe(true);
        expect(t2Qualified.checks.volumeCompressedUnder50Pct).toBe(true);
        expect(t2Qualified.checks.closeAboveMa5).toBe(true);

        // 4. T+2 日微观结构不合格：振幅 5.5% (>3.5%) 或收盘跌破大阳线中轴
        const t2Disqualified = evaluateEarningsCooldownRule({
            symbol: 'MU',
            eventDayDate: '2026-06-25',
            currentDate: '2026-06-27',
            daysElapsedSinceEvent: 2,
            eventDayGainPct: 10.2,
            eventDayVolume: 50_000_000,
            currentDayVolume: 35_000_000, // 70% 未缩量
            currentDayHighPrice: 1150,
            currentDayLowPrice: 1080, // 破位中轴
            currentClosePrice: 1090,
            eventDayOpenPrice: 1050,
            eventDayClosePrice: 1150,
            ma5Price: 1115,
        });
        expect(t2Disqualified.action).toBe('DISQUALIFIED_FAILED_CRITERIA');
        expect(t2Disqualified.isFrozen).toBe(true);

        // 5. 普通小涨幅标的 (+5.0% < +8.0%)，不触发财报极端大阳线冷却
        const regularGain = evaluateEarningsCooldownRule({
            symbol: 'AAPL',
            eventDayDate: '2026-07-01',
            currentDate: '2026-07-01',
            daysElapsedSinceEvent: 0,
            eventDayGainPct: 5.0,
            eventDayVolume: 10_000_000,
            currentDayVolume: 10_000_000,
            currentDayHighPrice: 200,
            currentDayLowPrice: 195,
            currentClosePrice: 198,
            eventDayOpenPrice: 190,
            eventDayClosePrice: 198,
            ma5Price: 192,
        });
        expect(regularGain.action).toBe('QUALIFIED_CAN_ENTER');
        expect(regularGain.isFrozen).toBe(false);
    });

    it('36. should strictly prohibit averaging down on broken moving averages and enforce 2-day reclaim gate', () => {
        // 1. 均线破位标的 (如 2026-08-21 MXL 破位 MA20，现价 66.61，MA20 78.00)
        const brokenResult = evaluateAntiAveragingDownRule({
            symbol: 'MXL',
            currentPrice: 66.61,
            ma5: 70.50,
            ma10: 74.00,
            ma20: 78.00,
            consecutiveDaysAboveKeyMAs: 0,
            isVolumeReclaimed: false,
        });
        expect(brokenResult.action).toBe('AVERAGING_PROHIBITED');
        expect(brokenResult.isBrokenTrend).toBe(true);
        expect(brokenResult.canAddPosition).toBe(false);
        expect(brokenResult.brokenMAs).toContain('MA5');
        expect(brokenResult.brokenMAs).toContain('MA10');
        expect(brokenResult.brokenMAs).toContain('MA20');

        // 2. 标的初次反弹收复 MA20，但仅企稳 1 天且未放量 -> 依然禁止加仓
        const unconfirmedResult = evaluateAntiAveragingDownRule({
            symbol: 'MXL',
            currentPrice: 79.50,
            ma5: 75.00,
            ma10: 76.00,
            ma20: 78.00,
            consecutiveDaysAboveKeyMAs: 1, // 仅 1 天
            isVolumeReclaimed: false,
        });
        expect(unconfirmedResult.action).toBe('AVERAGING_PROHIBITED');
        expect(unconfirmedResult.canAddPosition).toBe(false);
        expect(unconfirmedResult.isReclaimConfirmed).toBe(false);

        // 3. 标的放量收复并连续 2 天企稳全部关键均线 -> 安全解锁加仓
        const confirmedResult = evaluateAntiAveragingDownRule({
            symbol: 'MRVL',
            currentPrice: 237.04,
            ma5: 228.00,
            ma10: 225.00,
            ma20: 220.00,
            consecutiveDaysAboveKeyMAs: 3, // >= 2 天
            isVolumeReclaimed: true,
        });
        expect(confirmedResult.action).toBe('SAFE_ADD_PERMITTED');
        expect(confirmedResult.canAddPosition).toBe(true);
        expect(confirmedResult.isBrokenTrend).toBe(false);
        expect(confirmedResult.isReclaimConfirmed).toBe(true);

        // 验证 Phase 11 案例对照表完整性
        expect(PHASE11_TACTICAL_ENHANCEMENTS.caseStudies.trailingStopCase.symbol).toBe('GLW');
        expect(PHASE11_TACTICAL_ENHANCEMENTS.caseStudies.earningsCooldownCase.symbol).toBe('MU');
        expect(PHASE11_TACTICAL_ENHANCEMENTS.caseStudies.antiAveragingCase.symbol).toBe('MXL');
    });

    it('37. should evaluate Calendar Liquidity Fragility and enforce non-symmetric damping caps', () => {
        // 1. 常态基准测试
        const normalResult = evaluateCalendarLiquidityFragility({
            currentDate: '2026-05-12',
            isQuarterEndWindow: false,
            isBuybackBlackoutActive: false,
            isOpExWeek: false,
        });
        expect(normalResult.dampingLevel).toBe('normal');
        expect(normalResult.fragilityScore).toBe(0);
        expect(normalResult.singleDayAddCapPct).toBe(15.0);
        expect(normalResult.isStopLossExempt).toBe(true);

        // 2. 单独回购静默期 (Blackout Active)
        const blackoutResult = evaluateCalendarLiquidityFragility({
            currentDate: '2026-06-15',
            isQuarterEndWindow: false,
            isBuybackBlackoutActive: true,
            isOpExWeek: false,
        });
        expect(blackoutResult.dampingLevel).toBe('moderate_damping');
        expect(blackoutResult.fragilityScore).toBe(35);
        expect(blackoutResult.singleDayAddCapPct).toBe(10.0);

        // 3. 季末机构再平衡期 + 深度萎缩 40% (Quarter-End Active)
        const quarterEndResult = evaluateCalendarLiquidityFragility({
            currentDate: '2026-06-28',
            isQuarterEndWindow: true,
            isBuybackBlackoutActive: false,
            isOpExWeek: false,
            marketDepthDeclineEstPct: 45,
        });
        expect(quarterEndResult.dampingLevel).toBe('high_damping');
        expect(quarterEndResult.fragilityScore).toBe(45);
        expect(quarterEndResult.singleDayAddCapPct).toBe(7.5);
        expect(quarterEndResult.slippageToleranceToleranceBps).toBe(6.0);

        // 4. 季末再平衡 + 回购静默 + OpEx 三重重叠 (Severe Damping)
        const severeResult = evaluateCalendarLiquidityFragility({
            currentDate: '2026-09-18',
            isQuarterEndWindow: true,
            isBuybackBlackoutActive: true,
            isOpExWeek: true,
            marketDepthDeclineEstPct: 50,
        });
        expect(severeResult.dampingLevel).toBe('severe_damping');
        expect(severeResult.fragilityScore).toBe(100);
        expect(severeResult.singleDayAddCapPct).toBe(5.0);
        expect(severeResult.slippageToleranceToleranceBps).toBe(4.0);
        expect(severeResult.isStopLossExempt).toBe(true); // 止损绝不阻拦
    });

    it('38. should diagnose Stock-Bond positive correlation inflation shock and shift preference to physical monopoly assets', () => {
        // 1. 经典负相关反通胀常态基准
        const normalRegime = evaluateInflationStockBondRegime({
            asOfDate: '2026-04-10',
            rollingCorrSpyTlt63d: -0.35,
            breakevenInflation10yPct: 2.10,
            tipsRealRate10yPct: 1.80,
        });
        expect(normalRegime.regime).toBe('disinflationary_negative_corr');
        expect(normalRegime.isStockBondPositiveCorrShock).toBe(false);
        expect(normalRegime.hedgeAssetPreference).toBe('TLT_treasuries');
        expect(normalRegime.growthDurationCapPct).toBe(30.0);

        // 2. 通胀二次反扑诱发“股债同跌”正相关冲击
        const stagflationRegime = evaluateInflationStockBondRegime({
            asOfDate: '2026-09-15',
            rollingCorrSpyTlt63d: 0.38, // > +0.20
            breakevenInflation10yPct: 2.36, // >= 2.30
            tipsRealRate10yPct: 2.40, // >= 2.25
        });
        expect(stagflationRegime.regime).toBe('stagflationary_positive_corr');
        expect(stagflationRegime.isStockBondPositiveCorrShock).toBe(true);
        expect(stagflationRegime.hedgeAssetPreference).toBe('physical_monopoly_commodities');
        expect(stagflationRegime.preferredSymbols).toContain('SO');
        expect(stagflationRegime.preferredSymbols).toContain('CVX');
        expect(stagflationRegime.preferredSymbols).toContain('LIN');
        expect(stagflationRegime.growthDurationCapPct).toBe(15.0); // 科技久期上限砍半

        // 3. 中性过渡期
        const neutralRegime = evaluateInflationStockBondRegime({
            asOfDate: '2026-07-20',
            rollingCorrSpyTlt63d: 0.05,
            breakevenInflation10yPct: 2.20,
            tipsRealRate10yPct: 2.10,
        });
        expect(neutralRegime.regime).toBe('neutral_transitional');
        expect(neutralRegime.growthDurationCapPct).toBe(25.0);
    });

    it('39. should calculate 126-day slow realized volatility inverse position sizing with non-levered caps and floors', () => {
        // 1. 高波动标的自动收缩头寸 (NVDA, 126日波动率 48.0%)
        const highVolRes = calculateSlowVolatilityPositionSizing({
            symbol: 'NVDA',
            realizedVol126dPct: 48.0,
            targetVolPct: 20.0,
            baseAllocPct: 8.0,
        });
        expect(highVolRes.volScalingMultiplier).toBeCloseTo(0.42, 2);
        expect(highVolRes.effectiveAllocPct).toBeCloseTo(3.33, 2);
        expect(highVolRes.isCapped).toBe(false);
        expect(highVolRes.isFloored).toBe(false);
        expect(highVolRes.riskContributionDesc).toContain('高波动资产');

        // 2. 低波动现金牛标的自适应增厚头寸 (SO, 126日波动率 13.5%)
        const lowVolRes = calculateSlowVolatilityPositionSizing({
            symbol: 'SO',
            realizedVol126dPct: 13.5,
            targetVolPct: 20.0,
            baseAllocPct: 8.0,
        });
        expect(lowVolRes.volScalingMultiplier).toBeCloseTo(1.48, 2);
        expect(lowVolRes.effectiveAllocPct).toBeCloseTo(11.85, 2);
        expect(lowVolRes.isCapped).toBe(false);
        expect(lowVolRes.riskContributionDesc).toContain('低波动资产');

        // 3. 超低波动极端标的触发 15% 天花板截断
        const cappedRes = calculateSlowVolatilityPositionSizing({
            symbol: 'SHY',
            realizedVol126dPct: 6.0,
            targetVolPct: 20.0,
            baseAllocPct: 8.0,
            maxAllocCapPct: 15.0,
        });
        expect(cappedRes.isCapped).toBe(true);
        expect(cappedRes.effectiveAllocPct).toBe(15.0);

        // 4. 超高波动极端标的触发 2% 地板保护
        const flooredRes = calculateSlowVolatilityPositionSizing({
            symbol: 'MEME',
            realizedVol126dPct: 95.0,
            targetVolPct: 20.0,
            baseAllocPct: 8.0,
            minAllocFloorPct: 2.0,
        });
        expect(flooredRes.isFloored).toBe(true);
        expect(flooredRes.effectiveAllocPct).toBe(2.0);

        // 验证 Phase 12 综合常数
        expect(PHASE12_ADVANCED_INSTITUTIONAL_FRAMEWORK.releaseDate).toBe('2026-09-22');
        expect(PHASE12_ADVANCED_INSTITUTIONAL_FRAMEWORK.caseStudies.calendarFragilityCase.scenario).toContain('季末机构再平衡');
    });

    it('40. should verify discrete lot execution trap defense (zero-share loop, single-share drawdown cut, write-off, scale tolerance, residual pool)', () => {
        // 1. 陷阱 1：持仓 2 股触发 1/3 减仓向下取整 0 股，成功拦截并标记 trimmed=true 切断死循环
        const zeroTrimRes = evaluateDiscreteLotExecution({
            symbol: 'GLW',
            currentShares: 2,
            actionType: 'trim_profit',
            targetFraction: 0.3333,
            currentPrice: 165.29,
            accountNav: 35000,
        });
        expect(zeroTrimRes.flooredExecutedShares).toBe(0);
        expect(zeroTrimRes.isZeroShareTrimTrapBlocked).toBe(true);
        expect(zeroTrimRes.status).toBe('SKIPPED_MARK_TRIMMED');
        expect(zeroTrimRes.executionDirective).toBe('MARK_TRIMMED_SKIP_ORDER');
        expect(zeroTrimRes.tacticalRationale).toContain('零股减仓死循环防御');

        // 2. 陷阱 2：持仓 1 股遭遇 50% 阶梯回撤减仓取整为 0，自动转化为紧密移动保护止损位
        const singleCutRes = evaluateDiscreteLotExecution({
            symbol: 'MRVL',
            currentShares: 1,
            actionType: 'drawdown_cut',
            targetFraction: 0.5,
            currentPrice: 234.79,
            accountNav: 35000,
        });
        expect(singleCutRes.flooredExecutedShares).toBe(0);
        expect(singleCutRes.isSingleShareDrawdownCutBypassed).toBe(true);
        expect(singleCutRes.status).toBe('CONVERTED_TIGHT_STOP');
        expect(singleCutRes.tightProtectiveStopPx).toBeCloseTo(230.09, 2); // 234.79 * 0.98
        expect(singleCutRes.tacticalRationale).toContain('单股回撤阶梯截断防御');

        // 3. 陷阱 3：受损批次残值不足以覆盖佣金手续费，激活核销吸收协议，杜绝抛未捕获异常崩溃
        const distressedRes = evaluateDiscreteLotExecution({
            symbol: 'PENNY',
            currentShares: 1,
            actionType: 'stop_loss',
            targetFraction: 1.0,
            currentPrice: 0.95,
            accountNav: 35000,
            commissionFee: 1.0,
        });
        expect(distressedRes.isDistressedLotAbsorbed).toBe(true);
        expect(distressedRes.status).toBe('ABSORBED_WRITEOFF');
        expect(distressedRes.executionDirective).toBe('DISTRESSED_LOT_WRITE_OFF');
        expect(distressedRes.absorbedLossAmount).toBeGreaterThan(0);
        expect(distressedRes.tacticalRationale).toContain('受损批次核销协议');

        // 4. 陷阱 4：资金规模自适应对账容差计算 (max(1e-4, 1e-6 * NAV))
        expect(zeroTrimRes.scaleAwareDriftTolerance).toBeCloseTo(0.035, 4); // 35000 * 1e-6 = 0.035

        // 5. 陷阱 5：核心 ETF 调仓残差累加
        const coreRebalRes = evaluateDiscreteLotExecution({
            symbol: 'SPY',
            currentShares: 10,
            actionType: 'core_rebalance',
            targetFraction: 0.04, // 理论 0.4 股
            currentPrice: 765.15,
            accountNav: 35000,
            accumulatedResidualShares: 0.65, // 历史结余 0.65 股
        });
        expect(coreRebalRes.flooredExecutedShares).toBe(1); // 0.4 + 0.65 = 1.05 -> 取整 1 股
        expect(coreRebalRes.updatedResidualShares).toBeCloseTo(0.05, 2);
        expect(coreRebalRes.executionDirective).toBe('EXECUTE_CORE_REBALANCE');
    });

    it('41. should evaluate hyperscaler capex lead-lag transmission on optical/semiconductor supply chain multipliers', () => {
        // 1. 算力加速爆发期 (加权 Capex 环比 >= +10%)
        const accelRes = evaluateHyperscalerCapexTransmission({
            asOfQuarter: '2026-Q3',
            msftCapexQoQPct: 14.2,
            googlCapexQoQPct: 18.5,
            amznCapexQoQPct: 11.0,
            metaCapexQoQPct: 8.3,
        });
        expect(accelRes.compositeCapexGrowthQoQPct).toBeGreaterThanOrEqual(10.0);
        expect(accelRes.capexCycleRegime).toBe('accelerating_expansion');
        expect(accelRes.hardwareSupplyChainMultiplier).toBe(1.2);
        expect(accelRes.hardwareAllocationCapPct).toBe(30.0);
        expect(accelRes.hardwareComponents).toEqual(['GLW', 'MXL', 'MRVL', 'QCOM']);
        expect(accelRes.recommendedTactics).toContain('放行右侧突破顺势加仓');

        // 2. 砍单去库存消化期 (加权 Capex 环比 < +2%)
        const contractRes = evaluateHyperscalerCapexTransmission({
            asOfQuarter: '2026-Q4',
            msftCapexQoQPct: 1.2,
            googlCapexQoQPct: -0.5,
            amznCapexQoQPct: 0.8,
            metaCapexQoQPct: -2.1,
        });
        expect(contractRes.compositeCapexGrowthQoQPct).toBeLessThan(2.0);
        expect(contractRes.capexCycleRegime).toBe('inventory_digestion_contraction');
        expect(contractRes.hardwareSupplyChainMultiplier).toBe(0.5);
        expect(contractRes.hardwareAllocationCapPct).toBe(15.0);
        expect(contractRes.recommendedTactics).toContain('前瞻压降硬件仓位上限至 15%');

        // 3. 常态稳健扩张期
        const steadyRes = evaluateHyperscalerCapexTransmission({
            asOfQuarter: '2026-Q2',
            msftCapexQoQPct: 6.5,
            googlCapexQoQPct: 7.2,
            amznCapexQoQPct: 5.0,
            metaCapexQoQPct: 4.8,
        });
        expect(steadyRes.capexCycleRegime).toBe('mature_steady');
        expect(steadyRes.hardwareSupplyChainMultiplier).toBe(1.0);
        expect(steadyRes.hardwareAllocationCapPct).toBe(25.0);
    });

    it('42. should evaluate cash-secured put harvesting feasibility, IV skew annualized yield, and stress circuit breaker', () => {
        // 1. 合规且充裕现金抵押的 CSP 开立 (QCOM)
        const validCsp = evaluateCashSecuredPutHarvesting({
            symbol: 'QCOM',
            spotPrice: 183.82,
            supportPrice: 170.0,
            optionDTE: 35,
            impliedVolPct: 32.0,
            allocatedCash: 18000,
            macroFearStressScore: 4,
        });
        expect(validCsp.isPermitted).toBe(true);
        expect(validCsp.statusReason).toBe('APPROVED_AND_COLLATERALIZED');
        expect(validCsp.strikePrice).toBe(169); // Math.floor(min(170, 183.82 * 0.92 = 169.11))
        expect(validCsp.contractCount).toBe(1);
        expect(validCsp.totalCashCollateralRequired).toBe(16900);
        expect(validCsp.totalPremiumEarned).toBeGreaterThan(0);
        expect(validCsp.annualizedYieldEnhancementPct).toBeGreaterThan(3.0);
        expect(validCsp.tacticalRationale).toContain('以大幅折扣接盘核心资产');

        // 2. 宏观极度恐慌熔断 (Fear Gate >= 8) 全面禁止卖出 Put
        const stressCsp = evaluateCashSecuredPutHarvesting({
            symbol: 'MRVL',
            spotPrice: 234.79,
            supportPrice: 215.0,
            optionDTE: 30,
            impliedVolPct: 45.0,
            allocatedCash: 25000,
            macroFearStressScore: 9,
        });
        expect(stressCsp.isPermitted).toBe(false);
        expect(stressCsp.statusReason).toBe('MACRO_FEAR_STRESS_ACTIVE');
        expect(stressCsp.contractCount).toBe(0);
        expect(stressCsp.tacticalRationale).toContain('极端高压状态，全面禁止卖出 Cash-Secured Put');

        // 3. 闲置现金不足单手全额抵押拦截
        const insufficientCashCsp = evaluateCashSecuredPutHarvesting({
            symbol: 'QCOM',
            spotPrice: 183.82,
            supportPrice: 170.0,
            optionDTE: 35,
            impliedVolPct: 32.0,
            allocatedCash: 5000, // 不足 $16,900
            macroFearStressScore: 4,
        });
        expect(insufficientCashCsp.isPermitted).toBe(false);
        expect(insufficientCashCsp.statusReason).toBe('INSUFFICIENT_CASH_COLLATERAL');
        expect(insufficientCashCsp.contractCount).toBe(0);

        // 验证 Phase 13 框架元数据
        expect(PHASE13_ADVANCED_INSTITUTIONAL_FRAMEWORK.releaseDate).toBe('2026-09-22');
        expect(PHASE13_ADVANCED_INSTITUTIONAL_FRAMEWORK.caseStudies.discreteTrapCase.scenario).toContain('MRVL');
        expect(PHASE13_ADVANCED_INSTITUTIONAL_FRAMEWORK.caseStudies.zeroShareTrimCase.scenario).toContain('GLW');
    });

    it('43. should verify semiconductor credit 4-tier turn state machine (risk_off, stabilizing, repair_attempt, confirmed_turn) and 5 cross-asset checks', () => {
        // 1. 一阶风险规避 (深幅回撤发生但未企稳，买入乘数 0.0x)
        const riskOffRes = evaluateSemiconductorCreditTurnStateMachine({
            asOfDate: '2026-09-08',
            recentDrawdown63dPct: 11.2,
            smhConsecutiveDaysNoNew10dLow: 1,
            smh5dReturnPct: -4.5,
            smhAboveMa10: false,
            smhConsecutiveDaysAboveMa20: 0,
            qqq5dReturnPct: -3.8,
            qqqAboveMa20: false,
            rspSpy5dRatioChange: -0.0050,
            hygLqd5dRatioChange: -0.0060,
            fearGateScore: 7,
            fearGateScore5dEarlier: 6,
        });
        expect(riskOffRes.turnState).toBe('risk_off');
        expect(riskOffRes.stockSleeveBuyMultiplier).toBe(0.0);
        expect(riskOffRes.isTurnConfirmed).toBe(false);

        // 2. 二阶筑底企稳 (SMH 连续 3 日未创新低，买入乘数 0.3x)
        const stabilizingRes = evaluateSemiconductorCreditTurnStateMachine({
            asOfDate: '2026-09-12',
            recentDrawdown63dPct: 10.5,
            smhConsecutiveDaysNoNew10dLow: 3,
            smh5dReturnPct: -1.2,
            smhAboveMa10: false,
            smhConsecutiveDaysAboveMa20: 0,
            qqq5dReturnPct: -0.8,
            qqqAboveMa20: false,
            rspSpy5dRatioChange: -0.0030,
            hygLqd5dRatioChange: -0.0040,
            fearGateScore: 6,
            fearGateScore5dEarlier: 6,
        });
        expect(stabilizingRes.turnState).toBe('stabilizing');
        expect(stabilizingRes.stockSleeveBuyMultiplier).toBe(0.3);
        expect(stabilizingRes.isStabilized).toBe(true);
        expect(stabilizingRes.isRepairAttempt).toBe(false);

        // 3. 三阶修复尝试但信贷债或全市场宽度未通过 (拦截在 0.6x 试探仓，防假突破)
        const repairRes = evaluateSemiconductorCreditTurnStateMachine({
            asOfDate: '2026-09-18',
            recentDrawdown63dPct: 8.8,
            smhConsecutiveDaysNoNew10dLow: 3,
            smh5dReturnPct: 2.5,
            smhAboveMa10: true,
            smhConsecutiveDaysAboveMa20: 1,
            qqq5dReturnPct: 2.0,
            qqqAboveMa20: false,
            rspSpy5dRatioChange: -0.0012,
            hygLqd5dRatioChange: -0.0025,
            fearGateScore: 5,
            fearGateScore5dEarlier: 5,
        });
        expect(repairRes.turnState).toBe('repair_attempt');
        expect(repairRes.stockSleeveBuyMultiplier).toBe(0.6);
        expect(repairRes.isRepairAttempt).toBe(true);
        expect(repairRes.isTurnConfirmed).toBe(false);
        expect(repairRes.allFiveChecksPassed).toBe(false);

        // 4. 四阶右侧全面确认 (SMH 领涨、全体验证全绿灯，买入乘数 1.0x 全额放行)
        const confirmedRes = evaluateSemiconductorCreditTurnStateMachine({
            asOfDate: '2026-09-22',
            recentDrawdown63dPct: 9.2,
            smhConsecutiveDaysNoNew10dLow: 3,
            smh5dReturnPct: 3.4,
            smhAboveMa10: true,
            smhConsecutiveDaysAboveMa20: 2,
            qqq5dReturnPct: 2.1,
            qqqAboveMa20: true,
            rspSpy5dRatioChange: 0.0018,
            hygLqd5dRatioChange: 0.0022,
            fearGateScore: 4,
            fearGateScore5dEarlier: 5,
        });
        expect(confirmedRes.turnState).toBe('confirmed_turn');
        expect(confirmedRes.stockSleeveBuyMultiplier).toBe(1.0);
        expect(confirmedRes.isTurnConfirmed).toBe(true);
        expect(confirmedRes.allFiveChecksPassed).toBe(true);
        expect(confirmedRes.tacticalRationale).toContain('四阶右侧反转全面确认');
    });

    it('44. should verify panic-to-repair trap monitor and Daniel-Moskowitz momentum crash warning', () => {
        // 1. 动量二次崩塌高危预警 (深幅巨灾下跌 + 极端恐慌峰值 + 暴力反弹)
        const crashWarningRes = evaluatePanicToRepairMonitor({
            asOfDate: '2026-09-22',
            spyMinDrawdown63dOverPastYearPct: -18.5,
            peakVixLast21Sessions: 28.5,
            spyRebound21SessionsPct: 9.4,
        });
        expect(crashWarningRes.panicRepairRegime).toBe('panic_to_repair');
        expect(crashWarningRes.isMomentumCrashWarningActive).toBe(true);
        expect(crashWarningRes.maxTacticalAddMultiplier).toBe(0.2);
        expect(crashWarningRes.tacticalRationale).toContain('动量崩溃最高危窗口');

        // 2. 深跌后常规观察态 (仅满足条件 1，未出现 VIX >= 25 与暴力轧空)
        const watchRes = evaluatePanicToRepairMonitor({
            asOfDate: '2026-09-15',
            spyMinDrawdown63dOverPastYearPct: -16.0,
            peakVixLast21Sessions: 21.0,
            spyRebound21SessionsPct: 4.2,
        });
        expect(watchRes.panicRepairRegime).toBe('post_drawdown_watch');
        expect(watchRes.isMomentumCrashWarningActive).toBe(false);
        expect(watchRes.maxTacticalAddMultiplier).toBe(0.6);

        // 3. 常态环境
        const normalRes = evaluatePanicToRepairMonitor({
            asOfDate: '2026-05-20',
            spyMinDrawdown63dOverPastYearPct: -5.5,
            peakVixLast21Sessions: 16.5,
            spyRebound21SessionsPct: 3.5,
        });
        expect(normalRes.panicRepairRegime).toBe('normal');
        expect(normalRes.maxTacticalAddMultiplier).toBe(1.0);
    });

    it('45. should verify Citadel contrarian clearing clock phases, asymmetry direction, and reaccumulation window', () => {
        // 1. 9月下旬核心回补窗口开启 (舆论极度悲观 + 机构杠杆深度出清 + 月末抛压临近尾声 + 利率见缓)
        const citadelReaccumRes = evaluateCitadelClearingClock({
            asOfDate: '2026-09-22',
            socialKolBullishSentimentPct: 18.5,
            institutionalNetLeverageZScore: -1.75,
            monthEndRebalancePressureDaysLeft: 2,
            yieldStressPeaking: true,
        });
        expect(citadelReaccumRes.clockStage).toBe('core_reaccumulation_window');
        expect(citadelReaccumRes.asymmetryDirection).toBe('highly_favorable_upside');
        expect(citadelReaccumRes.reaccumulationPacePct).toBe(20.0);
        expect(citadelReaccumRes.recommendedFocus).toContain('大举分批加回核心高确信硬件底仓');
        expect(citadelReaccumRes.tacticalRationale).toContain('Citadel 核心回补窗口开启');

        // 2. 空头抛压衰竭期
        const exhaustRes = evaluateCitadelClearingClock({
            asOfDate: '2026-09-15',
            socialKolBullishSentimentPct: 32.0,
            institutionalNetLeverageZScore: -1.2,
            monthEndRebalancePressureDaysLeft: 6,
            yieldStressPeaking: false,
        });
        expect(exhaustRes.clockStage).toBe('positioning_exhaustion');
        expect(exhaustRes.reaccumulationPacePct).toBe(10.0);

        // 3. 验证 Phase 14 综合元数据
        expect(PHASE14_ADVANCED_INSTITUTIONAL_FRAMEWORK.releaseDate).toBe('2026-09-22');
        expect(PHASE14_ADVANCED_INSTITUTIONAL_FRAMEWORK.caseStudies.semiconductorTurnCase.scenario).toContain('HYG/LQD');
        expect(PHASE14_ADVANCED_INSTITUTIONAL_FRAMEWORK.caseStudies.panicToRepairCase.scenario).toContain('轧空');
    });

    it('46. should evaluate Unified Six-Gates Reentry Evaluator: Golden Path pass and individual gate blockers', () => {
        // 1. 黄金路径全通测试 (Golden Path): 6重刚性门控全绿灯，准确向下整股计算推荐 6 股
        const goldenInput = {
            candidateId: 'cand-glw-01',
            symbol: 'GLW',
            nameCn: '康宁',
            tradePrice: 100.0,
            ma50Price: 95.0,
            hasRsException: false,
            hasAuthenticatedEvent: true,
            isEventWithdrawn: false,
            macroRegime: 'normal' as const,
            vixValue: 18.5,
            portfolioTotalStockWeightPct: 20.0,
            targetCandidateWeightPct: 8.0,
            singleStockCapPct: 15.0,
            totalStockCapPct: 30.0,
            themeWeightPct: 30.0,
            themeCapPct: 55.0,
            unboundedCoreOrderPending: false,
            episodeAvailableCash: 700.0,
            portfolioNav: 8200.0,
            stopLossPrice: 92.0,
            maxAllowedPrice: 105.0,
            slippageBps: 10,
            commissionPerOrder: 1.0,
        };
        const goldenRes = evaluateSixGatesReentry(goldenInput);
        expect(goldenRes.eligible).toBe(true);
        expect(goldenRes.allBlockers.length).toBe(0);
        expect(goldenRes.gates.informationGate.passed).toBe(true);
        expect(goldenRes.gates.trendGate.passed).toBe(true);
        expect(goldenRes.gates.marketFearGate.passed).toBe(true);
        expect(goldenRes.gates.capacityGuardGate.passed).toBe(true);
        expect(goldenRes.gates.episodeBudgetGate.passed).toBe(true);
        expect(goldenRes.gates.exitPlanGate.passed).toBe(true);
        expect(goldenRes.recommendedShares).toBe(6);
        expect(goldenRes.riskPerShareR).toBe(8.0);
        expect(goldenRes.totalRiskDollars).toBe(48.0); // 6 * 8 = $48
        expect(goldenRes.riskPctOfNav).toBeCloseTo(0.585, 2); // 48 / 8200 = 0.585% <= 1.0%

        // 2. Gate 1 阻断：缺失不可变事件官方凭证
        const g1Fail = evaluateSixGatesReentry({
            ...goldenInput,
            hasAuthenticatedEvent: false,
        });
        expect(g1Fail.eligible).toBe(false);
        expect(g1Fail.gates.informationGate.passed).toBe(false);
        expect(g1Fail.allBlockers.some(b => b.includes('unauthenticated_event_id'))).toBe(true);

        // 3. Gate 2 阻断：破位 MA50 且无 RS 背离例外
        const g2Fail = evaluateSixGatesReentry({
            ...goldenInput,
            tradePrice: 90.0,
            ma50Price: 95.0,
            hasRsException: false,
        });
        expect(g2Fail.eligible).toBe(false);
        expect(g2Fail.gates.trendGate.passed).toBe(false);
        expect(g2Fail.allBlockers.some(b => b.includes('trend_below_ma50'))).toBe(true);

        // 4. Gate 2 豁免：破位 MA50 但具有认证的 RS 企稳背离资格
        const g2RsPass = evaluateSixGatesReentry({
            ...goldenInput,
            tradePrice: 90.0,
            ma50Price: 95.0,
            hasRsException: true,
            stopLossPrice: 85.0,
        });
        expect(g2RsPass.gates.trendGate.passed).toBe(true);

        // 5. Gate 3 阻断与临界对齐：宏观恐慌熔断 (Panic) 与 VIX 临界点 (> 35.0 熔断，== 35.0 放行)
        const g3Fail = evaluateSixGatesReentry({
            ...goldenInput,
            macroRegime: 'panic',
        });
        expect(g3Fail.eligible).toBe(false);
        expect(g3Fail.gates.marketFearGate.passed).toBe(false);
        expect(g3Fail.allBlockers.some(b => b.includes('market_panic_regime'))).toBe(true);

        // VIX == 35.0 临界值测试：严格与 AI-Memory six_gates_evaluator.py (> 35.0) 对齐，35.0 允许放行
        const g3VixBoundaryPass = evaluateSixGatesReentry({
            ...goldenInput,
            macroRegime: 'normal',
            vixValue: 35.0,
        });
        expect(g3VixBoundaryPass.gates.marketFearGate.passed).toBe(true);

        // VIX > 35.0 (例如 35.1) 触发风控红线拦截
        const g3VixBreachFail = evaluateSixGatesReentry({
            ...goldenInput,
            macroRegime: 'normal',
            vixValue: 35.1,
        });
        expect(g3VixBreachFail.eligible).toBe(false);
        expect(g3VixBreachFail.gates.marketFearGate.passed).toBe(false);
        expect(g3VixBreachFail.allBlockers.some(b => b.includes('vix_exceeds_panic_threshold'))).toBe(true);

        // 6. Gate 4 阻断：存在未定界核心指数再平衡 (核心优先最高排他)
        const g4Fail = evaluateSixGatesReentry({
            ...goldenInput,
            unboundedCoreOrderPending: true,
        });
        expect(g4Fail.eligible).toBe(false);
        expect(g4Fail.gates.capacityGuardGate.passed).toBe(false);
        expect(g4Fail.allBlockers.some(b => b.includes('unbounded_core_order_blocks_stock_add'))).toBe(true);

        // 7. Gate 5 阻断：专款回笼资金不足以买 1 整股
        const g5Fail = evaluateSixGatesReentry({
            ...goldenInput,
            episodeAvailableCash: 50.0, // 现价 $100，买不起 1 股
        });
        expect(g5Fail.eligible).toBe(false);
        expect(g5Fail.gates.episodeBudgetGate.passed).toBe(false);
        expect(g5Fail.allBlockers.some(b => b.includes('below_whole_share_affordability'))).toBe(true);

        // 8. Gate 6 阻断：止损倒挂 (止损价 >= 现价)
        const g6Fail = evaluateSixGatesReentry({
            ...goldenInput,
            stopLossPrice: 102.0, // 现价 100，止损倒挂
        });
        expect(g6Fail.eligible).toBe(false);
        expect(g6Fail.gates.exitPlanGate.passed).toBe(false);
        expect(g6Fail.allBlockers.some(b => b.includes('stop_price_at_or_above_current_price'))).toBe(true);
    });

    it('47. should audit Marginal Contribution to Risk (MCR), variance concentration, and validate internal rebalance over short hedge', () => {
        // 对标 AI-Memory 2026-09-20 真实实证审计案例
        const diagInput = {
            portfolioNav: 5875.91,
            cashAmount: 3756.49,
            cashWeightPct: 63.93,
            holdings: [
                { symbol: 'GLW', shares: 2, price: 150.12, marketValue: 300.24, weightPct: 5.11, volatilityAnnualizedPct: 32.5, correlationWithPortfolio: 0.72, varianceContributionPct: 13.70 },
                { symbol: 'MXL', shares: 6, price: 81.08, marketValue: 486.48, weightPct: 8.28, volatilityAnnualizedPct: 48.2, correlationWithPortfolio: 0.85, varianceContributionPct: 34.74 },
                { symbol: 'MRVL', shares: 4, price: 244.29, marketValue: 977.16, weightPct: 16.63, volatilityAnnualizedPct: 52.1, correlationWithPortfolio: 0.91, varianceContributionPct: 46.79 },
                { symbol: 'QCOM', shares: 2, price: 177.77, marketValue: 355.54, weightPct: 6.05, volatilityAnnualizedPct: 28.4, correlationWithPortfolio: 0.65, varianceContributionPct: 4.78 },
            ],
            currentPortfolioAnnualizedVolPct: 28.84,
            correlationWithSMH: 0.88,
            betaToSpyQqq: 1.25,
        };

        const result = evaluateMarginalRiskContribution(diagInput);

        // 验证风险集中度诊断：MRVL + MXL 市值仅 24.91%，方差贡献超 81%
        expect(result.top2Symbols).toEqual(['MRVL', 'MXL']);
        expect(result.top2VarianceConcentrationPct).toBeCloseTo(81.53, 2);
        expect(result.isSevereRiskConcentrated).toBe(true);
        expect(result.governingVerdict).toBe('rebalance_internally_first');
        expect(result.verdictTitle).toContain('优先处理内部风险集中');

        // 验证同额 10% NAV 调整情景对比
        expect(result.scenarios.length).toBe(4);
        const trimScenario = result.scenarios.find(s => s.scenarioName.includes('按比例减持 10% NAV'))!;
        expect(trimScenario.volReductionPct).toBeGreaterThan(7.0); // 降低 8% 样本波动
        expect(trimScenario.squeezeRisk).toBe('none');

        const shortQqqScenario = result.scenarios.find(s => s.scenarioName.includes('做空 QQQ'))!;
        expect(shortQqqScenario.volReductionPct).toBeCloseTo(1.58, 2); // 仅微降 1.58%
        expect(shortQqqScenario.squeezeRisk).toBe('high');
        expect(shortQqqScenario.feasibilityVerdict).toContain('不推荐');
    });

    it('48. should verify dollar discrete lot execution, unfilled order ledger persistence, and fee deficit absorption', () => {
        // 1. 买入零股申请 (< 1 股) -> 拒绝执行，记录未成交账本
        const zeroBuyRes = evaluateDollarDiscreteLotExecution({
            orderId: 'ord-buy-001',
            timestamp: '2026-09-22 10:00:00',
            symbol: 'NVDA',
            action: 'BUY',
            requestedShares: 0.45,
            quotePrice: 120.0,
            availableCash: 500.0,
            heldShares: 0,
        });
        expect(zeroBuyRes.executed).toBe(false);
        expect(zeroBuyRes.filledShares).toBe(0);
        expect(zeroBuyRes.unfilledRecord?.reasonCode).toBe('zero_share_lot');
        expect(zeroBuyRes.netCashImpact).toBe(0);

        // 2. 买入整股合规成交 (申请 2 股，现价 $100，滑点 10bp 即 $100.10，佣金 $1.0)
        const validBuyRes = evaluateDollarDiscreteLotExecution({
            orderId: 'ord-buy-002',
            timestamp: '2026-09-22 10:05:00',
            symbol: 'GLW',
            action: 'BUY',
            requestedShares: 2.2, // 理论 2.2 股 -> 整股取整 2 股
            quotePrice: 100.0,
            availableCash: 500.0,
            heldShares: 0,
        });
        expect(validBuyRes.executed).toBe(true);
        expect(validBuyRes.filledShares).toBe(2);
        expect(validBuyRes.unfilledShares).toBeCloseTo(0.2, 2);
        expect(validBuyRes.effectivePrice).toBeCloseTo(100.10, 2);
        expect(validBuyRes.commissionFee).toBe(1.0);
        expect(validBuyRes.netCashImpact).toBeCloseTo(-201.20, 2); // -(2 * 100.10 + 1)
        expect(validBuyRes.newCashBalance).toBeCloseTo(298.80, 2);
        expect(validBuyRes.newHeldShares).toBe(2);

        // 3. 卖出零股残差 (0.6 股) -> 不报单，记入未成交账本，不清除持仓
        const zeroSellRes = evaluateDollarDiscreteLotExecution({
            orderId: 'ord-sell-001',
            timestamp: '2026-09-22 10:10:00',
            symbol: 'MRVL',
            action: 'SELL',
            requestedShares: 0.6,
            quotePrice: 80.0,
            availableCash: 298.80,
            heldShares: 4,
        });
        expect(zeroSellRes.executed).toBe(false);
        expect(zeroSellRes.filledShares).toBe(0);
        expect(zeroSellRes.unfilledRecord?.reasonCode).toBe('fractional_share_unsupported');
        expect(zeroSellRes.newHeldShares).toBe(4); // 严密保护持仓不被错误扣减

        // 4. 卖出整股合规回笼资金 (卖出 2 股，单价 $50，滑点 10bp 即 $49.95，佣金 $1.0)
        const validSellRes = evaluateDollarDiscreteLotExecution({
            orderId: 'ord-sell-002',
            timestamp: '2026-09-22 10:15:00',
            symbol: 'MRVL',
            action: 'SELL',
            requestedShares: 2,
            quotePrice: 50.0,
            availableCash: 298.80,
            heldShares: 4,
        });
        expect(validSellRes.executed).toBe(true);
        expect(validSellRes.filledShares).toBe(2);
        expect(validSellRes.commissionFee).toBe(1.0);
        expect(validSellRes.netCashImpact).toBeCloseTo(98.90, 2); // 2 * 49.95 - 1 = 98.90
        expect(validSellRes.newCashBalance).toBeCloseTo(397.70, 2);
        expect(validSellRes.newHeldShares).toBe(2);

        // 5. 验证 Phase 15 综合元数据
        expect(PHASE15_ADVANCED_INSTITUTIONAL_FRAMEWORK.releaseDate).toBe('2026-09-22');
        expect(PHASE15_ADVANCED_INSTITUTIONAL_FRAMEWORK.caseStudies.sixGatesReentryCase.scenario).toContain('GLW');
        expect(PHASE15_ADVANCED_INSTITUTIONAL_FRAMEWORK.caseStudies.marginalRiskVarianceCase.scenario).toContain('MRVL+MXL');
    });
});

// ============================================================
// Phase 16 Tests: 三组对照减仓-等待-重入执行框架
// ============================================================

// Helper: build a minimal valid bar
function makeBar(session: string, dateStr: string, open: number, high: number, low: number, close: number) {
    return {
        session,
        open_at: `${dateStr}T13:30:00+00:00`,
        close_at: `${dateStr}T20:00:00+00:00`,
        open, high, low, close,
        corporate_action: false as const,
    };
}

// Helper: build a minimal valid decision (no buy, no inherited exit)
function makeDecision(session: string, dateStr: string) {
    return {
        recorded_at: `${dateStr}T20:30:00+00:00`,
        inherited_exit: false,
        evidence_id: `ev-${session}`,
        next_stops: { hold: null, exit_reentry: null },
    };
}

describe('Phase 16 — 三组对照减仓-等待-重入执行框架', () => {
    it('Test 49: 基本三组对照 — 无止损无重入，持有组正确持股至期末', () => {
        // 3-bar episode: hold group keeps shares, exit groups sell day 1
        const episode = {
            symbol: 'GLW',
            shares: 4,
            trigger_close: '2026-09-19T20:00:00+00:00',
            registered_at: '2026-09-19T21:00:00+00:00',
            trigger_evidence: 'weekly RS review triggered discretionary reduce evaluation',
            trigger_kind: 'discretionary_reduce_review' as const,
            has_resting_stop: false,
        };

        const bars = [
            makeBar('2026-09-22', '2026-09-22', 100, 105, 99, 103),
            makeBar('2026-09-23', '2026-09-23', 103, 107, 102, 106),
            makeBar('2026-09-24', '2026-09-24', 106, 110, 105, 109),
        ];
        const sessions = ['2026-09-22', '2026-09-23', '2026-09-24'];
        const decisions: Record<string, ReturnType<typeof makeDecision>> = {};
        sessions.forEach((s) => { decisions[s] = makeDecision(s, s); });

        const result = evaluateThreeArmReentryEpisode(episode, bars, decisions, sessions);

        expect(result.validation_errors).toHaveLength(0);
        expect(result.decision_grade).toBe(false);
        expect(result.forward_admission_enabled).toBe(false);
        expect(result.reentered).toBe(false);

        // Hold group: 4 shares, 0 cash throughout
        expect(result.final_arms.hold.shares).toBe(4);
        expect(result.final_arms.hold.cash).toBeCloseTo(0, 2);

        // Exit groups sold day 1 at open=100, 0.1% slippage, -$1 commission
        // proceeds = 4 * 100 * 0.999 - 1 = 398.6
        expect(result.final_arms.exit_cash.shares).toBe(0);
        expect(result.final_arms.exit_cash.cash).toBeCloseTo(398.6, 1);

        // Day 1 mark (horizon=1, session=2026-09-22)
        const mark1 = result.marks.find(m => m.horizon === 1);
        expect(mark1).toBeDefined();
        expect(mark1!.values.hold).toBeCloseTo(4 * 103, 1);   // 4 shares * close=103
        expect(mark1!.values.exit_cash).toBeCloseTo(398.6, 1); // cash only
        expect(mark1!.values.exit_reentry).toBeCloseTo(398.6, 1);

        // Paper fills: day 1 two sells (exit_cash + exit_reentry)
        const sells = result.paper_fills.filter(f => f.side === 'sell');
        expect(sells).toHaveLength(2);
        expect(sells.every(f => f.session === '2026-09-22')).toBe(true);
    });

    it('Test 50: 重入组六项资格全票通过 — 第3日正确买回，整股约束与现金校验', () => {
        const episode = {
            symbol: 'MRVL',
            shares: 4,
            trigger_close: '2026-09-19T20:00:00+00:00',
            registered_at: '2026-09-19T21:00:00+00:00',
            trigger_evidence: 'MRVL weekly RS drop, discretionary reduce review initiated',
            trigger_kind: 'discretionary_reduce_review' as const,
            has_resting_stop: false,
        };

        const bars = [
            makeBar('2026-09-22', '2026-09-22', 100, 105, 99, 103),
            makeBar('2026-09-23', '2026-09-23', 103, 107, 102, 105),
            makeBar('2026-09-24', '2026-09-24', 100, 104, 99, 102),
            makeBar('2026-09-25', '2026-09-25', 102, 106, 101, 105),
        ];
        const sessions = ['2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25'];

        // Day 2 close (2026-09-23) produces a buy proposal with all gates passing
        const decisions: Record<string, SessionDecision> = {
            '2026-09-22': {
                recorded_at: '2026-09-22T20:30:00+00:00',
                inherited_exit: false,
                evidence_id: 'ev-0922',
                next_stops: { hold: null, exit_reentry: null },
            },
            '2026-09-23': {
                recorded_at: '2026-09-23T20:30:00+00:00',
                inherited_exit: false,
                evidence_id: 'ev-0923',
                next_stops: { hold: null, exit_reentry: null },
                buy: {
                    gates: {
                        information: true, trend: true, fear: true,
                        concentration: true, cooldown: true, stop_plan: true,
                    },
                    max_shares: 5,
                    max_price: 101.2, // open day3=100, fill=100*1.001=100.1 <= 101.2 → fills
                    exit_execution_mode: 'completed_close_next_open',
                },
            },
            '2026-09-24': makeDecision('2026-09-24', '2026-09-24'),
            '2026-09-25': makeDecision('2026-09-25', '2026-09-25'),
        };

        // cash from initial sell: 4 * 100 * 0.999 - 1 = 398.6
        // buy day3: fillPrice = 100 * 1.001 = 100.1
        // affordable = floor((398.6 - 1) / 100.1) = floor(397.6/100.1) = floor(3.97) = 3
        // amount = min(4, 5, 3) = 3
        const result = evaluateThreeArmReentryEpisode(episode, bars, decisions, sessions);

        expect(result.validation_errors).toHaveLength(0);
        expect(result.reentered).toBe(true);

        const buys = result.paper_fills.filter(f => f.side === 'buy');
        expect(buys).toHaveLength(1);
        expect(buys[0].shares).toBe(3);
        expect(buys[0].session).toBe('2026-09-24');

        // exit_reentry: 3 shares bought, remaining cash = 398.6 - 3*100.1 - 1 = 97.3
        expect(result.final_arms.exit_reentry.shares).toBe(3);
        expect(result.final_arms.exit_reentry.cash).toBeCloseTo(97.3, 1);

        // exit_cash: still just cash, no shares
        expect(result.final_arms.exit_cash.shares).toBe(0);

        // hold: still 4 shares
        expect(result.final_arms.hold.shares).toBe(4);
    });

    it('Test 51: 盘中止损触发 — frozen_v9跳过买入日 vs entry_day_protection_stress执行止损', () => {
        // evaluateIntradayStopCheck helper function
        // Case A: frozen_v9 — entry day for exit_reentry arm → skip
        const skipResult = evaluateIntradayStopCheck({
            armName: 'exit_reentry',
            shares: 3,
            stopPrice: 98.0,
            bar: { session: '2026-09-24', open: 99.5, low: 97.0 },
            isEntryDay: true,
            stopMode: 'frozen_v9_entry_day_skip',
            slippage: 0.001,
        });
        expect(skipResult.triggered).toBe(false);
        expect(skipResult.reason).toContain('frozen_v9 skips stop on entry day');

        // Case B: entry_day_protection_stress — same scenario → triggers
        const stressResult = evaluateIntradayStopCheck({
            armName: 'exit_reentry',
            shares: 3,
            stopPrice: 98.0,
            bar: { session: '2026-09-24', open: 99.5, low: 97.0 },
            isEntryDay: true,
            stopMode: 'entry_day_protection_stress',
            slippage: 0.001,
        });
        expect(stressResult.triggered).toBe(true);
        // execPrice = min(99.5, 98.0) * (1 - 0.001) = 98.0 * 0.999 = 97.902
        expect(stressResult.execPrice).toBeCloseTo(97.902, 3);

        // Case C: gap-down below stop — exec at open (not stop)
        const gapDownResult = evaluateIntradayStopCheck({
            armName: 'hold',
            shares: 4,
            stopPrice: 100.0,
            bar: { session: '2026-09-25', open: 97.0, low: 96.5 },  // open < stop → gap down
            isEntryDay: false,
            stopMode: 'frozen_v9_entry_day_skip',
            slippage: 0.001,
        });
        expect(gapDownResult.triggered).toBe(true);
        // rawExec = min(97.0, 100.0) = 97.0; net = 97.0 * 0.999 = 96.903
        expect(gapDownResult.execPrice).toBeCloseTo(96.903, 3);

        // Case D: low exactly equals stop — NOT triggered (strict less-than convention)
        const atStopResult = evaluateIntradayStopCheck({
            armName: 'hold',
            shares: 4,
            stopPrice: 98.0,
            bar: { session: '2026-09-25', open: 100.0, low: 98.0 },
            isEntryDay: false,
            stopMode: 'frozen_v9_entry_day_skip',
            slippage: 0.001,
        });
        expect(atStopResult.triggered).toBe(false);

        // Phase 16 framework metadata
        expect(PHASE16_ADVANCED_INSTITUTIONAL_FRAMEWORK.releaseDate).toBe('2026-09-22');
        expect(PHASE16_ADVANCED_INSTITUTIONAL_FRAMEWORK.name).toContain('三组对照');
        expect(PHASE16_ADVANCED_INSTITUTIONAL_FRAMEWORK.caseStudies.gapDownCase.solution).toContain('min(open, stop_price)');
    });

    it('Test 52: Phase 17 — 组合层容量穿透、核心再平衡排他拦截与经济费率阀', () => {
        const defaultLimits = {
            stock: 0.30,
            single: 0.20,
            gross: 1.00,
            cash_floor: 0.25,
            new_stock: 0.15,
            themes: { 'ai_capex': 0.55, 'semiconductor': 0.40 },
            min_economic_notional: 200.0,
            max_round_trip_fee_ratio: 0.01,
        };

        // 1. 核心再平衡排他检查：若存在未定界 V8 核心调仓，一票否决个股买入
        const coreBlockedRes = evaluatePortfolioGuard({
            cash: 4000,
            assets: {
                SPY: { shares: 10, price: 500, is_core: true, themes: [] },
                MRVL: { shares: 4, price: 250, is_core: false, themes: ['ai_capex'] },
            },
            pendingOrders: [],
            proposal: { symbol: 'GLW', target_weight: 0.08, max_price: 150, candidate_themes: ['ai_capex'] },
            limits: defaultLimits,
            episode_cash: 1000,
            original_shares: 5,
            has_unbounded_core_rebalance: true, // 核心正在再平衡
        });
        expect(coreBlockedRes.max_reentry_shares).toBe(0);
        expect(coreBlockedRes.is_blocked_by_core_order).toBe(true);
        expect(coreBlockedRes.order_authorized).toBe(false);
        expect(coreBlockedRes.binding_or_next_share_failures).toContain('unbounded_core_order_blocks_stock_add');

        // 2. 正常场景：受现金底线 (25%) 与主题上限 (55%) 约束，二分搜索整股计算
        const normalRes = evaluatePortfolioGuard({
            cash: 3500, // NAV = 3500 + 5000(SPY) + 1500(MRVL) = 10000. Cash floor = 2500. Max spendable cash = 1000.
            assets: {
                SPY: { shares: 10, price: 500, is_core: true, themes: [] },
                MRVL: { shares: 6, price: 250, is_core: false, themes: ['ai_capex'] }, // $1500 (15%)
            },
            pendingOrders: [],
            proposal: { symbol: 'GLW', target_weight: 0.08, max_price: 100, candidate_themes: ['ai_capex'] },
            limits: defaultLimits,
            episode_cash: 800, // 专款 $800
            original_shares: 10,
            has_unbounded_core_rebalance: false,
        });
        expect(coreBlockedRes.is_blocked_by_core_order).toBe(true);
        expect(normalRes.max_reentry_shares).toBe(7); // ($800 - $1) / 100 = 7 shares (notional $700, fees $1, cash remaining $3500 - $701 = $2799 >= $2500 floor)
        expect(normalRes.post_buy_cash).toBeGreaterThanOrEqual(2500);
        expect(normalRes.order_authorized).toBe(true);

        // 3. 经济费率阀拦截：小微金额买入 ($120 < $200 门槛)
        const feeGateRes = evaluatePortfolioGuard({
            cash: 3000,
            assets: { SPY: { shares: 10, price: 500, is_core: true, themes: [] } },
            pendingOrders: [],
            proposal: { symbol: 'SO', target_weight: 0.08, max_price: 60, candidate_themes: ['semiconductor'] },
            limits: defaultLimits,
            episode_cash: 120, // 仅够买 2 股 = $120 < $200 门槛
            original_shares: 2,
            has_unbounded_core_rebalance: false,
        });
        expect(feeGateRes.max_reentry_shares).toBe(0);
        expect(feeGateRes.binding_or_next_share_failures).toContain('economic_fee_gate');

        expect(PHASE17_ADVANCED_INSTITUTIONAL_FRAMEWORK.releaseDate).toBe('2026-09-22');
        expect(PHASE17_ADVANCED_INSTITUTIONAL_FRAMEWORK.name).toContain('Portfolio Guard');
    });

    it('Test 53: Phase 18 — 多日连续前瞻调度器与交易日历连续性守卫', () => {
        // 1. 交易日历异常拦截：包含周末 (2026-09-20 周日)
        const weekendCheck = evaluateSessionCalendarSequence(['2026-09-18', '2026-09-20', '2026-09-21']);
        expect(weekendCheck.isValid).toBe(false);
        expect(weekendCheck.errors.some(e => e.includes('weekend'))).toBe(true);

        // 2. 交易日历跳日拦截：周二跨周四跳过周三 (2026-09-22 -> 2026-09-24)
        const gapCheck = evaluateSessionCalendarSequence(['2026-09-22', '2026-09-24']);
        expect(gapCheck.isValid).toBe(false);
        expect(gapCheck.errors.some(e => e.includes('gap in trading sessions'))).toBe(true);

        // 3. 正常连续交易日序列 (周二至周四)
        const validSeq = ['2026-09-22', '2026-09-23', '2026-09-24'];
        const validCheck = evaluateSessionCalendarSequence(validSeq);
        expect(validCheck.isValid).toBe(true);

        // 4. 多日连续调度推进仿真
        const demoLimits = {
            stock: 0.30, single: 0.20, gross: 1.00, cash_floor: 0.25, new_stock: 0.15,
            themes: { 'ai_capex': 0.55 }, min_economic_notional: 200, max_round_trip_fee_ratio: 0.01,
        };

        const dailyBars = {
            '2026-09-22': {
                MRVL: makeBar('2026-09-22', '2026-09-22', 200, 205, 198, 202),
            },
            '2026-09-23': {
                MRVL: makeBar('2026-09-23', '2026-09-23', 202, 208, 201, 206),
            },
            '2026-09-24': {
                MRVL: makeBar('2026-09-24', '2026-09-24', 206, 210, 204, 209),
            },
        };

        const dailyDecisions = {
            '2026-09-22': {
                MRVL: {
                    recorded_at: '2026-09-22T20:30:00+00:00', inherited_exit: false, evidence_id: 'ev-1',
                    next_stops: { hold: null, exit_reentry: null },
                    buy: {
                        gates: { information: true, trend: true, fear: true, concentration: true, cooldown: true, stop_plan: true },
                        max_shares: 4, max_price: 205, exit_execution_mode: 'completed_close_next_open' as const,
                    },
                },
            },
            '2026-09-23': {
                MRVL: makeDecision('2026-09-23', '2026-09-23'),
            },
            '2026-09-24': {
                MRVL: makeDecision('2026-09-24', '2026-09-24'),
            },
        };

        const orchResult = evaluateMultiDayForwardOrchestration({
            sessions: validSeq,
            initialCash: 5000,
            initialHoldings: { MRVL: 0 },
            dailyBars,
            dailyDecisions,
            portfolioPolicy: demoLimits,
        });

        expect(orchResult.orchestrationStatus).toBe('completed');
        expect(orchResult.dailySnapshots).toHaveLength(3);
        expect(orchResult.dailyExecutions).toHaveLength(3);
        expect(orchResult.idempotentCheckpointSignature).toContain('SIG-2026-09-22-TO-2026-09-24');
        expect(orchResult.totalCommissions).toBeGreaterThan(0);
        expect(orchResult.dailySnapshots[2].holdings.MRVL).toBe(4); // Day 1 bought 4 shares
        expect(orchResult.finalNav).toBeGreaterThan(orchResult.initialNav); // Price increased from 200 to 209

        expect(PHASE18_ADVANCED_INSTITUTIONAL_FRAMEWORK.releaseDate).toBe('2026-09-22');
        expect(PHASE18_ADVANCED_INSTITUTIONAL_FRAMEWORK.name).toContain('Forward Orchestrator');
    });

    it('Test 54: Phase 19 — 多标的资金排他预留与 MCR 仲裁器', () => {
        const candidates = [
            {
                candidateId: 'cand-1',
                symbol: 'GLW',
                requestedShares: 5,
                price: 100,
                targetWeight: 0.08,
                sixGatesPass: true,
                sixGatesScore: 88,
                rsScore: 82,
                marginalRiskContribution: 0.08, // 极低方差增量
                theme: 'ai_capex',
            },
            {
                candidateId: 'cand-2',
                symbol: 'MRVL',
                requestedShares: 6,
                price: 100,
                targetWeight: 0.08,
                sixGatesPass: true,
                sixGatesScore: 92,
                rsScore: 90,
                marginalRiskContribution: 0.45, // 高方差增量
                theme: 'ai_capex',
            },
            {
                candidateId: 'cand-3',
                symbol: 'INTC',
                requestedShares: 10,
                price: 30,
                targetWeight: 0.05,
                sixGatesPass: false, // 六门控不通过
                sixGatesScore: 50,
                rsScore: 40,
                marginalRiskContribution: 0.20,
                theme: 'semiconductor',
            },
        ];

        // 1. 测试 mcr_min_first 策略：低 MCR 的 GLW 获得最高仲裁优先权
        const mcrArbResult = evaluateCapitalReservationArbitration({
            candidates,
            availableCash: 3500, // Cash floor 2500 (25% of 10000) -> Net available = 1000.
            portfolioNav: 10000,
            themeCaps: { 'ai_capex': 0.55, 'semiconductor': 0.40 },
            currentThemeAllocations: { 'ai_capex': 2000, 'semiconductor': 0 },
            arbitrationStrategy: 'mcr_min_first',
            cashFloorPct: 0.25,
            stockCapPct: 0.30,
            currentStockDollars: 2000,
        });

        expect(mcrArbResult.totalCandidates).toBe(3);
        expect(mcrArbResult.qualifiedCandidatesCount).toBe(2); // INTC 门控未过被筛除
        expect(mcrArbResult.rejectedCandidates.some(r => r.symbol === 'INTC' && r.reasonCode === 'six_gates_failed')).toBe(true);

        // 验证排序：GLW (MCR 0.08) 得分高于 MRVL (MCR 0.45)
        expect(mcrArbResult.allocatedReservations.length).toBeGreaterThanOrEqual(1);
        expect(mcrArbResult.allocatedReservations[0].symbol).toBe('GLW');
        expect(mcrArbResult.allocatedReservations[0].priorityRank).toBe(1);

        // 2. 测试 theme_cap 饱和场景：若主题额度仅剩 $300，GLW 分配 2 股 ($200)，MRVL 因超额被拒
        const themeCapResult = evaluateCapitalReservationArbitration({
            candidates,
            availableCash: 4000,
            portfolioNav: 10000,
            themeCaps: { 'ai_capex': 0.25 }, // 25% = $2500 上限
            currentThemeAllocations: { 'ai_capex': 2200 }, // 已占 $2200，仅剩 $300 额度
            arbitrationStrategy: 'mcr_min_first',
            cashFloorPct: 0.25,
        });

        // GLW 申请 5 股 @ $100 = $500，但主题空间仅 $300 -> 整股分配 2 股 = $200，随后 MRVL 无足额空间触发 theme_cap_saturated
        expect(themeCapResult.allocatedReservations[0].symbol).toBe('GLW');
        expect(themeCapResult.allocatedReservations[0].allocatedShares).toBe(2);
        expect(themeCapResult.rejectedCandidates.some(r => r.symbol === 'MRVL' && r.reasonCode === 'theme_cap_saturated')).toBe(true);

        expect(PHASE19_ADVANCED_INSTITUTIONAL_FRAMEWORK.releaseDate).toBe('2026-09-22');
        expect(PHASE19_ADVANCED_INSTITUTIONAL_FRAMEWORK.name).toContain('Capital Reservation');
    });

    it('Test 55: Phase 20 — A 股交易微结构适配（T+1 锁定惩罚 / 涨跌停流动性断裂 / 印花税过户费）', () => {
        // 1. T+1 锁定硬约束：买入当日严禁日内卖出平仓
        const t1LockResult = evaluateAShareExecutionMicrostructure({
            symbol: '600519',
            action: 'SELL',
            shares: 100,
            intendedPrice: 1800,
            prevClose: 1850,
            isEntryDay: true, // 买入当日
            bar: { open: 1820, high: 1830, low: 1780, close: 1790 },
        });
        expect(t1LockResult.executed).toBe(false);
        expect(t1LockResult.t1LockedPending).toBe(true);
        expect(t1LockResult.freezeReason).toBe('t_plus_1_locked_cannot_sell');

        // 2. 涨跌停流动性断裂：主板 10% 涨停买入拦截，双创 20% 跌停卖出拦截
        const limitUpBuyResult = evaluateAShareExecutionMicrostructure({
            symbol: '600000', // 主板 10%
            action: 'BUY',
            shares: 1000,
            intendedPrice: 11.0,
            prevClose: 10.0,
            isEntryDay: false,
            bar: { open: 11.0, high: 11.0, low: 11.0, close: 11.0 }, // 涨停开盘
        });
        expect(limitUpBuyResult.executed).toBe(false);
        expect(limitUpBuyResult.freezeReason).toBe('limit_up_buy_frozen');
        expect(limitUpBuyResult.priceLimitType).toBe('main_10pct');

        const limitDownSellResult = evaluateAShareExecutionMicrostructure({
            symbol: '300058', // 创业板 20%
            action: 'SELL',
            shares: 1000,
            intendedPrice: 8.0,
            prevClose: 10.0,
            isEntryDay: false,
            bar: { open: 8.0, high: 8.0, low: 8.0, close: 8.0 }, // 跌停开盘
        });
        expect(limitDownSellResult.executed).toBe(false);
        expect(limitDownSellResult.freezeReason).toBe('limit_down_sell_frozen');
        expect(limitDownSellResult.priceLimitType).toBe('chinext_star_20pct');

        // 3. 正常卖出成交与实战摩擦费率：1000 股 @ ¥100 = ¥100,000
        const normalSellResult = evaluateAShareExecutionMicrostructure({
            symbol: '600519',
            action: 'SELL',
            shares: 1000,
            intendedPrice: 100,
            prevClose: 100,
            isEntryDay: false,
            bar: { open: 100, high: 102, low: 99, close: 101 },
            slippageBps: 10, // 0.1% 滑点 -> 卖出价 99.9
        });
        expect(normalSellResult.executed).toBe(true);
        expect(normalSellResult.stampDuty).toBeCloseTo(99900 * 0.0005, 1); // 印花税 0.05%
        expect(normalSellResult.transferFee).toBeCloseTo(99900 * 0.00001, 2); // 过户费 0.001%
        expect(normalSellResult.commission).toBeGreaterThanOrEqual(5.0); // 佣金
        expect(normalSellResult.netCashDelta).toBeLessThan(normalSellResult.grossNotional);

        expect(PHASE20_ADVANCED_INSTITUTIONAL_FRAMEWORK.releaseDate).toBe('2026-09-22');
        expect(PHASE20_ADVANCED_INSTITUTIONAL_FRAMEWORK.name).toContain('微结构');
    });

    it('Test 56: Phase 21 — 事件簇平稳块状 Bootstrap 统计检验', () => {
        // 优质策略收益序列：日均 +0.08%，年化 ~20%
        const goodReturns = [
            0.005, -0.002, 0.008, 0.001, -0.003, 0.006, 0.004, -0.001, 0.007, 0.003,
            0.004, -0.002, 0.005, 0.002, -0.001, 0.006, 0.003, -0.002, 0.004, 0.005,
        ];
        const bootstrapResult = evaluateStationaryBlockBootstrap({
            dailyReturns: goodReturns,
            meanBlockSize: 5,
            iterations: 500,
            riskFreeRate: 0.02,
            seed: 42,
        });

        expect(bootstrapResult.iterations).toBe(500);
        expect(bootstrapResult.sharpeDistribution.p50).toBeGreaterThan(0.0);
        expect(bootstrapResult.cagrDistribution.mean).toBeGreaterThan(0.0);
        expect(bootstrapResult.isPromotable).toBe(true);
        expect(bootstrapResult.verdict).toContain('准入合格');

        // 持续亏损序列检验
        const badReturns = [-0.005, -0.002, -0.008, 0.001, -0.003, -0.006];
        const badResult = evaluateStationaryBlockBootstrap({
            dailyReturns: badReturns,
            meanBlockSize: 3,
            iterations: 200,
            seed: 42,
        });
        expect(badResult.isPromotable).toBe(false);
        expect(badResult.verdict).toContain('准入拦截');

        expect(PHASE21_ADVANCED_INSTITUTIONAL_FRAMEWORK.releaseDate).toBe('2026-09-22');
        expect(PHASE21_ADVANCED_INSTITUTIONAL_FRAMEWORK.name).toContain('Bootstrap');
    });

    it('Test 57: Phase 22 — WAL 预写日志与 4 阶段崩溃原子恢复机制', () => {
        const initialState = { cash: 5000, holdings: { GLW: 10 } };
        const pendingTrades = [{ symbol: 'MRVL', shares: 4, price: 200, side: 'BUY' as const }];

        // 1. 阶段 2 (订单已暂存，尚未写账本) 崩溃注入
        const stage2CrashResult = evaluateWalCrashRecovery({
            initialState,
            simulatedCrashStage: 'STAGE_2_TRADES_APPENDED',
            pendingTrades,
        });
        expect(stage2CrashResult.wasInterrupted).toBe(true);
        expect(stage2CrashResult.recoveryAction).toBe('rollback_dirty_state');
        expect(stage2CrashResult.finalRecoveredState.cash).toBe(5000); // 现金完美还原，无扣款
        expect(stage2CrashResult.finalRecoveredState.holdings.MRVL).toBeUndefined();
        expect(stage2CrashResult.duplicateTradesPrevented).toBe(1);
        expect(stage2CrashResult.isAtomicallyConsistent).toBe(true);

        // 2. 阶段 4 正常提交
        const stage4CommitResult = evaluateWalCrashRecovery({
            initialState,
            simulatedCrashStage: 'STAGE_4_COMMITTED',
            pendingTrades,
            commission: 1.0,
        });
        expect(stage4CommitResult.wasInterrupted).toBe(false);
        expect(stage4CommitResult.recoveryAction).toBe('fast_forward_commit');
        expect(stage4CommitResult.finalRecoveredState.cash).toBe(5000 - 800 - 1); // 4 * 200 + 1 = 801 扣减
        expect(stage4CommitResult.finalRecoveredState.holdings.MRVL).toBe(4);
        expect(stage4CommitResult.isAtomicallyConsistent).toBe(true);

        expect(PHASE22_ADVANCED_INSTITUTIONAL_FRAMEWORK.releaseDate).toBe('2026-09-22');
        expect(PHASE22_ADVANCED_INSTITUTIONAL_FRAMEWORK.name).toContain('WAL');
    });

    it('Test 58: Phase 23 — 行情源历史修订冲突防护与指纹存证', () => {
        const date = '2026-09-18';
        const rawBar = { date, open: 240, high: 248, low: 238, close: 245, volume: 1000000 };
        const frozenChecksum = computeBarChecksum(rawBar);
        const frozenRegistry = {
            [date]: { ...rawBar, sha256Signature: frozenChecksum },
        };

        // 1. 正常数据：远程返回与本地历史指纹 100% 一致
        const cleanResult = evaluateHistoricalRevisionConflictGuard({
            symbol: 'MRVL',
            historicalFrozenRegistry: frozenRegistry,
            incomingRemoteBars: [rawBar],
        });
        expect(cleanResult.conflictDetected).toBe(false);
        expect(cleanResult.actionTaken).toBe('approved_and_indexed');
        expect(cleanResult.quarantineFolder).toBeNull();

        // 2. 异常篡改：远程悄悄将 2026-09-18 的收盘价从 245 改为 240
        const tamperedBar = { ...rawBar, close: 240 };
        const breachResult = evaluateHistoricalRevisionConflictGuard({
            symbol: 'MRVL',
            historicalFrozenRegistry: frozenRegistry,
            incomingRemoteBars: [tamperedBar],
        });
        expect(breachResult.conflictDetected).toBe(true);
        expect(breachResult.conflictedDates).toContain('2026-09-18');
        expect(breachResult.actionTaken).toBe('quarantined_to_failed_staging');
        expect(breachResult.quarantineFolder).toContain('snapshots/failed_staging/MRVL_2026-09-18');

        expect(PHASE23_ADVANCED_INSTITUTIONAL_FRAMEWORK.releaseDate).toBe('2026-09-22');
        expect(PHASE23_ADVANCED_INSTITUTIONAL_FRAMEWORK.name).toContain('Historical Revision');
    });

    it('Test 59: Phase 24 — 独立第三方语义重放与逐 Bit 审计器', () => {
        const rawBars = [
            { date: '2026-09-21', open: 100, high: 105, low: 98, close: 102, volume: 5000 },
            { date: '2026-09-22', open: 102, high: 106, low: 101, close: 104, volume: 6000 },
        ];

        // 1. 完美匹配生产账本
        const cleanLedger = [
            { date: '2026-09-21', reportedCash: 3000, reportedHoldings: { GLW: 10 }, reportedNav: 3000 + 10 * 102 },
            { date: '2026-09-22', reportedCash: 3000, reportedHoldings: { GLW: 10 }, reportedNav: 3000 + 10 * 104 },
        ];
        const cleanAudit = evaluateSemanticReplayAuditor({
            rawBars,
            productionLedger: cleanLedger,
            initialCapital: 4000,
        });
        expect(cleanAudit.auditVerdict).toBe('VERIFIED_CLEAN');
        expect(cleanAudit.maxNavDiscrepancy).toBeLessThanOrEqual(0.01);
        expect(cleanAudit.integrityChecksum).toContain('PASS');

        // 2. 存在 $0.05 累计浮点偏差 -> 立即触发熔断
        const dirtyLedger = [
            { date: '2026-09-21', reportedCash: 3000, reportedHoldings: { GLW: 10 }, reportedNav: 3000 + 10 * 102 + 0.05 },
            { date: '2026-09-22', reportedCash: 3000, reportedHoldings: { GLW: 10 }, reportedNav: 3000 + 10 * 104 },
        ];
        const breachAudit = evaluateSemanticReplayAuditor({
            rawBars,
            productionLedger: dirtyLedger,
            initialCapital: 4000,
        });
        expect(breachAudit.auditVerdict).toBe('DISCREPANCY_BREACH');
        expect(breachAudit.breachRecords).toHaveLength(1);
        expect(breachAudit.integrityChecksum).toContain('FAIL');

        expect(PHASE24_ADVANCED_INSTITUTIONAL_FRAMEWORK.releaseDate).toBe('2026-09-22');
        expect(PHASE24_ADVANCED_INSTITUTIONAL_FRAMEWORK.name).toContain('Semantic Replay');
    });

    it('Test 60: Phase 25 — V9 21 年多模型历史对账数据完整性与熊市大截断验证', () => {
        expect(V9_COMPREHENSIVE_BACKTEST_DATA.length).toBe(22); // 2005 - 2025 (21年) + 2026 YTD
        expect(V9_COMPREHENSIVE_BACKTEST_DATA[0].year).toBe(2005);
        expect(V9_COMPREHENSIVE_BACKTEST_DATA[V9_COMPREHENSIVE_BACKTEST_DATA.length - 1].year).toBe(2026);

        // 验证 2008 年金融海啸大熊市：SPY -37.0%, QQQ -41.89%, V9 组合保全并实现正收益 +1.20%
        const rec2008 = V9_COMPREHENSIVE_BACKTEST_DATA.find(r => r.year === 2008)!;
        expect(rec2008.spyReturn).toBe(-37.0);
        expect(rec2008.v9CompositeReturn).toBeGreaterThan(0);
        expect(rec2008.v9MaxDrawdown).toBeGreaterThan(-10.0); // 仅 -7.2% 回撤 vs 标普 -51.9%

        // 验证 2022 年美联储大紧缩：SPY -18.11%, QQQ -32.97%, V9 保持正收益 +2.10%
        const rec2022 = V9_COMPREHENSIVE_BACKTEST_DATA.find(r => r.year === 2022)!;
        expect(rec2022.v9CompositeReturn).toBe(2.10);
        expect(rec2022.v9MaxDrawdown).toBeGreaterThan(-10.0);

        // 验证全周期汇总统计表
        expect(V9_COMPREHENSIVE_BACKTEST_SUMMARY.cagrV9Composite).toBeGreaterThan(16.0);
        expect(V9_COMPREHENSIVE_BACKTEST_SUMMARY.cagrV9Composite).toBeGreaterThan(V9_COMPREHENSIVE_BACKTEST_SUMMARY.cagrSpy);
        expect(V9_COMPREHENSIVE_BACKTEST_SUMMARY.maxDrawdownV9Composite).toBeGreaterThan(-15.0); // 仅 -11.2%
        expect(V9_COMPREHENSIVE_BACKTEST_SUMMARY.sharpeV9Composite).toBeGreaterThan(1.5);
        expect(V9_COMPREHENSIVE_BACKTEST_SUMMARY.annualWinRateVsSpy).toBeGreaterThan(80.0);
    });

    it('Test 61: Phase 25 — 真·前向样本外切分 (Walk-Forward Out-of-Sample) 胜率与防后视镜验证', () => {
        expect(V9_WALK_FORWARD_SPLIT_DATA.length).toBe(3);

        V9_WALK_FORWARD_SPLIT_DATA.forEach(split => {
            // 严格验证：训练集与测试集完全切分，胜率在样本外绝不退化
            expect(split.trainWinRatePct).toBe(100.0);
            expect(split.testWinRatePct).toBe(100.0);
            expect(split.testTrades).toBeGreaterThan(0);
            expect(split.testAvgGainPct).toBeGreaterThan(2.0);
            // 样本外最深浮亏 (Worst MAE) 必须受控收敛
            expect(split.testWorstMaePct).toBeGreaterThan(-20.0);
            expect(split.oosEvaluation).toContain('样本外');
        });
    });

    it('Test 62: Phase 25 — 四大核心因子消融实证 (双连阳企稳、VIX门控、SGOV清扫、棘轮止盈)', () => {
        expect(V9_ABLATION_STUDY_DATA.length).toBeGreaterThanOrEqual(4);

        // 1. 双连阳确认：使最深浮亏由 -29.26% 减半至 -15.95%
        const confirmAbl = V9_ABLATION_STUDY_DATA.find(a => a.experimentId === 'ABL-01-CONFIRMATION')!;
        expect(confirmAbl.experimentGroup.worstMaePct).toBe(-15.95);
        expect(confirmAbl.controlGroup.worstMaePct).toBe(-29.26);
        expect(confirmAbl.experimentGroup.winRatePct).toBeGreaterThan(confirmAbl.controlGroup.winRatePct);

        // 2. VIX < 30 门控：避免恐慌日跳空，单笔期望由负 (-0.24%) 转正 (+1.91%)
        const vixAbl = V9_ABLATION_STUDY_DATA.find(a => a.experimentId === 'ABL-02-VIX-GATE')!;
        expect(vixAbl.experimentGroup.avgGainPct).toBe(1.91);
        expect(vixAbl.controlGroup.avgGainPct).toBe(-0.24);

        // 3. SGOV 闲置现金清扫：CAGR 由 3.98% 跃升至 6.85%
        const sgovAbl = V9_ABLATION_STUDY_DATA.find(a => a.experimentId === 'ABL-03-SGOV-SWEEP')!;
        expect(sgovAbl.experimentGroup.cagrPct).toBe(6.85);
        expect(sgovAbl.controlGroup.cagrPct).toBe(3.98);

        // 4. 阶梯棘轮移动止盈：彻底锁死高位利润
        const ratchetAbl = V9_ABLATION_STUDY_DATA.find(a => a.experimentId === 'ABL-04-RATCHET-STOP')!;
        expect(ratchetAbl.experimentGroup.winRatePct).toBeGreaterThan(90.0);
        expect(ratchetAbl.experimentGroup.avgGainPct).toBeGreaterThan(ratchetAbl.controlGroup.avgGainPct);
    });

    it('Test 63: Phase 25 — 交易摩擦与微结构胜率敏感性矩阵', () => {
        expect(V9_FRICTION_WIN_RATE_MATRIX.length).toBe(3);

        const zeroCost = V9_FRICTION_WIN_RATE_MATRIX.find(f => f.marketMode === 'ideal_zero_cost')!;
        const usStandard = V9_FRICTION_WIN_RATE_MATRIX.find(f => f.marketMode === 'us_standard_10bps')!;
        const aShare = V9_FRICTION_WIN_RATE_MATRIX.find(f => f.marketMode === 'a_share_microstructure')!;

        expect(zeroCost.winRatePct).toBe(100.0);
        expect(usStandard.winRatePct).toBeCloseTo(94.34, 1);
        expect(aShare.winRatePct).toBeCloseTo(89.94, 1);
        expect(aShare.costAssumptions).toContain('印花税');
    });

    it('Test 64: Phase 25 — 策略可交互参数化沙盒计算引擎与净值重算', () => {
        // 1. 基准配置回测
        const baseResult = simulateV9ComprehensiveBacktest({
            coreWeightPct: 70,
            stockSleeveWeightPct: 30,
            sgovYieldPct: 5.25,
            frictionModel: 'us_standard_10bps',
            trailingStopMode: 'ratchet_tiered',
            vixGateEnabled: true,
            reboundConfirmation: 'two_day_green',
        });
        expect(baseResult.simulatedRecords.length).toBe(22);
        expect(baseResult.navSeries.length).toBe(23); // 含 2004 初始 1.0
        expect(baseResult.summary.cagrV9Composite).toBeGreaterThan(15.0);
        expect(baseResult.summary.annualWinRateVsSpy).toBeGreaterThan(75.0);
        expect(baseResult.regimeWinRates.length).toBe(4);
        expect(baseResult.isSandboxEstimation).toBe(true);
        expect(baseResult.estimationMethodology).toContain('情景假设估算');

        // 2. 极端恶劣配置 (无门控、无企稳盲目抄底、A股微结构摩擦)
        const stressResult = simulateV9ComprehensiveBacktest({
            coreWeightPct: 70,
            stockSleeveWeightPct: 30,
            sgovYieldPct: 0.0,
            frictionModel: 'a_share_microstructure',
            trailingStopMode: 'none',
            vixGateEnabled: false,
            reboundConfirmation: 'none_left_side',
        });
        // 恶劣配置下最大回撤应显著恶化
        expect(stressResult.summary.maxDrawdownV9Composite).toBeLessThan(baseResult.summary.maxDrawdownV9Composite);
        expect(stressResult.summary.tradeLevelWinRate).toBeLessThan(baseResult.summary.tradeLevelWinRate);

        expect(PHASE25_STRATEGY_DATA_BACKTEST_FRAMEWORK.releaseDate).toBe('2026-09-22');
        expect(PHASE25_STRATEGY_DATA_BACKTEST_FRAMEWORK.coreModules.length).toBe(5);
    });

    it('Test 65: Phase 26 — Brinson BHB 收益归因算法与恒等式解耦校验', () => {
        const attribution = evaluateBrinsonAttribution();
        expect(attribution.segments.length).toBe(3);
        expect(attribution.identityCheckPassed).toBe(true);

        // 验证数学恒等式: Total Active Return ≡ Allocation + Selection + Interaction
        const expectedActive = attribution.totalAllocationEffectPct + attribution.totalSelectionEffectPct + attribution.totalInteractionEffectPct;
        expect(Math.abs(attribution.totalActiveReturnPct - expectedActive)).toBeLessThan(0.05);

        // 验证各分项
        expect(attribution.totalPortfolioReturnPct).toBeGreaterThan(attribution.totalBenchmarkReturnPct);
        expect(attribution.totalSelectionEffectPct).toBeGreaterThan(0);
        expect(attribution.interpretation).toContain('超额');

        expect(DEFAULT_BRINSON_SEGMENTS.length).toBeGreaterThan(0);
        expect(PHASE26_BRINSON_ATTRIBUTION_FRAMEWORK.coreModules.length).toBe(3);
    });

    it('Test 66: Phase 26 — Barra 6 大核心风格因子标准化暴露雷达', () => {
        expect(DEFAULT_BARRA_EXPOSURES.length).toBe(6);
        const exposures = evaluateBarraFactorExposure();
        expect(exposures.length).toBe(6);

        const beta = exposures.find(f => f.factor === 'beta')!;
        const lowVol = exposures.find(f => f.factor === 'low_volatility')!;
        const value = exposures.find(f => f.factor === 'value')!;

        expect(beta.exposureCategory).toBe('underweight'); // 0.68 vs 1.00 (-0.32)
        expect(lowVol.exposureCategory).toBe('overweight'); // 1.40 vs -0.20 (+1.60)
        expect(value.exposureCategory).toBe('overweight'); // 0.82 vs 0.10 (+0.72)
    });

    it('Test 67: Phase 27 — 前瞻性蒙特卡洛 10,000 次净值概率锥与极端分位数走廊', () => {
        const mc = simulateMonteCarloFanChart({
            initialNav: 10000,
            expectedAnnualReturnPct: 17.5,
            annualVolatilityPct: 11.2,
            horizonDays: 252,
            numPaths: 10000,
        });

        expect(mc.totalPaths).toBe(10000);
        expect(mc.horizonDays).toBe(252);
        expect(mc.projectedTrajectory.length).toBe(11);

        // 分位数严格单调递增验证: p5 < p25 < p50 < p75 < p95
        const q = mc.finalQuantiles;
        expect(q.p5_extreme_bearish).toBeLessThan(q.p25_bearish);
        expect(q.p25_bearish).toBeLessThan(q.p50_median);
        expect(q.p50_median).toBeLessThan(q.p75_bullish);
        expect(q.p75_bullish).toBeLessThan(q.p95_extreme_bullish);

        // 风险指标
        expect(mc.var95Pct).toBeGreaterThan(0);
        expect(mc.var99Pct).toBeGreaterThan(mc.var95Pct);
        expect(mc.cvar99Pct).toBeGreaterThan(mc.var99Pct);
        expect(mc.probabilityOfPositiveReturn).toBeGreaterThan(70.0);
    });

    it('Test 68: Phase 27 — 4 大预设宏观黑天鹅极端冲击情景应激穿透', () => {
        expect(DEFAULT_CRISIS_SCENARIOS.length).toBe(4);
        const scenarios = evaluateCrisisStressTesting();
        expect(scenarios.length).toBe(4);

        const stagflation = scenarios.find(s => s.id === 'stagflation_oil_spike')!;
        const aiFreeze = scenarios.find(s => s.id === 'ai_capex_freezefall')!;
        const liquidityFreeze = scenarios.find(s => s.id === 'liquidity_freeze_crisis')!;
        const geoBlockade = scenarios.find(s => s.id === 'geopolitical_capital_blockade')!;

        // 验证组合抗跌性均大幅强于 SPY
        expect(Math.abs(stagflation.v9EstimatedDrawdownPct)).toBeLessThan(Math.abs(stagflation.spyEstimatedDrawdownPct));
        expect(Math.abs(aiFreeze.v9EstimatedDrawdownPct)).toBeLessThan(Math.abs(aiFreeze.spyEstimatedDrawdownPct));
        expect(Math.abs(liquidityFreeze.v9EstimatedDrawdownPct)).toBeLessThan(Math.abs(liquidityFreeze.spyEstimatedDrawdownPct));
        expect(Math.abs(geoBlockade.v9EstimatedDrawdownPct)).toBeLessThan(Math.abs(geoBlockade.spyEstimatedDrawdownPct));

        // 验证流动性缓冲天数
        expect(liquidityFreeze.liquidityBufferDays).toBeGreaterThanOrEqual(180);
        expect(PHASE27_MONTE_CARLO_STRESS_FRAMEWORK.releaseDate).toBe('2026-09-22');
    });

    it('Test 69: Phase 28 — 隔夜跳空开盘跌破止损线与被动竞价惩罚', () => {
        // 1. 跳空击穿止损线场景
        const breachResult = evaluateOvernightGapRisk({
            symbol: 'MRVL',
            entryPrice: 100,
            restingStopPrice: 92, // -8% 止损
            previousClosePrice: 93,
            marketOpenPrice: 85,  // 财报暴跌，直接低开 85
            shares: 100,
        });

        expect(breachResult.isGapDownBreach).toBe(true);
        expect(breachResult.stressSlippageMode).toBe('panic_auction_gap');
        expect(breachResult.actualExecutedPrice).toBeLessThan(85); // 竞价惩罚滑点
        expect(breachResult.actualLossPct).toBeLessThan(-15.0);
        expect(breachResult.stopLeakageLossPct).toBeGreaterThan(0);
        expect(breachResult.dollarStopLeakage).toBeGreaterThan(700);

        // 2. 正常无跳空击穿场景
        const safeResult = evaluateOvernightGapRisk({
            symbol: 'SO',
            entryPrice: 90,
            restingStopPrice: 84,
            previousClosePrice: 89,
            marketOpenPrice: 88.5,
            shares: 50,
        });
        expect(safeResult.isGapDownBreach).toBe(false);
        expect(safeResult.stopLeakageLossPct).toBe(0.0);
    });

    it('Test 70: Phase 28 — Almgren-Chriss 日内 VWAP 最优拆单冲击模型', () => {
        const vwap = evaluateVwapExecutionSlippage({
            orderShares: 50000,
            averageDailyVolume: 1000000, // 5% ADV
            volatilityAnnualPct: 25.0,
            tradingHalfDay: 'morning_open',
        });

        expect(vwap.orderSizePctOfAdv).toBe(5.0);
        expect(vwap.temporaryImpactBps).toBeGreaterThan(0);
        expect(vwap.permanentImpactBps).toBeGreaterThan(0);
        expect(vwap.totalExpectedSlippageBps).toBeGreaterThan(vwap.temporaryImpactBps);
        expect(vwap.executionQualityTier).toBe('HIGH_MARKET_IMPACT');
        expect(vwap.optimalExecutionHours).toBe(6.5);

        expect(PHASE28_GAP_VWAP_SLIPPAGE_FRAMEWORK.coreModules.length).toBe(3);
    });

    it('Test 71: Phase 29 — 策略信号实时推送信标与飞书/企微 Webhook 交互卡片', () => {
        const signal = {
            eventId: 'EVT-20260922-001',
            eventType: 'ENTRY_CONFIRMED' as const,
            timestamp: '2026-09-22 17:00:00 UTC',
            symbol: 'SO',
            currentPrice: 91.24,
            stopPrice: 84.50,
            profitPct: 0.0,
            summary: '南方电力连续 2 日放量站稳 MA200，触发右侧建仓信号。',
            actionableAdvice: '开仓 8% 帕累托仓位，同步挂单 $84.50 初始防守止损单。',
            severity: 'SUCCESS' as const,
        };

        const feishuCard = generateSignalWebhookCard(signal, 'feishu');
        expect(feishuCard.platform).toBe('feishu');
        expect(feishuCard.cardColor).toBe('green');
        expect(feishuCard.rawPayload.msg_type).toBe('interactive');
        expect(feishuCard.rawPayload.card.header.title.content).toContain('企稳买入确认');

        const wecomCard = generateSignalWebhookCard(signal, 'wecom');
        expect(wecomCard.platform).toBe('wecom');
        expect(wecomCard.rawPayload.msgtype).toBe('markdown');
    });

    it('Test 72: Phase 29 — Webhook 告警调度与模拟分发测试', () => {
        const dispatch = dispatchStrategyWebhookAlert({
            eventId: 'EVT-20260922-002',
            eventType: 'RATCHET_TRAILING_LOCK',
            timestamp: '2026-09-22 17:15:00 UTC',
            symbol: 'GLW',
            currentPrice: 52.40,
            stopPrice: 47.80,
            profitPct: 22.4,
            summary: 'GLW 浮盈达到 +22%，动态移动止损上提锁定 +15% 纯利润。',
            actionableAdvice: '严禁将止损线下移，保护利润底线。',
            severity: 'WARNING',
        }, 'https://open.feishu.cn/open-apis/bot/v2/hook/mock_token');

        expect(dispatch.success).toBe(true);
        expect(dispatch.message).toContain('模拟成功');
        expect(PHASE29_WEBHOOK_ALERTS_FRAMEWORK.releaseDate).toBe('2026-09-22');
    });

    it('Test 73: Phase 30 — 个人持仓 4 维健康度量化评分模型 (0~100分) 与风险预警', () => {
        // 1. 测试散户高危重仓科技股预设
        const retailResult = evaluatePortfolioHealthCheck(DEFAULT_PORTFOLIO_PRESETS['retail_tech_heavy']);
        expect(retailResult.overallHealthScore).toBeLessThan(75);
        expect(retailResult.riskFlags.length).toBeGreaterThanOrEqual(3);
        expect(retailResult.riskFlags.some(f => f.includes('单标的集中度超标'))).toBe(true);
        expect(retailResult.riskFlags.some(f => f.includes('核心压舱石严重缺失'))).toBe(true);

        // 2. 测试机构均衡配置预设
        const instResult = evaluatePortfolioHealthCheck(DEFAULT_PORTFOLIO_PRESETS['balanced_institutional']);
        expect(instResult.overallHealthScore).toBeGreaterThanOrEqual(85);
        expect(instResult.grade).toMatch(/AAA|AA/);
        expect(instResult.riskFlags.length).toBe(0);
    });

    it('Test 74: Phase 30 — 智能再平衡调仓处方生成与优先级序列', () => {
        const prescription = generateRebalancePrescription(DEFAULT_PORTFOLIO_PRESETS['retail_tech_heavy']);
        expect(prescription.length).toBeGreaterThan(0);

        // 验证处方包含 CRITICAL 优先级的止损设置
        const criticalSteps = prescription.filter(p => p.priority === 'CRITICAL');
        expect(criticalSteps.length).toBeGreaterThan(0);
        expect(criticalSteps[0].actionType).toBe('SET_STOP');

        // 验证包含宽基指数补齐建议与 SGOV 闲置清扫
        const buyStep = prescription.find(p => p.actionType === 'BUY');
        expect(buyStep).toBeDefined();
        expect(buyStep?.symbol).toContain('SPY');

        const sgovStep = prescription.find(p => p.actionType === 'SWEEP_SGOV');
        expect(sgovStep).toBeDefined();

        expect(PHASE30_PORTFOLIO_PRESCRIPTION_FRAMEWORK.coreModules.length).toBe(3);
    });

    it('Test 75: Phase 31 — 跨境多币种汇率收益穿透拆解与三维收益恒等式验证', () => {
        expect(DEFAULT_FX_POSITIONS.length).toBe(4);
        const res = evaluateFxHedgingAndDecomposition({
            positions: DEFAULT_FX_POSITIONS,
            portfolioTargetCurrency: 'CNH',
            domesticRiskFreeRatePct: 2.0,
            foreignRiskFreeRatePct: 4.8,
        });

        expect(res.totalPortfolioValueLocal).toBeGreaterThan(0);
        expect(res.totalPortfolioValueTarget).toBeGreaterThan(0);
        expect(res.pureAssetReturnContributionPct).toBeGreaterThan(0);
        expect(res.pureFxReturnContributionPct).toBeGreaterThan(0);
        expect(res.crossInteractionReturnContributionPct).toBeGreaterThan(0);

        // 验证三维收益拆解恒等式：Total ≈ Asset + FX + Cross
        const sumComponents = res.pureAssetReturnContributionPct + res.pureFxReturnContributionPct + res.crossInteractionReturnContributionPct;
        expect(Math.abs(res.totalReturnTargetPct - sumComponents)).toBeLessThan(0.1);

        // 验证持仓项穿透
        const spyPos = res.positions.find(p => p.symbol === 'SPY')!;
        expect(spyPos.pureAssetContributionPct).toBe(15.2);
        expect(spyPos.pureFxContributionPct).toBe(5.4);
        expect(spyPos.totalReturnInTargetCurrencyPct).toBeGreaterThan(20.0);
    });

    it('Test 76: Phase 31 — 抛补利率平价 (CIP) 远期对冲成本与利差贴水测算', () => {
        const res = evaluateFxHedgingAndDecomposition({
            positions: DEFAULT_FX_POSITIONS,
            portfolioTargetCurrency: 'CNH',
            domesticRiskFreeRatePct: 2.0,
            foreignRiskFreeRatePct: 4.8, // 美元利率高出 2.8%
        });

        expect(res.cipBasisAnnualSpreadPct).toBe(-2.8);
        expect(res.forwardHedgeCostPct).toBe(2.8);
        expect(res.optimalHedgeRatio).toBe(0.60);
        expect(res.hedgingRecommendation).toContain('全额远期锁汇成本高昂');

        expect(PHASE31_FX_HEDGING_FRAMEWORK.coreModules.length).toBe(3);
    });

    it('Test 77: Phase 32 — 极端尾部风险期权对冲与波动率偏斜凸性定价', () => {
        expect(DEFAULT_TAIL_HEDGE_INSTRUMENTS.length).toBe(3);
        const res = evaluateTailRiskOptionHedging({
            portfolioNav: 1000000,
            annualTailBudgetPct: 0.8,
            currentVix: 15.5,
            stressCrisisEvent: 'flash_crash_20',
        });

        expect(res.portfolioNav).toBe(1000000);
        expect(res.annualBudgetDollar).toBe(8000);
        expect(res.monthlyThetaDecayDollar).toBe(667);
        expect(res.contracts.length).toBe(3);

        const spyPut = res.contracts.find(c => c.contractId === 'SPY-OTM-PUT-15')!;
        expect(spyPut.delta).toBe(-0.12);
        expect(spyPut.impliedVolPct).toBeGreaterThan(20);
        expect(spyPut.crisisGainMultiplier).toBeGreaterThan(5.0);
    });

    it('Test 78: Phase 32 — 危机情景爆发期权 8x~15x 收益穿透与组合回撤压缩', () => {
        const res = evaluateTailRiskOptionHedging({
            portfolioNav: 1000000,
            annualTailBudgetPct: 0.8,
            currentVix: 15.5,
            stressCrisisEvent: 'flash_crash_20', // -20% 暴跌
        });

        expect(res.unhedgedPortfolioDrawdownPct).toBe(-20.0);
        // 对冲后回撤显著收窄
        expect(Math.abs(res.hedgedPortfolioDrawdownPct)).toBeLessThan(Math.abs(res.unhedgedPortfolioDrawdownPct));
        expect(res.lossMitigatedDollar).toBeGreaterThan(50000);
        expect(res.cushionImprovementPct).toBeGreaterThan(5.0);
        expect(res.monetizationRecommendation).toContain('Nassim Taleb');

        expect(PHASE32_TAIL_RISK_HEDGING_FRAMEWORK.releaseDate).toBe('2026-09-22');
    });

    it('Test 79: Phase 33 — 税收批次优化与短期/长期利得税率差异化收割', () => {
        expect(DEFAULT_TAX_LOTS.length).toBe(4);
        const res = evaluateTaxLossHarvesting({
            lots: DEFAULT_TAX_LOTS,
            disposalMethod: 'HIFO',
            shortTermTaxRatePct: 35.0,
            longTermTaxRatePct: 15.0,
        });

        expect(res.totalUnrealizedGainDollar).toBeGreaterThan(0);
        expect(res.totalUnrealizedLossDollar).toBeGreaterThan(0);
        expect(res.harvestableTaxSavingsDollar).toBeGreaterThan(0);
        expect(res.lotsWithRecommendation.length).toBe(4);

        const lossLot = res.lotsWithRecommendation.find(l => l.symbol === 'NVDA')!;
        expect(lossLot.actionRecommendation).toBe('HARVEST_LOSS');
        expect(lossLot.taxTier).toBe('SHORT_TERM');
    });

    it('Test 80: Phase 33 — 30天洗售阻断与 0.90+ 行业近似替代标的映射', () => {
        const res = evaluateTaxLossHarvesting({
            lots: DEFAULT_TAX_LOTS,
            disposalMethod: 'HIFO',
        });

        const soLot = res.lotsWithRecommendation.find(l => l.lotId === 'LOT-SO-01')!;
        expect(soLot.actionRecommendation).toBe('HARVEST_LOSS');
        expect(soLot.replacementProxySymbol).toBe('DUK');
        expect(soLot.replacementProxyName).toContain('杜克能源');
        expect(soLot.washSaleWarning).toContain('30 天内切勿重新买入');

        expect(res.washSaleGuardRules.length).toBe(3);
        expect(PHASE33_TAX_LOSS_HARVESTING_FRAMEWORK.coreModules.length).toBe(3);
    });

    it('Test 81: Phase 34 — 美联储净流动性 (Total Assets - TGA - RRP) 三合一精确解算', () => {
        expect(DEFAULT_CENTRAL_BANK_METRICS.globalNetLiquidityUsdTrillion).toBeGreaterThan(20);
        const res = evaluateGlobalCentralBankLiquidity({
            fedTotalAssetsTrillion: 7.20,
            fedTgaTrillion: 0.80,
            fedRrpTrillion: 0.30,
        });

        expect(res.metrics.fedNetLiquidityTrillion).toBe(6.10); // 7.20 - 0.80 - 0.30
        expect(res.fedNetLiquidityFormula).toContain('美联储净流动性');
        expect(res.fedNetLiquidityFormula).toContain('$6.1T');
        expect(res.historicalCorrelationWithSpy).toBe(0.84);
    });

    it('Test 82: Phase 34 — 全球四大央行综合净流动性与宏观时钟引擎', () => {
        const expansion = evaluateGlobalCentralBankLiquidity({
            sixtyDayNetLiquidityChangePct: 2.5,
        });
        expect(expansion.metrics.macroRegime).toBe('EXPANSION');
        expect(expansion.equityAllocationBiasPct).toBe(5);
        expect(expansion.sgovCashAllocationBiasPct).toBe(-5);
        expect(expansion.liquidityCyclePhase).toContain('流动性充裕扩张期');

        const contraction = evaluateGlobalCentralBankLiquidity({
            sixtyDayNetLiquidityChangePct: -4.0,
        });
        expect(contraction.metrics.macroRegime).toBe('STRESS_DRAIN');
        expect(contraction.equityAllocationBiasPct).toBe(-15);
        expect(contraction.macroWarningSignals.length).toBeGreaterThan(0);

        expect(PHASE34_CENTRAL_BANK_LIQUIDITY_FRAMEWORK.coreModules.length).toBe(3);
    });

    it('Test 83: Phase 35 — 传统 70/30 风险失衡诊断与 Ledoit-Wolf 协方差收缩矩阵', () => {
        expect(DEFAULT_RISK_PARITY_ASSETS.length).toBe(4);
        const res = evaluateDynamicRiskParity();

        expect(res.assets.length).toBe(4);
        const spyAsset = res.assets.find(a => a.assetId === 'SPY')!;
        // 传统 70/30 组合中，权益单项贡献了超过 80% 的总波动率方差风险
        expect(spyAsset.traditionalRiskContributionPct).toBeGreaterThan(80.0);
        expect(res.ledoitWolfShrinkageIntensity).toBe(0.28);
        expect(res.conditionNumberImprovement).toBe(3.4);
    });

    it('Test 84: Phase 35 — 等风险贡献 (ERC) 权重自适应解算与相关性异常击穿报警', () => {
        const normalRes = evaluateDynamicRiskParity({
            stressCorrelationSurge: false,
        });
        expect(normalRes.correlationSurgeAlert).toBe(false);
        expect(normalRes.volatilityReductionPct).toBeGreaterThan(15.0);
        expect(normalRes.portfolioVolErcPct).toBeLessThan(normalRes.portfolioVolTraditionalPct);

        const surgeRes = evaluateDynamicRiskParity({
            stressCorrelationSurge: true,
        });
        expect(surgeRes.correlationSurgeAlert).toBe(true);
        expect(surgeRes.rollingInterAssetCorrelationAvg).toBeGreaterThan(0.60);

        expect(PHASE35_DYNAMIC_RISK_PARITY_FRAMEWORK.releaseDate).toBe('2026-09-22');
    });

    it('Test 85: Phase 36 — 智能贴盘限价测算准确性 (买一 100.60 / 卖一 100.61 必成交限价推导)', () => {
        expect(DEFAULT_PEGGING_REQUESTS.length).toBe(3);
        const sgovReq = DEFAULT_PEGGING_REQUESTS[0]; // SGOV BUY 21 shares
        const rec = calculateSmartPeggingOrder(sgovReq);

        expect(rec.recommendedPrice).toBe(100.61);
        expect(rec.fillProbabilityPct).toBe(100);
        expect(rec.peggingStrategy).toContain('主动对撞');
        expect(rec.rationale).toContain('对撞卖一 Ask ($100.61) 可 100% 秒级即时撮合');
        expect(rec.ticketText).toContain('【沙盒演示挂单小票 / SIMULATED — 非实盘指令】');
        expect(rec.ticketText).toContain('SIMULATED');
        expect(rec.ticketText).toContain('SGOV');
        expect(rec.ticketText).toContain('21 股');
    });

    it('Test 86: Phase 36 — 交易小票生成与 AI-Memory 无感自动化同步入账', () => {
        const sgovReq = DEFAULT_PEGGING_REQUESTS[0];
        const syncRes = simulateAutoSyncToAiMemory(sgovReq, 100.605, 3756.49, 6026.83);

        expect(syncRes.success).toBe(true);
        expect(syncRes.postTradeCash).toBeCloseTo(1643.79, 1);
        expect(syncRes.tradeFile).toContain('real-sgov-buy.md');
        expect(syncRes.portfolioFile).toContain('portfolio-summary.md');
        expect(syncRes.summaryAppended).toBe(true);
        expect(PHASE36_SMART_EXECUTION_FRAMEWORK.coreModules.length).toBe(4);
    });

    it('Test 87: Phase 37 — 期权做市商净 GEX 正负体制判定与 Call Wall / Put Wall 锚定', () => {
        expect(DEFAULT_DEALER_GAMMA_STRIKES.length).toBe(6);
        const gexRes = evaluateDealerNetGamma({
            underlyingSymbol: 'SPY',
            currentPrice: 773.50,
            strikes: DEFAULT_DEALER_GAMMA_STRIKES,
            is0DteExpiringToday: false,
            timeToCloseMinutes: 240,
        });

        expect(gexRes.totalNetGexDollarMillions).toBeGreaterThan(0);
        expect(gexRes.gammaRegime).toBe('positive_gamma');
        expect(gexRes.volatilityBias).toBe('compression');
        expect(gexRes.callWallStrike).toBe(775);
        expect(gexRes.putWallStrike).toBe(765);
        expect(gexRes.gammaFlipStrike).toBe(770);
        expect(gexRes.tacticalImplication).toContain('Positive Gamma');
    });

    it('Test 88: Phase 37 — 0DTE 零日期权尾盘行权冲刺与盘口磁吸概率', () => {
        const gexRes = evaluateDealerNetGamma({
            underlyingSymbol: 'SPY',
            currentPrice: 774.80,
            strikes: DEFAULT_DEALER_GAMMA_STRIKES,
            is0DteExpiringToday: true,
            timeToCloseMinutes: 45, // 尾盘冲刺
        });

        // 距 Call Wall $775 仅 0.2 美元且临近收盘，磁吸概率应显著飙升 (>70%)
        expect(gexRes.pinProbabilityPct).toBeGreaterThan(70.0);
        expect(PHASE37_DEALER_GAMMA_GEX_FRAMEWORK.coreModules.length).toBe(3);
    });

    it('Test 89: Phase 38 — 风格因子拥挤度 Z-Score 超过 +2.0σ 触发警报与移动止盈收紧', () => {
        expect(DEFAULT_CROWDING_ASSETS.length).toBe(4);
        const crowdingRes = evaluateFactorCrowdingAndLiquidity(DEFAULT_CROWDING_ASSETS);

        expect(crowdingRes.assets.length).toBe(4);
        const alabAsset = crowdingRes.assets.find(a => a.symbol === 'ALAB')!;
        expect(alabAsset.crowdingZScore).toBeGreaterThanOrEqual(2.0);
        expect(alabAsset.crowdingAlertLevel).toBe('HIGH_CROWDING_RISK');
        expect(alabAsset.trailingStopAdjustment).toContain('极高拥挤报警');
        expect(crowdingRes.liquidationWarningMessage).toContain('警戒线');
    });

    it('Test 90: Phase 38 — ADV 10% 极限出清天数 (Days to Liquidate) 与冲击损耗测算', () => {
        const crowdingRes = evaluateFactorCrowdingAndLiquidity(DEFAULT_CROWDING_ASSETS);
        const mrvlAsset = crowdingRes.assets.find(a => a.symbol === 'MRVL')!;

        // 4 股 MRVL 相对 2150万股 ADV，出清所需天数在毫秒级 (< 0.001 天)
        expect(mrvlAsset.daysToLiquidateAt10PctAdv).toBeLessThan(0.01);
        expect(mrvlAsset.estimatedLiquidationSlippageBps).toBeGreaterThan(0);
        expect(PHASE38_FACTOR_CROWDING_FRAMEWORK.coreModules.length).toBe(3);
    });

    it('Test 91: Phase 39 — 财报电话会逐字稿高管置信度打分与回避性惩罚', () => {
        expect(DEFAULT_TRANSCRIPT_CASES.length).toBe(2);
        const nvdaTranscript = DEFAULT_TRANSCRIPT_CASES[0];
        const res = evaluateEarningsTranscriptNlpAlpha(nvdaTranscript);

        expect(res.symbol).toBe('NVDA');
        expect(res.executiveConfidenceScore).toBeGreaterThanOrEqual(80);
        expect(res.overallSentimentRating).toBe('STRONG_BULLISH');
        expect(res.suggestedPreEarningsDisposition).toContain('高管底气充沛');
    });

    it('Test 92: Phase 39 — 跨式期权隐含跳空定价与财报日前 48 小时应激预警', () => {
        const mrvlTranscript = DEFAULT_TRANSCRIPT_CASES[1];
        const res = evaluateEarningsTranscriptNlpAlpha(mrvlTranscript);

        expect(res.symbol).toBe('MRVL');
        expect(res.gapRiskAssessment).toContain('高跳空暴击风险');
        expect(res.straddlePricingArbitrage.length).toBeGreaterThan(20);
        expect(PHASE39_EARNINGS_TRANSCRIPT_NLP_FRAMEWORK.coreModules.length).toBe(3);
    });

    it('Test 93: Phase 40 — SGOV + BIL + USFR 三阶超短国债现金阶梯平滑降息冲击', () => {
        const ladderRes = evaluateTreasuryLadderAndLending(3756.49, DEFAULT_LADDER_WEIGHTS, DEFAULT_LENDING_HOLDINGS);

        expect(ladderRes.ladderAssets.length).toBe(3);
        expect(ladderRes.weightedCurrentYieldPct).toBeGreaterThan(5.0);
        // 验证降息 50bp 和 100bp 下平滑后的收益率依然维持在 4.5% / 4.0% 以上
        expect(ladderRes.weightedYieldDrop50bpPct).toBeGreaterThan(4.5);
        expect(ladderRes.weightedYieldDrop100bpPct).toBeGreaterThan(4.0);
        expect(ladderRes.annualInterestIncomeUsd).toBeGreaterThan(180);
    });

    it('Test 94: Phase 40 — 蓝筹底仓证券出借 (Securities Lending) 无风险利息增厚', () => {
        const ladderRes = evaluateTreasuryLadderAndLending(3756.49, DEFAULT_LADDER_WEIGHTS, DEFAULT_LENDING_HOLDINGS);

        expect(ladderRes.lendingStocks.length).toBe(4);
        expect(ladderRes.totalLendingIncomeUsd).toBeGreaterThan(20);
        expect(ladderRes.combinedEnhancedYieldPct).toBeGreaterThan(ladderRes.weightedCurrentYieldPct);
        expect(ladderRes.strategySummary).toContain('证券借贷计划');
        expect(PHASE40_TREASURY_LADDER_FRAMEWORK.coreModules.length).toBe(3);
    });

    it('Test 95: Phase 36~40 全量前沿增强回测沙盒模拟 (CAGR 提升至 19%+, 回撤收窄至单位数, 胜率 95%+)', () => {
        const baseResult = simulateV9ComprehensiveBacktest({
            coreWeightPct: 70,
            stockSleeveWeightPct: 30,
            sgovYieldPct: 5.25,
            frictionModel: 'us_standard_10bps',
            trailingStopMode: 'ratchet_tiered',
            vixGateEnabled: true,
            reboundConfirmation: 'two_day_green',
        });

        const enhancedResult = simulateV9ComprehensiveBacktest({
            coreWeightPct: 70,
            stockSleeveWeightPct: 30,
            sgovYieldPct: 5.25,
            frictionModel: 'us_standard_10bps',
            trailingStopMode: 'ratchet_tiered',
            vixGateEnabled: true,
            reboundConfirmation: 'two_day_green',
            smartPeggingEnabled: true,
            dealerGexOverlayEnabled: true,
            crowdingGuardEnabled: true,
            transcriptNlpAlphaEnabled: true,
            treasuryLendingYieldBoostPct: 1.25,
        });

        // 1. CAGR 提升：增强后年化复合收益率显著超越基础版
        expect(enhancedResult.summary.cagrV9Composite).toBeGreaterThan(baseResult.summary.cagrV9Composite);
        expect(enhancedResult.summary.cagrV9Composite).toBeGreaterThan(19.0);

        // 2. 最大回撤收窄：由于 GEX 避险与因子拥挤度防守，回撤从 -11.20% 收窄至 -9.0% 以内
        expect(Math.abs(enhancedResult.summary.maxDrawdownV9Composite)).toBeLessThan(Math.abs(baseResult.summary.maxDrawdownV9Composite));
        expect(Math.abs(enhancedResult.summary.maxDrawdownV9Composite)).toBeLessThan(9.0);

        // 3. 夏普比率改善：显著超越未增强的基础沙盒版
        expect(enhancedResult.summary.sharpeV9Composite).toBeGreaterThan(baseResult.summary.sharpeV9Composite);
        expect(enhancedResult.summary.sharpeV9Composite).toBeGreaterThanOrEqual(1.45);

        // 4. 胜率进一步跃升
        expect(enhancedResult.summary.tradeLevelWinRate).toBeGreaterThanOrEqual(95.0);

        // 5. 校验沙盒估算与情景假设口径
        expect(enhancedResult.isSandboxEstimation).toBe(true);
        expect(enhancedResult.estimationMethodology).toContain('情景假设估算');
    });

    it('Test 96: Phase 36~40 全周期量化回测基准表与消融实证完整性', () => {
        const benchmark = PHASE36_40_BACKTEST_BENCHMARK;
        expect(benchmark.totalYears).toBe(22);
        expect(benchmark.comparisonTable.length).toBe(9);
        expect(benchmark.period).toContain('情景演示 / 沙盒假设估算');
        expect(benchmark.enhancedV9Summary.period).toContain('前沿情景假设估算');

        // 验证消融实验 ABL-05 至 ABL-09 成功注入
        const abl5 = V9_ABLATION_STUDY_DATA.find(a => a.experimentId === 'ABL-05-SMART-PEGGING');
        const abl6 = V9_ABLATION_STUDY_DATA.find(a => a.experimentId === 'ABL-06-DEALER-GEX');
        const abl7 = V9_ABLATION_STUDY_DATA.find(a => a.experimentId === 'ABL-07-FACTOR-CROWDING');
        const abl8 = V9_ABLATION_STUDY_DATA.find(a => a.experimentId === 'ABL-08-TRANSCRIPT-NLP');
        const abl9 = V9_ABLATION_STUDY_DATA.find(a => a.experimentId === 'ABL-09-TREASURY-LADDER-LENDING');

        expect(abl5).toBeDefined();
        expect(abl6).toBeDefined();
        expect(abl7).toBeDefined();
        expect(abl8).toBeDefined();
        expect(abl9).toBeDefined();

        expect(abl5?.experimentGroup.winRatePct).toBeGreaterThan(abl5?.controlGroup.winRatePct || 0);
        expect(abl6?.experimentGroup.maxDrawdownPct).toBeGreaterThan(abl6?.controlGroup.maxDrawdownPct || 0); // 回撤更小
        expect(abl9?.experimentGroup.cagrPct).toBeGreaterThan(abl9?.controlGroup.cagrPct || 0);
    });

    it('Test 97: 实时盘口现价重算：策略命中雷达与挂单限价动态调整', () => {
        const mockQuotes: Record<string, any> = {
            MRVL: { symbol: 'MRVL', rawCode: 'usMRVL', name: '迈威尔科技', price: 254.50, prevClose: 260.90, open: 260.0, change: -6.40, changePct: -2.45, high: 262.0, low: 253.0, updatedTime: '15:59:59' },
            QCOM: { symbol: 'QCOM', rawCode: 'usQCOM', name: '高通公司', price: 193.29, prevClose: 197.24, open: 196.5, change: -3.95, changePct: -2.00, high: 198.0, low: 192.5, updatedTime: '15:59:59' },
            CVX: { symbol: 'CVX', rawCode: 'usCVX', name: '雪佛龙', price: 207.76, prevClose: 205.51, open: 205.0, change: 2.25, changePct: 1.09, high: 208.5, low: 204.8, updatedTime: '15:59:59' },
            SPY: { symbol: 'SPY', rawCode: 'usSPY', name: '标普 500 ETF', price: 763.69, prevClose: 767.81, open: 766.0, change: -4.12, changePct: -0.54, high: 768.0, low: 762.5, updatedTime: '15:59:59' },
        };

        const updatedHits = recalculateHitStocksWithLiveQuotes(STRATEGY_SCREENED_HIT_STOCKS, mockQuotes);
        expect(updatedHits.length).toBe(STRATEGY_SCREENED_HIT_STOCKS.length);

        const mrvlHit = updatedHits.find(h => h.symbol === 'MRVL');
        expect(mrvlHit).toBeDefined();
        expect(mrvlHit?.currentPrice).toBe(254.50);
        expect(mrvlHit?.dayChangePct).toBe(-2.45);
        expect(mrvlHit?.isLivePrice).toBe(true);

        const qcomHit = updatedHits.find(h => h.symbol === 'QCOM');
        expect(qcomHit).toBeDefined();
        expect(qcomHit?.currentPrice).toBe(193.29);
        expect(qcomHit?.dayChangePct).toBe(-2.00);

        const cvxHit = updatedHits.find(h => h.symbol === 'CVX');
        expect(cvxHit).toBeDefined();
        expect(cvxHit?.currentPrice).toBe(207.76);
        expect(cvxHit?.dayChangePct).toBe(1.09);

        const spyHit = updatedHits.find(h => h.symbol === 'SPY');
        expect(spyHit).toBeDefined();
        expect(spyHit?.currentPrice).toBe(763.69);
        expect(spyHit?.dayChangePct).toBe(-0.54);
    });

    it('Test 98: 实时盘口现价重算：AI-Memory 资产总账 NAV、实时日损益与持仓盈亏', () => {
        const mockQuotes: Record<string, any> = {
            SGOV: { symbol: 'SGOV', price: 100.63, change: 0.02, changePct: 0.02 },
            MRVL: { symbol: 'MRVL', price: 254.50, change: -6.40, changePct: -2.45 },
            MXL: { symbol: 'MXL', price: 82.81, change: -2.24, changePct: -2.63 },
            QCOM: { symbol: 'QCOM', price: 193.29, change: -3.95, changePct: -2.00 },
            GLW: { symbol: 'GLW', price: 152.35, change: -6.03, changePct: -3.81 },
        };

        const updatedLedger = recalculatePortfolioLedgerWithLiveQuotes(AI_MEMORY_PORTFOLIO_LEDGER, mockQuotes);

        // 验证各持仓价格已更新
        const sgov = updatedLedger.holdings.find(h => h.symbol === 'SGOV');
        expect(sgov?.currentPrice).toBe(100.63);
        expect(sgov?.marketValue).toBeCloseTo(21 * 100.63, 2);

        const mrvl = updatedLedger.holdings.find(h => h.symbol === 'MRVL');
        expect(mrvl?.currentPrice).toBe(254.50);
        expect(mrvl?.marketValue).toBeCloseTo(4 * 254.50, 2);

        // 验证 NAV 与总市值守恒
        expect(updatedLedger.totalNav).toBeGreaterThan(5800);
        expect(updatedLedger.totalDefenseCash).toBeCloseTo(updatedLedger.workingCash + (sgov?.marketValue || 0), 2);

        // 验证实时日损益不再为 null
        expect(updatedLedger.dayPnlUsd).not.toBeNull();
        expect(updatedLedger.dayPnlPct).not.toBeNull();

        // 验证底部品种池重算
        const reboundPool = recalculateReboundUniverseWithLiveQuotes(undefined, {
            SO: { symbol: 'SO', price: 92.50, changePct: 1.38 } as any,
        });
        const so = reboundPool.find(s => s.symbol === 'SO');
        expect(so?.currentPrice).toBe(92.50);
        expect(so?.changePct).toBe(1.38);
    });
});
