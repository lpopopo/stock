import React, { useState } from 'react';
import type {
    UsSectorMetric,
    FedPolicyCycle,
    UsMarketBreadthDivergence,
    UsSectorSignal,
} from '../../../types/market.types';
import { SectorBacktestPanel } from './SectorBacktestPanel';

interface UsSectorRotationRadarProps {
    sectors: UsSectorMetric[];
    fedCycle?: FedPolicyCycle | null;
    divergence?: UsMarketBreadthDivergence | null;
    signals: UsSectorSignal[];
    colorScheme?: 'cn' | 'us';
    onJumpToBacktest?: () => void;
}

const DEFAULT_FED_CYCLE: FedPolicyCycle = {
    phaseName: '降息周期 + 经济软着陆博弈',
    quadrant: '降息+软着陆(成长)',
    us10yYield: 4.28,
    fedRateExpectation: '降息周期推进中',
    yieldCurveSpread: 0.15,
    characteristics: '通胀受控且就业温和降温，无风险利率下行扩张估值空间，流动性充裕支持高成长与优质现金流板块。',
    recommendedSectors: ['科技信息 (XLK)', '通信服务 (XLC)', '非必需消费 (XLY)'],
    cautions: ['能源 (XLE) 周期弱势', '公用事业 (XLU) 股息吸引力稀释'],
    historicalWinRate: 75.8,
};

const DEFAULT_DIVERGENCE: UsMarketBreadthDivergence = {
    spyPrice: 585.2,
    spyChangePct: 0.45,
    rspPrice: 172.8,
    rspChangePct: -0.12,
    divergencePct: 0.57,
    divergenceStatus: 'mega_cap_dominant',
    divergenceDesc: '当前标普市值权重指数明显强于等权指数，资金聚集于科技巨头，注意非权重股流动性分化。',
};

