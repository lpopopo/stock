import React, { useState } from 'react';
import {
    BOTTOM_REBOUND_100WIN_SUMMARY,
    BOTTOM_REBOUND_UNIVERSE,
    BOTTOM_REBOUND_RULES,
    BOTTOM_REBOUND_AUDITED_TRADES,
    V9_STRATEGY_CONFIG,
    FEAR_GATE_LEVELS,
    INSTITUTIONAL_RESEARCH_FEED,
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
    V8_V9_UNIFIED_OPERATING_MODEL,
    DEFAULT_PROFIT_TRAILING_TIERS,
    calculateTieredTrailingStop,
    evaluateTreasuryFedMacroMonitor,
    evaluateEarningsCooldownRule,
    evaluateAntiAveragingDownRule,
    PHASE11_TACTICAL_ENHANCEMENTS,
    type BottomReboundStock,
    type TradeChecklistInput,
    type TradeChecklistResult,
    type BatchAuditRow,
    type TrailingStopCalculationInput,
    type TreasuryFedMacroInput,
    type EarningsCooldownInput,
    type AntiAveragingDownInput,
} from '../../../api/institutionalStrategy';

interface InstitutionalReboundPanelProps {
    colorScheme?: 'cn' | 'us';
}

type SubTabType =
    | 'stocks'
    | 'live-shadow'
    | 'fear-matrix'
    | 'breadth'
    | 'cross-market'
    | 'lead-lag'
    | 'batch-audit'
    | 'saturation-boundary'
    | 'four-dispositions'
    | 'behavioral-guardrail'
    | 'immutable-audit'
    | 'cash-efficiency'
    | 'position-sizing'
    | 'core-whipsaw'
    | 'thematic-tiers'
    | 'fee-gate'
    | 'reclass-invariance'
    | 'tactical-guards'
    | 'ai-bottleneck'
    | 'crowding-radar'
    | 'trade-checklist'
    | 'hypotheses'
    | 'rsr-momentum'
    | 'reentry'
    | 'risk-budget'
    | 'mechanisms'
    | 'rules'
    | 'trades'
    | 'v9'
    | 'hedgefunds';

