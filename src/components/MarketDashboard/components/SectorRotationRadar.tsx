import React, { useState } from 'react';
import type { SectorMetric, MacroCyclePhase, SectorRotationSignal } from '../../../types/market.types';
import { SectorBacktestPanel } from './SectorBacktestPanel';

interface SectorRotationRadarProps {
    sectors: SectorMetric[];
    macroPhase: MacroCyclePhase | null;
    signals: SectorRotationSignal[];
    colorScheme?: 'cn' | 'us';
}

export const SectorRotationRadar: React.FC<SectorRotationRadarProps> = ({
    sectors,
    macroPhase,
    signals,
    colorScheme = 'cn',
}) => {
    const [radarViewMode, setRadarViewMode] = useState<'live' | 'backtest'>('live');
    const [flowTab, setFlowTab] = useState<'inflow' | 'outflow'>('inflow');
    const [crowdedFilter, setCrowdedFilter] = useState<'ALL' | 'overheat' | 'active' | 'cold'>('ALL');

    const isCn = colorScheme === 'cn';
    const getTrendClass = (val: number) => {
        if (val === 0) return 'text-neutral';
        if (isCn) {
            return val > 0 ? 'text-red' : 'text-green';
        } else {
            return val > 0 ? 'text-green' : 'text-red';
        }
    };

    // 排序板块主力资金
    const topInflowSectors = [...sectors]
        .sort((a, b) => b.mainNetInflow - a.mainNetInflow)
        .slice(0, 8);

    const topOutflowSectors = [...sectors]
        .sort((a, b) => a.mainNetInflow - b.mainNetInflow)
        .slice(0, 8);

    const displayedFlowSectors = flowTab === 'inflow' ? topInflowSectors : topOutflowSectors;

    // 拥挤度筛选
    const filteredCrowdedSectors = crowdedFilter === 'ALL'
        ? sectors
        : sectors.filter(s => s.crowdednessStatus === crowdedFilter);

    // 按成交额降序
    const sortedCrowdedSectors = [...filteredCrowdedSectors]
        .sort((a, b) => b.turnover - a.turnover)
        .slice(0, 10);

    return (
        <div className="sector-rotation-radar-root">
            {/* 顶部主视图切换：实时资金雷达 vs 20年量化回测与胜率检验 */}
            <div className="radar-view-selector-bar">
                <div className="selector-tabs">
                    <button
                        className={`radar-nav-tab ${radarViewMode === 'live' ? 'active' : ''}`}
                        onClick={() => setRadarViewMode('live')}
                    >
                        ⚡ 实时板块轮动与资金雷达
                    </button>
                    <button
                        className={`radar-nav-tab ${radarViewMode === 'backtest' ? 'active' : ''}`}
                        onClick={() => setRadarViewMode('backtest')}
                    >
                        🔬 20年历史量化回测与胜率检验
                        <span className="tab-win-rate-badge">胜率 90.5%</span>
                    </button>
                </div>
                <div className="radar-top-meta">
                    {radarViewMode === 'live' ? (
                        <span className="meta-text">496个申万行业实时高频监控</span>
                    ) : (
                        <span className="meta-text font-mono">2005 - 2025 全样本实证 / 年化 22.6% (55.2倍)</span>
                    )}
                </div>
            </div>

            {/* 视图 1：实时板块轮动雷达与周期罗盘 */}
            {radarViewMode === 'live' ? (
                <>
                    {/* 顶栏：宏观信用时钟与风格配置罗盘 */}
                    {macroPhase && (
                        <div className="macro-cycle-compass-card">
                            <div className="compass-header">
                                <div className="compass-title-wrap">
                                    <span className="compass-icon">🧭</span>
                                    <div>
                                        <h3 className="compass-main-title">宏观信用时钟与周期罗盘</h3>
                                        <span className="compass-sub-title">中国宏观货币-信用四象限改良时钟模型</span>
                                    </div>
                                </div>
                                <div className="macro-quadrant-badge">
                                    {macroPhase.quadrant} · {macroPhase.phaseName}
                                </div>
                            </div>

                            <div className="compass-body">
                                <p className="compass-char-text">
                                    <strong>【周期特征】</strong>: {macroPhase.characteristics}
                                </p>

                                <div className="compass-allocation-grid">
                                    <div className="alloc-column recommend-column">
                                        <div className="column-title">
                                            <span className="dot dot-green" />
                                            <span>推荐胜率进攻/防御风格 (杠铃策略)</span>
                                        </div>
                                        <div className="style-pills-wrap">
                                            {macroPhase.recommendedStyles.map((st, idx) => (
                                                <div key={idx} className="style-pill recommend-pill">
                                                    ✅ {st}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="alloc-column caution-column">
                                        <div className="column-title">
                                            <span className="dot dot-red" />
                                            <span>重点规避与防御方向</span>
                                        </div>
                                        <div className="style-pills-wrap">
                                            {macroPhase.cautions.map((c, idx) => (
                                                <div key={idx} className="style-pill caution-pill">
                                                    ⚠️ {c}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 中部双栏：行业主力资金进出榜 vs 板块成交拥挤度红绿灯 */}
                    <div className="radar-two-column-grid">
                        {/* 栏 1：行业板块主力资金排行榜 */}
                        <div className="radar-card sector-flow-leaderboard-card">
                            <div className="radar-card-header">
                                <div className="header-left">
                                    <span className="radar-card-icon">🌊</span>
                                    <span className="radar-card-title">行业主力资金排行榜</span>
                                </div>
                                <div className="toggle-tab-pills">
                                    <button
                                        className={`pill-btn ${flowTab === 'inflow' ? 'active' : ''}`}
                                        onClick={() => setFlowTab('inflow')}
                                    >
                                        🚀 主力净买入 Top
                                    </button>
                                    <button
                                        className={`pill-btn ${flowTab === 'outflow' ? 'active' : ''}`}
                                        onClick={() => setFlowTab('outflow')}
                                    >
                                        🔻 主力净流出 Top
                                    </button>
                                </div>
                            </div>

                            <div className="sector-flow-table-wrapper">
                                <table className="radar-data-table">
                                    <thead>
                                        <tr>
                                            <th>行业名称</th>
                                            <th>板块涨跌</th>
                                            <th>主力净额</th>
                                            <th>主力净比</th>
                                            <th>超大单净额</th>
                                            <th>领涨标杆</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayedFlowSectors.map((sec, idx) => (
                                            <tr key={sec.code}>
                                                <td className="sector-name-cell">
                                                    <span className="rank-badge">{idx + 1}</span>
                                                    <span className="sec-name">{sec.name}</span>
                                                </td>
                                                <td className={`font-mono ${getTrendClass(sec.changePct)}`}>
                                                    {sec.changePct > 0 ? '+' : ''}{sec.changePct.toFixed(2)}%
                                                </td>
                                                <td className={`font-mono font-bold ${getTrendClass(sec.mainNetInflow)}`}>
                                                    {sec.mainNetInflow > 0 ? '+' : ''}{sec.mainNetInflow.toFixed(2)} 亿
                                                </td>
                                                <td className={`font-mono ${getTrendClass(sec.mainNetInflowRatio)}`}>
                                                    {sec.mainNetInflowRatio > 0 ? '+' : ''}{sec.mainNetInflowRatio.toFixed(2)}%
                                                </td>
                                                <td className={`font-mono text-muted ${getTrendClass(sec.superLargeNetInflow)}`}>
                                                    {sec.superLargeNetInflow > 0 ? '+' : ''}{sec.superLargeNetInflow.toFixed(2)} 亿
                                                </td>
                                                <td className="leading-stock-cell">
                                                    <span className="leading-name">{sec.leadingStockName}</span>
                                                    <span className="leading-code">({sec.leadingStockCode})</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 栏 2：板块交易拥挤度红绿灯监测 */}
                        <div className="radar-card sector-crowdedness-card">
                            <div className="radar-card-header">
                                <div className="header-left">
                                    <span className="radar-card-icon">🚦</span>
                                    <span className="radar-card-title">板块交易拥挤度红绿灯</span>
                                    <span className="tip-text">(成交额占两市总比)</span>
                                </div>
                                <div className="crowded-filter-pills">
                                    <button
                                        className={`filter-btn ${crowdedFilter === 'ALL' ? 'active' : ''}`}
                                        onClick={() => setCrowdedFilter('ALL')}
                                    >
                                        全部
                                    </button>
                                    <button
                                        className={`filter-btn ${crowdedFilter === 'overheat' ? 'active text-red' : ''}`}
                                        onClick={() => setCrowdedFilter('overheat')}
                                    >
                                        🔴 过热(&gt;10%)
                                    </button>
                                    <button
                                        className={`filter-btn ${crowdedFilter === 'active' ? 'active text-orange' : ''}`}
                                        onClick={() => setCrowdedFilter('active')}
                                    >
                                        🟡 活跃(5-10%)
                                    </button>
                                    <button
                                        className={`filter-btn ${crowdedFilter === 'cold' ? 'active text-blue' : ''}`}
                                        onClick={() => setCrowdedFilter('cold')}
                                    >
                                        ❄️ 冰点(&lt;2%)
                                    </button>
                                </div>
                            </div>

                            <div className="crowdedness-list">
                                {sortedCrowdedSectors.map(sec => {
                                    let statusBadge = <span className="status-pill status-normal">平稳 (2~5%)</span>;
                                    if (sec.crowdednessStatus === 'overheat') {
                                        statusBadge = <span className="status-pill status-overheat">🔴 过热预警 (&gt;10%)</span>;
                                    } else if (sec.crowdednessStatus === 'active') {
                                        statusBadge = <span className="status-pill status-active">🟡 活跃主升 (5~10%)</span>;
                                    } else if (sec.crowdednessStatus === 'cold') {
                                        statusBadge = <span className="status-pill status-cold">❄️ 冰点出清 (&lt;2%)</span>;
                                    }

                                    return (
                                        <div key={sec.code} className="crowded-item-row">
                                            <div className="item-meta-top">
                                                <div className="meta-left">
                                                    <span className="sector-title">{sec.name}</span>
                                                    <span className="sector-turnover">{sec.turnoverDisplay}</span>
                                                </div>
                                                <div className="meta-right">
                                                    {statusBadge}
                                                    <span className="crowded-percent font-mono">{sec.crowdedness}%</span>
                                                </div>
                                            </div>

                                            {/* 拥挤度进度指示条 (警戒刻度线 10%) */}
                                            <div className="crowded-progress-track">
                                                <div
                                                    className={`crowded-progress-fill ${sec.crowdednessStatus}`}
                                                    style={{ width: `${Math.min(100, (sec.crowdedness / 15) * 100)}%` }}
                                                />
                                                <div className="warning-threshold-mark" style={{ left: `${(10 / 15) * 100}%` }} title="10% 拥挤度警戒线" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 下部：实时捕获的高胜率轮动信号清单 */}
                    <div className="radar-card rotation-signals-card">
                        <div className="radar-card-header">
                            <div className="header-left">
                                <span className="radar-card-icon">⚡</span>
                                <span className="radar-card-title">实时捕获的高胜率轮动信号清单</span>
                            </div>
                            <div className="signals-count-badge">
                                实时激活信号: {signals.length} 条
                            </div>
                        </div>

                        <div className="signals-grid">
                            {signals.map(sig => (
                                <div key={sig.id} className={`signal-item-card signal-${sig.level}`}>
                                    <div className="signal-card-top">
                                        <span className="signal-sector-badge">{sig.sectorName}</span>
                                        <span className="signal-time">{sig.timestamp}</span>
                                    </div>
                                    <h4 className="signal-title">{sig.title}</h4>
                                    <p className="signal-desc">{sig.description}</p>
                                </div>
                            ))}
                        </div>

                        {/* 底部引导栏 */}
                        <div className="backtest-jump-banner">
                            <div className="jump-banner-left">
                                <span className="jump-icon">💡</span>
                                <span>
                                    想验证本策略在过去 20 年（2005-2025）穿越牛熊周期的完整超额胜率与回测表现？
                                </span>
                            </div>
                            <button
                                className="jump-action-btn"
                                onClick={() => setRadarViewMode('backtest')}
                            >
                                查看 20 年回测与胜率检验面板 →
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                /* 视图 2：20年历史量化回测与胜率检验面板 */
                <SectorBacktestPanel colorScheme={colorScheme} />
            )}
        </div>
    );
};
