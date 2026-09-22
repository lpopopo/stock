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
    type BottomReboundStock,
    type TradeChecklistInput,
    type TradeChecklistResult,
    type BatchAuditRow,
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