export const UsSectorRotationRadar: React.FC<UsSectorRotationRadarProps> = ({
    sectors,
    fedCycle,
    divergence,
    signals,
    colorScheme = 'us',
    onJumpToBacktest,
}) => {
    const [radarViewMode, setRadarViewMode] = useState<'live' | 'backtest'>('live');
    const [styleFilter, setStyleFilter] = useState<'ALL' | 'growth' | 'cyclical' | 'defensive'>('ALL');
    const [sortBy, setSortBy] = useState<'rs' | 'change' | 'breadth'>('rs');

    const activeFedCycle = fedCycle || DEFAULT_FED_CYCLE;
    const activeDivergence = divergence || DEFAULT_DIVERGENCE;

    const isCn = colorScheme === 'cn';
    const getTrendClass = (val: number) => {
        if (val === 0) return 'text-neutral';
        if (isCn) {
            return val > 0 ? 'text-red' : 'text-green';
        } else {
            return val > 0 ? 'text-green' : 'text-red';
        }
    };

    // 过滤与排序
    const filteredSectors = styleFilter === 'ALL'
        ? sectors
        : sectors.filter(s => s.macroStyle === styleFilter);

    const sortedSectors = [...filteredSectors].sort((a, b) => {
        if (sortBy === 'rs') return b.relativeStrength - a.relativeStrength;
        if (sortBy === 'change') return b.changePct - a.changePct;
        return b.breadth200Sma - a.breadth200Sma;
    });

    const handleBacktestClick = () => {
        if (onJumpToBacktest) {
            onJumpToBacktest();
        } else {
            setRadarViewMode('backtest');
        }
    };

    return (
        <div className="us-sector-rotation-radar-root">
            {/* 顶部主视图切换：实时行业雷达 vs 20年量化回测与胜率检验 */}
            <div className="radar-view-selector-bar">
                <div className="selector-tabs">
                    <button
                        className={`radar-nav-tab ${radarViewMode === 'live' ? 'active' : ''}`}
                        onClick={() => setRadarViewMode('live')}
                    >
                        📡 实时 GICS 11大行业与美联储时钟
                    </button>
                    <button
                        className={`radar-nav-tab ${radarViewMode === 'backtest' ? 'active' : ''}`}
                        onClick={() => setRadarViewMode('backtest')}
                    >
                        🔬 20年美股量化回测与胜率检验
                        <span className="tab-win-rate-badge">策略胜率 75.8%</span>
                    </button>
                </div>
                <div className="radar-top-meta">
                    <span className="meta-text">GICS 11行业ETF · 美联储利率时钟 · SPY/RSP宽度背离</span>
                </div>
            </div>

            {radarViewMode === 'backtest' ? (
                <SectorBacktestPanel colorScheme={colorScheme} initialMarket="US" />
            ) : (
                <>
                    {/* 顶栏：美联储利率时钟与宏观资产配置罗盘 */}
                    <div className="fed-cycle-compass-card">
                        <div className="compass-header">
                            <div className="compass-title-wrap">
                                <span className="compass-icon">🏛️</span>
                                <div>
                                    <h3 className="compass-main-title">美联储利率时钟与周期配置罗盘</h3>
                                    <span className="compass-sub-title">Fed Funds Rate · US 10Y Yield · GICS 11 Sector Allocation</span>
                                </div>
                            </div>
                            <div className="fed-quadrant-badge">
                                {activeFedCycle.quadrant}
                            </div>
                        </div>

                        <div className="compass-body">
                            <div className="fed-macro-indicators-row">
                                <div className="fed-ind-pill">
                                    <span className="ind-lbl">美联储降息预期</span>
                                    <span className="ind-val text-cyan">{activeFedCycle.fedRateExpectation}</span>
                                </div>
                                <div className="fed-ind-pill">
                                    <span className="ind-lbl">10年期美债收益率 (US10Y)</span>
                                    <span className="ind-val font-mono text-gold">{activeFedCycle.us10yYield}%</span>
                                </div>
                                <div className="fed-ind-pill">
                                    <span className="ind-lbl">10Y-2Y 利差曲线</span>
                                    <span className="ind-val font-mono text-green">+{activeFedCycle.yieldCurveSpread}% (正常化)</span>
                                </div>
                            </div>

                            <p className="compass-char-text">
                                <strong>【宏观周期特征】</strong>: {activeFedCycle.characteristics}
                            </p>

                            <div className="compass-allocation-grid">
                                <div className="alloc-column recommend-column">
                                    <div className="column-title">
                                        <span className="dot dot-green" />
                                        <span>当前胜率超配行业 (Overweight)</span>
                                    </div>
                                    <div className="style-pills-wrap">
                                        {activeFedCycle.recommendedSectors.map((sec, idx) => (
                                            <div key={idx} className="style-pill recommend-pill">
                                                ✅ {sec}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="alloc-column caution-column">
                                    <div className="column-title">
                                        <span className="dot dot-red" />
                                        <span>防范与低配方向 (Underweight)</span>
                                    </div>
                                    <div className="style-pills-wrap">
                                        {activeFedCycle.cautions.map((c, idx) => (
                                            <div key={idx} className="style-pill caution-pill">
                                                ⚠️ {c}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 中部核心指标：标普500市值加权 (SPY) vs 等权重 (RSP) 剪刀差监测卡 */}
                    <div className="us-breadth-divergence-card">
                        <div className="divergence-header">
                            <div className="header-left">
                                <span className="div-icon">⚖️</span>
                                <div>
                                    <h4 className="div-title">标普500 权重集中度与市场广度剪刀差 (SPY vs RSP)</h4>
                                    <span className="div-sub">揭示是“科技七巨头单骑救主”还是“全市场普涨牛市”的关键指标</span>
                                </div>
                            </div>
                            <div className={`divergence-status-badge status-${activeDivergence.divergenceStatus}`}>
                                {activeDivergence.divergenceStatus === 'mega_cap_dominant' && '⚡ 巨头虹吸 (科技权重集中)'}
                                {activeDivergence.divergenceStatus === 'broad_rally' && '🌿 广度向好 (全行业普涨)'}
                                {activeDivergence.divergenceStatus === 'market_pullback' && '🛡️ 全面防御回撤'}
                            </div>
                        </div>

                        <div className="divergence-body-grid">
                            <div className="div-metric-item">
                                <span className="m-tag">标普500 市值加权 (SPY)</span>
                                <div className="m-row">
                                    <span className="m-val font-mono">${activeDivergence.spyPrice.toFixed(2)}</span>
                                    <span className={`m-chg font-mono ${getTrendClass(activeDivergence.spyChangePct)}`}>
                                        {activeDivergence.spyChangePct > 0 ? '+' : ''}{activeDivergence.spyChangePct.toFixed(2)}%
                                    </span>
                                </div>
                            </div>

                            <div className="div-metric-item">
                                <span className="m-tag">标普500 等权重 (RSP)</span>
                                <div className="m-row">
                                    <span className="m-val font-mono">${activeDivergence.rspPrice.toFixed(2)}</span>
                                    <span className={`m-chg font-mono ${getTrendClass(activeDivergence.rspChangePct)}`}>
                                        {activeDivergence.rspChangePct > 0 ? '+' : ''}{activeDivergence.rspChangePct.toFixed(2)}%
                                    </span>
                                </div>
                            </div>

                            <div className="div-metric-item">
                                <span className="m-tag">广度剪刀差 (SPY - RSP)</span>
                                <div className="m-row">
                                    <span className={`m-val font-mono font-bold ${getTrendClass(activeDivergence.divergencePct ?? 0)}`}>
                                        {(activeDivergence.divergencePct ?? 0) > 0 ? '+' : ''}{(activeDivergence.divergencePct ?? 0).toFixed(2)}%
                                    </span>
                                    <span className="m-chg text-muted">
                                        {(activeDivergence.divergencePct ?? 0) > 0 ? '大市值领跑' : '中小盘占优'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="divergence-insight-footnote">
                            💡 <strong>广度诊断</strong>：{activeDivergence.divergenceDesc}
                        </div>
                    </div>

            {/* 下部：GICS 11 大行业 ETF 实时相对强弱热力表与宽度监控 */}
            <div className="radar-card us-gics-table-card">
                <div className="radar-card-header">
                    <div className="header-left">
                        <span className="radar-card-icon">📊</span>
                        <span className="radar-card-title">美股 GICS 11 大行业 ETF 相对强弱动量排行</span>
                        <span className="tip-text">(相对标普500超额 RS)</span>
                    </div>

                    <div className="us-gics-controls">
                        {/* 风格筛选 */}
                        <div className="gics-filter-pills">
                            <button
                                className={`pill-btn ${styleFilter === 'ALL' ? 'active' : ''}`}
                                onClick={() => setStyleFilter('ALL')}
                            >
                                全部(11)
                            </button>
                            <button
                                className={`pill-btn ${styleFilter === 'growth' ? 'active' : ''}`}
                                onClick={() => setStyleFilter('growth')}
                            >
                                🚀 科技成长
                            </button>
                            <button
                                className={`pill-btn ${styleFilter === 'cyclical' ? 'active' : ''}`}
                                onClick={() => setStyleFilter('cyclical')}
                            >
                                🏭 顺周期
                            </button>
                            <button
                                className={`pill-btn ${styleFilter === 'defensive' ? 'active' : ''}`}
                                onClick={() => setStyleFilter('defensive')}
                            >
                                🛡️ 防御抗跌
                            </button>
                        </div>

                        {/* 排序方式 */}
                        <div className="gics-sort-pills">
                            <button
                                className={`sort-btn ${sortBy === 'rs' ? 'active' : ''}`}
                                onClick={() => setSortBy('rs')}
                                title="按相对标普超额收益排序"
                            >
                                相对强弱 (RS)
                            </button>
                            <button
                                className={`sort-btn ${sortBy === 'change' ? 'active' : ''}`}
                                onClick={() => setSortBy('change')}
                                title="按日涨跌幅排序"
                            >
                                涨跌幅 %
                            </button>
                            <button
                                className={`sort-btn ${sortBy === 'breadth' ? 'active' : ''}`}
                                onClick={() => setSortBy('breadth')}
                                title="按成分股突破200日均线比例排序"
                            >
                                行业宽度 %
                            </button>
                        </div>
                    </div>
                </div>

                <div className="us-gics-table-wrapper">
                    <table className="radar-data-table us-sector-table">
                        <thead>
                            <tr>
                                <th>行业ETF</th>
                                <th>行业中文名</th>
                                <th>最新价格</th>
                                <th>日涨跌幅</th>
                                <th>相对标普超额 (RS)</th>
                                <th>成份股突破 200SMA (宽度)</th>
                                <th>风格属性</th>
                                <th>核心权重持仓</th>
                                <th>管理规模 (AUM)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedSectors.map((sec, idx) => (
                                <tr key={sec.code}>
                                    <td className="sector-code-cell">
                                        <span className="rank-badge">{idx + 1}</span>
                                        <span className="etf-ticker font-mono font-bold text-cyan">{sec.code}</span>
                                    </td>
                                    <td className="sector-name-cell">
                                        <span className="sec-name">{sec.nameCn}</span>
                                        <small className="text-muted">({sec.nameEn})</small>
                                    </td>
                                    <td className="font-mono font-bold">
                                        ${sec.price.toFixed(2)}
                                    </td>
                                    <td className={`font-mono font-bold ${getTrendClass(sec.changePct)}`}>
                                        {sec.changePct > 0 ? '+' : ''}{sec.changePct.toFixed(2)}%
                                    </td>
                                    <td className={`font-mono font-bold ${getTrendClass(sec.relativeStrength)}`}>
                                        {sec.relativeStrength > 0 ? '+' : ''}{sec.relativeStrength.toFixed(2)}%
                                    </td>
                                    <td className="breadth-meter-cell">
                                        <div className="breadth-cell-wrap">
                                            <div className="breadth-text-row">
                                                <span className={`breadth-val font-mono ${sec.breadthStatus === 'overheat' ? 'text-red font-bold' : ''}`}>
                                                    {sec.breadth200Sma}%
                                                </span>
                                                <span className={`breadth-badge badge-${sec.breadthStatus}`}>
                                                    {sec.breadthStatus === 'overheat' && '过热'}
                                                    {sec.breadthStatus === 'healthy' && '健康'}
                                                    {sec.breadthStatus === 'neutral' && '中性'}
                                                    {sec.breadthStatus === 'oversold' && '超跌'}
                                                </span>
                                            </div>
                                            <div className="breadth-track">
                                                <div
                                                    className={`breadth-fill fill-${sec.breadthStatus}`}
                                                    style={{ width: `${Math.min(100, sec.breadth200Sma)}%` }}
                                                />
                                                <div className="overheat-line" style={{ left: '80%' }} title="80% 极端过热警戒线" />
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`style-type-badge type-${sec.macroStyle}`}>
                                            {sec.macroStyle === 'growth' && '科技成长'}
                                            {sec.macroStyle === 'cyclical' && '顺周期'}
                                            {sec.macroStyle === 'defensive' && '防御价值'}
                                        </span>
                                    </td>
                                    <td className="holdings-cell font-mono text-secondary">
                                        {sec.leadingHoldings}
                                    </td>
                                    <td className="font-mono text-muted">
                                        {sec.aumDisplay}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 底部：实时捕获的美股高胜率轮动信号 */}
            <div className="radar-card us-signals-card">
                <div className="radar-card-header">
                    <div className="header-left">
                        <span className="radar-card-icon">⚡</span>
                        <span className="radar-card-title">美股实时高胜率轮动捕捉信号清单</span>
                    </div>
                    <div className="signals-count-badge">
                        激活信号: {signals.length} 条
                    </div>
                </div>

                <div className="signals-grid">
                    {signals.map(sig => (
                        <div key={sig.id} className={`signal-item-card signal-${sig.level}`}>
                            <div className="signal-card-top">
                                <span className="signal-sector-badge font-mono">{sig.sectorCode} · {sig.sectorName}</span>
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
                            想查看美股 GICS 11 大行业轮动策略在过去 20 年（2005-2025，对决标普 500）的真实回测与胜率？
                        </span>
                    </div>
                    <button
                        className="jump-action-btn"
                        onClick={handleBacktestClick}
                    >
                        查看美股 20 年回测与胜率实证 →
                    </button>
                </div>
            </div>
            </>
            )}
        </div>
    );
};