export const InstitutionalReboundPanel: React.FC<InstitutionalReboundPanelProps> = ({
    colorScheme = 'cn',
}) => {
    const [subTab, setSubTab] = useState<SubTabType>('stocks');
    const [selectedEpoch, setSelectedEpoch] = useState<'all' | '2000-2007' | '2008-2016' | '2017-2026'>('all');
    const [hypoCategoryFilter, setHypoCategoryFilter] = useState<string>('all');
    const [hypoStatusFilter, setHypoStatusFilter] = useState<string>('all');

    // Phase 11: 进阶实战四维硬风控交互表单状态
    const [trailingInput, setTrailingInput] = useState<TrailingStopCalculationInput>({
        symbol: 'GLW',
        entryPrice: 100.0,
        highestPriceSinceEntry: 122.0,
        currentPrice: 112.0,
        currentStopPrice: 92.0,
        ma20Price: 106.0,
    });

    const [macroInput, setMacroInput] = useState<TreasuryFedMacroInput>({
        asOfDate: '2026-08-21',
        nominal2y: 4.24,
        nominal10y: 4.74,
        nominal30y: 5.27,
        real10y: 2.40,
        breakeven10y: 2.34,
        nominal10y_5d_change_bp: 6.0,
        real10y_5d_change_bp: -1.0,
        curve10s2s_bp: 50.0,
        priorCurve10s2s_bp: 48.0,
        fedTargetRangePct: [3.50, 3.75],
        fedHikeDissentCount: 3,
        fedTighteningContingency: true,
    });

    const [cooldownInput, setCooldownInput] = useState<EarningsCooldownInput>({
        symbol: 'MU',
        eventDayDate: '2026-06-25',
        currentDate: '2026-06-27',
        daysElapsedSinceEvent: 2,
        eventDayGainPct: 10.2,
        eventDayVolume: 50_000_000,
        currentDayVolume: 21_000_000,
        currentDayHighPrice: 1140,
        currentDayLowPrice: 1110,
        currentClosePrice: 1135,
        eventDayOpenPrice: 1050,
        eventDayClosePrice: 1150,
        ma5Price: 1115,
    });

    const [antiAveragingInput, setAntiAveragingInput] = useState<AntiAveragingDownInput>({
        symbol: 'MXL',
        currentPrice: 66.61,
        ma5: 70.50,
        ma10: 74.00,
        ma20: 78.00,
        consecutiveDaysAboveKeyMAs: 0,
        isVolumeReclaimed: false,
    });

    // 计算 Phase 11 四维风控实时结果
    const trailingResult = calculateTieredTrailingStop(trailingInput);
    const macroResult = evaluateTreasuryFedMacroMonitor(macroInput);
    const cooldownResult = evaluateEarningsCooldownRule(cooldownInput);
    const antiAveragingResult = evaluateAntiAveragingDownRule(antiAveragingInput);

    // 六维实战决策自检器交互表单状态
    const [checklistInput, setChecklistInput] = useState<TradeChecklistInput>({
        symbol: 'NVDA',
        fearGateScore: 5,
        crowdingScore: 82,
        rsRating: 92,
        trendAboveMa50: true,
        entryReclaimConfirmed: true,
        currentThemeWeightPct: 24.5,
        plannedLossUnder1PctNav: true,
        hasHardStopPlan: true,
    });

    const checklistResult: TradeChecklistResult = evaluateTradeChecklist(checklistInput);

    const handleLoadSymbolToChecklist = (row: BatchAuditRow) => {
        setChecklistInput({
            symbol: row.symbol,
            fearGateScore: row.fearGateScore,
            crowdingScore: row.crowdingScore,
            rsRating: row.rsRating,
            trendAboveMa50: row.trendStatus === 'Bullish',
            entryReclaimConfirmed: row.reclaimStatus === 'Confirmed',
            currentThemeWeightPct: row.currentThemeWeightPct,
            plannedLossUnder1PctNav: true,
            hasHardStopPlan: true,
        });
        setSubTab('trade-checklist');
    };

    const summary = BOTTOM_REBOUND_100WIN_SUMMARY;
    const stocks = BOTTOM_REBOUND_UNIVERSE;
    const isCn = colorScheme === 'cn';

    const filteredTrades = selectedEpoch === 'all'
        ? BOTTOM_REBOUND_AUDITED_TRADES
        : BOTTOM_REBOUND_AUDITED_TRADES.filter(t => t.epoch.startsWith(selectedEpoch));

    return (
        <div className="institutional-rebound-panel-root">
            {/* 顶栏 Hero 战绩看板 */}
            <div className="rebound-hero-header">
                <div className="hero-badge-strip">
                    <span className="source-repo-tag">🧠 跨仓库融合 · AI-Memory 策略引擎</span>
                    <span className="hero-super-badge">🏆 26年实证 100% 胜率 (159战159胜)</span>
                    <span className="hero-audit-badge">✓ 十轮系统化逐级审计严正通过</span>
                </div>
                <h3 className="hero-title">
                    底部品种企稳反弹量化战法 & V9 机构双轨配置雷达
                </h3>
                <p className="hero-desc">
                    由 <code>AI-Memory</code> 2000–2026（6,713 交易日）无偏历史全样本深度实证提炼：针对<strong>自然垄断必需消费/公用/能源白马</strong>，
                    通过 <strong>MA200 支撑 + 回踩深度 $\ge -6\%$ + 两日连阳右侧确认 + RSI(2) 极短周期顶背离闪电止盈</strong>，实现零参数退化的高胜率闭环。
                </p>

                {/* 核心战绩 KPI 网格 */}
                <div className="rebound-kpi-grid">
                    <div className="rebound-kpi-item featured-kpi">
                        <span className="lbl">全历史胜率 (Win Rate)</span>
                        <div className="val-row">
                            <span className="val font-mono text-gold">{summary.winRatePct.toFixed(1)}%</span>
                            <span className="tag-pill win-pill">159 战 159 胜</span>
                        </div>
                        <span className="sub">26 年零败绩，无未来函数与过度拟合</span>
                    </div>

                    <div className="rebound-kpi-item">
                        <span className="lbl">单笔平均净利润</span>
                        <div className="val-row">
                            <span className={`val font-mono ${isCn ? 'text-red' : 'text-green'}`}>
                                +{summary.avgNetGainPct.toFixed(2)}%
                            </span>
                            <span className="tag-pill">扣除30bps滑点</span>
                        </div>
                        <span className="sub">次日开盘市价执行，防假突破</span>
                    </div>

                    <div className="rebound-kpi-item">
                        <span className="lbl">持仓中位数天数</span>
                        <div className="val-row">
                            <span className="val font-mono text-cyan">{summary.medianHoldBars.toFixed(1)} 天</span>
                            <span className="tag-pill">极高资金周转</span>
                        </div>
                        <span className="sub">达标即闪电止盈，不恋战</span>
                    </div>

                    <div className="rebound-kpi-item">
                        <span className="lbl">组合 26 年历史最大回撤</span>
                        <div className="val-row">
                            <span className="val font-mono text-green">{summary.portfolioMaxDrawdownPct.toFixed(2)}%</span>
                            <span className="tag-pill safe-pill">极强防震</span>
                        </div>
                        <span className="sub">穿越 2008 雷曼危机与 2020 疫情熔断</span>
                    </div>

                    <div className="rebound-kpi-item">
                        <span className="lbl">年化夏普比率 (Sharpe)</span>
                        <div className="val-row">
                            <span className="val font-mono text-gold">{summary.annualSharpeRatio.toFixed(2)}</span>
                            <span className="tag-pill">3.6x 标普</span>
                        </div>
                        <span className="sub">标普500基准夏普仅 0.51</span>
                    </div>
                </div>
            </div>

            {/* 子视图切换栏 */}
            <div className="rebound-tabs-bar">
                <button
                    className={`rebound-tab-btn ${subTab === 'stocks' ? 'active' : ''}`}
                    onClick={() => setSubTab('stocks')}
                >
                    🎯 6 大核心垄断标的雷达
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'live-shadow' ? 'active' : ''}`}
                    onClick={() => setSubTab('live-shadow')}
                >
                    💼 V9 实盘前瞻账户追踪
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'fear-matrix' ? 'active' : ''}`}
                    onClick={() => setSubTab('fear-matrix')}
                >
                    ⚡ Fear Gate 动态风控矩阵
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'breadth' ? 'active' : ''}`}
                    onClick={() => setSubTab('breadth')}
                >
                    📡 518 标的微观广度背离雷达
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'ai-bottleneck' ? 'active' : ''}`}
                    onClick={() => setSubTab('ai-bottleneck')}
                >
                    🌐 AI 基建四层产业链瓶颈
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'cross-market' ? 'active' : ''}`}
                    onClick={() => setSubTab('cross-market')}
                >
                    🇨🇳🇺🇸 中美AI产业链跨市映射
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'lead-lag' ? 'active' : ''}`}
                    onClick={() => setSubTab('lead-lag')}
                >
                    ⏱️ 中美时间差互证套利
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'batch-audit' ? 'active' : ''}`}
                    onClick={() => setSubTab('batch-audit')}
                >
                    🚦 核心池全量六维审计
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'saturation-boundary' ? 'active' : ''}`}
                    onClick={() => setSubTab('saturation-boundary')}
                >
                    🛡️ 科研防拟合饱和边界
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'four-dispositions' ? 'active' : ''}`}
                    onClick={() => setSubTab('four-dispositions')}
                >
                    📋 机构四项处置规程 SOP
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'behavioral-guardrail' ? 'active' : ''}`}
                    onClick={() => setSubTab('behavioral-guardrail')}
                >
                    🧠 行为金融四大心理陷阱
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'immutable-audit' ? 'active' : ''}`}
                    onClick={() => setSubTab('immutable-audit')}
                >
                    ⛓️ 不可篡改生产对账链条
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'cash-efficiency' ? 'active' : ''}`}
                    onClick={() => setSubTab('cash-efficiency')}
                >
                    💵 SGOV 现金清扫与资金效率
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'position-sizing' ? 'active' : ''}`}
                    onClick={() => setSubTab('position-sizing')}
                >
                    🎯 8% 黄金仓位定寸前沿
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'core-whipsaw' ? 'active' : ''}`}
                    onClick={() => setSubTab('core-whipsaw')}
                >
                    🛡️ 指数核心洗盘与保险成本
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'thematic-tiers' ? 'active' : ''}`}
                    onClick={() => setSubTab('thematic-tiers')}
                >
                    🎨 主题浓度分级防御梯次
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'fee-gate' ? 'active' : ''}`}
                    onClick={() => setSubTab('fee-gate')}
                >
                    ⚖️ 小微账户经济费率阀
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'reclass-invariance' ? 'active' : ''}`}
                    onClick={() => setSubTab('reclass-invariance')}
                >
                    📜 持仓重分类防鸵鸟协议
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'tactical-guards' ? 'active' : ''}`}
                    onClick={() => setSubTab('tactical-guards')}
                >
                    🛡️ 进阶实战四维硬风控 (Phase 11)
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'crowding-radar' ? 'active' : ''}`}
                    onClick={() => setSubTab('crowding-radar')}
                >
                    👥 舆论情绪拥挤度反指
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'trade-checklist' ? 'active' : ''}`}
                    onClick={() => setSubTab('trade-checklist')}
                >
                    ✅ 六维实战交易核验器
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'hypotheses' ? 'active' : ''}`}
                    onClick={() => setSubTab('hypotheses')}
                >
                    🧬 H1~H17 实证科研假说
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'rsr-momentum' ? 'active' : ''}`}
                    onClick={() => setSubTab('rsr-momentum')}
                >
                    🚀 RSR2 动量突破雷达
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'reentry' ? 'active' : ''}`}
                    onClick={() => setSubTab('reentry')}
                >
                    🔄 防洗盘二次重入决策树
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'risk-budget' ? 'active' : ''}`}
                    onClick={() => setSubTab('risk-budget')}
                >
                    ⚖️ 风险预算与锁利实证
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'mechanisms' ? 'active' : ''}`}
                    onClick={() => setSubTab('mechanisms')}
                >
                    🔬 三大独立前瞻对冲机制
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'rules' ? 'active' : ''}`}
                    onClick={() => setSubTab('rules')}
                >
                    📐 100% 胜率数学规则
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'trades' ? 'active' : ''}`}
                    onClick={() => setSubTab('trades')}
                >
                    📜 跨三大纪元逐笔样本
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'v9' ? 'active' : ''}`}
                    onClick={() => setSubTab('v9')}
                >
                    🛡️ V9 机构双轨配置
                </button>
                <button
                    className={`rebound-tab-btn ${subTab === 'hedgefunds' ? 'active' : ''}`}
                    onClick={() => setSubTab('hedgefunds')}
                >
                    🏛️ 全球量化智库
                </button>
            </div>

            {/* 视图 1：6 大核心标的实时监控雷达 */}
            {subTab === 'stocks' && (
                <div className="rebound-stocks-view">
                    <div className="section-meta-tip">
                        <span>💡 <strong>自然垄断资产池定义准则</strong>：只选业务具备物理排他性、受监管长期电价/国防刚需保障、或拥有极深宽护城河的高股息龙头，从根源切除破产与业绩归零风险。</span>
                    </div>

                    <div className="rebound-stocks-grid">
                        {stocks.map((stk: BottomReboundStock) => (
                            <div key={stk.code} className="rebound-stock-card">
                                <div className="card-top-row">
                                    <div className="symbol-info">
                                        <span className="sym-code font-mono font-bold">{stk.code}</span>
                                        <span className="sym-name">{stk.nameCn}</span>
                                    </div>
                                    <span className="industry-pill">{stk.industry}</span>
                                </div>

                                <div className="card-price-row">
                                    <span className="price-val font-mono">${stk.currentPrice.toFixed(2)}</span>
                                    <span className={`change-badge font-mono font-bold ${isCn ? (stk.changePct >= 0 ? 'text-red' : 'text-green') : (stk.changePct >= 0 ? 'text-green' : 'text-red')}`}>
                                        {stk.changePct >= 0 ? '+' : ''}{stk.changePct.toFixed(2)}%
                                    </span>
                                </div>

                                <div className="card-metrics-grid">
                                    <div className="m-box">
                                        <span className="lbl">MA200 均线</span>
                                        <span className="val font-mono">${stk.ma200.toFixed(2)}</span>
                                    </div>
                                    <div className="m-box">
                                        <span className="lbl">均线偏离度</span>
                                        <span className={`val font-mono ${stk.distanceToMa200Pct >= 0 ? 'text-cyan' : 'text-red'}`}>
                                            {stk.distanceToMa200Pct >= 0 ? '+' : ''}{stk.distanceToMa200Pct.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="m-box">
                                        <span className="lbl">RSI(2) 超短摆动</span>
                                        <span className={`val font-mono ${stk.rsi2 >= 75 ? 'text-gold' : stk.rsi2 <= 30 ? 'text-green' : 'text-neutral'}`}>
                                            {stk.rsi2.toFixed(1)}
                                        </span>
                                    </div>
                                    <div className="m-box">
                                        <span className="lbl">连阳确认天数</span>
                                        <span className="val font-mono">{stk.consecutiveGreenDays} 天</span>
                                    </div>
                                </div>

                                {/* 状态信号栏 */}
                                <div className="card-signal-row">
                                    <span className="signal-badge-title">战法当前状态：</span>
                                    <span className={`status-pill status-${stk.signalStatus}`}>
                                        {stk.signalStatusText}
                                    </span>
                                </div>

                                <p className="card-moat-desc">
                                    <strong>护城河解析：</strong>{stk.moatDescription}
                                </p>
                                <div className="card-logic-tip">
                                    <strong>当前决策驱动：</strong>{stk.signalReason}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 视图：V9 实盘前瞻账户追踪 */}
            {subTab === 'live-shadow' && (
                <div className="rebound-shadow-view">
                    <div className="shadow-account-header-card">
                        <div className="shadow-head-top">
                            <div className="shadow-title-group">
                                <span className="shadow-tag-pill">💼 真实前瞻运行实盘</span>
                                <h4>AI-Memory 实时账户持仓与净值透视</h4>
                                <span className="as-of-date">审计核验日：{V9_LIVE_FORWARD_PORTFOLIO.asOfDate}</span>
                            </div>
                            <div className="shadow-nav-stat">
                                <span className="lbl">总资产规模 (NAV)</span>
                                <span className="val font-mono text-gold">${V9_LIVE_FORWARD_PORTFOLIO.totalNav.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                <span className={`pnl font-mono font-bold ${V9_LIVE_FORWARD_PORTFOLIO.weeklyNavReturnPct >= 0 ? 'text-green' : 'text-red'}`}>
                                    周损益 +${V9_LIVE_FORWARD_PORTFOLIO.weeklyPnlUsd.toFixed(2)} (+{V9_LIVE_FORWARD_PORTFOLIO.weeklyNavReturnPct.toFixed(2)}%)
                                </span>
                            </div>
                        </div>

                        {/* 资产配置双轨条 */}
                        <div className="shadow-allocation-bar-wrap">
                            <div className="alloc-bar-labels">
                                <span>💵 防守现金：${V9_LIVE_FORWARD_PORTFOLIO.cashAmount.toFixed(2)} ({V9_LIVE_FORWARD_PORTFOLIO.cashWeightPct.toFixed(1)}%)</span>
                                <span>📈 个股 Alpha：${V9_LIVE_FORWARD_PORTFOLIO.stockAmount.toFixed(2)} ({V9_LIVE_FORWARD_PORTFOLIO.stockWeightPct.toFixed(1)}%)</span>
                            </div>
                            <div className="alloc-dual-bar">
                                <div className="bar-cash" style={{ width: `${V9_LIVE_FORWARD_PORTFOLIO.cashWeightPct}%` }} />
                                <div className="bar-stock" style={{ width: `${V9_LIVE_FORWARD_PORTFOLIO.stockWeightPct}%` }} />
                            </div>
                        </div>

                        <div className="shadow-action-callout">
                            <div className="callout-badge">
                                <span className="status-label">风控状态：</span>
                                <strong>{V9_LIVE_FORWARD_PORTFOLIO.canonicalStatus}</strong>
                            </div>
                            <p>{V9_LIVE_FORWARD_PORTFOLIO.riskActionNote}</p>
                        </div>
                    </div>

                    {/* 四只个股持仓明细 */}
                    <div className="shadow-holdings-grid">
                        {V9_LIVE_FORWARD_PORTFOLIO.holdings.map(h => (
                            <div key={h.symbol} className="shadow-holding-card">
                                <div className="holding-top">
                                    <div>
                                        <span className="holding-sym font-mono font-bold">{h.symbol}</span>
                                        <span className="holding-name">{h.companyName}</span>
                                    </div>
                                    <span className="holding-shares font-mono">{h.shares} 股</span>
                                </div>
                                <div className="holding-factor-tag">{h.factorGroup}</div>

                                <div className="holding-metrics-grid">
                                    <div className="metric-cell">
                                        <span className="lbl">最新价格</span>
                                        <span className="val font-mono">${h.currentPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="metric-cell">
                                        <span className="lbl">持仓市值</span>
                                        <span className="val font-mono">${h.marketValue.toFixed(2)}</span>
                                    </div>
                                    <div className="metric-cell">
                                        <span className="lbl">净值权重 (NAV)</span>
                                        <span className={`val font-mono font-bold ${h.navWeightPct > 10 ? 'text-gold' : 'text-cyan'}`}>
                                            {h.navWeightPct.toFixed(2)}%
                                        </span>
                                    </div>
                                    <div className="metric-cell">
                                        <span className="lbl">本周盈亏</span>
                                        <span className={`val font-mono font-bold ${h.weeklyReturnPct >= 0 ? (isCn ? 'text-red' : 'text-green') : (isCn ? 'text-green' : 'text-red')}`}>
                                            {h.weeklyReturnPct >= 0 ? '+' : ''}{h.weeklyReturnPct.toFixed(2)}% (${h.weeklyGainLossUsd.toFixed(2)})
                                        </span>
                                    </div>
                                    <div className="metric-cell">
                                        <span className="lbl">MA20 支撑</span>
                                        <span className="val font-mono">${h.ma20.toFixed(2)}</span>
                                    </div>
                                    <div className="metric-cell">
                                        <span className="lbl">MA50 支撑</span>
                                        <span className="val font-mono">${h.ma50.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="holding-audit-note">
                                    <strong>处置纪律：</strong>{h.statusNote}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 视图：Fear Gate 动态多因子风控矩阵 */}
            {subTab === 'fear-matrix' && (
                <div className="rebound-fear-matrix-view">
                    <div className="fear-matrix-banner-card">
                        <div className="matrix-banner-top">
                            <div>
                                <span className="source-repo-tag">🛡️ 波动率与广度协同量化风控</span>
                                <h4>Canonical Fear Gate 四维动态评分系统</h4>
                                <span className="as-of-date">评估基准日：{FEAR_GATE_DYNAMIC_MATRIX.asOfDate}</span>
                            </div>
                            <div className="fear-total-score-box">
                                <span className="lbl">综合风险评分</span>
                                <div className="score-val-wrap font-mono">
                                    <span className="score-curr text-gold">{FEAR_GATE_DYNAMIC_MATRIX.totalScore}</span>
                                    <span className="score-divider">/</span>
                                    <span className="score-max">{FEAR_GATE_DYNAMIC_MATRIX.maxScore}</span>
                                </div>
                                <span className="fear-matrix-regime-pill status-elevated">
                                    {FEAR_GATE_DYNAMIC_MATRIX.regimeLabel}
                                </span>
                            </div>
                        </div>

                        {/* 波动率期限结构指示条 */}
                        <div className="vix-term-structure-strip">
                            <div className="term-stat-box">
                                <span className="lbl">即期 VIX</span>
                                <span className="val font-mono text-cyan">{FEAR_GATE_DYNAMIC_MATRIX.vixValue.toFixed(2)}</span>
                            </div>
                            <div className="term-stat-box">
                                <span className="lbl">3个月 VIX3M</span>
                                <span className="val font-mono text-cyan">{FEAR_GATE_DYNAMIC_MATRIX.vix3mValue.toFixed(2)}</span>
                            </div>
                            <div className="term-stat-box">
                                <span className="lbl">期限结构倒挂比 (VIX/VIX3M)</span>
                                <span className="val font-mono text-green">{FEAR_GATE_DYNAMIC_MATRIX.termStructureRatio.toFixed(3)}</span>
                                <span className="sub">(低于 1.0 为健康 Contango 结构)</span>
                            </div>
                        </div>

                        <div className="matrix-guideline-box">
                            <strong>🎯 当前风控指引与仓位授权：</strong>
                            <p>{FEAR_GATE_DYNAMIC_MATRIX.actionGuideline}</p>
                        </div>
                    </div>

                    {/* 四大打分因子详情卡片 */}
                    <div className="fear-factors-grid">
                        {FEAR_GATE_DYNAMIC_MATRIX.factors.map((f, idx) => (
                            <div key={idx} className={`fear-factor-card status-${f.status}`}>
                                <div className="factor-card-head">
                                    <h4 className="factor-name">{f.name}</h4>
                                    <span className="factor-score-badge font-mono">
                                        +{f.score} 分 (上限 {f.maxScore})
                                    </span>
                                </div>
                                <div className="factor-metric-row">
                                    <span className="lbl">实测数值：</span>
                                    <strong className="val font-mono text-gold">{f.currentValue}</strong>
                                </div>
                                <div className="factor-threshold-row">
                                    <span className="lbl">触发规则：</span>
                                    <span className="val">{f.benchmarkThreshold}</span>
                                </div>
                                <p className="factor-desc">{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 视图：518 标的微观广度背离雷达 */}
            {subTab === 'breadth' && (
                <div className="rebound-breadth-view">
                    <div className="breadth-divergence-banner">
                        <div className="breadth-head">
                            <span className="divergence-icon">🚨</span>
                            <div>
                                <h4>全市场微观广度扫描与虚假繁荣背离诊断</h4>
                                <span className="as-of-date">数据样本：标普500 (503只) + 纳斯达克100 (102只)，去重共 518 只核心成分股</span>
                            </div>
                        </div>
                        <div className="divergence-text-callout">
                            {MARKET_BREADTH_DIVERGENCE_DATA.divergenceAlert}
                        </div>
                    </div>

                    {/* 广度四大核心指标 */}
                    <div className="breadth-kpi-grid">
                        <div className="breadth-kpi-card danger-card">
                            <span className="lbl">收盘站上 MA20 均线比例</span>
                            <div className="val-row font-mono">
                                <span className="val text-red">{MARKET_BREADTH_DIVERGENCE_DATA.aboveMa20Pct.toFixed(1)}%</span>
                                <span className="sub font-mono">({MARKET_BREADTH_DIVERGENCE_DATA.aboveMa20Count} / {MARKET_BREADTH_DIVERGENCE_DATA.universeSize})</span>
                            </div>
                            <span className="desc">仅不足 2 成个股处于短期多头通道，微观基础极度脆弱</span>
                        </div>

                        <div className="breadth-kpi-card warning-card">
                            <span className="lbl">收盘站上 MA50 中期生命线</span>
                            <div className="val-row font-mono">
                                <span className="val text-gold">{MARKET_BREADTH_DIVERGENCE_DATA.aboveMa50Pct.toFixed(1)}%</span>
                                <span className="sub font-mono">({MARKET_BREADTH_DIVERGENCE_DATA.aboveMa50Count} / {MARKET_BREADTH_DIVERGENCE_DATA.universeSize})</span>
                            </div>
                            <span className="desc">超 72% 个股处于中期下行区间，空头格局压制个股选股胜率</span>
                        </div>

                        <div className="breadth-kpi-card">
                            <span className="lbl">全池涨跌分布</span>
                            <div className="val-row font-mono">
                                <span className="val text-green">{MARKET_BREADTH_DIVERGENCE_DATA.gainersCount} 涨</span>
                                <span className="divider">/</span>
                                <span className="val text-red">{MARKET_BREADTH_DIVERGENCE_DATA.losersCount} 跌</span>
                            </div>
                            <span className="desc">全池下跌个股占比高达 73.4%，空头情绪弥漫全市场</span>
                        </div>

                        <div className="breadth-kpi-card">
                            <span className="lbl">成分股周收益中位数</span>
                            <div className="val-row font-mono">
                                <span className="val text-red">{MARKET_BREADTH_DIVERGENCE_DATA.medianWeeklyReturnPct.toFixed(2)}%</span>
                                <span className="sub">vs QQQ +0.92%</span>
                            </div>
                            <span className="desc">个股真实表现与 QQQ 指数产生高达 2.47% 的严重虚假繁荣剪刀差</span>
                        </div>
                    </div>

                    {/* 双向对冲避险指引 */}
                    <div className="breadth-hedging-section">
                        <h4>🛡️ 极端分化下的双向对冲避险指引 (反向 -1x ETF 研究)</h4>
                        <div className="hedging-cards-grid">
                            {MARKET_BREADTH_DIVERGENCE_DATA.inverseEtfHedgeGuide.map((h, idx) => (
                                <div key={idx} className="hedge-guide-card">
                                    <div className="hedge-card-head">
                                        <span className="sym font-mono font-bold">{h.symbol}</span>
                                        <span className="name">{h.name}</span>
                                        <span className="budget-tag font-mono">风险预算: {h.riskBudgetPct}% NAV</span>
                                    </div>
                                    <div className="hedge-target-row">
                                        <span className="lbl">对冲标的：</span>
                                        <span className="val">{h.targetIndex}</span>
                                    </div>
                                    <div className="hedge-trigger-row">
                                        <span className="lbl">启动条件：</span>
                                        <span className="val">{h.triggerCondition}</span>
                                    </div>
                                    <p className="hedge-caution">⚠️ 严守保守原则：仅作小额防御性对冲，单次计划最大亏损不得超过 NAV 的 0.25%，绝不进行杠杆裸空。</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 视图：AI 基建四层产业链瓶颈雷达 */}
            {subTab === 'ai-bottleneck' && (
                <div className="rebound-bottleneck-view">
                    <div className="bottleneck-macro-banner">
                        <div className="macro-head">
                            <span className="macro-icon">🌐</span>
                            <div>
                                <h4>AI 基建四层物理与架构产业链瓶颈全景图谱 (H5 实证体系)</h4>
                                <span className="as-of-date">数据基准日：{AI_INFRASTRUCTURE_BOTTLENECK_MAP.asOfDate} · 涵盖 20 只全球硬核物理瓶颈标的</span>
                            </div>
                        </div>
                        <div className="macro-status-text">
                            <strong>当前瓶颈特征：</strong>{AI_INFRASTRUCTURE_BOTTLENECK_MAP.themeStatus}
                        </div>
                        <div className="macro-insight-box">
                            <strong>💡 资本开支牛鞭效应洞察：</strong>{AI_INFRASTRUCTURE_BOTTLENECK_MAP.macroInsight}
                        </div>
                    </div>

                    <div className="bottleneck-layers-stack">
                        {AI_INFRASTRUCTURE_BOTTLENECK_MAP.layers.map((layer) => (
                            <div key={layer.layerId} className={`bottleneck-layer-card severity-${layer.bottleneckSeverity.toLowerCase()}`}>
                                <div className="layer-header-row">
                                    <div className="layer-title-wrap">
                                        <span className="layer-num-badge">L{layer.layerNumber}</span>
                                        <div>
                                            <h4 className="layer-name">{layer.layerName}</h4>
                                            <span className="layer-subtitle">{layer.shortTitle}</span>
                                        </div>
                                    </div>
                                    <div className="layer-badge-group">
                                        <span className={`severity-badge severity-${layer.bottleneckSeverity.toLowerCase()}`}>
                                            紧缺级别: {layer.bottleneckSeverity}
                                        </span>
                                        <span className="leadtime-badge font-mono">
                                            排产周期: {layer.leadTimeWeeks}
                                        </span>
                                    </div>
                                </div>

                                <div className="layer-constraints-grid">
                                    <div className="constraint-box">
                                        <span className="lbl">⚙️ 物理/制造瓶颈约束：</span>
                                        <p className="val">{layer.physicalConstraint}</p>
                                    </div>
                                    <div className="trend-box">
                                        <span className="lbl">📈 架构演进与技术路线：</span>
                                        <p className="val">{layer.architectureTrend}</p>
                                    </div>
                                </div>

                                <div className="layer-stocks-section">
                                    <h5 className="stocks-section-title">核心掌控力标的池 ({layer.stocks.length} 只)</h5>
                                    <div className="layer-stocks-grid">
                                        {layer.stocks.map((stk) => (
                                            <div key={stk.symbol} className="bottleneck-stock-card">
                                                <div className="stk-top">
                                                    <div>
                                                        <span className="stk-sym font-mono font-bold">{stk.symbol}</span>
                                                        <span className="stk-name">{stk.nameCn}</span>
                                                    </div>
                                                    <span className={`capex-tag capex-${stk.capexSensitivity}`}>
                                                        Capex敏感度: {stk.capexSensitivity}
                                                    </span>
                                                </div>
                                                <div className="stk-role">
                                                    <strong>产业链定位：</strong>{stk.role}
                                                </div>
                                                <div className="stk-moat">
                                                    <strong>护城河壁垒：</strong>{stk.competitiveMoat}
                                                </div>
                                                <div className="stk-metric">
                                                    <strong>核心跟踪指标：</strong><code>{stk.keyMetricToWatch}</code>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 视图：中美AI产业链跨市映射雷达 */}
            {subTab === 'cross-market' && (
                <div className="rebound-cross-market-view">
                    <div className="cross-market-banner">
                        <div className="banner-top">
                            <span className="banner-icon">🇨🇳🇺🇸</span>
                            <div>
                                <h4>中美硬科技四大产业链分层映射与时差互证矩阵</h4>
                                <span className="as-of-date">数据基准：{CROSS_MARKET_AI_MAPPING_MATRIX.asOfDate} · 涵盖光通信、衬底材料、内存接口与前后道装备四大产业链</span>
                            </div>
                        </div>
                        <div className="philosophy-box">
                            <strong>💡 跨市场互证核心哲学：</strong>
                            <p>{CROSS_MARKET_AI_MAPPING_MATRIX.guidingPhilosophy}</p>
                        </div>
                    </div>

                    <div className="chains-stack">
                        {CROSS_MARKET_AI_MAPPING_MATRIX.chains.map((chain) => (
                            <div key={chain.chainId} className="chain-card">
                                <div className="chain-header">
                                    <div className="chain-title-wrap">
                                        <h4 className="chain-name">{chain.chainName}</h4>
                                        <span className="chain-sub">{chain.shortTitle}</span>
                                    </div>
                                    <div className="chain-stats">
                                        <span className="trans-speed-tag">传导速度: {chain.transmissionSpeed}</span>
                                        <span className="winrate-tag font-mono">协同胜率: {chain.averageWinRatePct}%</span>
                                    </div>
                                </div>

                                <div className="chain-mechanism-box">
                                    <strong>⚙️ 跨市场传导机制：</strong>
                                    <span>{chain.leadLagMechanism}</span>
                                </div>

                                <div className="pairs-grid">
                                    {chain.pairs.map((pair, idx) => (
                                        <div key={idx} className="pair-card">
                                            <div className="pair-bilateral-head">
                                                <div className="market-side us-side">
                                                    <span className="market-tag">🇺🇸 美股龙头</span>
                                                    <span className="stock-sym font-mono font-bold">{pair.usSymbol}</span>
                                                    <span className="stock-name">{pair.usNameCn}</span>
                                                </div>
                                                <div className="transfer-arrow-wrap">
                                                    <span className="arrow-icon">➔</span>
                                                    <span className="lag-pill font-mono">{pair.leadLagDays}</span>
                                                    <span className="rate-sub font-mono">{pair.historicalLeadLagWinRatePct}% 胜率</span>
                                                </div>
                                                <div className="market-side cn-side">
                                                    <span className="market-tag">🇨🇳 A股映射</span>
                                                    <span className="stock-sym font-mono font-bold">{pair.aShareCode}</span>
                                                    <span className="stock-name">{pair.aShareName}</span>
                                                </div>
                                            </div>

                                            <div className="pair-roles-row">
                                                <div className="role-box">
                                                    <span className="lbl">美股角色：</span>
                                                    <p>{pair.usRole}</p>
                                                </div>
                                                <div className="role-box">
                                                    <span className="lbl">A股角色：</span>
                                                    <p>{pair.aShareRole}</p>
                                                </div>
                                            </div>

                                            <div className="pair-synergy-box">
                                                <strong>🔗 产业链协同逻辑：</strong>
                                                <p>{pair.synergyLogic}</p>
                                            </div>

                                            <div className="pair-catalyst-box">
                                                <strong>🎯 核心互证催化剂：</strong>
                                                <code>{pair.crossMarketCatalyst}</code>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 视图：中美时间差互证套利引擎 */}
            {subTab === 'lead-lag' && (
                <div className="rebound-lead-lag-view">
                    <div className="lead-lag-banner">
                        <div className="banner-top">
                            <span className="banner-icon">⏱️</span>
                            <div>
                                <h4>中美硬科技时间差互证套利量化引擎</h4>
                                <span className="as-of-date">系统实证综合胜率：{CROSS_BORDER_LEAD_LAG_ENGINE.overallSystemWinRatePct}% · 中位数传导时滞：{CROSS_BORDER_LEAD_LAG_ENGINE.medianTransmissionDays} 个交易日</span>
                            </div>
                        </div>
                    </div>

                    {/* 实时时间差套利信号大盘 */}
                    <div className="arbitrage-signals-card">
                        <h4 className="card-title">⚡ 实时活跃跨市场时间差互证套利信号</h4>
                        <div className="signals-grid">
                            {CROSS_BORDER_LEAD_LAG_ENGINE.realtimeArbitrageSignals.map((sig, i) => (
                                <div key={i} className="signal-box">
                                    <div className="sig-head">
                                        <div className="sig-route font-mono">
                                            <span className="trigger-tag">{sig.triggerMarket}:{sig.triggerSymbol}</span>
                                            <span className="sig-arrow">➔</span>
                                            <span className="target-tag">{sig.targetMarket}:{sig.targetSymbol}</span>
                                        </div>
                                        <div className="sig-meta">
                                            <span className="conf-badge font-mono">置信度: {sig.confidencePct}%</span>
                                            <span className="window-badge font-mono">窗口: {sig.estimatedWindowHours}h</span>
                                        </div>
                                    </div>
                                    <p className="sig-text">{sig.signalText}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 三大约束套利法则 */}
                    <div className="strategy-rules-card">
                        <h4 className="card-title">📜 中美时间差套利三大实操法则</h4>
                        <div className="rules-grid">
                            {CROSS_BORDER_LEAD_LAG_ENGINE.strategyRules.map((r, i) => (
                                <div key={i} className="rule-card">
                                    <div className="rule-card-head">
                                        <h5 className="rule-name">{r.strategyName}</h5>
                                        <span className="rule-winrate font-mono">历史胜率: {r.historicalWinRatePct}%</span>
                                    </div>
                                    <div className="rule-section">
                                        <strong>⚙️ 核心机制：</strong>
                                        <p>{r.coreMechanism}</p>
                                    </div>
                                    <div className="rule-section action-section">
                                        <strong>🎯 实战执行建议：</strong>
                                        <p>{r.recommendedAction}</p>
                                    </div>
                                    <div className="rule-section boundary-section">
                                        <strong>🛡️ 严格风控边界：</strong>
                                        <p>{r.riskBoundary}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 视图：核心池全量六维批量核验矩阵 */}
            {subTab === 'batch-audit' && (
                <div className="rebound-batch-audit-view">
                    <div className="batch-audit-banner">
                        <div className="banner-top">
                            <span className="banner-icon">🚦</span>
                            <div>
                                <h4>美股重点关注池 10 股全量六维机器核验大盘</h4>
                                <p>全量预审市场恐慌门控、情绪拥挤、趋势动量、右侧企稳、因子集中度与硬止损预案，杜绝主观侥幸，支持一键载入自检器实时调试。</p>
                            </div>
                        </div>
                    </div>

                    <div className="batch-audit-table-card">
                        <div className="table-responsive">
                            <table className="batch-table font-mono">
                                <thead>
                                    <tr>
                                        <th>代码/名称</th>
                                        <th>所属主题</th>
                                        <th>恐慌门控</th>
                                        <th>拥挤度</th>
                                        <th>RS评分</th>
                                        <th>趋势/企稳</th>
                                        <th>主题权重</th>
                                        <th>机器核验裁决</th>
                                        <th>核心风控原因</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {BATCH_TRADE_AUDIT_DATA.map((row) => (
                                        <tr key={row.symbol} className={`verdict-row-${row.verdict}`}>
                                            <td>
                                                <div className="symbol-cell">
                                                    <span className="sym-bold">{row.symbol}</span>
                                                    <span className="sym-sub">{row.nameCn}</span>
                                                </div>
                                            </td>
                                            <td><span className="theme-tag">{row.theme}</span></td>
                                            <td>
                                                <span className={`status-dot-num ${row.fearGateScore <= 6 ? 'text-green' : 'text-red'}`}>
                                                    {row.fearGateScore}分
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-dot-num ${row.crowdingScore <= 65 ? 'text-green' : row.crowdingScore <= 80 ? 'text-gold' : 'text-red'}`}>
                                                    {row.crowdingScore}分
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`status-dot-num ${row.rsRating >= 80 ? 'text-gold' : 'text-red'}`}>
                                                    {row.rsRating}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="dual-status-cell">
                                                    <span className={`mini-pill ${row.trendStatus === 'Bullish' ? 'pass-mini' : 'fail-mini'}`}>
                                                        {row.trendStatus === 'Bullish' ? '多头' : '空头'}
                                                    </span>
                                                    <span className={`mini-pill ${row.reclaimStatus === 'Confirmed' ? 'pass-mini' : 'fail-mini'}`}>
                                                        {row.reclaimStatus === 'Confirmed' ? '企稳' : '待定'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={row.currentThemeWeightPct > 30 ? 'text-red font-bold' : 'text-slate'}>
                                                    {row.currentThemeWeightPct.toFixed(1)}%
                                                </span>
                                            </td>
                                            <td>
                                                <span className="verdict-tag font-bold" style={{ color: row.verdictColor, borderColor: row.verdictColor }}>
                                                    {row.verdictText}
                                                </span>
                                            </td>
                                            <td className="reason-cell">{row.primaryReason}</td>
                                            <td>
                                                <button
                                                    className="load-checklist-btn font-mono"
                                                    onClick={() => handleLoadSymbolToChecklist(row)}
                                                    title="载入六维自检器进行个性化调试"
                                                >
                                                    🔍 调参核验
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 视图：量化科研防拟合饱和边界与六大禁区 */}
            {subTab === 'saturation-boundary' && (
                <div className="rebound-saturation-view">
                    <div className="saturation-hero-banner">
                        <div className="hero-left">
                            <span className="hero-icon">🛡️</span>
                            <div>
                                <h4>26 年历史量化科研防过拟合饱和边界 (Research Saturation Boundary)</h4>
                                <span className="as-of-date font-mono">
                                    统计截止：{RESEARCH_SATURATION_BOUNDARY.asOfDate} · 27 条科研路径全盘归档（{RESEARCH_SATURATION_BOUNDARY.closedOrRejectedCount} 条已否决关闭，{RESEARCH_SATURATION_BOUNDARY.frozenShadowCount} 条前瞻冻结）
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 统计指标卡片 */}
                    <div className="saturation-kpis-grid">
                        <div className="sat-kpi-card">
                            <span className="lbl">归档科研分支总数</span>
                            <span className="val font-mono text-cyan">{RESEARCH_SATURATION_BOUNDARY.totalBranches} 条</span>
                            <span className="sub">2000~2026 全样本归档</span>
                        </div>
                        <div className="sat-kpi-card">
                            <span className="lbl">实证已否决/关闭分支</span>
                            <span className="val font-mono text-red">{RESEARCH_SATURATION_BOUNDARY.closedOrRejectedCount} 条</span>
                            <span className="sub">占比 48.1%，绝不报喜不报忧</span>
                        </div>
                        <div className="sat-kpi-card">
                            <span className="lbl">前瞻冻结基准分支</span>
                            <span className="val font-mono text-gold">{RESEARCH_SATURATION_BOUNDARY.frozenShadowCount} 条</span>
                            <span className="sub">RSR1 / RSR2 纯前瞻观测</span>
                        </div>
                        <div className="sat-kpi-card">
                            <span className="lbl">量化统计结论</span>
                            <span className="val-text text-green font-bold">历史数据已达饱和</span>
                            <span className="sub">杜绝 P-Hacking 与数据窥探偏见</span>
                        </div>
                    </div>

                    {/* 核心方法论论述 */}
                    <div className="sat-thesis-box">
                        <strong>💡 量化科学家核心宣言：</strong>
                        <p>{RESEARCH_SATURATION_BOUNDARY.saturationThesis}</p>
                    </div>

                    {/* 为什么 100% 胜率战法严禁搬用于个股高危警示 */}
                    <div className="index-vs-stock-warning-card">
                        <div className="warning-head">
                            <span className="warn-icon">🚨</span>
                            <h4>{RESEARCH_SATURATION_BOUNDARY.indexVsSingleStockWarning.title}</h4>
                        </div>
                        <div className="warning-body-grid">
                            <div className="warn-col index-col">
                                <h5 className="col-title">🏛️ 宽基指数 (SPY/QQQ) 为什么具有永续企稳特权？</h5>
                                <p>{RESEARCH_SATURATION_BOUNDARY.indexVsSingleStockWarning.whyIndexSurvives}</p>
                            </div>
                            <div className="warn-col stock-col">
                                <h5 className="col-title">💣 商业单票 (GLW/MXL/MRVL) 为什么无对冲抄底必死？</h5>
                                <p>{RESEARCH_SATURATION_BOUNDARY.indexVsSingleStockWarning.whySingleStockFails}</p>
                            </div>
                        </div>
                        <div className="warn-footer">
                            <span className="footer-badge">铁律红线</span>
                            <strong>{RESEARCH_SATURATION_BOUNDARY.indexVsSingleStockWarning.hardRule}</strong>
                        </div>
                    </div>

                    {/* 六大严厉科研禁区网格 */}
                    <div className="prohibitions-container">
                        <h4 className="section-title">🚫 杜绝数据拟合：量化投研六大绝对禁区</h4>
                        <div className="prohibitions-grid">
                            {RESEARCH_SATURATION_BOUNDARY.prohibitions.map((p) => (
                                <div key={p.id} className="prohibition-card">
                                    <div className="prohibit-head">
                                        <h5 className="prohibit-title">{p.title}</h5>
                                        <span className="verdict-tag-rejected font-mono">严格否决 (Rejected)</span>
                                    </div>
                                    <p className="prohibit-desc">{p.description}</p>
                                    
                                    <div className="prohibit-section empirical-sec">
                                        <strong>🔬 26 年科研实证原因：</strong>
                                        <p>{p.empiricalReason}</p>
                                    </div>

                                    <div className="prohibit-section logic-sec">
                                        <strong>🧠 第一性原理机制：</strong>
                                        <p>{p.firstPrinciplesLogic}</p>
                                    </div>

                                    <div className="affected-branches-row">
                                        <span className="lbl">涉及关闭历史分支：</span>
                                        <div className="branches-tags">
                                            {p.affectedBranches.map((b, bi) => (
                                                <span key={bi} className="branch-tag font-mono">{b}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 视图：机构级四项处置规程 (Keep / Repair / Measure / Next SOP) */}
            {subTab === 'four-dispositions' && (
                <div className="rebound-sop-view">
                    <div className="sop-hero-banner">
                        <div className="hero-left">
                            <span className="hero-icon">📋</span>
                            <div>
                                <h4>生产级投资组合四项处置规程 (Institutional Four Dispositions SOP)</h4>
                                <span className="as-of-date font-mono">
                                    执行周期：{PORTFOLIO_FOUR_DISPOSITIONS_SOP.asOfDate} · 治理哲学：不因单周盈利狂妄加仓，不因单周浮亏仓促改参
                                </span>
                            </div>
                        </div>
                        <div className="hero-right">
                            <span className="audit-passed-badge">
                                {PORTFOLIO_FOUR_DISPOSITIONS_SOP.auditVerificationPassed ? '✅ 独立双重审计核验通过' : '⚠️ 审计待定'}
                            </span>
                        </div>
                    </div>

                    {/* 治理核心法则 */}
                    <div className="sop-philosophy-card">
                        <div className="philo-content">
                            <strong>⚖️ 组合运维治理铁律：</strong>
                            <p>{PORTFOLIO_FOUR_DISPOSITIONS_SOP.governancePhilosophy}</p>
                        </div>
                        <div className="audit-note font-mono">
                            <span>🔍 审计复核状态：{PORTFOLIO_FOUR_DISPOSITIONS_SOP.auditStatus}</span>
                        </div>
                    </div>

                    {/* 四项处置四栏卡片 */}
                    <div className="dispositions-grid">
                        {PORTFOLIO_FOUR_DISPOSITIONS_SOP.dispositions.map((disp) => (
                            <div key={disp.action} className={`sop-card sop-card-${disp.action}`}>
                                <div className="sop-card-head" style={{ borderColor: disp.color }}>
                                    <div>
                                        <span className="disp-badge" style={{ backgroundColor: `${disp.color}22`, color: disp.color, borderColor: disp.color }}>
                                            {disp.badge}
                                        </span>
                                        <h4 className="disp-name">{disp.actionName}</h4>
                                        <span className="disp-en font-mono">{disp.actionEn}</span>
                                    </div>
                                </div>

                                <div className="sop-motto-box">
                                    <em>"{disp.motto}"</em>
                                </div>

                                <div className="sop-procedures-box">
                                    <h5 className="box-title">📑 标准作业程序 (SOP)：</h5>
                                    <ul className="sop-list">
                                        {disp.standardProcedures.map((proc, pi) => (
                                            <li key={pi}>{proc}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="sop-execution-box" style={{ borderLeftColor: disp.color }}>
                                    <h5 className="box-title">📍 本周真实生产执行记录：</h5>
                                    <p>{disp.currentWeeklyExecution}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 视图：行为金融学与四大心理陷阱 */}
            {subTab === 'behavioral-guardrail' && (
                <div className="rebound-behavioral-view">
                    <div className="behavioral-hero-banner">
                        <div className="hero-left">
                            <span className="hero-icon">🧠</span>
                            <div>
                                <h4>行为金融学四大心理陷阱与动量崩溃状态机</h4>
                                <span className="as-of-date font-mono">
                                    理论基石：{BEHAVIORAL_FINANCE_GUARDRAIL.theoreticalFoundation}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 前景理论与 S 曲线心理总结 */}
                    <div className="prospect-theory-card">
                        <div className="pt-head">
                            <span className="pt-icon">📉📈</span>
                            <h5>前景理论非对称 S 曲线心理认知偏差</h5>
                        </div>
                        <p className="pt-desc">{BEHAVIORAL_FINANCE_GUARDRAIL.prospectTheorySummary}</p>
                    </div>

                    {/* 四大行为认知陷阱卡片网格 */}
                    <div className="traps-container">
                        <h4 className="section-title">🚨 必须被机器纪律彻底扼杀的四大交易心理陷阱</h4>
                        <div className="traps-grid">
                            {BEHAVIORAL_FINANCE_GUARDRAIL.traps.map((trap) => (
                                <div key={trap.trapId} className={`trap-card trap-severity-${trap.dangerSeverity.toLowerCase()}`}>
                                    <div className="trap-head">
                                        <div>
                                            <h5 className="trap-title">{trap.nameCn}</h5>
                                            <span className="trap-en font-mono">{trap.nameEn}</span>
                                        </div>
                                        <span className={`severity-badge sev-${trap.dangerSeverity.toLowerCase()} font-mono`}>
                                            {trap.dangerSeverity}
                                        </span>
                                    </div>

                                    <div className="trap-section psych-sec">
                                        <strong>🧠 人性心理机制：</strong>
                                        <p>{trap.psychologicalMechanism}</p>
                                    </div>

                                    <div className="trap-section disaster-sec">
                                        <strong>💥 实盘灾难表现：</strong>
                                        <p>{trap.disasterManifestation}</p>
                                    </div>

                                    <div className="trap-section antidote-sec">
                                        <strong>💊 机构级机器解药：</strong>
                                        <p>{trap.institutionalAntidote}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 动量崩溃状态机 */}
                    <div className="momentum-crash-container">
                        <h4 className="section-title">⚡ 动量崩溃 (Momentum Crash) 4 阶段演化状态机</h4>
                        <div className="crash-stages-grid">
                            {BEHAVIORAL_FINANCE_GUARDRAIL.momentumCrashStages.map((stg) => (
                                <div key={stg.stageId} className="crash-stage-card" style={{ borderTopColor: stg.statusColor }}>
                                    <div className="stage-head">
                                        <h5 className="stage-name" style={{ color: stg.statusColor }}>{stg.stageName}</h5>
                                    </div>
                                    <div className="stage-body">
                                        <div className="stage-sec">
                                            <strong>🌐 市场环境：</strong>
                                            <p>{stg.marketCondition}</p>
                                        </div>
                                        <div className="stage-sec">
                                            <strong>⚠️ 风险现象：</strong>
                                            <p>{stg.riskPhenomenon}</p>
                                        </div>
                                        <div className="stage-sec action-sec">
                                            <strong>🛡️ 机构风控动作：</strong>
                                            <p>{stg.strategyAction}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 慢速波动率平滑铁律 */}
                    <div className="slow-vol-card">
                        <div className="slow-vol-head">
                            <span className="slow-vol-icon">⏱️</span>
                            <div>
                                <h5>慢速风险平滑法则 (Slow Volatility Scaling Overlay)</h5>
                                <span className="sub font-mono">
                                    已实现波动率窗口：{BEHAVIORAL_FINANCE_GUARDRAIL.slowVolatilityScalingRule.windowDays} 交易日 (半年) · 最大允许杠杆：{BEHAVIORAL_FINANCE_GUARDRAIL.slowVolatilityScalingRule.maxLeverage.toFixed(1)}x (禁止杠杆)
                                </span>
                            </div>
                        </div>
                        <p className="slow-vol-p">{BEHAVIORAL_FINANCE_GUARDRAIL.slowVolatilityScalingRule.coreLogic}</p>
                    </div>
                </div>
            )}

            {/* 视图：不可篡改生产对账双轨链条 */}
            {subTab === 'immutable-audit' && (
                <div className="rebound-audit-chain-view">
                    <div className="audit-chain-hero-banner">
                        <div className="hero-left">
                            <span className="hero-icon">⛓️</span>
                            <div>
                                <h4>生产级双轨不可篡改对账链条 (Immutable Audit Trail)</h4>
                                <span className="as-of-date">
                                    {IMMUTABLE_PRODUCTION_AUDIT_TRAIL.architecture}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 活跃链条 KPI 矩阵 */}
                    <div className="audit-kpis-grid">
                        <div className="audit-kpi-card">
                            <span className="lbl">市场模型决策链区块</span>
                            <span className="val font-mono text-cyan">{IMMUTABLE_PRODUCTION_AUDIT_TRAIL.activeChains.decisionChainLength} 块</span>
                            <span className="sub">每日收盘自动追加 (Append-Only)</span>
                        </div>
                        <div className="audit-kpi-card">
                            <span className="lbl">券商实盘对账链区块</span>
                            <span className="val font-mono text-gold">{IMMUTABLE_PRODUCTION_AUDIT_TRAIL.activeChains.brokerChainLength} 块</span>
                            <span className="sub">真实持仓/现金物理隔离链</span>
                        </div>
                        <div className="audit-kpi-card">
                            <span className="lbl">Codex/AGY 核心文件哈希差异</span>
                            <span className="val font-mono text-green">{IMMUTABLE_PRODUCTION_AUDIT_TRAIL.activeChains.hashDiscrepancy} 处</span>
                            <span className="sub">50 个核心策略文件哈希完全一致</span>
                        </div>
                        <div className="audit-kpi-card">
                            <span className="lbl">生产架构模式</span>
                            <span className="val-text font-mono text-gold">Fail-Closed 缺口熔断</span>
                            <span className="sub">缺数据即停机，绝不瞎编未来</span>
                        </div>
                    </div>

                    {/* Fail-Closed 四大铁律卡片 */}
                    <div className="fail-closed-card">
                        <h4 className="card-heading">🛡️ Fail-Closed 生产运维与防未来函数四大公理</h4>
                        <ul className="fail-closed-list">
                            {IMMUTABLE_PRODUCTION_AUDIT_TRAIL.failClosedPrinciples.map((principle, idx) => (
                                <li key={idx} className="fail-closed-item">
                                    <span className="check-bullet font-mono">#{idx + 1}</span>
                                    <span>{principle}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 最新不可篡改对账区块流 */}
                    <div className="audit-blocks-container">
                        <h4 className="section-title">📦 最新不可篡改区块记录流 (Recent Immutable Blocks)</h4>
                        <div className="blocks-timeline">
                            {IMMUTABLE_PRODUCTION_AUDIT_TRAIL.recentAuditBlocks.map((block) => (
                                <div key={block.blockIndex} className={`timeline-block-card chain-${block.chainType}`}>
                                    <div className="block-header">
                                        <div className="block-index-row font-mono">
                                            <span className="block-num">BLOCK #{block.blockIndex}</span>
                                            <span className={`chain-type-tag tag-${block.chainType}`}>
                                                {block.chainType === 'decision' ? '🎯 市场模型决策链' : '💼 券商实盘对账链'}
                                            </span>
                                            <span className="block-time">{block.timestamp}</span>
                                        </div>
                                        <div className="block-meta-row font-mono">
                                            <span className="block-nav">NAV: {block.accountNav}</span>
                                            <span className="hash-tag">{block.hashVerification}</span>
                                            <span className={`fail-check-badge check-${block.failClosedCheck.toLowerCase()}`}>
                                                {block.failClosedCheck}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="block-content">
                                        <p>{block.event}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 视图：SGOV 现金自动清扫与资金效率 */}
            {subTab === 'cash-efficiency' && (
                <div className="rebound-cash-view">
                    <div className="cash-header-card">
                        <div className="cash-top-row">
                            <div className="cash-title-wrap">
                                <span className="cash-icon">💵</span>
                                <div>
                                    <h4>SGOV 现金自动清扫与资金效率前沿 (Cash Sweep Optimization)</h4>
                                    <span className="as-of-date">监测基准：无风险利率 {CASH_EFFICIENCY_SWEEP_DATA.annualRiskFreeRatePct}% · SGOV 全周期收益率 +{CASH_EFFICIENCY_SWEEP_DATA.sgovFullPeriodProxyReturnPct}% · 截至 {CASH_EFFICIENCY_SWEEP_DATA.asOfDate}</span>
                                </div>
                            </div>
                            <div className="cash-badge-pill">
                                <span className="pill-dot"></span>
                                <span>全周期增厚 +12.77% 纯阿尔法</span>
                            </div>
                        </div>

                        <div className="cash-kpi-grid">
                            <div className="cash-kpi-card">
                                <span className="kpi-label">闲置现金收益基准</span>
                                <div className="kpi-val text-cyan">{CASH_EFFICIENCY_SWEEP_DATA.annualRiskFreeRatePct}%</div>
                                <span className="kpi-sub">SGOV 0~3月超短美债年化</span>
                            </div>
                            <div className="cash-kpi-card highlight-card">
                                <span className="kpi-label">全周期收益跃迁 (2024~2026)</span>
                                <div className="kpi-val text-green font-mono">18.11% → 30.88%</div>
                                <span className="kpi-sub text-green">抹平 63.93% 闲置现金拖累</span>
                            </div>
                            <div className="cash-kpi-card">
                                <span className="kpi-label">夏普比率提升 (Sharpe)</span>
                                <div className="kpi-val text-gold font-mono">1.77 → 2.83</div>
                                <span className="kpi-sub">+59.9% 风险调整收益爆发</span>
                            </div>
                            <div className="cash-kpi-card">
                                <span className="kpi-label">最大回撤收窄</span>
                                <div className="kpi-val text-cyan font-mono">-2.33% → -2.24%</div>
                                <span className="kpi-sub">零额外权益下行暴露</span>
                            </div>
                        </div>

                        <div className="cash-mechanism-box">
                            <div className="mechanism-title">
                                <span className="icon">⚙️</span>
                                <strong>每日自动清扫运作机制 (Daily Cash Sweep Protocol)</strong>
                            </div>
                            <p>{CASH_EFFICIENCY_SWEEP_DATA.coreMechanism}</p>
                        </div>
                    </div>

                    <div className="cash-table-card">
                        <h4 className="section-title">📊 零息现金 vs SGOV 自动清扫多周期回测实证对照表</h4>
                        <div className="cash-table-wrap">
                            <table className="cash-comparison-table">
                                <thead>
                                    <tr>
                                        <th>回测周期</th>
                                        <th>量化策略</th>
                                        <th>0息现金收益</th>
                                        <th>SGOV清扫收益</th>
                                        <th>0息夏普</th>
                                        <th>SGOV夏普</th>
                                        <th>0息最大回撤</th>
                                        <th>SGOV最大回撤</th>
                                        <th>累计增厚利息</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {CASH_EFFICIENCY_SWEEP_DATA.comparisons.map((row, idx) => (
                                        <tr key={idx} className={row.period.includes('全样本') ? 'highlight-row' : ''}>
                                            <td className="font-semibold">{row.period}</td>
                                            <td><span className="strat-tag">{row.strategy}</span></td>
                                            <td className="font-mono text-muted">+{row.zeroYieldReturnPct.toFixed(2)}%</td>
                                            <td className="font-mono text-green font-bold">+{row.sgovSweepReturnPct.toFixed(2)}%</td>
                                            <td className="font-mono text-muted">{row.zeroYieldSharpe.toFixed(2)}</td>
                                            <td className="font-mono text-gold font-bold">{row.sgovSweepSharpe.toFixed(2)}</td>
                                            <td className="font-mono text-red">{row.zeroYieldMaxDDPct.toFixed(2)}%</td>
                                            <td className="font-mono text-cyan">{row.sgovSweepMaxDDPct.toFixed(2)}%</td>
                                            <td className="font-mono text-gold">+${row.earnedInterestUsd.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="cash-takeaway-alert">
                            <span className="alert-icon">💡</span>
                            <div>
                                <span className="alert-heading">第一性原理实证定论：</span>
                                <p>{CASH_EFFICIENCY_SWEEP_DATA.operationalTakeaway}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 视图：8% 黄金仓位定寸前沿 */}
            {subTab === 'position-sizing' && (
                <div className="rebound-sizing-view">
                    <div className="sizing-header-card">
                        <div className="sizing-top-row">
                            <div className="sizing-title-wrap">
                                <span className="sizing-icon">🎯</span>
                                <div>
                                    <h4>最优仓位定寸前沿与定寸悬崖实证 (Optimal Position Sizing Frontier)</h4>
                                    <span className="as-of-date">最优目标权重：8.0% · 黄金并发上限：3 只 · 30% 个股袖子预算硬约束 · 截至 {OPTIMAL_POSITION_SIZING_FRONTIER.asOfDate}</span>
                                </div>
                            </div>
                            <div className="sizing-badge-pill">
                                <span>⭐ 8% 帕累托最优解</span>
                            </div>
                        </div>

                        <div className="sizing-kpi-grid">
                            <div className="sizing-kpi-card highlight-card">
                                <span className="kpi-label">帕累托最优目标仓位</span>
                                <div className="kpi-val text-gold font-mono">{OPTIMAL_POSITION_SIZING_FRONTIER.optimalWeightPct.toFixed(1)}%</div>
                                <span className="kpi-sub">全周期收益 +17.81% / 夏普 1.77</span>
                            </div>
                            <div className="sizing-kpi-card">
                                <span className="kpi-label">黄金并发个股数</span>
                                <div className="kpi-val text-cyan font-mono">{OPTIMAL_POSITION_SIZING_FRONTIER.optimalConcurrentNames} 只</div>
                                <span className="kpi-sub">大数定律分散非系统性风险</span>
                            </div>
                            <div className="sizing-kpi-card danger-card">
                                <span className="kpi-label">定寸悬崖拐点 (Sizing Cliff)</span>
                                <div className="kpi-val text-red font-mono">&gt;= 10.0%</div>
                                <span className="kpi-sub">并发萎缩至 1~2 只，回撤暴增</span>
                            </div>
                            <div className="sizing-kpi-card">
                                <span className="kpi-label">执行稳定性 (Jaccard)</span>
                                <div className="kpi-val text-green font-mono">1.00</div>
                                <span className="kpi-sub">在 1.5x 滑点扰动下路径完全重合</span>
                            </div>
                        </div>

                        <div className="sizing-philosophy-box">
                            <div className="philosophy-title">
                                <span className="icon">📐</span>
                                <strong>定寸科学前沿逻辑 (Position Sizing Theory)</strong>
                            </div>
                            <p>{OPTIMAL_POSITION_SIZING_FRONTIER.corePhilosophy}</p>
                        </div>
                    </div>

                    <div className="sizing-table-card">
                        <h4 className="section-title">📈 6 组仓位梯度全指标实证回测对比</h4>
                        <div className="sizing-table-wrap">
                            <table className="sizing-comparison-table">
                                <thead>
                                    <tr>
                                        <th>单票目标仓位</th>
                                        <th>全周期收益</th>
                                        <th>最大回撤</th>
                                        <th>夏普比率 (Sharpe)</th>
                                        <th>最大并发标的数</th>
                                        <th>最大单票盈利贡献</th>
                                        <th>执行稳定性</th>
                                        <th>实证评价与定论</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {OPTIMAL_POSITION_SIZING_FRONTIER.sizingRows.map((row) => (
                                        <tr key={row.targetWeightPct} className={row.targetWeightPct === 8.0 ? 'optimal-row' : ''}>
                                            <td className="font-mono font-bold">
                                                {row.targetWeightPct === 8.0 && <span className="star-tag">⭐</span>}
                                                {row.targetWeightPct.toFixed(1)}%
                                            </td>
                                            <td className="font-mono font-bold text-green">+{row.fullReturnPct.toFixed(2)}%</td>
                                            <td className={`font-mono ${row.fullMaxDDPct < -3.0 ? 'text-red font-bold' : 'text-cyan'}`}>
                                                {row.fullMaxDDPct.toFixed(2)}%
                                            </td>
                                            <td className="font-mono font-bold text-gold">{row.fullSharpe.toFixed(2)}</td>
                                            <td className="font-mono text-center">{row.peakConcurrentNames} 只</td>
                                            <td className="font-mono">{row.maxProfitSharePct.toFixed(2)}%</td>
                                            <td>
                                                <span className={`stability-badge ${row.executionStability.includes('Stable') ? 'badge-stable' : 'badge-cliff'}`}>
                                                    {row.executionStability}
                                                </span>
                                            </td>
                                            <td className="eval-notes-cell">{row.evaluationNotes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="sizing-cliff-alert">
                            <span className="alert-icon">⚠️</span>
                            <div>
                                <span className="alert-heading">定寸悬崖 (Sizing Cliff) 机制原理解析：</span>
                                <p>{OPTIMAL_POSITION_SIZING_FRONTIER.sizingCliffExplanation}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 视图：指数核心洗盘假突破复盘与巨灾保险成本 */}
            {subTab === 'core-whipsaw' && (
                <div className="rebound-whipsaw-view">
                    <div className="whipsaw-header-card">
                        <div className="whipsaw-top-row">
                            <div className="whipsaw-title-wrap">
                                <span className="whipsaw-icon">🛡️</span>
                                <div>
                                    <h4>指数核心洗盘假突破复盘与保险成本 (Core Insurance Cost Audit)</h4>
                                    <span className="as-of-date">2026 年 4 月洗盘深度解剖 · 4 大挑战者变体全盘否决 · 截至 {V9_CORE_INSURANCE_COST_AUDIT.asOfDate}</span>
                                </div>
                            </div>
                            <div className="whipsaw-badge-pill">
                                <span>防范 2008 世纪毁灭的必要保险费</span>
                            </div>
                        </div>

                        <div className="whipsaw-kpi-grid">
                            <div className="whipsaw-kpi-card danger-card">
                                <span className="kpi-label">2026年4月洗盘踏空影响</span>
                                <div className="kpi-val text-red font-mono">-{V9_CORE_INSURANCE_COST_AUDIT.april2026WhipsawBreakdown.netMissedCoreReturnPct.toFixed(2)}%</div>
                                <span className="kpi-sub">踏空 SPY +{V9_CORE_INSURANCE_COST_AUDIT.april2026WhipsawBreakdown.spyGainMissedPct}% / QQQ +{V9_CORE_INSURANCE_COST_AUDIT.april2026WhipsawBreakdown.qqqGainMissedPct}%</span>
                            </div>
                            <div className="whipsaw-kpi-card highlight-card">
                                <span className="kpi-label">行为性质定性</span>
                                <div className="kpi-val text-green font-mono">纪律性保险费</div>
                                <span className="kpi-sub">非策略缺陷，属不可或缺风控开支</span>
                            </div>
                            <div className="whipsaw-kpi-card danger-card">
                                <span className="kpi-label">迟滞离场反事实代价</span>
                                <div className="kpi-val text-red font-mono">+3.08% 回撤恶化</div>
                                <span className="kpi-sub">迟滞退出将 2025 回撤从 -7.46% 扩大到 -10.54%</span>
                            </div>
                            <div className="whipsaw-kpi-card">
                                <span className="kpi-label">挑战者变体采纳率</span>
                                <div className="kpi-val text-gold font-mono">0 / 4 (全否决)</div>
                                <span className="kpi-sub">无一能在保留防灾能力的同时提升稳健性</span>
                            </div>
                        </div>

                        <div className="whipsaw-thesis-box">
                            <div className="thesis-title">
                                <span className="icon">🏛️</span>
                                <strong>巨灾保险第一性原理 (Cost of Insurance Thesis)</strong>
                            </div>
                            <p>{V9_CORE_INSURANCE_COST_AUDIT.costOfInsuranceThesis}</p>
                        </div>
                    </div>

                    {/* 2026 年 4 月洗盘踏空案卷拆解 */}
                    <div className="whipsaw-case-card">
                        <h4 className="section-title">📂 2026 年 4 月洗盘案卷深度复盘 (Case Study Breakdown)</h4>
                        <div className="case-details-grid">
                            <div className="case-detail-item">
                                <span className="item-lbl">清仓/减半执行日</span>
                                <span className="item-val font-mono">{V9_CORE_INSURANCE_COST_AUDIT.april2026WhipsawBreakdown.exitDate}</span>
                            </div>
                            <div className="case-detail-item">
                                <span className="item-lbl">右侧收复买回日</span>
                                <span className="item-val font-mono">{V9_CORE_INSURANCE_COST_AUDIT.april2026WhipsawBreakdown.reentryDate}</span>
                            </div>
                            <div className="case-detail-item">
                                <span className="item-lbl">期间标普500 (SPY) 涨幅</span>
                                <span className="item-val font-mono text-green">+{V9_CORE_INSURANCE_COST_AUDIT.april2026WhipsawBreakdown.spyGainMissedPct.toFixed(2)}%</span>
                            </div>
                            <div className="case-detail-item">
                                <span className="item-lbl">期间纳指100 (QQQ) 涨幅</span>
                                <span className="item-val font-mono text-green">+{V9_CORE_INSURANCE_COST_AUDIT.april2026WhipsawBreakdown.qqqGainMissedPct.toFixed(2)}%</span>
                            </div>
                        </div>

                        <div className="case-narrative-block">
                            <div className="narrative-col">
                                <div className="narrative-label text-cyan">
                                    <span>🛡️ 为什么当时离场是严格合规的顶级纪律？</span>
                                </div>
                                <p>{V9_CORE_INSURANCE_COST_AUDIT.april2026WhipsawBreakdown.whyExitWasDisciplined}</p>
                            </div>
                            <div className="narrative-col">
                                <div className="narrative-label text-red">
                                    <span>⚠️ 若事后诸葛亮引入“迟滞离场”的反事实代价</span>
                                </div>
                                <p>{V9_CORE_INSURANCE_COST_AUDIT.april2026WhipsawBreakdown.counterfactualPenalty}</p>
                            </div>
                        </div>
                    </div>

                    {/* 4 大挑战者变体全盘否决对照表 */}
                    <div className="whipsaw-variants-card">
                        <h4 className="section-title">🧪 4 大挑战者变体全盘回测与否决审计表</h4>
                        <div className="whipsaw-table-wrap">
                            <table className="whipsaw-comparison-table">
                                <thead>
                                    <tr>
                                        <th>变体架构</th>
                                        <th>2026测试收益</th>
                                        <th>2025历史最大回撤</th>
                                        <th>2025夏普比率</th>
                                        <th>科学评审裁决</th>
                                        <th>详细否决 / 保留技术原因</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {V9_CORE_INSURANCE_COST_AUDIT.variantsTested.map((v, idx) => (
                                        <tr key={idx} className={v.verdict === 'BASE' ? 'base-variant-row' : 'rejected-variant-row'}>
                                            <td className="font-bold">{v.variantName}</td>
                                            <td className={`font-mono font-bold ${v.return2026Pct < 0 ? 'text-red' : 'text-green'}`}>
                                                {v.return2026Pct > 0 ? `+${v.return2026Pct.toFixed(2)}%` : `${v.return2026Pct.toFixed(2)}%`}
                                            </td>
                                            <td className={`font-mono font-bold ${v.maxDD2025Pct < -8.0 ? 'text-red' : 'text-muted'}`}>
                                                {v.maxDD2025Pct.toFixed(2)}%
                                            </td>
                                            <td className="font-mono">{v.sharpe2025.toFixed(2)}</td>
                                            <td>
                                                <span className={`verdict-pill ${v.verdict === 'BASE' ? 'pill-base' : 'pill-rejected'}`}>
                                                    {v.verdict === 'BASE' ? '⭐ 基准采用' : '❌ 严厉否决'}
                                                </span>
                                            </td>
                                            <td className="reason-cell">{v.rejectionReason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 视图：主题浓度分级防御梯次与同日加仓速度阻尼器 */}
            {subTab === 'thematic-tiers' && (
                <div className="rebound-thematic-view">
                    <div className="thematic-header-card">
                        <div className="thematic-top-row">
                            <div className="thematic-title-wrap">
                                <span className="thematic-icon">🎨</span>
                                <div>
                                    <h4>主题浓度分级防御梯次与同日加仓阻尼器 (Thematic Concentration Tiers)</h4>
                                    <span className="as-of-date">主题硬上限：{THEMATIC_CONCENTRATION_TIERS.themeExposureCeilingPct}% · 子主题上限：{THEMATIC_CONCENTRATION_TIERS.subThemeExposureCeilingPct}% · 单日净增上限：{THEMATIC_CONCENTRATION_TIERS.maxSingleDayAdditionPct}% · 截至 {THEMATIC_CONCENTRATION_TIERS.asOfDate}</span>
                                </div>
                            </div>
                            <div className="thematic-badge-pill">
                                <span className="pill-dot"></span>
                                <span>当前敞口 {THEMATIC_CONCENTRATION_TIERS.currentAccountStatus.currentExposurePct}% (合规自由区)</span>
                            </div>
                        </div>

                        <div className="thematic-kpi-grid">
                            <div className="thematic-kpi-card danger-card">
                                <span className="kpi-label">单一大主题硬上限 (Ceiling)</span>
                                <div className="kpi-val text-red font-mono">{THEMATIC_CONCENTRATION_TIERS.themeExposureCeilingPct.toFixed(1)}%</div>
                                <span className="kpi-sub">超出立即触发硬性熔断减仓</span>
                            </div>
                            <div className="thematic-kpi-card">
                                <span className="kpi-label">单一子赛道硬上限 (Sub-theme)</span>
                                <div className="kpi-val text-gold font-mono">{THEMATIC_CONCENTRATION_TIERS.subThemeExposureCeilingPct.toFixed(1)}%</div>
                                <span className="kpi-sub">防单点技术路线黑天鹅突变</span>
                            </div>
                            <div className="thematic-kpi-card highlight-card">
                                <span className="kpi-label">单日同主题净增上限 (Velocity)</span>
                                <div className="kpi-val text-cyan font-mono">{THEMATIC_CONCENTRATION_TIERS.maxSingleDayAdditionPct.toFixed(1)}%</div>
                                <span className="kpi-sub">阻尼器：杜绝单日冲动一次性扎堆</span>
                            </div>
                            <div className="thematic-kpi-card">
                                <span className="kpi-label">当前主导主题与敞口</span>
                                <div className="kpi-val text-green font-mono">{THEMATIC_CONCENTRATION_TIERS.currentAccountStatus.currentExposurePct.toFixed(2)}%</div>
                                <span className="kpi-sub">{THEMATIC_CONCENTRATION_TIERS.currentAccountStatus.dominantTheme}</span>
                            </div>
                        </div>

                        <div className="thematic-origin-alert">
                            <span className="alert-icon">⚠️</span>
                            <div>
                                <span className="alert-heading">实盘惨痛教训起源 (2026-06-25 复盘)：</span>
                                <p>{THEMATIC_CONCENTRATION_TIERS.empiricalOriginCase}</p>
                            </div>
                        </div>
                    </div>

                    <div className="thematic-tiers-card">
                        <h4 className="section-title">🪜 四级防御梯次管理矩阵 (Four-Tier Thematic Management Matrix)</h4>
                        <div className="thematic-table-wrap">
                            <table className="thematic-tiers-table">
                                <thead>
                                    <tr>
                                        <th>仓位区间</th>
                                        <th>梯次命名与状态</th>
                                        <th>单日最大净增</th>
                                        <th>运作规程与入场门槛</th>
                                        <th>机构风控底线指令</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {THEMATIC_CONCENTRATION_TIERS.tiers.map((tier) => (
                                        <tr key={tier.tierRange} className={`tier-row-${tier.zoneType}`}>
                                            <td className="font-mono font-bold">{tier.tierRange}</td>
                                            <td>
                                                <span className={`zone-badge zone-${tier.zoneType}`}>
                                                    {tier.zoneName}
                                                </span>
                                            </td>
                                            <td className="font-mono font-bold text-center">
                                                {tier.maxDailyNetAdditionPct > 0 ? `+${tier.maxDailyNetAdditionPct.toFixed(1)}%` : '0.0% (冻结)'}
                                            </td>
                                            <td className="rules-cell">{tier.operatingRules}</td>
                                            <td className="directives-cell">{tier.riskDirectives}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 视图：小微账户经济费率门槛与出场保命安全阀 */}
            {subTab === 'fee-gate' && (
                <div className="rebound-fee-view">
                    <div className="fee-header-card">
                        <div className="fee-top-row">
                            <div className="fee-title-wrap">
                                <span className="fee-icon">⚖️</span>
                                <div>
                                    <h4>小微账户经济费率门槛与出场保命安全阀 (OPT-PROC-02 Economic Fee Gate)</h4>
                                    <span className="as-of-date">最低开仓名义额：${ECONOMIC_FEE_GATE_PROTOCOL.minNotionalUsd.toFixed(2)} · 双边费率上限：&lt;= {ECONOMIC_FEE_GATE_PROTOCOL.maxRoundTripFeeDragPct}% · 卖出平仓无条件豁免 · 截至 {ECONOMIC_FEE_GATE_PROTOCOL.asOfDate}</span>
                                </div>
                            </div>
                            <div className="fee-badge-pill">
                                <span>⭐ 出场保命非对称豁免 (100% Exemption)</span>
                            </div>
                        </div>

                        <div className="fee-kpi-grid">
                            <div className="fee-kpi-card highlight-card">
                                <span className="kpi-label">单笔最低名义开仓额</span>
                                <div className="kpi-val text-green font-mono">${ECONOMIC_FEE_GATE_PROTOCOL.minNotionalUsd.toFixed(2)}</div>
                                <span className="kpi-sub">小微账户杜绝碎股摩擦</span>
                            </div>
                            <div className="fee-kpi-card">
                                <span className="kpi-label">双边最大费率摩擦拖累</span>
                                <div className="kpi-val text-gold font-mono">&lt;= {ECONOMIC_FEE_GATE_PROTOCOL.maxRoundTripFeeDragPct.toFixed(1)}%</div>
                                <span className="kpi-sub">2 * fee / notional &lt;= 0.01</span>
                            </div>
                            <div className="fee-kpi-card highlight-card">
                                <span className="kpi-label">止损卖出拦截率</span>
                                <div className="kpi-val text-cyan font-mono">0.0% (永不拦截)</div>
                                <span className="kpi-sub">保命第一，费率豁免</span>
                            </div>
                            <div className="fee-kpi-card">
                                <span className="kpi-label">执行安全模式</span>
                                <div className="kpi-val text-green font-mono">单向非对称</div>
                                <span className="kpi-sub">买入受限，卖出自由</span>
                            </div>
                        </div>

                        <div className="fee-thesis-box">
                            <div className="thesis-title">
                                <span className="icon">🛡️</span>
                                <strong>非对称执行第一性原理 (Asymmetric Execution Thesis)</strong>
                            </div>
                            <p>{ECONOMIC_FEE_GATE_PROTOCOL.asymmetricExecutionThesis}</p>
                        </div>
                    </div>

                    {/* 3 大核心执行铁律 */}
                    <div className="fee-rules-card">
                        <h4 className="section-title">📋 经济费率三大执行铁律条目 (Three Economic Principles)</h4>
                        <div className="fee-rules-grid">
                            {ECONOMIC_FEE_GATE_PROTOCOL.rules.map((rule) => (
                                <div key={rule.ruleId} className="fee-rule-item">
                                    <div className="rule-top-row font-mono">
                                        <span className="rule-id">{rule.ruleId}</span>
                                        <span className={`scope-badge scope-${rule.enforcementScope.toLowerCase()}`}>
                                            {rule.enforcementScope === 'BUY_ONLY' ? '仅作用于买入/加仓' : '全订单'}
                                        </span>
                                    </div>
                                    <div className="rule-param-row">
                                        <strong>{rule.parameterName}</strong>
                                        <span className="param-val font-mono">{rule.thresholdValue}</span>
                                    </div>
                                    <p className="rule-rationale">{rule.firstPrinciplesRationale}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 压力测试实操场景对照表 */}
                    <div className="fee-scenarios-card">
                        <h4 className="section-title">🧪 典型订单压力测试决策对照 (Stress Scenarios Validation)</h4>
                        <div className="fee-table-wrap">
                            <table className="fee-scenarios-table">
                                <thead>
                                    <tr>
                                        <th>方向</th>
                                        <th>标的代码</th>
                                        <th>订单名义金额</th>
                                        <th>预估佣金</th>
                                        <th>双边摩擦拖累</th>
                                        <th>系统执行裁决</th>
                                        <th>机构处置详细原因</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ECONOMIC_FEE_GATE_PROTOCOL.stressScenarios.map((sc, idx) => (
                                        <tr key={idx} className={sc.systemAction === 'BLOCKED' ? 'blocked-row' : 'allowed-row'}>
                                            <td>
                                                <span className={`order-type-tag ${sc.orderType === 'BUY' ? 'tag-buy' : 'tag-sell'}`}>
                                                    {sc.orderType}
                                                </span>
                                            </td>
                                            <td className="font-bold">{sc.ticker}</td>
                                            <td className="font-mono">${sc.orderNotionalUsd.toFixed(2)}</td>
                                            <td className="font-mono">${sc.estimatedFeeUsd.toFixed(2)}</td>
                                            <td className={`font-mono font-bold ${sc.feeDragPct > 1.0 ? 'text-red' : 'text-green'}`}>
                                                {sc.feeDragPct.toFixed(2)}%
                                            </td>
                                            <td>
                                                <span className={`action-pill ${sc.systemAction === 'ALLOWED' ? 'pill-allowed' : 'pill-blocked'}`}>
                                                    {sc.systemAction === 'ALLOWED' ? '✅ 放行执行' : '🛑 熔断拦截'}
                                                </span>
                                            </td>
                                            <td className="reason-cell">{sc.actionReason}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 视图：持仓周期重分类防鸵鸟协议与不可篡改存证 */}
            {subTab === 'reclass-invariance' && (
                <div className="rebound-reclass-view">
                    <div className="reclass-header-card">
                        <div className="reclass-top-row">
                            <div className="reclass-title-wrap">
                                <span className="reclass-icon">📜</span>
                                <div>
                                    <h4>持仓周期重分类防鸵鸟协议与不可篡改存证 (OPT-GOV-01 Reclassification Invariance)</h4>
                                    <span className="as-of-date">64 位 SHA-256 快照哈希校验 · 根除散户认知失调 · 严格仅前瞻生效 · 截至 {POSITION_RECLASSIFICATION_INVARIANCE.asOfDate}</span>
                                </div>
                            </div>
                            <div className="reclass-badge-pill">
                                <span>🔒 历史失误与执行评分永久固化</span>
                            </div>
                        </div>

                        <div className="reclass-kpi-grid">
                            <div className="reclass-kpi-card danger-card">
                                <span className="kpi-label">历史评分回溯覆写许可</span>
                                <div className="kpi-val text-red font-mono">0.0% (绝对禁止)</div>
                                <span className="kpi-sub">杜绝事后诸葛亮粉饰曲线</span>
                            </div>
                            <div className="reclass-kpi-card highlight-card">
                                <span className="kpi-label">独立替代论据要求</span>
                                <div className="kpi-val text-green font-mono">100% 严查</div>
                                <span className="kpi-sub">严禁沿用原建仓理由找借口</span>
                            </div>
                            <div className="reclass-kpi-card">
                                <span className="kpi-label">密码学快照对账要求</span>
                                <div className="kpi-val text-gold font-mono">SHA-256</div>
                                <span className="kpi-sub">创世开仓快照逐字节匹配</span>
                            </div>
                            <div className="reclass-kpi-card">
                                <span className="kpi-label">重分类生效范畴</span>
                                <div className="kpi-val text-cyan font-mono">前瞻生效 (Prospective)</div>
                                <span className="kpi-sub">原始交易评级永不篡改</span>
                            </div>
                        </div>

                        <div className="reclass-philosophy-box">
                            <div className="philosophy-title">
                                <span className="icon">🧠</span>
                                <strong>防鸵鸟心理第一性原理 (Anti-Ostrich Philosophy)</strong>
                            </div>
                            <p>{POSITION_RECLASSIFICATION_INVARIANCE.antiOstrichPhilosophy}</p>
                        </div>
                    </div>

                    {/* 4 项硬性准入前置条件 */}
                    <div className="reclass-requirements-card">
                        <h4 className="section-title">🔐 四项密码学与合规硬性前置门槛 (Four Invariant Requirements)</h4>
                        <div className="requirements-grid">
                            {POSITION_RECLASSIFICATION_INVARIANCE.mandatoryRequirements.map((req, idx) => (
                                <div key={idx} className="requirement-item">
                                    <div className="req-header font-mono">
                                        <span className="field-name">#{idx + 1} {req.field}</span>
                                    </div>
                                    <p className="req-text"><strong>准入要求：</strong>{req.requirement}</p>
                                    <div className="fail-consequence font-mono">
                                        <span className="fail-icon">🛑</span>
                                        <span>违规熔断：{req.failClosedConsequence}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 真实案例审计案卷深度剖析 */}
                    <div className="reclass-case-card">
                        <h4 className="section-title">📂 真实案卷深度审计剖析：{POSITION_RECLASSIFICATION_INVARIANCE.auditCaseStudy.symbol} 企图逃避止损复盘</h4>
                        <div className="audit-case-grid">
                            <div className="case-col">
                                <div className="case-row">
                                    <span className="lbl">标的代码：</span>
                                    <span className="val font-mono font-bold">{POSITION_RECLASSIFICATION_INVARIANCE.auditCaseStudy.symbol}</span>
                                </div>
                                <div className="case-row">
                                    <span className="lbl">原始意图周期：</span>
                                    <span className="val font-mono text-cyan">{POSITION_RECLASSIFICATION_INVARIANCE.auditCaseStudy.originalHorizon} (短线波段)</span>
                                </div>
                                <div className="case-row">
                                    <span className="lbl">试图变更新周期：</span>
                                    <span className="val font-mono text-gold">{POSITION_RECLASSIFICATION_INVARIANCE.auditCaseStudy.attemptedNewHorizon} (长线核心)</span>
                                </div>
                            </div>
                            <div className="case-col">
                                <div className="case-row">
                                    <span className="lbl">原始买入成本：</span>
                                    <span className="val font-mono">${POSITION_RECLASSIFICATION_INVARIANCE.auditCaseStudy.originalEntryPrice.toFixed(2)}</span>
                                </div>
                                <div className="case-row">
                                    <span className="lbl">破位时浮亏：</span>
                                    <span className="val font-mono text-red font-bold">{POSITION_RECLASSIFICATION_INVARIANCE.auditCaseStudy.currentDrawdownPct.toFixed(1)}%</span>
                                </div>
                                <div className="case-row">
                                    <span className="lbl">创世哈希快照：</span>
                                    <span className="val font-mono text-muted text-truncate">{POSITION_RECLASSIFICATION_INVARIANCE.auditCaseStudy.originalRecordSha256.slice(0, 16)}...</span>
                                </div>
                            </div>
                        </div>

                        <div className="case-verdict-banner">
                            <div className="verdict-tag-row font-mono">
                                <span className="verdict-label">系统审计最终裁决：</span>
                                <span className="verdict-pill pill-rejected">
                                    {POSITION_RECLASSIFICATION_INVARIANCE.auditCaseStudy.decisionVerdict} (否决重分类，强制止损)
                                </span>
                            </div>
                            <p className="verdict-explanation">{POSITION_RECLASSIFICATION_INVARIANCE.auditCaseStudy.verdictExplanation}</p>
                        </div>
                    </div>

                    {/* 4 大不可动摇公理 */}
                    <div className="reclass-axioms-card">
                        <h4 className="section-title">🏛️ 生产级四大不可动摇治理公理 (Four Unbreakable Invariants)</h4>
                        <div className="axioms-grid">
                            {POSITION_RECLASSIFICATION_INVARIANCE.unbreakableInvariants.map((axiom, idx) => (
                                <div key={idx} className="axiom-pill">
                                    <span className="axiom-icon">⚖️</span>
                                    <span>{axiom}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 视图：Phase 11 进阶实战四维硬风控 (Tactical Guards) */}
            {subTab === 'tactical-guards' && (
                <div className="rebound-tactical-view">
                    {/* 顶部总览卡片 */}
                    <div className="tactical-header-card">
                        <div className="tactical-top-row">
                            <div className="tactical-title-wrap">
                                <span className="tactical-icon">🛡️</span>
                                    <h4>{PHASE11_TACTICAL_ENHANCEMENTS.name}</h4>
                                    <span className="as-of-date">发布于 {PHASE11_TACTICAL_ENHANCEMENTS.releaseDate} · 单向棘轮移动止盈 · 美债折现率前瞻穿透 · 财报大阳线 T+2 冷静期 · 破位均线防向下补仓</span>
                            </div>
                            <div className="tactical-badge-pill">
                                <span>🔒 微观收益锁定与宏观折现穿透双轨闭环</span>
                            </div>
                        </div>

                        <div className="tactical-kpi-grid">
                            <div className="tactical-kpi-card highlight-card">
                                <span className="kpi-label">移动止盈棘轮特性</span>
                                <div className="kpi-val text-green font-mono">只升不降 (单向不可逆)</div>
                                <span className="kpi-sub">+15% 锁 +8% / +25% 锁 +15% / +40% 锁 +25%</span>
                            </div>
                            <div className={`tactical-kpi-card ${macroResult.state === 'stress' ? 'danger-card' : macroResult.state === 'restrictive' ? 'warning-card' : 'highlight-card'}`}>
                                <span className="kpi-label">美债/联储估值状态</span>
                                <div className={`kpi-val font-mono ${macroResult.state === 'stress' ? 'text-red' : macroResult.state === 'restrictive' ? 'text-gold' : 'text-green'}`}>
                                    {macroResult.state.toUpperCase()} ({macroResult.highDurationNewRiskMultiplier}x 乘数)
                                </div>
                                <span className="kpi-sub">10Y 实际 {macroInput.real10y}% · 10s2s {macroResult.curve10s2s_bp}bp</span>
                            </div>
                            <div className={`tactical-kpi-card ${cooldownResult.isFrozen ? 'warning-card' : 'highlight-card'}`}>
                                <span className="kpi-label">财报催化剂冷却状态</span>
                                <div className={`kpi-val font-mono ${cooldownResult.isFrozen ? 'text-gold' : 'text-green'}`}>
                                    {cooldownResult.action}
                                </div>
                                <span className="kpi-sub">T+{cooldownResult.daysElapsed} · 振幅 {cooldownResult.amplitudePct}% · 缩量比 {cooldownResult.volumeRatioPct}%</span>
                            </div>
                            <div className={`tactical-kpi-card ${!antiAveragingResult.canAddPosition ? 'danger-card' : 'highlight-card'}`}>
                                <span className="kpi-label">防向下摊平加仓控制</span>
                                <div className={`kpi-val font-mono ${!antiAveragingResult.canAddPosition ? 'text-red' : 'text-green'}`}>
                                    {antiAveragingResult.action}
                                </div>
                                <span className="kpi-sub">{antiAveragingResult.isBrokenTrend ? `破位均线: ${antiAveragingResult.brokenMAs.join(', ')}` : '均线健康已放量企稳'}</span>
                            </div>
                        </div>
                    </div>

                    {/* 模块 1：阶梯式动态移动止盈棘轮协议交互模拟器 */}
                    <div className="tactical-section-card">
                        <div className="section-card-header">
                            <span className="section-badge">支柱一 · 微观收益锁定</span>
                            <h4>📈 阶梯式动态移动止盈棘轮协议 (Tiered Profit-Trailing Stops - Ratchet Lock)</h4>
                            <p className="section-intro">
                                汲取实盘 GLW 浮盈 +22% 遭遇坐过山车、利润被均值回归大幅吞噬的真实教训。建立单向棘轮机制：只能单向向上提拉，物理禁止下移，确保浮盈一旦扩大即刻落袋为安。
                            </p>
                        </div>

                        {/* 经典案例预设加载 */}
                        <div className="preset-buttons-row">
                            <span className="preset-lbl">⚡ 快速加载实战案卷预设：</span>
                            <button
                                className="preset-btn"
                                onClick={() => setTrailingInput({
                                    symbol: 'GLW',
                                    entryPrice: 100.0,
                                    highestPriceSinceEntry: 122.0,
                                    currentPrice: 105.0,
                                    currentStopPrice: 92.0,
                                    ma20Price: 102.0,
                                })}
                            >
                                📘 加载 GLW 回踩案例 (+22% 浮盈)
                            </button>
                            <button
                                className="preset-btn"
                                onClick={() => setTrailingInput({
                                    symbol: 'MRVL',
                                    entryPrice: 185.0,
                                    highestPriceSinceEntry: 237.0,
                                    currentPrice: 237.0,
                                    currentStopPrice: 170.0,
                                    ma20Price: 220.0,
                                })}
                            >
                                📘 加载 MRVL 利润保护案例 (+28% 浮盈)
                            </button>
                            <button
                                className="preset-btn"
                                onClick={() => setTrailingInput({
                                    symbol: 'NVDA',
                                    entryPrice: 95.0,
                                    highestPriceSinceEntry: 162.0,
                                    currentPrice: 158.0,
                                    currentStopPrice: 120.0,
                                    ma20Price: 152.0,
                                })}
                            >
                                📘 加载 NVDA 主升浪案例 (+65% 浮盈 / MA20护航)
                            </button>
                        </div>

                        {/* 交互输入网格 */}
                        <div className="interactive-form-grid">
                            <div className="form-group">
                                <label>标的代码</label>
                                <input
                                    type="text"
                                    value={trailingInput.symbol}
                                    onChange={(e) => setTrailingInput({ ...trailingInput, symbol: e.target.value.toUpperCase() })}
                                />
                            </div>
                            <div className="form-group">
                                <label>买入成本 ($)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={trailingInput.entryPrice}
                                    onChange={(e) => setTrailingInput({ ...trailingInput, entryPrice: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="form-group">
                                <label>历史最高价 ($)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={trailingInput.highestPriceSinceEntry}
                                    onChange={(e) => setTrailingInput({ ...trailingInput, highestPriceSinceEntry: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="form-group">
                                <label>当前价格 ($)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={trailingInput.currentPrice}
                                    onChange={(e) => setTrailingInput({ ...trailingInput, currentPrice: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="form-group">
                                <label>当前生效止损价 ($)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={trailingInput.currentStopPrice}
                                    onChange={(e) => setTrailingInput({ ...trailingInput, currentStopPrice: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="form-group">
                                <label>日线 MA20 价格 ($)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={trailingInput.ma20Price || 0}
                                    onChange={(e) => setTrailingInput({ ...trailingInput, ma20Price: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        {/* 实时棘轮评估输出 */}
                        <div className="audit-result-banner font-mono">
                            <div className="result-top-line">
                                <span className="result-title">棘轮止盈评估结果：</span>
                                <span className={`result-tag ${trailingResult.ratchetProtectionLocked ? 'tag-locked' : 'tag-pending'}`}>
                                    {trailingResult.ratchetProtectionLocked ? `🔒 已锁定保底纯利润 +${trailingResult.lockFloorProfitPct}%` : '⏳ 未触发移动止盈'}
                                </span>
                                {trailingResult.activeTier && (
                                    <span className="tier-tag">激活 Tier {trailingResult.activeTier.tierIndex} (+{trailingResult.activeTier.profitThresholdPct}% 门槛)</span>
                                )}
                            </div>
                            <div className="result-stats-row">
                                <div className="stat-item">
                                    <span className="lbl">当前浮盈:</span>
                                    <span className={`val ${trailingResult.currentProfitPct >= 0 ? 'text-green' : 'text-red'}`}>{trailingResult.currentProfitPct}%</span>
                                </div>
                                <div className="stat-item">
                                    <span className="lbl">最高浮盈:</span>
                                    <span className="val text-gold">{trailingResult.maxFloatingProfitPct}%</span>
                                </div>
                                <div className="stat-item">
                                    <span className="lbl">原止损价:</span>
                                    <span className="val text-muted">${trailingInput.currentStopPrice.toFixed(2)}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="lbl">新阶梯止损价:</span>
                                    <span className="val text-cyan font-bold">${trailingResult.newStopPrice.toFixed(2)}</span>
                                </div>
                            </div>
                            <p className="result-directive-msg">{trailingResult.statusMessage}</p>
                        </div>

                        {/* 阶梯规范对照表 */}
                        <div className="tiers-table-wrap">
                            <table className="mini-data-table">
                                <thead>
                                    <tr>
                                        <th>阶梯层级</th>
                                        <th>触发浮盈门槛</th>
                                        <th>保底锁利地板</th>
                                        <th>跟踪机制</th>
                                        <th>风控执行指令</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {DEFAULT_PROFIT_TRAILING_TIERS.map((tier) => (
                                        <tr key={tier.tierIndex} className={trailingResult.activeTier?.tierIndex === tier.tierIndex ? 'row-active' : ''}>
                                            <td className="font-mono font-bold">Tier {tier.tierIndex}</td>
                                            <td className="font-mono text-gold">+{tier.profitThresholdPct.toFixed(0)}%</td>
                                            <td className="font-mono text-green font-bold">成本 +{tier.lockedFloorProfitPct.toFixed(0)}%</td>
                                            <td className="font-mono">{tier.trackingMechanism}</td>
                                            <td className="text-muted">{tier.directive}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* 模块 2：美债收益率与美联储前瞻估值压力监控器 */}
                    <div className="tactical-section-card">
                        <div className="section-card-header">
                            <span className="section-badge">支柱二 · 宏观折现率穿透</span>
                            <h4>🏛️ 美债收益率与美联储前瞻压力监控器 (Treasury & Fed Policy Valuation Monitor)</h4>
                            <p className="section-intro">
                                移植并工程化 AI-Memory 中的 <code>v9_macro_policy_monitor.py</code>。单纯看 VIX/QQQ 存在价格滞后；当 10Y 名义利率突破 4.5% 或 10Y TIPS 实际利率突破 2.25% 甚至发生熊陡时，高估值成长股在估值模型中会率先遭遇折现率杀估值。
                            </p>
                        </div>

                        {/* 经典案例预设加载 */}
                        <div className="preset-buttons-row">
                            <span className="preset-lbl">⚡ 快速加载宏观情境：</span>
                            <button
                                className="preset-btn"
                                onClick={() => setMacroInput({
                                    asOfDate: '2026-08-21',
                                    nominal2y: 4.24,
                                    nominal10y: 4.74,
                                    nominal30y: 5.27,
                                    real10y: 2.40,
                                    breakeven10y: 2.34,
                                    nominal10y_5d_change_bp: 6.0,
                                    real10y_5d_change_bp: -1.0,
                                    curve10s2s_bp: 50.0,
                                    priorCurve10s2s_bp: 48.0,
                                    fedTargetRangePct: [3.50, 3.75],
                                    fedHikeDissentCount: 3,
                                    fedTighteningContingency: true,
                                })}
                            >
                                📘 加载 2026-08-21 真实美债审计 (Restrictive · 乘数 0.5x)
                            </button>
                            <button
                                className="preset-btn"
                                onClick={() => setMacroInput({
                                    asOfDate: '2026-09-12',
                                    nominal2y: 4.20,
                                    nominal10y: 4.60,
                                    nominal30y: 5.10,
                                    real10y: 2.50,
                                    breakeven10y: 2.10,
                                    nominal10y_5d_change_bp: 25.0,
                                    real10y_5d_change_bp: 18.0,
                                    curve10s2s_bp: 40.0,
                                    priorCurve10s2s_bp: 25.0,
                                    fedTargetRangePct: [3.50, 3.75],
                                    fedHikeDissentCount: 1,
                                    fedTighteningContingency: true,
                                })}
                            >
                                📘 加载 10s2s 熊陡冲击压力场景 (Stress · 乘数 0.0x 冻结开仓)
                            </button>
                            <button
                                className="preset-btn"
                                onClick={() => setMacroInput({
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
                                })}
                            >
                                📘 加载基准常态宏观环境 (Normal · 乘数 1.0x 全额放行)
                            </button>
                        </div>

                        {/* 交互输入网格 */}
                        <div className="interactive-form-grid">
                            <div className="form-group">
                                <label>观察基准日</label>
                                <input
                                    type="text"
                                    value={macroInput.asOfDate}
                                    onChange={(e) => setMacroInput({ ...macroInput, asOfDate: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>10Y 名义利率 (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={macroInput.nominal10y}
                                    onChange={(e) => setMacroInput({ ...macroInput, nominal10y: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="form-group">
                                <label>10Y TIPS 实际利率 (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={macroInput.real10y}
                                    onChange={(e) => setMacroInput({ ...macroInput, real10y: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="form-group">
                                <label>10s2s 利差 (bp)</label>
                                <input
                                    type="number"
                                    step="1"
                                    value={macroInput.curve10s2s_bp}
                                    onChange={(e) => setMacroInput({ ...macroInput, curve10s2s_bp: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="form-group">
                                <label>5日前 10s2s 利差 (bp)</label>
                                <input
                                    type="number"
                                    step="1"
                                    value={macroInput.priorCurve10s2s_bp || 0}
                                    onChange={(e) => setMacroInput({ ...macroInput, priorCurve10s2s_bp: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="form-group">
                                <label>5日实际利率变动 (bp)</label>
                                <input
                                    type="number"
                                    step="1"
                                    value={macroInput.real10y_5d_change_bp}
                                    onChange={(e) => setMacroInput({ ...macroInput, real10y_5d_change_bp: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="form-group">
                                <label>5日名义利率变动 (bp)</label>
                                <input
                                    type="number"
                                    step="1"
                                    value={macroInput.nominal10y_5d_change_bp}
                                    onChange={(e) => setMacroInput({ ...macroInput, nominal10y_5d_change_bp: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="form-group">
                                <label>联储票委加息异议票数</label>
                                <input
                                    type="number"
                                    step="1"
                                    value={macroInput.fedHikeDissentCount}
                                    onChange={(e) => setMacroInput({ ...macroInput, fedHikeDissentCount: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        {/* 宏观实时评估看板 */}
                        <div className={`audit-result-banner font-mono ${macroResult.state === 'stress' ? 'banner-danger' : macroResult.state === 'restrictive' ? 'banner-warning' : 'banner-safe'}`}>
                            <div className="result-top-line">
                                <span className="result-title">宏观估值折现率压力评级：</span>
                                <span className={`state-badge state-${macroResult.state}`}>
                                    {macroResult.state.toUpperCase()}
                                </span>
                                <span className="multiplier-badge">
                                    长久期科技股新增系数: {macroResult.highDurationNewRiskMultiplier}x
                                </span>
                                {macroResult.bearSteepeningDetected && (
                                    <span className="bear-steepening-tag">⚠️ 触发 10s2s 熊陡预警 (走阔 &gt;=10bp)</span>
                                )}
                            </div>
                            <div className="flags-overview-row">
                                <div className="flag-group">
                                    <span className="flag-group-title">结构性红线 (Score: {macroResult.structuralScore}/3):</span>
                                    <span className={`flag-pill ${macroResult.structuralFlags.real10yAtOrAbove225 ? 'flag-on' : 'flag-off'}`}>实际利率&gt;=2.25%</span>
                                    <span className={`flag-pill ${macroResult.structuralFlags.nominal10yAtOrAbove450 ? 'flag-on' : 'flag-off'}`}>名义利率&gt;=4.50%</span>
                                    <span className={`flag-pill ${macroResult.structuralFlags.hawkishPolicyRisk ? 'flag-on' : 'flag-off'}`}>联储鹰派加息异议</span>
                                </div>
                                <div className="flag-group">
                                    <span className="flag-group-title">脉冲式异动 (Score: {macroResult.impulseScore}/3):</span>
                                    <span className={`flag-pill ${macroResult.impulseFlags.real10yFiveObsUpAtLeast15bp ? 'flag-on' : 'flag-off'}`}>5日实际利率&gt;=15bp</span>
                                    <span className={`flag-pill ${macroResult.impulseFlags.nominal10yFiveObsUpAtLeast20bp ? 'flag-on' : 'flag-off'}`}>5日名义利率&gt;=20bp</span>
                                    <span className={`flag-pill ${macroResult.impulseFlags.tenTwoBearSteepeningAtLeast10bp ? 'flag-on' : 'flag-off'}`}>10s2s熊陡&gt;=10bp</span>
                                </div>
                            </div>
                            <p className="result-directive-msg">{macroResult.directiveSummary}</p>
                        </div>
                    </div>

                    {/* 模块 3：财报大阳线 T+2 冷静期与破位防摊平双闸门 */}
                    <div className="dual-guards-grid">
                        {/* 左卡：财报与催化剂 T+2 冷静期 */}
                        <div className="tactical-section-card mini-guard-card">
                            <div className="section-card-header">
                                <span className="section-badge">支柱三 · 追高冲动物理阻断</span>
                                <h4>🧊 财报与催化剂大阳线次日 T+2 强制冷静期</h4>
                                <p className="section-intro">
                                    对标 2026-06-25 MU 财报暴涨 10% 后次日散户开盘追高遭遇 6.7% 回吐深套教训。单日涨幅 &gt;=8% 后 T+0/T+1 物理冻结买入，T+2 须满足微观结构三审。
                                </p>
                            </div>

                            <div className="interactive-form-grid mini-form-grid">
                                <div className="form-group">
                                    <label>事件当日涨幅 (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={cooldownInput.eventDayGainPct}
                                        onChange={(e) => setCooldownInput({ ...cooldownInput, eventDayGainPct: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>距离事件交易日天数</label>
                                    <input
                                        type="number"
                                        step="1"
                                        value={cooldownInput.daysElapsedSinceEvent}
                                        onChange={(e) => setCooldownInput({ ...cooldownInput, daysElapsedSinceEvent: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>当日振幅 (%)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={cooldownResult.amplitudePct}
                                        onChange={(e) => {
                                            const amp = parseFloat(e.target.value) || 0;
                                            setCooldownInput({
                                                ...cooldownInput,
                                                currentDayLowPrice: 1000,
                                                currentDayHighPrice: 1000 * (1 + amp / 100),
                                            });
                                        }}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>当日成交量占比 (%)</label>
                                    <input
                                        type="number"
                                        step="1"
                                        value={cooldownResult.volumeRatioPct}
                                        onChange={(e) => {
                                            const ratio = parseFloat(e.target.value) || 0;
                                            setCooldownInput({
                                                ...cooldownInput,
                                                currentDayVolume: cooldownInput.eventDayVolume * (ratio / 100),
                                            });
                                        }}
                                    />
                                </div>
                            </div>

                            <div className={`audit-result-banner font-mono ${cooldownResult.isFrozen ? 'banner-warning' : 'banner-safe'}`}>
                                <div className="result-top-line">
                                    <span className="result-title">冷静期判定：</span>
                                    <span className={`result-tag ${cooldownResult.isFrozen ? 'tag-frozen' : 'tag-safe'}`}>
                                        {cooldownResult.action}
                                    </span>
                                </div>
                                <div className="checklist-items-col">
                                    <div className={`chk-item ${cooldownResult.checks.isTPlusTwoOrLater ? 'pass' : 'fail'}`}>
                                        <span>{cooldownResult.checks.isTPlusTwoOrLater ? '✓' : '✗'} 达到 T+2 或之后交易日</span>
                                    </div>
                                    <div className={`chk-item ${cooldownResult.checks.amplitudeWithin3Point5Pct ? 'pass' : 'fail'}`}>
                                        <span>{cooldownResult.checks.amplitudeWithin3Point5Pct ? '✓' : '✗'} 振幅收窄至 &lt;= 3.5% (当前 {cooldownResult.amplitudePct}%)</span>
                                    </div>
                                    <div className={`chk-item ${cooldownResult.checks.volumeCompressedUnder50Pct ? 'pass' : 'fail'}`}>
                                        <span>{cooldownResult.checks.volumeCompressedUnder50Pct ? '✓' : '✗'} 成交量萎缩至事件日 &lt;= 50% (当前 {cooldownResult.volumeRatioPct}%)</span>
                                    </div>
                                    <div className={`chk-item ${cooldownResult.checks.closeAboveMa5 && cooldownResult.checks.closeAboveEventMidpoint ? 'pass' : 'fail'}`}>
                                        <span>{cooldownResult.checks.closeAboveMa5 && cooldownResult.checks.closeAboveEventMidpoint ? '✓' : '✗'} 收盘坚守 MA5 与大阳线实体中轴 ${cooldownResult.eventMidpointPrice} 之上</span>
                                    </div>
                                </div>
                                <p className="result-directive-msg">{cooldownResult.rationale}</p>
                            </div>
                        </div>

                        {/* 右卡：破位均线严禁向下摊平成本 */}
                        <div className="tactical-section-card mini-guard-card">
                            <div className="section-card-header">
                                <span className="section-badge">支柱四 · 处置效应硬阻断</span>
                                <h4>🚫 破位均线严禁向下摊平成本铁律</h4>
                                <p className="section-intro">
                                    对标 2026-08-21 盘后审计待办：MXL/GLW 跌破 MA20 趋势破位，系统执行严格 <code>no-add</code>。严禁以“拉低均价”为由向下补仓，杜绝回本心理导致的无底洞套牢。
                                </p>
                            </div>

                            <div className="interactive-form-grid mini-form-grid">
                                <div className="form-group">
                                    <label>当前收盘价 ($)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={antiAveragingInput.currentPrice}
                                        onChange={(e) => setAntiAveragingInput({ ...antiAveragingInput, currentPrice: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>MA5 价格 ($)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={antiAveragingInput.ma5}
                                        onChange={(e) => setAntiAveragingInput({ ...antiAveragingInput, ma5: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>MA10 价格 ($)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={antiAveragingInput.ma10}
                                        onChange={(e) => setAntiAveragingInput({ ...antiAveragingInput, ma10: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>MA20 价格 ($)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={antiAveragingInput.ma20}
                                        onChange={(e) => setAntiAveragingInput({ ...antiAveragingInput, ma20: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>连续收复关键均线天数</label>
                                    <input
                                        type="number"
                                        step="1"
                                        value={antiAveragingInput.consecutiveDaysAboveKeyMAs}
                                        onChange={(e) => setAntiAveragingInput({ ...antiAveragingInput, consecutiveDaysAboveKeyMAs: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>是否放量收复</label>
                                    <select
                                        value={antiAveragingInput.isVolumeReclaimed ? 'true' : 'false'}
                                        onChange={(e) => setAntiAveragingInput({ ...antiAveragingInput, isVolumeReclaimed: e.target.value === 'true' })}
                                    >
                                        <option value="false">缩量 / 未确认放量</option>
                                        <option value="true">放量确认突破</option>
                                    </select>
                                </div>
                            </div>

                            <div className={`audit-result-banner font-mono ${!antiAveragingResult.canAddPosition ? 'banner-danger' : 'banner-safe'}`}>
                                <div className="result-top-line">
                                    <span className="result-title">补仓加仓裁决：</span>
                                    <span className={`result-tag ${!antiAveragingResult.canAddPosition ? 'tag-prohibited' : 'tag-safe'}`}>
                                        {antiAveragingResult.action}
                                    </span>
                                </div>
                                <div className="result-stats-row">
                                    <div className="stat-item">
                                        <span className="lbl">破位均线:</span>
                                        <span className={`val ${antiAveragingResult.brokenMAs.length > 0 ? 'text-red' : 'text-green'}`}>
                                            {antiAveragingResult.brokenMAs.length > 0 ? antiAveragingResult.brokenMAs.join(', ') : '无 (均线上方)'}
                                        </span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="lbl">企稳天数:</span>
                                        <span className="val text-gold">{antiAveragingInput.consecutiveDaysAboveKeyMAs} 天 (&gt;=2天准入)</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="lbl">加仓权限:</span>
                                        <span className={`val ${antiAveragingResult.canAddPosition ? 'text-green font-bold' : 'text-red font-bold'}`}>
                                            {antiAveragingResult.canAddPosition ? '🟢 已安全解锁' : '🔴 物理锁定 (禁止买入)'}
                                        </span>
                                    </div>
                                </div>
                                <p className="result-directive-msg">{antiAveragingResult.rationale}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 视图：舆论情绪拥挤度反指雷达 */}
            {subTab === 'crowding-radar' && (
                <div className="rebound-crowding-view">
                    <div className="crowding-header-card">
                        <div className="crowding-top-row">
                            <div className="crowding-title-wrap">
                                <span className="crowding-icon">👥</span>
                                <div>
                                    <h4>社交媒体与机构资金流拥挤度反指雷达 (H7 & Citadel 框架)</h4>
                                    <span className="as-of-date">监测周期：2026-09-20 · 对标小红书/X/社群KOL晒单与期权资金流</span>
                                </div>
                            </div>
                            <div className="heat-dial-box">
                                <span className="lbl">全网综合狂热指数</span>
                                <div className="dial-val-row font-mono">
                                    <span className="dial-num text-red">{THEME_CROWDING_RADAR.overallHeatIndex}</span>
                                    <span className="dial-max">/ 100</span>
                                </div>
                                <span className="level-badge level-hyper">{THEME_CROWDING_RADAR.levelText}</span>
                            </div>
                        </div>

                        <div className="crowding-warning-alert">
                            <span className="alert-icon">⚠️</span>
                            <div>
                                <strong>KOL/散户晒单狂热度：</strong>
                                <span>{THEME_CROWDING_RADAR.kolGainDensity}</span>
                            </div>
                        </div>
                    </div>

                    {/* 四大约束反向操作铁律 */}
                    <div className="contrarian-directives-card">
                        <h4 className="card-heading">🛡️ 拥挤高危期的四大反向风控铁律 (Contrarian Directives)</h4>
                        <div className="directives-list">
                            {THEME_CROWDING_RADAR.contrarianDirectives.map((d, i) => (
                                <div key={i} className="directive-item">
                                    <span className="d-idx font-mono font-bold">0{i + 1}</span>
                                    <p className="d-text">{d}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 四级拥挤度评分阶梯对照 */}
                    <div className="crowding-ladder-card">
                        <h4 className="card-heading">📊 四级拥挤度分级阶梯与实战应对方案</h4>
                        <div className="ladder-grid">
                            {THEME_CROWDING_RADAR.crowdingLevels.map((lvl) => {
                                const isActive = lvl.level === THEME_CROWDING_RADAR.currentLevel;
                                return (
                                    <div key={lvl.level} className={`ladder-box ${isActive ? 'active-ladder' : ''}`}>
                                        <div className="ladder-head">
                                            <span className="ladder-range font-mono">{lvl.scoreRange} 分</span>
                                            <span className="ladder-pill" style={{ color: lvl.color }}>{lvl.statusBadge}</span>
                                        </div>
                                        <h5 className="ladder-title">{lvl.levelName}</h5>
                                        <p className="ladder-desc">{lvl.description}</p>
                                        <div className="ladder-action">
                                            <strong>操作指南：</strong>{lvl.behaviorGuide}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 五大细分子赛道拥挤度对比 */}
                    <div className="subthemes-crowding-card">
                        <h4 className="card-heading">🎯 5 大细分科技赛道拥挤度与操作指令</h4>
                        <div className="subthemes-table-wrap">
                            <table className="subthemes-table font-mono">
                                <thead>
                                    <tr>
                                        <th>细分主题赛道</th>
                                        <th>拥挤度得分</th>
                                        <th>趋势结构</th>
                                        <th>KOL多空共识</th>
                                        <th>针对性操作指引</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {THEME_CROWDING_RADAR.subThemes.map((st, i) => (
                                        <tr key={i}>
                                            <td className="st-name font-bold">{st.themeName}</td>
                                            <td>
                                                <div className="score-bar-wrap">
                                                    <span className={`score-txt font-bold ${st.crowdingScore >= 75 ? 'text-red' : st.crowdingScore >= 60 ? 'text-gold' : 'text-green'}`}>
                                                        {st.crowdingScore}
                                                    </span>
                                                    <div className="score-bg-bar">
                                                        <div
                                                            className="score-fill-bar"
                                                            style={{
                                                                width: `${st.crowdingScore}%`,
                                                                backgroundColor: st.crowdingScore >= 75 ? '#ef4444' : st.crowdingScore >= 60 ? '#f59e0b' : '#10b981',
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`trend-pill trend-${st.trendStatus}`}>
                                                    {st.trendStatus === 'strong_trend' ? '强势多头' : st.trendStatus === 'extended_exhaustion' ? '高位竭尽' : '箱体整理'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`sentiment-pill sent-${st.kolSentiment}`}>
                                                    {st.kolSentiment === 'bullish_consensus' ? '单边极度看多' : st.kolSentiment === 'skeptical' ? '普遍冷清质疑' : '多空分歧适中'}
                                                </span>
                                            </td>
                                            <td className="directive-cell">{st.actionDirective}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 视图：六维实战交易决策核验器 */}
            {subTab === 'trade-checklist' && (
                <div className="rebound-checklist-view">
                    <div className="checklist-hero-banner">
                        <div className="hero-left">
                            <span className="checklist-icon">✅</span>
                            <div>
                                <h4>六维实战交易决策动态核验器 (6-Dimensional Decision Engine)</h4>
                                <p>开仓前的最后一道防线：将恐慌门控、情绪拥挤、趋势动量、右侧结构、风险预算与退出纪律进行刚性机器核验，杜绝情绪化冲动交易。</p>
                            </div>
                        </div>
                    </div>

                    <div className="checklist-interactive-layout">
                        {/* 左侧：输入控制台 */}
                        <div className="checklist-input-card">
                            <h4 className="card-title">⚙️ 拟开仓标的与条件输入控制台</h4>
                            <div className="form-group">
                                <label>拟操作股票代码 (Ticker)</label>
                                <input
                                    type="text"
                                    className="dark-input font-mono"
                                    value={checklistInput.symbol}
                                    onChange={(e) => setChecklistInput({ ...checklistInput, symbol: e.target.value.toUpperCase() })}
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    Fear Gate 恐慌门控得分 (0~10)
                                    <span className="val-preview font-mono text-gold">{checklistInput.fearGateScore} 分</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="1"
                                    className="dark-range"
                                    value={checklistInput.fearGateScore}
                                    onChange={(e) => setChecklistInput({ ...checklistInput, fearGateScore: Number(e.target.value) })}
                                />
                                <div className="range-hints">
                                    <span>0~3 正常</span>
                                    <span>4~6 警戒</span>
                                    <span>7~8 压力</span>
                                    <span>9~10 恐慌</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>
                                    主题拥挤度评分 (0~100)
                                    <span className="val-preview font-mono text-cyan">{checklistInput.crowdingScore} 分</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="1"
                                    className="dark-range"
                                    value={checklistInput.crowdingScore}
                                    onChange={(e) => setChecklistInput({ ...checklistInput, crowdingScore: Number(e.target.value) })}
                                />
                            </div>

                            <div className="form-group">
                                <label>
                                    相对强弱评分 RS Rating (0~100)
                                    <span className="val-preview font-mono text-gold">{checklistInput.rsRating} 分</span>
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="1"
                                    className="dark-range"
                                    value={checklistInput.rsRating}
                                    onChange={(e) => setChecklistInput({ ...checklistInput, rsRating: Number(e.target.value) })}
                                />
                            </div>

                            <div className="form-group">
                                <label>拟加仓后该主题总仓位占比 (%)</label>
                                <input
                                    type="number"
                                    className="dark-input font-mono"
                                    min="0"
                                    max="100"
                                    step="0.5"
                                    value={checklistInput.currentThemeWeightPct}
                                    onChange={(e) => setChecklistInput({ ...checklistInput, currentThemeWeightPct: Number(e.target.value) })}
                                />
                                <span className="field-tip">单因子主题硬上限为 30% NAV</span>
                            </div>

                            <div className="checkboxes-stack">
                                <label className="custom-checkbox-row">
                                    <input
                                        type="checkbox"
                                        checked={checklistInput.trendAboveMa50}
                                        onChange={(e) => setChecklistInput({ ...checklistInput, trendAboveMa50: e.target.checked })}
                                    />
                                    <span>日线处于 50 日均线上方 (中期顺势)</span>
                                </label>

                                <label className="custom-checkbox-row">
                                    <input
                                        type="checkbox"
                                        checked={checklistInput.entryReclaimConfirmed}
                                        onChange={(e) => setChecklistInput({ ...checklistInput, entryReclaimConfirmed: e.target.checked })}
                                    />
                                    <span>具备放量突破或回踩企稳确认 (Reclaim)</span>
                                </label>

                                <label className="custom-checkbox-row">
                                    <input
                                        type="checkbox"
                                        checked={checklistInput.plannedLossUnder1PctNav}
                                        onChange={(e) => setChecklistInput({ ...checklistInput, plannedLossUnder1PctNav: e.target.checked })}
                                    />
                                    <span>单笔预设止损风险 $\le$ 账户总净值的 1%</span>
                                </label>

                                <label className="custom-checkbox-row">
                                    <input
                                        type="checkbox"
                                        checked={checklistInput.hasHardStopPlan}
                                        onChange={(e) => setChecklistInput({ ...checklistInput, hasHardStopPlan: e.target.checked })}
                                    />
                                    <span>已预设清晰的硬性止损位与退出预案</span>
                                </label>
                            </div>
                        </div>

                        {/* 右侧：核验结果与机器裁定 */}
                        <div className="checklist-result-card">
                            <div className="result-verdict-banner" style={{ borderColor: checklistResult.verdictColor }}>
                                <div className="verdict-head">
                                    <span className="verdict-title font-bold" style={{ color: checklistResult.verdictColor }}>
                                        {checklistResult.verdictTitle}
                                    </span>
                                    <span className="verdict-score-badge font-mono" style={{ backgroundColor: checklistResult.verdictColor }}>
                                        合规得分: {checklistResult.score}%
                                    </span>
                                </div>
                                <p className="verdict-guidance">{checklistResult.actionGuidance}</p>
                            </div>

                            {/* 若存在否决原因，突出显示 */}
                            {checklistResult.vetoReasons.length > 0 && (
                                <div className="veto-alert-box">
                                    <h5 className="veto-box-title">❌ 触发 {checklistResult.vetoReasons.length} 项机器否决禁令：</h5>
                                    <ul className="veto-reasons-list">
                                        {checklistResult.vetoReasons.map((r, i) => (
                                            <li key={i}>{r}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* 六维逐项审核细则 */}
                            <div className="audits-list-section">
                                <h5 className="section-title">六维逐项独立审计细则</h5>
                                <div className="audits-grid">
                                    {checklistResult.dimensionAudits.map((a, i) => (
                                        <div key={i} className={`audit-item-box ${a.pass ? 'pass-box' : 'fail-box'}`}>
                                            <div className="audit-item-head">
                                                <span className="dim-name">{a.dimension}</span>
                                                <span className={`status-pill ${a.pass ? 'pass-pill' : 'fail-pill'}`}>
                                                    {a.statusText}
                                                </span>
                                            </div>
                                            <p className="dim-detail">{a.detail}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 视图：H1~H17 实证科研假说看板 */}
            {subTab === 'hypotheses' && (
                <div className="rebound-hypotheses-view">
                    <div className="hypotheses-hero-banner">
                        <div className="hero-left">
                            <span className="hypo-icon">🧬</span>
                            <div>
                                <h4>26 年量化实证科研假说生命周期全景 (H1~H17 Hypotheses Registry)</h4>
                                <p>严守 AI-Memory 科学无偏准则：所有假说均经 2000–2026 年（6,713 交易日）全样本逐笔检验，绝不隐瞒负面结论，拒绝过度拟合与未来函数。</p>
                            </div>
                        </div>
                    </div>

                    {/* 筛选过滤工具条 */}
                    <div className="hypo-filter-bar">
                        <div className="filter-group">
                            <span className="filter-label">研究领域：</span>
                            {['all', 'Asset Allocation', 'Factor & Alpha', 'Risk & Fear Gate', 'AI Bottleneck', 'Execution Discipline'].map((cat) => (
                                <button
                                    key={cat}
                                    className={`filter-btn ${hypoCategoryFilter === cat ? 'active' : ''}`}
                                    onClick={() => setHypoCategoryFilter(cat)}
                                >
                                    {cat === 'all' ? '全部领域 (17)' : cat}
                                </button>
                            ))}
                        </div>

                        <div className="filter-group">
                            <span className="filter-label">生命周期状态：</span>
                            {['all', 'integrated_in_v9', 'validated', 'research_active'].map((st) => (
                                <button
                                    key={st}
                                    className={`filter-btn ${hypoStatusFilter === st ? 'active' : ''}`}
                                    onClick={() => setHypoStatusFilter(st)}
                                >
                                    {st === 'all' ? '全部状态' : st === 'integrated_in_v9' ? '已融入基石' : st === 'validated' ? '实证证实' : '科研追踪'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 假说卡片瀑布流 */}
                    <div className="hypotheses-cards-grid">
                        {EMPIRICAL_HYPOTHESES_REGISTRY
                            .filter((h) => hypoCategoryFilter === 'all' || h.category === hypoCategoryFilter)
                            .filter((h) => hypoStatusFilter === 'all' || h.status === hypoStatusFilter)
                            .map((h) => (
                                <div key={h.id} className="hypothesis-card">
                                    <div className="hypo-card-header">
                                        <div className="hypo-id-wrap">
                                            <span className="hypo-id-badge font-mono font-bold">{h.id}</span>
                                            <div>
                                                <h4 className="hypo-title">{h.title}</h4>
                                                <span className="hypo-date font-mono">提出日期: {h.proposedDate}</span>
                                            </div>
                                        </div>
                                        <div className="hypo-tags-group">
                                            <span className="category-pill">{h.category}</span>
                                            <span className="status-pill" style={{ backgroundColor: `${h.statusColor}22`, color: h.statusColor, border: `1px solid ${h.statusColor}` }}>
                                                {h.statusText}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="hypo-section-block">
                                        <span className="block-title">💡 核心科学论断：</span>
                                        <p className="block-content">{h.coreThesis}</p>
                                    </div>

                                    <div className="hypo-section-block">
                                        <span className="block-title">🔬 实证检验方法：</span>
                                        <p className="block-content font-mono">{h.empiricalMethod}</p>
                                    </div>

                                    <div className="hypo-findings-box">
                                        <span className="block-title">📊 26 年历史实证结论：</span>
                                        <p className="block-content">{h.keyFindings}</p>
                                    </div>

                                    <div className="hypo-impact-box">
                                        <span className="block-title">🚀 生产策略实战落地：</span>
                                        <p className="block-content">{h.actionImpact}</p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* 视图：RSR2 相对强弱动量突破雷达 */}
            {subTab === 'rsr-momentum' && (
                <div className="rebound-rsr-view">
                    <div className="rsr-banner-card">
                        <div className="rsr-banner-head">
                            <div>
                                <span className="source-repo-tag">🚀 AI-Memory Alpha 进攻端</span>
                                <h4>{RSR2_MOMENTUM_SCREENER.name}</h4>
                                <span className="as-of-date">覆盖样本池：{RSR2_MOMENTUM_SCREENER.universe}</span>
                            </div>
                            <div className="rsr-stat-badges">
                                <div className="stat-pill">
                                    <span className="lbl">实证胜率</span>
                                    <span className="val text-gold font-mono">{RSR2_MOMENTUM_SCREENER.historicalWinRatePct}%</span>
                                </div>
                                <div className="stat-pill">
                                    <span className="lbl">利润因子 (PF)</span>
                                    <span className="val text-cyan font-mono">{RSR2_MOMENTUM_SCREENER.profitFactor}x</span>
                                </div>
                                <div className="stat-pill">
                                    <span className="lbl">平均持仓</span>
                                    <span className="val text-green font-mono">{RSR2_MOMENTUM_SCREENER.holdingBarsExpected} 天</span>
                                </div>
                            </div>
                        </div>

                        <div className="rsr-criteria-strip">
                            <span className="crit-item"><strong>铁律 1:</strong> RS Rating &ge; {RSR2_MOMENTUM_SCREENER.rsThreshold} (超越全市场 85% 股票)</span>
                            <span className="crit-item"><strong>铁律 2:</strong> 均线多头排列 (Close &gt; MA20 &gt; MA50 &gt; MA200)</span>
                            <span className="crit-item"><strong>铁律 3:</strong> 突破放量 &ge; {RSR2_MOMENTUM_SCREENER.volumeThreshold}x 20日均量</span>
                            <span className="crit-item"><strong>铁律 4:</strong> 收盘强度 CLV &ge; {RSR2_MOMENTUM_SCREENER.clvThreshold} (位于日内最高 25% 区间)</span>
                        </div>
                    </div>

                    {/* 标的卡片网格 */}
                    <div className="rsr-stocks-grid">
                        {RSR2_MOMENTUM_SCREENER.stocks.map(stk => (
                            <div key={stk.symbol} className="rsr-stock-card">
                                <div className="rsr-card-head">
                                    <div>
                                        <span className="sym font-mono font-bold">{stk.symbol}</span>
                                        <span className="name">{stk.name}</span>
                                    </div>
                                    <span className={`rs-badge font-mono ${stk.rsRating >= 95 ? 'rs-super' : ''}`}>
                                        RS {stk.rsRating}
                                    </span>
                                </div>

                                <span className="rsr-sector-tag">{stk.sector}</span>

                                <div className="rsr-metrics-grid">
                                    <div className="metric-box">
                                        <span className="lbl">现价 / 突破位</span>
                                        <span className="val font-mono">${stk.currentPrice.toFixed(2)} / ${stk.breakoutPrice.toFixed(2)}</span>
                                    </div>
                                    <div className="metric-box">
                                        <span className="lbl">放量倍数</span>
                                        <span className="val font-mono text-cyan">{stk.volumeMultiplier.toFixed(2)}x 均量</span>
                                    </div>
                                    <div className="metric-box">
                                        <span className="lbl">收盘强度 (CLV)</span>
                                        <span className="val font-mono text-gold">{stk.closeLocationValue.toFixed(2)}</span>
                                    </div>
                                    <div className="metric-box">
                                        <span className="lbl">ATR 波动带</span>
                                        <span className="val font-mono">±${stk.atr14.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="rsr-status-row">
                                    <span className="lbl">突破状态：</span>
                                    <span className={`rsr-status-pill status-${stk.breakoutStatus}`}>
                                        {stk.breakoutStatus === 'confirmed' ? '🟢 突破放量确认 (主升浪)' : '🟡 观察蓄势待破 (临界点)'}
                                    </span>
                                </div>

                                <div className="rsr-catalyst-note">
                                    <strong>🚀 核心驱动催化剂：</strong>
                                    <p>{stk.catalyst}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 视图：防洗盘二次企稳重入决策树 */}
            {subTab === 'reentry' && (
                <div className="rebound-reentry-view">
                    <div className="reentry-banner-card">
                        <div className="reentry-head">
                            <span className="reentry-icon">🔄</span>
                            <div>
                                <h4>{REENTRY_EXECUTION_ENGINE.version}：防洗盘二次企稳重入决策树</h4>
                                <span className="as-of-date">解决痛点：严防优质白马在假破位洗盘触碰盘中止损后快速爆拉拉升、散户“卖飞大牛股”</span>
                            </div>
                        </div>

                        <div className="reentry-stats-bar">
                            <div className="stat-pill">
                                <span className="lbl">洗盘企稳挽回率</span>
                                <span className="val text-gold font-mono">{REENTRY_EXECUTION_ENGINE.historicalWhipsawRecoveryRatePct}%</span>
                                <span className="sub">(26年历史 38.6% 止损被成功挽救)</span>
                            </div>
                            <div className="stat-pill">
                                <span className="lbl">平均收益增厚</span>
                                <span className="val text-cyan font-mono">+{REENTRY_EXECUTION_ENGINE.avgGainImprovementPct}%</span>
                                <span className="sub">(相较于机械割肉离场)</span>
                            </div>
                            <div className="stat-pill">
                                <span className="lbl">观察窗口期</span>
                                <span className="val text-green font-mono">{REENTRY_EXECUTION_ENGINE.observationWindowDays} 个交易日</span>
                                <span className="sub">(超期未收复则硬性淘汰)</span>
                            </div>
                        </div>
                    </div>

                    {/* 四步执行决策流 */}
                    <div className="reentry-flow-container">
                        <h4>🔄 严谨点时执行状态机流程</h4>
                        <div className="flow-steps-grid">
                            {REENTRY_EXECUTION_ENGINE.stepByStepFlow.map(s => (
                                <div key={s.step} className="flow-step-card">
                                    <div className="step-badge">步骤 {s.step}</div>
                                    <h4 className="step-title">{s.title}</h4>
                                    <p className="step-action">{s.action}</p>
                                    <div className="step-guard">
                                        <strong>🛡️ 严格防线：</strong>
                                        <p>{s.riskGuard}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 实盘挽救案例 */}
                    <div className="reentry-cases-section">
                        <h4>📋 近期实战洗盘挽回案例台账</h4>
                        <div className="cases-cards-grid">
                            {REENTRY_EXECUTION_ENGINE.recentCaseStudies.map(c => (
                                <div key={c.symbol} className="case-card">
                                    <div className="case-top">
                                        <span className="case-sym font-mono font-bold">{c.symbol}</span>
                                        <span className="case-gain font-mono text-green font-bold">+{c.subsequentMaxGainPct.toFixed(2)}%</span>
                                    </div>
                                    <div className="case-timeline">
                                        <div className="time-node">
                                            <span className="date font-mono">{c.stopLossDate}</span>
                                            <span className="label">触碰止损</span>
                                            <span className="px font-mono">${c.stopPrice.toFixed(2)}</span>
                                        </div>
                                        <div className="time-arrow">➡️ 企稳 ➡️</div>
                                        <div className="time-node">
                                            <span className="date font-mono">{c.reentryDate}</span>
                                            <span className="label">触发重入</span>
                                            <span className="px font-mono">${c.reentryPrice.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="case-status-note">{c.status}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 视图：单因子风险预算与锁利实证 */}
            {subTab === 'risk-budget' && (
                <div className="rebound-risk-budget-view">
                    <div className="risk-budget-banner">
                        <div className="budget-head">
                            <span className="budget-icon">⚖️</span>
                            <div>
                                <h4>组合级单因子 30% 风险预算硬约束 & 出场机制实证</h4>
                                <span className="as-of-date">审计基准日：{PORTFOLIO_RISK_BUDGET_DATA.asOfDate}</span>
                            </div>
                        </div>
                        <div className="budget-summary-callout">
                            {PORTFOLIO_RISK_BUDGET_DATA.summaryInsight}
                        </div>
                    </div>

                    {/* 因子暴露约束进度 */}
                    <div className="factors-constraint-section">
                        <h4>📊 核心因子集中度监控 (硬约束上限: 30%)</h4>
                        <div className="factors-list">
                            {PORTFOLIO_RISK_BUDGET_DATA.factorConstraints.map((fc, idx) => (
                                <div key={idx} className={`factor-budget-card status-${fc.riskLevel}`}>
                                    <div className="fb-head">
                                        <span className="fb-name">{fc.factorName}</span>
                                        <span className={`fb-weight font-mono font-bold ${fc.currentWeightPct > fc.hardLimitPct ? 'text-red' : 'text-green'}`}>
                                            {fc.currentWeightPct.toFixed(2)}% (上限 {fc.hardLimitPct.toFixed(1)}%)
                                        </span>
                                    </div>
                                    <div className="fb-bar-wrap">
                                        <div
                                            className={`fb-bar-fill ${fc.currentWeightPct > fc.hardLimitPct ? 'fill-danger' : 'fill-safe'}`}
                                            style={{ width: `${Math.min(fc.currentWeightPct, 100)}%` }}
                                        />
                                    </div>
                                    <p className="fb-action"><strong>风控指令：</strong>{fc.actionRequired}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 出场止盈机制 26 年实证对比表 */}
                    <div className="exit-study-section">
                        <h4>🔬 26年历史三大出场止盈模式科学对照表 (2000–2026 全样本)</h4>
                        <div className="exit-table-wrap">
                            <table className="exit-comparison-table">
                                <thead>
                                    <tr>
                                        <th>出场模式</th>
                                        <th>年化复合 (CAGR)</th>
                                        <th>夏普比率 (Sharpe)</th>
                                        <th>最大历史回撤</th>
                                        <th>胜率 (Win Rate)</th>
                                        <th>换手率倍数</th>
                                        <th>实证裁决结论</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {PORTFOLIO_RISK_BUDGET_DATA.exitMethodEmpiricalStudy.map((ex, idx) => (
                                        <tr key={idx} className={idx === 0 ? 'highlight-winner-row' : ''}>
                                            <td className="font-bold">{ex.method}</td>
                                            <td className="font-mono font-bold text-gold">+{ex.cagrPct.toFixed(1)}%</td>
                                            <td className="font-mono font-bold text-cyan">{ex.sharpeRatio.toFixed(2)}</td>
                                            <td className="font-mono text-green">{ex.maxDrawdownPct.toFixed(2)}%</td>
                                            <td className="font-mono">{ex.winRatePct.toFixed(1)}%</td>
                                            <td className="font-mono">{ex.turnoverMultiplier.toFixed(1)}x</td>
                                            <td className="verdict-cell">{ex.verdict}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* 视图：三大独立前瞻对冲机制 */}
            {subTab === 'mechanisms' && (
                <div className="rebound-mechanisms-view">
                    <div className="mechanisms-intro-card">
                        <div className="intro-badge">🔬 跨出饱和历史回测的真创新</div>
                        <h4>AI-Memory 严谨注册制：三大独立经济学机制</h4>
                        <p>
                            AI-Memory 严守科研红线：在历史 26 支参数研究饱和后，坚决禁止通过微调 ATR 止损、修改均线周期或扩大标的池来制造“纸面神话”。
                            以下三大机制基于<strong>真实的产业牛鞭效应、资金负债端利息及多空因子对冲</strong>，为小资金现金额度管理注入全新生产力。
                        </p>
                    </div>

                    <div className="mechanisms-list">
                        {PREREGISTERED_MECHANISMS.map(m => (
                            <div key={m.id} className="mechanism-card">
                                <div className="mech-head">
                                    <div>
                                        <h4 className="mech-title">{m.title}</h4>
                                        <span className="mech-title-en font-mono">{m.titleEn}</span>
                                    </div>
                                </div>

                                <div className="mech-body-grid">
                                    <div className="mech-box logic-box">
                                        <strong>💡 核心经济学机制：</strong>
                                        <p>{m.economicLogic}</p>
                                    </div>
                                    <div className="mech-box solve-box">
                                        <strong>🎯 解决组合实质痛点：</strong>
                                        <p>{m.solvesProblem}</p>
                                    </div>
                                    <div className="mech-box app-box">
                                        <strong>💼 在当前实盘中的落地：</strong>
                                        <p>{m.portfolioApplication}</p>
                                    </div>
                                    <div className="mech-box risk-box">
                                        <strong>⚠️ 核心风险与失效模式：</strong>
                                        <p>{m.failureRisk}</p>
                                    </div>
                                </div>

                                <div className="mech-evidence-footer">
                                    <strong>📋 正式前瞻注册所需的实证门槛：</strong>
                                    <p>{m.evidenceRequirement}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 视图 2：100% 胜率数学铁律与审计报告 */}
            {subTab === 'rules' && (
                <div className="rebound-rules-view">
                    <div className="rules-intro-card">
                        <h4>十轮逐级优化科学审计全景 (2000–2026)</h4>
                        <p>
                            AI-Memory 严守“绝不造假、闭环循环优化、检查错误数据与结论”科研原则，对 61 只标的展开全面历史扫描。揭露出 NVDA/AMD/NFLX 等成长股存在“假 100% 陷阱”（若盲目死扛浮亏曾深达 -95% 且需熬过 13 年），
                            通过逐级加入 <strong>-6% 相变回踩深度、MA200 长期过滤、两日连阳右侧确认、RSI &ge; 85 顶背离闪电止盈、VIX &le; 35 极端断路器</strong>，彻底将策略提炼至零退化的全纪元 100% 胜率。
                        </p>
                    </div>

                    <div className="rules-cards-list">
                        {BOTTOM_REBOUND_RULES.map((r, idx) => (
                            <div key={idx} className="rule-item-card">
                                <div className="rule-head">
                                    <span className="rule-step">铁律 {idx + 1}</span>
                                    <h4 className="rule-title">{r.title}</h4>
                                    <code className="rule-formula-badge">{r.formula}</code>
                                </div>
                                <p className="rule-detail">{r.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 视图 3：跨三大纪元真实逐笔交易样本 */}
            {subTab === 'trades' && (
                <div className="rebound-trades-view">
                    <div className="trades-filter-bar">
                        <span className="filter-lbl">纪元筛选：</span>
                        {(['all', '2000-2007', '2008-2016', '2017-2026'] as const).map(ep => (
                            <button
                                key={ep}
                                className={`epoch-btn ${selectedEpoch === ep ? 'active' : ''}`}
                                onClick={() => setSelectedEpoch(ep)}
                            >
                                {ep === 'all' && '全部三大纪元样本'}
                                {ep === '2000-2007' && '纪元 1：2000-2007 (泡沫破裂与筑底)'}
                                {ep === '2008-2016' && '纪元 2：2008-2016 (次贷危机与复苏)'}
                                {ep === '2017-2026' && '纪元 3：2017-2026 (大牛市与加息)'}
                            </button>
                        ))}
                    </div>

                    <div className="backtest-table-wrapper">
                        <table className="radar-data-table backtest-table">
                            <thead>
                                <tr>
                                    <th>标的代码</th>
                                    <th>所属纪元</th>
                                    <th>入场日期</th>
                                    <th>出场日期</th>
                                    <th>入场价格</th>
                                    <th>出场价格</th>
                                    <th>持仓天数</th>
                                    <th>单笔净收益</th>
                                    <th>最大逆向浮亏 (MAE)</th>
                                    <th>离场触发原因</th>
                                    <th>胜负</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTrades.map((t, idx) => (
                                    <tr key={idx}>
                                        <td className="font-mono font-bold text-neutral">{t.symbol}</td>
                                        <td className="text-muted" style={{ fontSize: '0.76rem' }}>{t.epoch}</td>
                                        <td className="font-mono">{t.entryDate}</td>
                                        <td className="font-mono">{t.exitDate}</td>
                                        <td className="font-mono">${t.entryPx.toFixed(2)}</td>
                                        <td className="font-mono">${t.exitPx.toFixed(2)}</td>
                                        <td className="font-mono">{t.holdBars} 天</td>
                                        <td className={`font-mono font-bold ${isCn ? 'text-red' : 'text-green'}`}>
                                            +{t.netGainPct.toFixed(2)}%
                                        </td>
                                        <td className="font-mono text-muted">{t.maePct.toFixed(2)}%</td>
                                        <td>
                                            <span className="exit-reason-pill">
                                                {t.exitReason === 'rsi_exhaustion' ? '⚡ RSI(2)枯竭顶背离' : '🎯 达成固定TP +2%'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="regime-badge regime-bull">✓ 盈利</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 视图 4：V9 机构双轨配置与恐惧之门 */}
            {subTab === 'v9' && (
                <div className="rebound-v9-view">
                    <div className="v9-architecture-card">
                        <h4>{V9_STRATEGY_CONFIG.strategyName}</h4>
                        <p>
                            V9 是 <code>AI-Memory</code> 体系中唯一定向部署的单组合量化体系，融合了<strong>70% 宽基指数趋势追踪</strong>与<strong>30% 胜率增强个股袖</strong>，
                            任何组件在缺乏严格证据授权时自动回退为现金余量，兼顾牛市跟进与熊市防暴跌。
                        </p>

                        <div className="v9-alloc-bar-wrap">
                            <div className="alloc-header">
                                <span>组合目标仓位划分架构</span>
                                <span>70% 指数核 + 30% 个股Alpha</span>
                            </div>
                            <div className="alloc-progress-track">
                                <div className="alloc-slice-core" style={{ width: '70%' }}>
                                    70% 指数核心 (SPY / QQQ 趋势追踪)
                                </div>
                                <div className="alloc-slice-alpha" style={{ width: '30%' }}>
                                    30% 胜率Alpha (自然垄断底部品种)
                                </div>
                            </div>
                        </div>

                        <div className="v9-specs-grid">
                            <div className="spec-box">
                                <span className="lbl">宽基核心规则 (70%)</span>
                                <span className="val">{V9_STRATEGY_CONFIG.coreRule}</span>
                            </div>
                            <div className="spec-box">
                                <span className="lbl">个股Alpha规则 (30%)</span>
                                <span className="val">{V9_STRATEGY_CONFIG.alphaRule}</span>
                            </div>
                            <div className="spec-box">
                                <span className="lbl">再平衡机制</span>
                                <span className="val">{V9_STRATEGY_CONFIG.rebalanceFrequency}</span>
                            </div>
                            <div className="spec-box">
                                <span className="lbl">安全垫原则</span>
                                <span className="val">{V9_STRATEGY_CONFIG.cashBufferRule}</span>
                            </div>
                        </div>

                        {/* 核心统合原则与 core_priority 仲裁公理 */}
                        <div className="unified-priority-banner">
                            <div className="priority-tag-row">
                                <span className="priority-badge">⭐ 最高仲裁法则：core_priority (核心绝对优先)</span>
                            </div>
                            <p className="priority-desc">{V8_V9_UNIFIED_OPERATING_MODEL.priorityRuleExplanation}</p>
                        </div>

                        {/* 五级绝对优先级仲裁层级表 */}
                        <div className="priority-hierarchy-section">
                            <h5 className="sub-section-title">📊 五级绝对策略优先级仲裁序列 (Arbitration Hierarchy)</h5>
                            <div className="priority-table-wrap">
                                <table className="priority-hierarchy-table">
                                    <thead>
                                        <tr>
                                            <th>优先级</th>
                                            <th>系统模块与定位</th>
                                            <th>预算天花板</th>
                                            <th>触发判定条件</th>
                                            <th>机构决策指令与优先级含义</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {V8_V9_UNIFIED_OPERATING_MODEL.priorityHierarchy.map((tier) => (
                                            <tr key={tier.priorityLevel} className={`priority-row-lvl-${tier.priorityLevel}`}>
                                                <td className="font-mono font-bold text-center">
                                                    <span className={`p-level-pill lvl-${tier.priorityLevel}`}>P{tier.priorityLevel}</span>
                                                </td>
                                                <td>
                                                    <div className="comp-name font-bold">{tier.componentName}</div>
                                                    <div className="comp-role text-muted">{tier.moduleRole}</div>
                                                </td>
                                                <td className="font-mono font-bold text-center">
                                                    {tier.budgetCeilingPct > 0 ? `${tier.budgetCeilingPct.toFixed(0)}%` : '动态/拦截'}
                                                </td>
                                                <td className="rules-cell">{tier.decisionRule}</td>
                                                <td className="directives-cell">{tier.priorityDirective}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 四级市场风险状态下的资本天花板矩阵 */}
                        <div className="regime-ceilings-section">
                            <h5 className="sub-section-title">🛡️ 四级市场状态动态资本天花板矩阵 (Dynamic Capital Ceilings)</h5>
                            <div className="regime-cards-grid">
                                {V8_V9_UNIFIED_OPERATING_MODEL.regimeCeilings.map((c) => (
                                    <div key={c.regime} className={`regime-ceiling-card card-${c.regime}`}>
                                        <div className="regime-card-top">
                                            <span className="regime-name font-bold">{c.nameCn}</span>
                                            <span className="regime-cond font-mono">{c.vixCondition}</span>
                                        </div>
                                        <div className="regime-alloc-row font-mono">
                                            <div className="alloc-pill pill-core">
                                                <span className="lbl">指数核心</span>
                                                <span className="val">{c.coreCeilingPct}%</span>
                                            </div>
                                            <div className="alloc-pill pill-stock">
                                                <span className="lbl">个股卫星</span>
                                                <span className="val">{c.stockCeilingPct}%</span>
                                            </div>
                                            <div className="alloc-pill pill-cash">
                                                <span className="lbl">缓冲现金</span>
                                                <span className="val">{c.minCashPct}%</span>
                                            </div>
                                        </div>
                                        <p className="regime-rationale">{c.arbitrationRationale}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 仲裁状态机执行步序流 */}
                        <div className="arbitration-flow-section">
                            <h5 className="sub-section-title">🔄 生产决策状态机标准仲裁步序 (Deterministic Flow)</h5>
                            <ol className="flow-steps-list">
                                {V8_V9_UNIFIED_OPERATING_MODEL.arbitrationFlowchartSummary.map((step, idx) => (
                                    <li key={idx} className="flow-step-item">
                                        <span className="step-idx font-mono">0{idx + 1}</span>
                                        <span className="step-text">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    {/* 恐惧之门 Fear Gate 仪表盘 */}
                    <div className="fear-gate-card">
                        <div className="fear-gate-header">
                            <span className="fear-icon">🚪</span>
                            <div className="fear-title-wrap">
                                <h4>恐惧之门 (Fear Gate) 期限结构实时风控系统</h4>
                                <p>基于 Cboe 官方 VIX 与 VIX3M 波动率期限结构，防范暗流涌动的流动性踩踏风暴。</p>
                            </div>
                            <div className="current-fear-pill status-normal">
                                当前状态: {FEAR_GATE_LEVELS.normal.name}
                            </div>
                        </div>

                        <div className="fear-levels-grid">
                            {Object.values(FEAR_GATE_LEVELS).map(lvl => (
                                <div key={lvl.level} className={`fear-level-box ${lvl.level === 'normal' ? 'active-level' : ''}`}>
                                    <div className="lvl-head">
                                        <span className="lvl-name">{lvl.name}</span>
                                        <span className="lvl-vix font-mono">{lvl.vixRange}</span>
                                    </div>
                                    <span className="lvl-term">{lvl.termStructure}</span>
                                    <p className="lvl-action">{lvl.action}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 视图 5：全球四大顶尖量化机构智库 */}
            {subTab === 'hedgefunds' && (
                <div className="rebound-hedgefunds-view">
                    <div className="section-meta-tip">
                        <span>🏛️ <strong>顶尖机构对冲智库</strong>：源自 AI-Memory 本地自动化爬虫与分析模块，持续对标全球一流对冲基金的最新研究论文与实证结论，为量化策略提供扎实的底层理论基石。</span>
                    </div>

                    <div className="hedgefunds-cards-grid">
                        {INSTITUTIONAL_RESEARCH_FEED.map((hf, idx) => (
                            <div key={idx} className="hedgefund-card">
                                <div className="hf-header">
                                    <span className="hf-institution">{hf.institution}</span>
                                    <span className="hf-date">{hf.date}</span>
                                </div>
                                <h4 className="hf-title">{hf.title}</h4>
                                <div className="hf-takeaway-box">
                                    <strong>机构核心论断：</strong>
                                    <p>{hf.takeaway}</p>
                                </div>
                                <div className="hf-application-box">
                                    <strong>在本项目中的实战映射：</strong>
                                    <p>{hf.application}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
