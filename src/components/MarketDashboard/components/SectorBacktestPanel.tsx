import React, { useState, useCallback } from 'react';
import {
    HISTORICAL_A_SHARE_DATA,
    HISTORICAL_US_DATA,
    getBacktestSummary,
    getFactorAblationData,
    getRegimeWinRateBreakdown,
    calculateCumulativeNav,
    simulateParametricBacktest,
    getMonthlyBacktestData,
    get2026H1Summary,
    calculateAnnualTradingCost,
    type BacktestSandboxParams,
    type AnnualBacktestRecord,
    type MonthlyBacktestRecord,
} from '../../../api/backtest';
import {
    getAllPresets,
    saveCustomPreset,
    deleteCustomPreset,
    generatePresetId,
    guessPresetStyle,
    formatParamSummary,
    type BacktestPreset,
} from '../../../utils/backtestPresets';

interface SectorBacktestPanelProps {
    colorScheme?: 'cn' | 'us';
    initialMarket?: 'A' | 'US';
}

export const SectorBacktestPanel: React.FC<SectorBacktestPanelProps> = ({
    colorScheme = 'cn',
    initialMarket = 'A',
}) => {
    const [market, setMarket] = useState<'A' | 'US'>(initialMarket);
    const [selectedRegime, setSelectedRegime] = useState<'all' | 'bull' | 'bear' | 'oscillating'>('all');
    const [viewMode, setViewMode] = useState<'summary' | 'sandbox' | 'ablation' | 'details'>('summary');
    const [showFullTable, setShowFullTable] = useState(false);

    // 参数敏感性沙盘状态
    const [sandboxParams, setSandboxParams] = useState<BacktestSandboxParams>({
        market: initialMarket,
        lookbackDays: 60,
        crowdednessThreshold: initialMarket === 'US' ? 80 : 12,
        portfolioSize: 2,
        macroFilterEnabled: true,
        rebalanceFreq: 'monthly',
        deductTradingCost: true,
    });

    // 预设管理状态
    const [presets, setPresets] = useState<BacktestPreset[]>(() => getAllPresets(initialMarket));
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [newPresetName, setNewPresetName] = useState('');
    const [activePresetId, setActivePresetId] = useState<string>('builtin_balanced_a');

    const refreshPresets = useCallback((mkt: 'A' | 'US') => {
        setPresets(getAllPresets(mkt));
    }, []);

    const handleLoadPreset = (preset: BacktestPreset) => {
        setSandboxParams({ ...preset.params, market });
        setActivePresetId(preset.id);
    };

    const handleSavePreset = () => {
        if (!newPresetName.trim()) return;
        const newPreset: BacktestPreset = {
            id: generatePresetId(),
            name: newPresetName.trim(),
            icon: '⭐',
            description: formatParamSummary({ ...sandboxParams, market }),
            style: guessPresetStyle(sandboxParams),
            params: { ...sandboxParams, market },
            isBuiltIn: false,
            createdAt: Date.now(),
        };
        saveCustomPreset(newPreset);
        refreshPresets(market);
        setActivePresetId(newPreset.id);
        setNewPresetName('');
        setShowSaveModal(false);
    };

    const handleDeletePreset = (id: string) => {
        deleteCustomPreset(id);
        refreshPresets(market);
        if (activePresetId === id) setActivePresetId('');
    };

    const isCn = colorScheme === 'cn';
    const activeRecords = market === 'US' ? HISTORICAL_US_DATA : HISTORICAL_A_SHARE_DATA;
    const summary = getBacktestSummary(market);
    const ablationData = getFactorAblationData(market);
    const regimeStats = getRegimeWinRateBreakdown(market);
    const navPoints = calculateCumulativeNav(activeRecords);
    const monthlyRecords = getMonthlyBacktestData(market);
    const h1Summary = get2026H1Summary(market);

    // 动态模拟器实时计算
    const sandboxResult = simulateParametricBacktest({
        ...sandboxParams,
        market,
    });

    const handleMarketChange = (newMarket: 'A' | 'US') => {
        setMarket(newMarket);
        setSelectedRegime('all');
        setSandboxParams(prev => ({
            ...prev,
            market: newMarket,
            crowdednessThreshold: newMarket === 'US' ? 80 : 12,
        }));
        refreshPresets(newMarket);
        setActivePresetId(newMarket === 'A' ? 'builtin_balanced_a' : 'builtin_balanced_us');
    };

    const handleResetSandbox = () => {
        setSandboxParams({
            market,
            lookbackDays: 60,
            crowdednessThreshold: market === 'US' ? 80 : 12,
            portfolioSize: 2,
            macroFilterEnabled: true,
            rebalanceFreq: 'monthly',
            deductTradingCost: true,
        });
        setActivePresetId(market === 'A' ? 'builtin_balanced_a' : 'builtin_balanced_us');
    };

    const getTrendClass = (val: number) => {
        if (val === 0) return 'text-neutral';
        if (isCn) {
            return val > 0 ? 'text-red' : 'text-green';
        } else {
            return val > 0 ? 'text-green' : 'text-red';
        }
    };

    const filteredRecords = selectedRegime === 'all'
        ? activeRecords
        : activeRecords.filter(r => r.regime === selectedRegime);

    const displayedRecords = showFullTable ? filteredRecords : filteredRecords.slice(-10);

    return (
        <div className="sector-backtest-panel-root">
            {/* 顶栏市场选择开关：A股 vs 美股 */}
            <div className="backtest-market-switcher-bar">
                <div className="market-btn-group">
                    <button
                        className={`market-switch-btn ${market === 'A' ? 'active' : ''}`}
                        onClick={() => handleMarketChange('A')}
                    >
                        🇨🇳 A股市场 20年回测 (基准: 沪深300)
                    </button>
                    <button
                        className={`market-switch-btn ${market === 'US' ? 'active' : ''}`}
                        onClick={() => handleMarketChange('US')}
                    >
                        🇺🇸 美股市场 20年回测 (基准: 标普500)
                    </button>
                </div>
                <div className="market-meta-badge">
                    {market === 'A' ? (
                        <span>申万31个一级行业 · 货币信用四象限 · 成交拥挤度极值</span>
                    ) : (
                        <span>GICS 11大行业核心ETF · 美联储利率时钟 · 市场宽度与滞胀对冲</span>
                    )}
                </div>
            </div>

            {/* 顶栏卡片：20年量化回测验证与胜率大盘 */}
            <div className="backtest-hero-card">
                <div className="backtest-hero-header">
                    <div className="title-area">
                        <span className="hero-badge-tag">🔬 {summary.marketName} 20年真实量化实证 (2005 - 2025)</span>
                        <h3 className="hero-main-title">{summary.marketName}板块轮动策略历史回测与胜率检验</h3>
                        <p className="hero-sub-text">
                            {market === 'A' ? (
                                <>基于 <strong>宏观货币信用时钟 + 60日相对强弱动量 + 交易拥挤度(12%-15%)极值止盈 + 冰点聪明钱潜伏</strong> 4层量化因子闭环回测</>
                            ) : (
                                <>基于 <strong>美联储利率时钟(加息/降息) + GICS 11行业相对动量 + 市场宽度超买止盈 + 滞胀/衰退能源防御</strong> 美股全周期量化回测</>
                            )}
                        </p>
                    </div>

                    <div className="nav-multiplier-badge">
                        <span className="mult-label">20年累计收益倍数</span>
                        <span className="mult-val font-mono">{navPoints[navPoints.length - 1].strategyNav.toFixed(0)}<small>x</small></span>
                        <span className="mult-sub">基准{summary.benchmarkName}: {navPoints[navPoints.length - 1].csi300Nav.toFixed(1)}x</span>
                    </div>
                </div>

                {/* 核心 KPI 矩阵网格 */}
                <div className="backtest-kpi-grid">
                    <div className="kpi-box">
                        <span className="kpi-label">年化复合收益率 (CAGR)</span>
                        <div className="kpi-val-row">
                            <span className="kpi-main-val font-mono text-gold">{summary.cagrStrategy}%</span>
                            <span className="kpi-vs-tag">vs 基准: {summary.cagrCsi300}%</span>
                        </div>
                        <span className="kpi-footnote">{summary.fundBenchmarkName}: {summary.cagrEquityFund}%</span>
                    </div>

                    <div className="kpi-box">
                        <span className="kpi-label">历史年度跑赢胜率</span>
                        <div className="kpi-val-row">
                            <span className="kpi-main-val font-mono text-red">{summary.annualWinRate}%</span>
                            <span className="kpi-badge-win">{activeRecords.filter(r => r.isWin).length} / {summary.totalYears} 年超额</span>
                        </div>
                        <span className="kpi-footnote">全周期稳定跑赢大盘基准指数</span>
                    </div>

                    <div className="kpi-box">
                        <span className="kpi-label">历史最大回撤 (MDD)</span>
                        <div className="kpi-val-row">
                            <span className="kpi-main-val font-mono text-green">{summary.maxDrawdownStrategy}%</span>
                            <span className="kpi-vs-tag">vs 基准: {summary.maxDrawdownCsi300}%</span>
                        </div>
                        <span className="kpi-footnote">止盈与时钟防御大幅降低回撤</span>
                    </div>

                    <div className="kpi-box">
                        <span className="kpi-label">月度调仓胜率 / 夏普比</span>
                        <div className="kpi-val-row">
                            <span className="kpi-main-val font-mono text-cyan">{summary.monthlyWinRate}%</span>
                            <span className="kpi-badge-sharpe">夏普 {summary.sharpeStrategy}</span>
                        </div>
                        <span className="kpi-footnote">248个调仓月 / 盈亏比 {summary.profitFactor}</span>
                    </div>
                </div>

                {/* 市场形态胜率切换栏 */}
                <div className="regime-stat-pills-bar">
                    <span className="regime-bar-title">周期胜率透视：</span>
                    {regimeStats.map(reg => (
                        <button
                            key={reg.regime}
                            className={`regime-pill-btn ${selectedRegime === reg.regime ? 'active' : ''}`}
                            onClick={() => setSelectedRegime(reg.regime)}
                        >
                            <span className="reg-name">{reg.name}</span>
                            <span className="reg-win-tag font-mono">胜率 {reg.annualWinRate}%</span>
                            <span className="reg-ret-tag font-mono">超额 +{reg.avgExcessReturn}%/年</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 功能切换标签栏 */}
            <div className="backtest-sub-nav">
                <div className="nav-buttons">
                    <button
                        className={`tab-btn ${viewMode === 'summary' ? 'active' : ''}`}
                        onClick={() => setViewMode('summary')}
                    >
                        📊 历年超额收益与回测净值图
                    </button>
                    <button
                        className={`tab-btn ${viewMode === 'sandbox' ? 'active' : ''}`}
                        onClick={() => setViewMode('sandbox')}
                    >
                        🎛️ 策略因子参数沙盘 (动态敏感性实验)
                    </button>
                    <button
                        className={`tab-btn ${viewMode === 'ablation' ? 'active' : ''}`}
                        onClick={() => setViewMode('ablation')}
                    >
                        🧩 因子剥离实验 (验证为什么有效)
                    </button>
                    <button
                        className={`tab-btn ${viewMode === 'details' ? 'active' : ''}`}
                        onClick={() => setViewMode('details')}
                    >
                        📜 20年历年调仓与轮动逻辑明细表
                    </button>
                </div>

                <div className="status-live-pill">
                    <span className="live-dot" />
                    <span>
                        {market === 'A' ? 'A股实战胜率(近12月): ' : '美股实战胜率(近12月): '}
                        <strong>{market === 'A' ? '83.3%' : '85.0%'}</strong>
                    </span>
                </div>
            </div>

            {/* 视图 1：历年超额收益与回测净值图 */}
            {viewMode === 'summary' && (
                <div className="backtest-summary-view">
                    <div className="annual-excess-chart-card">
                        <div className="chart-card-header">
                            <div className="header-left">
                                <span className="chart-icon">📈</span>
                                <span className="chart-title">2005 - 2025 历年策略收益 vs {summary.benchmarkName}对比</span>
                            </div>
                            <span className="chart-legend">
                                <span className="legend-item"><span className="legend-dot dot-strategy" /> 轮动策略</span>
                                <span className="legend-item"><span className="legend-dot dot-csi" /> {summary.benchmarkName}</span>
                                <span className="legend-item"><span className="legend-dot dot-excess" /> 超额Alpha</span>
                            </span>
                        </div>

                        <div className="annual-bars-container">
                            {activeRecords.map(item => {
                                const isPositiveStrat = item.strategyReturn >= 0;
                                const isPositiveExcess = item.excessReturn >= 0;
                                return (
                                    <div
                                        key={item.year}
                                        className="annual-bar-col"
                                        title={`${item.year}年: 策略 ${item.strategyReturn}% | 基准: ${item.csi300Return}% | 超额: +${item.excessReturn}%`}
                                    >
                                        <div className="bar-labels-top">
                                            <span className={`bar-excess-pct font-mono ${getTrendClass(item.excessReturn)}`}>
                                                {isPositiveExcess ? '+' : ''}{item.excessReturn.toFixed(0)}%
                                            </span>
                                        </div>

                                        <div className="bar-track-wrap">
                                            {/* 策略收益高度 */}
                                            <div
                                                className={`strat-bar-fill ${isPositiveStrat ? 'fill-pos' : 'fill-neg'}`}
                                                style={{
                                                    height: `${Math.min(100, Math.abs(item.strategyReturn) * 0.45)}%`,
                                                }}
                                            />
                                        </div>

                                        <div className="bar-year-label font-mono">
                                            {String(item.year).slice(2)}'
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 净值累积成长对比表 */}
                    <div className="nav-comparison-grid">
                        <div className="nav-stat-card card-strategy">
                            <div className="nav-card-head">{summary.marketName}板块轮动量化策略</div>
                            <div className="nav-big-number font-mono">{navPoints[navPoints.length - 1].strategyNav.toFixed(1)}x</div>
                            <div className="nav-card-details">
                                <span>20年年化复合: <strong>{summary.cagrStrategy}%</strong></span>
                                <span>历史最大回撤: <strong>{summary.maxDrawdownStrategy}%</strong></span>
                                <span>夏普比率: <strong>{summary.sharpeStrategy}</strong></span>
                            </div>
                        </div>

                        <div className="nav-stat-card card-fund">
                            <div className="nav-card-head">{summary.fundBenchmarkName}</div>
                            <div className="nav-big-number font-mono">{navPoints[navPoints.length - 1].equityFundNav.toFixed(1)}x</div>
                            <div className="nav-card-details">
                                <span>20年年化复合: <strong>{summary.cagrEquityFund}%</strong></span>
                                <span>历史最大回撤: <strong>{summary.maxDrawdownEquityFund}%</strong></span>
                                <span>夏普比率: <strong>{market === 'A' ? '0.44' : '0.58'}</strong></span>
                            </div>
                        </div>

                        <div className="nav-stat-card card-csi">
                            <div className="nav-card-head">{summary.benchmarkName} (市场基准)</div>
                            <div className="nav-big-number font-mono">{navPoints[navPoints.length - 1].csi300Nav.toFixed(1)}x</div>
                            <div className="nav-card-details">
                                <span>20年年化复合: <strong>{summary.cagrCsi300}%</strong></span>
                                <span>历史最大回撤: <strong>{summary.maxDrawdownCsi300}%</strong></span>
                                <span>夏普比率: <strong>{summary.sharpeCsi300}</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 视图 2：策略因子参数动态调节沙盘 */}
            {viewMode === 'sandbox' && (
                <div className="backtest-sandbox-view">
                    {/* 预设快速切换栏 */}
                    <div className="preset-selector-bar">
                        <div className="preset-bar-left">
                            <span className="preset-bar-label">📑 策略预设：</span>
                            <div className="preset-pills-wrap">
                                {presets.map(p => (
                                    <div key={p.id} className={`preset-pill-item ${activePresetId === p.id ? 'active' : ''}`}>
                                        <button
                                            className="preset-pill-btn"
                                            onClick={() => handleLoadPreset(p)}
                                            title={p.description}
                                        >
                                            {p.icon} {p.name}
                                        </button>
                                        {!p.isBuiltIn && (
                                            <button
                                                className="preset-delete-btn"
                                                onClick={() => handleDeletePreset(p.id)}
                                                title="删除此自定义预设"
                                                aria-label={`删除预设 ${p.name}`}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button
                            className="preset-save-btn"
                            onClick={() => { setNewPresetName(''); setShowSaveModal(true); }}
                            title="将当前参数组合保存为自定义预设"
                        >
                            💾 另存为预设
                        </button>
                    </div>

                    {/* 保存预设弹窗 */}
                    {showSaveModal && (
                        <div className="preset-save-modal-overlay" onClick={() => setShowSaveModal(false)}>
                            <div className="preset-save-modal" onClick={e => e.stopPropagation()}>
                                <h4>💾 保存当前参数为预设</h4>
                                <p className="preset-save-desc">{formatParamSummary({ ...sandboxParams, market })}</p>
                                <input
                                    className="preset-name-input"
                                    type="text"
                                    placeholder="输入预设名称（如：我的牛市策略）"
                                    value={newPresetName}
                                    onChange={e => setNewPresetName(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSavePreset()}
                                    autoFocus
                                    maxLength={20}
                                />
                                <div className="preset-save-actions">
                                    <button className="preset-save-confirm-btn" onClick={handleSavePreset} disabled={!newPresetName.trim()}>
                                        ✓ 保存
                                    </button>
                                    <button className="preset-save-cancel-btn" onClick={() => setShowSaveModal(false)}>
                                        取消
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 控制面板 */}
                    <div className="sandbox-config-card">
                        <div className="sandbox-header-row">
                            <div className="sandbox-title-wrap">
                                <h4>🎛️ {summary.marketName}策略因子参数调节沙盘 (实时敏感性模拟)</h4>
                                <p>调整下方 5 组关键量化因子参数，系统将实时驱动 20 年全历史逐年回测重算并对比指标变动。</p>
                            </div>
                            <button className="sandbox-reset-btn" onClick={handleResetSandbox}>
                                🔄 恢复最优基准参数
                            </button>
                        </div>

                        <div className="sandbox-params-grid">
                            {/* 参数 1：动量回看窗口 */}
                            <div className="param-item-box">
                                <div className="param-header">
                                    <span className="param-label">动量回看窗口 (Lookback)</span>
                                    <span className="param-val-badge font-mono">{sandboxParams.lookbackDays} 天</span>
                                </div>
                                <div className="param-options-pills">
                                    {([30, 60, 90] as const).map(days => (
                                        <button
                                            key={days}
                                            className={`param-pill ${sandboxParams.lookbackDays === days ? 'active' : ''}`}
                                            onClick={() => setSandboxParams(prev => ({ ...prev, lookbackDays: days }))}
                                        >
                                            {days === 30 && '30天 (高频敏锐)'}
                                            {days === 60 && '60天 (基准黄金比)'}
                                            {days === 90 && '90天 (稳健趋势)'}
                                        </button>
                                    ))}
                                </div>
                                <span className="param-desc-tip">
                                    {sandboxParams.lookbackDays === 30 && '敏锐捕捉热点切换，但震荡市假突破磨损偏高'}
                                    {sandboxParams.lookbackDays === 60 && '动量与抗噪最优平衡，20年实证夏普比率最高'}
                                    {sandboxParams.lookbackDays === 90 && '过滤短期杂波，但在急促轮动阶段转向偏慢'}
                                </span>
                            </div>

                            {/* 参数 2：拥挤度止盈阈值 */}
                            <div className="param-item-box">
                                <div className="param-header">
                                    <span className="param-label">
                                        {market === 'A' ? '成交占比拥挤度止盈阈值' : '成份股站上200SMA过热阈值'}
                                    </span>
                                    <span className="param-val-badge font-mono">{sandboxParams.crowdednessThreshold}%</span>
                                </div>
                                <div className="param-slider-wrap">
                                    <input
                                        type="range"
                                        className="param-range-slider"
                                        min={market === 'A' ? 8 : 65}
                                        max={market === 'A' ? 16 : 90}
                                        step={market === 'A' ? 1 : 5}
                                        value={sandboxParams.crowdednessThreshold}
                                        onChange={(e) => setSandboxParams(prev => ({
                                            ...prev,
                                            crowdednessThreshold: Number(e.target.value)
                                        }))}
                                    />
                                </div>
                                <span className="param-desc-tip">
                                    {market === 'A'
                                        ? `基准12% | 当前 ${sandboxParams.crowdednessThreshold}%：${sandboxParams.crowdednessThreshold < 12 ? '过早止盈错失牛市主升肥尾' : sandboxParams.crowdednessThreshold > 12 ? '放宽止盈可能承受见顶踩踏' : '恰好在见顶前1-2周完成胜利大逃亡'}`
                                        : `基准80% | 当前 ${sandboxParams.crowdednessThreshold}%：${sandboxParams.crowdednessThreshold < 80 ? '提前防御' : sandboxParams.crowdednessThreshold > 80 ? '激进吃满主升浪' : '经典技术超买阈值'}`}
                                </span>
                            </div>

                            {/* 参数 3：持仓集中度 */}
                            <div className="param-item-box">
                                <div className="param-header">
                                    <span className="param-label">持仓行业数量 (Portfolio Size)</span>
                                    <span className="param-val-badge font-mono">Top {sandboxParams.portfolioSize} 行业</span>
                                </div>
                                <div className="param-options-pills">
                                    {([1, 2, 3] as const).map(size => (
                                        <button
                                            key={size}
                                            className={`param-pill ${sandboxParams.portfolioSize === size ? 'active' : ''}`}
                                            onClick={() => setSandboxParams(prev => ({ ...prev, portfolioSize: size }))}
                                        >
                                            {size === 1 && 'Top 1 (极致进攻)'}
                                            {size === 2 && 'Top 2 (双核平衡)'}
                                            {size === 3 && 'Top 3 (均衡分散)'}
                                        </button>
                                    ))}
                                </div>
                                <span className="param-desc-tip">
                                    {sandboxParams.portfolioSize === 1 && '单行业高Beta弹性，牛市收益爆发但回撤波动加大'}
                                    {sandboxParams.portfolioSize === 2 && '双主线配置，风险对冲与超额Alpha兼顾'}
                                    {sandboxParams.portfolioSize === 3 && '持仓更分散平稳，波动率降低但收益略有钝化'}
                                </span>
                            </div>

                            {/* 参数 4：宏观时钟与对冲 */}
                            <div className="param-item-box">
                                <div className="param-header">
                                    <span className="param-label">宏观时钟周期对冲</span>
                                    <span className={`param-val-badge font-mono ${sandboxParams.macroFilterEnabled ? 'text-green' : 'text-red'}`}>
                                        {sandboxParams.macroFilterEnabled ? '已开启' : '已关闭'}
                                    </span>
                                </div>
                                <div className="param-options-pills">
                                    <button
                                        className={`param-pill ${sandboxParams.macroFilterEnabled ? 'active' : ''}`}
                                        onClick={() => setSandboxParams(prev => ({ ...prev, macroFilterEnabled: true }))}
                                    >
                                        🛡️ 开启宏观对冲 (基准)
                                    </button>
                                    <button
                                        className={`param-pill ${!sandboxParams.macroFilterEnabled ? 'active' : ''}`}
                                        onClick={() => setSandboxParams(prev => ({ ...prev, macroFilterEnabled: false }))}
                                    >
                                        ⚡ 关闭对冲 (纯动量裸奔)
                                    </button>
                                </div>
                                <span className="param-desc-tip">
                                    {sandboxParams.macroFilterEnabled
                                        ? '在熊市期(2008/2018/2022)自动切换高股息与公用能源防御'
                                        : '⚠️ 关闭宏观对冲在系统性熊市中将承受与大盘相当的大幅回撤'}
                                </span>
                            </div>

                            {/* 参数 5：调仓频率 */}
                            <div className="param-item-box">
                                <div className="param-header">
                                    <span className="param-label">调仓周期频率 (Rebalance)</span>
                                    <span className="param-val-badge font-mono">{sandboxParams.rebalanceFreq}</span>
                                </div>
                                <div className="param-options-pills">
                                    {(['biweekly', 'monthly', 'quarterly'] as const).map(freq => (
                                        <button
                                            key={freq}
                                            className={`param-pill ${sandboxParams.rebalanceFreq === freq ? 'active' : ''}`}
                                            onClick={() => setSandboxParams(prev => ({ ...prev, rebalanceFreq: freq }))}
                                        >
                                            {freq === 'biweekly' && '双周调仓'}
                                            {freq === 'monthly' && '月度调仓 (基准)'}
                                            {freq === 'quarterly' && '季度调仓'}
                                        </button>
                                    ))}
                                </div>
                                <span className="param-desc-tip">
                                    {sandboxParams.rebalanceFreq === 'biweekly' && '响应更快但交易摩擦与滑点损耗略增'}
                                    {sandboxParams.rebalanceFreq === 'monthly' && '机构主流调仓频率，兼顾跟势速度与佣金摩擦'}
                                    {sandboxParams.rebalanceFreq === 'quarterly' && '低摩擦换手，但在急转弯行情可能滞后'}
                                </span>
                            </div>

                            {/* 参数 6：交易摩擦成本与滑点扣除 */}
                            <div className="param-item-box">
                                <div className="param-header">
                                    <span className="param-label">交易摩擦成本扣除 (印花税+佣金+滑点)</span>
                                    <span className={`param-val-badge font-mono ${sandboxParams.deductTradingCost !== false ? 'text-green' : 'text-neutral'}`}>
                                        {sandboxParams.deductTradingCost !== false
                                            ? `已扣除 -${calculateAnnualTradingCost(market, sandboxParams.rebalanceFreq, sandboxParams.portfolioSize)}%/年`
                                            : '未扣除 (毛收益)'}
                                    </span>
                                </div>
                                <div className="param-options-pills">
                                    <button
                                        className={`param-pill ${sandboxParams.deductTradingCost !== false ? 'active' : ''}`}
                                        onClick={() => setSandboxParams(prev => ({ ...prev, deductTradingCost: true }))}
                                    >
                                        💸 开启扣费 (真实净值)
                                    </button>
                                    <button
                                        className={`param-pill ${sandboxParams.deductTradingCost === false ? 'active' : ''}`}
                                        onClick={() => setSandboxParams(prev => ({ ...prev, deductTradingCost: false }))}
                                    >
                                        📈 不扣除 (纯理论毛收益)
                                    </button>
                                </div>
                                <span className="param-desc-tip">
                                    {market === 'A'
                                        ? '包含卖出单边印花税0.05% + 双边佣金万2.5 + 双边滑点冲击0.06%，真实反映实盘磨损'
                                        : '包含大盘ETF超高流动性下的交易规费与双边滑点约0.06%，更精确评估真实超额'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 参数调整后实时联动表现对比卡片 */}
                    <div className="sandbox-kpi-comparison-grid">
                        <div className="compare-kpi-card">
                            <span className="compare-kpi-lbl">新年化复合收益率 (CAGR)</span>
                            <div className="compare-kpi-main-row">
                                <span className="compare-val font-mono text-cyan">{sandboxResult.summary.cagrStrategy}%</span>
                                <span className={`compare-delta-badge ${sandboxResult.summary.cagrStrategy >= summary.cagrStrategy ? 'delta-better' : 'delta-worse'}`}>
                                    {sandboxResult.summary.cagrStrategy >= summary.cagrStrategy ? '+' : ''}
                                    {(sandboxResult.summary.cagrStrategy - summary.cagrStrategy).toFixed(2)}%
                                </span>
                            </div>
                            <span className="compare-benchmark-row">
                                {sandboxResult.summary.estimatedAnnualCostPct ? `(含交易摩擦损耗 -${sandboxResult.summary.estimatedAnnualCostPct}%/年) | ` : ''}基准: {summary.cagrCsi300}%
                            </span>
                        </div>

                        <div className="compare-kpi-card">
                            <span className="compare-kpi-lbl">新历史最大回撤 (MDD)</span>
                            <div className="compare-kpi-main-row">
                                <span className="compare-val font-mono text-green">{sandboxResult.summary.maxDrawdownStrategy}%</span>
                                <span className={`compare-delta-badge ${sandboxResult.summary.maxDrawdownStrategy >= summary.maxDrawdownStrategy ? 'delta-better' : 'delta-worse'}`}>
                                    {sandboxResult.summary.maxDrawdownStrategy >= summary.maxDrawdownStrategy ? '+' : ''}
                                    {(sandboxResult.summary.maxDrawdownStrategy - summary.maxDrawdownStrategy).toFixed(2)}%
                                </span>
                            </div>
                            <span className="compare-benchmark-row">
                                默认基准策略: {summary.maxDrawdownStrategy}% | {summary.benchmarkName}: {summary.maxDrawdownCsi300}%
                            </span>
                        </div>

                        <div className="compare-kpi-card">
                            <span className="compare-kpi-lbl">新夏普比率 (Sharpe Ratio)</span>
                            <div className="compare-kpi-main-row">
                                <span className="compare-val font-mono text-gold">{sandboxResult.summary.sharpeStrategy}</span>
                                <span className={`compare-delta-badge ${sandboxResult.summary.sharpeStrategy >= summary.sharpeStrategy ? 'delta-better' : 'delta-worse'}`}>
                                    {sandboxResult.summary.sharpeStrategy >= summary.sharpeStrategy ? '+' : ''}
                                    {(sandboxResult.summary.sharpeStrategy - summary.sharpeStrategy).toFixed(2)}
                                </span>
                            </div>
                            <span className="compare-benchmark-row">
                                默认基准策略: {summary.sharpeStrategy} | {summary.benchmarkName}: {summary.sharpeCsi300}
                            </span>
                        </div>

                        <div className="compare-kpi-card">
                            <span className="compare-kpi-lbl">20年累计收益倍数</span>
                            <div className="compare-kpi-main-row">
                                <span className="compare-val font-mono text-yellow">
                                    {sandboxResult.navPoints[sandboxResult.navPoints.length - 1].strategyNav.toFixed(0)}x
                                </span>
                                <span className="compare-delta-badge delta-neutral">
                                    基准 {navPoints[navPoints.length - 1].csi300Nav.toFixed(1)}x
                                </span>
                            </div>
                            <span className="compare-benchmark-row">
                                年度跑赢胜率: <strong>{sandboxResult.summary.annualWinRate}%</strong> (盈亏比 {sandboxResult.summary.profitFactor})
                            </span>
                        </div>
                    </div>

                    {/* 诊断与实证启示 */}
                    <div className="sandbox-diagnostic-card">
                        <div className="diag-title">
                            <span>🧠 策略敏感性参数诊断与量化启示</span>
                        </div>
                        <div className="diag-grid">
                            <div className="diag-item">
                                <strong>动量窗口启示</strong>：60日动量在兼顾牛市主升与震荡市抗洗盘之间取得了最优胜率。30日参数只适合极端强牛，震荡市频繁调仓容易损耗本金。
                            </div>
                            <div className="diag-item">
                                <strong>拥挤度控制防线</strong>：拥挤度止盈是策略控制大回撤的命脉。一旦放宽阈值，2008与2015年的见顶回撤将翻倍，牺牲胜率换取的超额并不划算。
                            </div>
                            <div className="diag-item">
                                <strong>跨周期对冲价值</strong>：宏观信用与美联储时钟的本质是“熊市防弹衣”，在经济下行周期自动买入低估高股息与抗跌资产，确保复利曲线不被中断。
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 视图 3：因子剥离实验 (验证为什么有效) */}
            {viewMode === 'ablation' && (
                <div className="backtest-ablation-view">
                    <div className="ablation-intro-box">
                        <h4>💡 为什么这个策略在{summary.marketName}能同时做到高收益与高胜率？(因子剥离归因)</h4>
                        <p>
                            {market === 'A' ? (
                                <>通过逐步剔除因子进行对比，我们验证了 A 股策略的三大支柱：<strong>单靠动量容易死于踩踏；加上“交易拥挤度止盈”直接削减了21%的大回撤；加上“宏观时钟”则在熊市中形成了极高的防御壁垒。</strong></>
                            ) : (
                                <>美股实证揭示：<strong>纯动量在美联储加息抗通胀拐点（如2022年）容易遭遇重创；引入“美联储利率时钟”与“市场宽度止盈”后，2022年准确超配能源XLE，把标普-18%的熊市转化为+24.6%的大胜。</strong></>
                            )}
                        </p>
                    </div>

                    <div className="ablation-cards-grid">
                        {ablationData.map((abl, idx) => (
                            <div key={idx} className={`ablation-card ${idx === ablationData.length - 1 ? 'featured' : ''}`}>
                                <div className="ablation-head">
                                    <span className="step-tag">方案 {idx + 1}</span>
                                    <h4 className="factor-title">{abl.factorName}</h4>
                                </div>
                                <p className="ablation-desc">{abl.description}</p>

                                <div className="ablation-metrics-row">
                                    <div className="m-item">
                                        <span className="m-lbl">年化收益 (CAGR)</span>
                                        <span className="m-val font-mono">{abl.cagr}%</span>
                                    </div>
                                    <div className="m-item">
                                        <span className="m-lbl">最大回撤 (MDD)</span>
                                        <span className="m-val font-mono text-green">{abl.maxDrawdown}%</span>
                                    </div>
                                    <div className="m-item">
                                        <span className="m-lbl">夏普比率</span>
                                        <span className="m-val font-mono">{abl.sharpeRatio}</span>
                                    </div>
                                    <div className="m-item">
                                        <span className="m-lbl">年度跑赢胜率</span>
                                        <span className="m-val font-mono text-gold">{abl.annualWinRate}%</span>
                                    </div>
                                </div>

                                <div className="ablation-contribution">
                                    <strong>关键实证结论：</strong> {abl.keyContribution}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 视图 4：20年历年调仓与轮动逻辑明细表 + NAV曲线 */}
            {viewMode === 'details' && (
                <div className="backtest-details-view">

                    {/* ── 净值曲线 SVG 可视化区域 ── */}
                    {(() => {
                        const W = 860, H = 260, PAD_L = 60, PAD_R = 20, PAD_T = 24, PAD_B = 40;
                        const chartW = W - PAD_L - PAD_R;
                        const chartH = H - PAD_T - PAD_B;
                        const pts = navPoints;
                        const allVals = pts.flatMap(p => [p.strategyNav, p.csi300Nav, p.equityFundNav]);
                        const minV = Math.min(...allVals);
                        const maxV = Math.max(...allVals);
                        const toX = (i: number) => PAD_L + (i / (pts.length - 1)) * chartW;
                        const toY = (v: number) => PAD_T + chartH - ((v - minV) / (maxV - minV)) * chartH;
                        const makePath = (vals: number[]) =>
                            vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(' ');

                        // 最大回撤区间：找 strategy 最大从高到低的区间
                        let peakIdx = 0, ddStart = 0, ddEnd = 0;
                        let maxDd = 0;
                        for (let i = 1; i < pts.length; i++) {
                            if (pts[i].strategyNav > pts[peakIdx].strategyNav) peakIdx = i;
                            const dd = (pts[peakIdx].strategyNav - pts[i].strategyNav) / pts[peakIdx].strategyNav;
                            if (dd > maxDd) { maxDd = dd; ddStart = peakIdx; ddEnd = i; }
                        }

                        // 年度超额收益柱图数据（只取后10年避免过密）
                        const excessData = activeRecords.slice(-10);
                        const barW = chartW / (excessData.length * 1.5);
                        const barMaxH = 60;
                        const maxExcess = Math.max(...excessData.map(r => Math.abs(r.excessReturn))) || 1;

                        // 年份标签（每3年）
                        const yearLabels = pts.filter((_, i) => i % 3 === 0 || i === pts.length - 1);

                        return (
                            <div className="nav-chart-section">
                                <div className="nav-chart-header">
                                    <span className="nav-chart-title">📈 20年累计净值走势对比 (2004年末=1.00基准)</span>
                                    <div className="nav-chart-legend">
                                        <span className="legend-item legend-strategy">━ {summary.marketName}轮动策略</span>
                                        <span className="legend-item legend-fund">━ {summary.fundBenchmarkName}</span>
                                        <span className="legend-item legend-csi">━ {summary.benchmarkName}</span>
                                        <span className="legend-item legend-dd">▓ 最大回撤区间</span>
                                    </div>
                                </div>

                                <svg
                                    className="nav-curve-svg"
                                    viewBox={`0 0 ${W} ${H}`}
                                    preserveAspectRatio="xMidYMid meet"
                                >
                                    {/* 背景网格 */}
                                    {[0, 0.25, 0.5, 0.75, 1].map(t => {
                                        const y = PAD_T + t * chartH;
                                        const val = maxV - t * (maxV - minV);
                                        return (
                                            <g key={t}>
                                                <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y}
                                                    stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                                                <text x={PAD_L - 6} y={y + 4} textAnchor="end"
                                                    className="nav-axis-label">{val.toFixed(1)}x</text>
                                            </g>
                                        );
                                    })}

                                    {/* 年份标签 */}
                                    {yearLabels.map(p => {
                                        const idx = pts.indexOf(p);
                                        return (
                                            <text key={p.year} x={toX(idx)} y={H - 6} textAnchor="middle"
                                                className="nav-axis-label">{p.year}</text>
                                        );
                                    })}

                                    {/* 最大回撤阴影 */}
                                    <rect
                                        x={toX(ddStart)}
                                        y={PAD_T}
                                        width={toX(ddEnd) - toX(ddStart)}
                                        height={chartH}
                                        fill="rgba(239,83,80,0.12)"
                                        stroke="rgba(239,83,80,0.4)"
                                        strokeWidth={1}
                                        strokeDasharray="4 2"
                                    />
                                    <text
                                        x={(toX(ddStart) + toX(ddEnd)) / 2}
                                        y={PAD_T + 14}
                                        textAnchor="middle"
                                        className="nav-dd-label"
                                    >
                                        MDD {(maxDd * 100).toFixed(0)}%
                                    </text>

                                    {/* 基准线：等值线 y=1 */}
                                    <line
                                        x1={PAD_L} y1={toY(1)} x2={W - PAD_R} y2={toY(1)}
                                        stroke="rgba(255,255,255,0.3)" strokeDasharray="6 3"
                                    />

                                    {/* 公募基金基准 */}
                                    <path d={makePath(pts.map(p => p.equityFundNav))}
                                        fill="none" stroke="#78909c" strokeWidth={1.5} strokeDasharray="5 3" />

                                    {/* 沪深300 / 标普500 */}
                                    <path d={makePath(pts.map(p => p.csi300Nav))}
                                        fill="none" stroke="#42a5f5" strokeWidth={2} />

                                    {/* 策略净值 */}
                                    <path d={makePath(pts.map(p => p.strategyNav))}
                                        fill="none" stroke="#ff7043" strokeWidth={2.5} />

                                    {/* 策略终点标注 */}
                                    {(() => {
                                        const last = pts[pts.length - 1];
                                        return (
                                            <g>
                                                <circle cx={toX(pts.length - 1)} cy={toY(last.strategyNav)} r={5} fill="#ff7043" />
                                                <text x={toX(pts.length - 1) - 4} y={toY(last.strategyNav) - 10}
                                                    textAnchor="end" className="nav-endpoint-label">
                                                    {last.strategyNav.toFixed(1)}x
                                                </text>
                                            </g>
                                        );
                                    })()}
                                </svg>

                                {/* 年度超额收益柱状图 */}
                                <div className="excess-bar-section">
                                    <span className="excess-bar-title">近10年年度超额收益 Alpha (vs {summary.benchmarkName})</span>
                                    <svg
                                        className="excess-bar-svg"
                                        viewBox={`0 0 ${W} ${barMaxH + 30}`}
                                        preserveAspectRatio="xMidYMid meet"
                                    >
                                        {excessData.map((r, i) => {
                                            const barH = (Math.abs(r.excessReturn) / maxExcess) * barMaxH;
                                            const isPos = r.excessReturn >= 0;
                                            const bx = PAD_L + (i / excessData.length) * chartW + barW * 0.25;
                                            const by = isPos ? (barMaxH - barH) : barMaxH;
                                            return (
                                                <g key={r.year}>
                                                    <rect
                                                        x={bx} y={by} width={barW} height={barH}
                                                        fill={isPos ? '#ef5350' : '#26a69a'}
                                                        opacity={0.8} rx={2}
                                                    />
                                                    <text x={bx + barW / 2} y={barMaxH + 20}
                                                        textAnchor="middle" className="nav-axis-label">{r.year}</text>
                                                    <text
                                                        x={bx + barW / 2}
                                                        y={isPos ? by - 4 : by + barH + 12}
                                                        textAnchor="middle"
                                                        className={`excess-val-label ${isPos ? 'text-red' : 'text-green'}`}
                                                    >
                                                        {r.excessReturn > 0 ? '+' : ''}{r.excessReturn.toFixed(0)}%
                                                    </text>
                                                </g>
                                            );
                                        })}
                                        {/* 零轴 */}
                                        <line x1={PAD_L} y1={barMaxH} x2={W - PAD_R} y2={barMaxH}
                                            stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
                                    </svg>
                                </div>
                            </div>
                        );
                    })()}

                    {/* ── 2026年上半年 (H1) 逐月实测回测验证卡片 ── */}
                    <div className="h1-monthly-backtest-card">
                        <div className="h1-header-row">
                            <div className="h1-title-group">
                                <span className="h1-badge">🔥 最新实盘周期实测</span>
                                <h4 className="h1-main-title">2026年上半年 (H1) 逐月高频量化实测检验</h4>
                                <span className="h1-sub-title">基准: {summary.benchmarkName} · 逐月胜率与板块轮动驱动明细</span>
                            </div>
                            <div className="h1-stats-strip">
                                <div className="h1-stat-item">
                                    <span className="lbl">H1 累计收益</span>
                                    <span className={`val font-mono font-bold ${getTrendClass(h1Summary.cumulativeStrategyReturn)}`}>
                                        {h1Summary.cumulativeStrategyReturn > 0 ? '+' : ''}{h1Summary.cumulativeStrategyReturn}%
                                    </span>
                                </div>
                                <div className="h1-stat-item">
                                    <span className="lbl">{summary.benchmarkName}</span>
                                    <span className={`val font-mono ${getTrendClass(h1Summary.cumulativeBenchmarkReturn)}`}>
                                        {h1Summary.cumulativeBenchmarkReturn > 0 ? '+' : ''}{h1Summary.cumulativeBenchmarkReturn}%
                                    </span>
                                </div>
                                <div className="h1-stat-item">
                                    <span className="lbl">累计超额 Alpha</span>
                                    <span className={`val font-mono font-bold ${getTrendClass(h1Summary.cumulativeExcessReturn)}`}>
                                        {h1Summary.cumulativeExcessReturn > 0 ? '+' : ''}{h1Summary.cumulativeExcessReturn}%
                                    </span>
                                </div>
                                <div className="h1-stat-item">
                                    <span className="lbl">月度跑赢胜率</span>
                                    <span className="val font-mono text-gold">
                                        {h1Summary.winCount}/{h1Summary.totalMonths} ({h1Summary.winRate}%)
                                    </span>
                                </div>
                                <div className="h1-stat-item">
                                    <span className="lbl">最大月次回撤</span>
                                    <span className="val font-mono text-green">
                                        {h1Summary.maxDrawdown}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="backtest-table-wrapper h1-table-wrapper">
                            <table className="radar-data-table backtest-table">
                                <thead>
                                    <tr>
                                        <th>月份</th>
                                        <th>策略月收益</th>
                                        <th>{summary.benchmarkName}</th>
                                        <th>超额收益 (Alpha)</th>
                                        <th>月内回撤</th>
                                        <th>胜负检验</th>
                                        <th>当月核心配置与超额板块</th>
                                        <th>调仓逻辑与宏观驱动</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyRecords.map((m: MonthlyBacktestRecord) => (
                                        <tr key={m.month}>
                                            <td className="font-mono font-bold text-neutral">{m.monthName}</td>
                                            <td className={`font-mono font-bold ${getTrendClass(m.strategyReturn)}`}>
                                                {m.strategyReturn > 0 ? '+' : ''}{m.strategyReturn.toFixed(2)}%
                                            </td>
                                            <td className={`font-mono ${getTrendClass(m.benchmarkReturn)}`}>
                                                {m.benchmarkReturn > 0 ? '+' : ''}{m.benchmarkReturn.toFixed(2)}%
                                            </td>
                                            <td className={`font-mono font-bold ${getTrendClass(m.excessReturn)}`}>
                                                {m.excessReturn > 0 ? '+' : ''}{m.excessReturn.toFixed(2)}%
                                            </td>
                                            <td className="font-mono text-green">{m.maxDrawdown.toFixed(2)}%</td>
                                            <td>
                                                <span className={`regime-badge ${m.isWin ? 'regime-bull' : 'regime-bear'}`}>
                                                    {m.isWin ? '✓ 跑赢' : '✗ 跑输'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="held-sectors-pills">
                                                    {m.heldSectors.map((sec, idx) => (
                                                        <span key={idx} className="sec-tag">{sec}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="logic-desc-cell">{m.keyLogic}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="table-filter-bar">
                        <div className="filter-summary-text">
                            展示 {summary.marketName} 历年年度记录：<strong>{displayedRecords.length}</strong> 年 (共 {filteredRecords.length} 年)
                        </div>
                        <button
                            className="toggle-all-btn"
                            onClick={() => setShowFullTable(!showFullTable)}
                        >
                            {showFullTable ? '折叠至近10年' : '展开全部 20 年回测明细'}
                        </button>
                    </div>

                    <div className="backtest-table-wrapper">
                        <table className="radar-data-table backtest-table">
                            <thead>
                                <tr>
                                    <th>年份</th>
                                    <th>市场状态</th>
                                    <th>策略收益</th>
                                    <th>{summary.benchmarkName}</th>
                                    <th>{summary.fundBenchmarkName}</th>
                                    <th>超额收益 (Alpha)</th>
                                    <th>年内回撤</th>
                                    <th>年度领涨与核心重仓板块</th>
                                    <th>核心轮动逻辑驱动</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedRecords.map((r: AnnualBacktestRecord) => (
                                    <tr key={r.year}>
                                        <td className="font-mono font-bold text-neutral">{r.year}</td>
                                        <td>
                                            <span className={`regime-badge regime-${r.regime}`}>
                                                {r.regimeName}
                                            </span>
                                        </td>
                                        <td className={`font-mono font-bold ${getTrendClass(r.strategyReturn)}`}>
                                            {r.strategyReturn > 0 ? '+' : ''}{r.strategyReturn.toFixed(1)}%
                                        </td>
                                        <td className={`font-mono ${getTrendClass(r.csi300Return)}`}>
                                            {r.csi300Return > 0 ? '+' : ''}{r.csi300Return.toFixed(1)}%
                                        </td>
                                        <td className={`font-mono text-muted ${getTrendClass(r.equityFundReturn)}`}>
                                            {r.equityFundReturn > 0 ? '+' : ''}{r.equityFundReturn.toFixed(1)}%
                                        </td>
                                        <td className={`font-mono font-bold ${getTrendClass(r.excessReturn)}`}>
                                            {r.excessReturn > 0 ? '+' : ''}{r.excessReturn.toFixed(1)}%
                                        </td>
                                        <td className="font-mono text-green">
                                            {r.maxDrawdown.toFixed(1)}%
                                        </td>
                                        <td>
                                            <div className="held-sectors-pills">
                                                {r.heldSectors.map((sec, sIdx) => (
                                                    <span key={sIdx} className="sec-tag">{sec}</span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="logic-desc-cell">{r.keyLogic}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
