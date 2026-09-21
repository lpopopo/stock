import React, { useEffect, useState } from 'react';
import { useMarketStore } from '../../store/market.store';
import { IndexHeroCards } from './components/IndexHeroCards';
import { MarketBreadthBar } from './components/MarketBreadthBar';
import { MarketCapitalFlowBar } from './components/MarketCapitalFlowBar';
import { SectorRotationRadar } from './components/SectorRotationRadar';
import { UsSectorRotationRadar } from './components/UsSectorRotationRadar';
import { CrossAssetBarometer } from './components/CrossAssetBarometer';
import { StockMatrixTable } from './components/StockMatrixTable';
import { ValuationCycleGauges } from './components/ValuationCycleGauges';
import { MarketWatchlist } from './components/MarketWatchlist';
import { MarketAiAnalysisModal } from './components/MarketAiAnalysisModal';
import type { MarketViewType } from '../../types/market.types';
import './MarketDashboard.css';

export const MarketDashboard: React.FC = () => {
    const {
        indices,
        stockMetrics,
        macroAssets,
        breadth,
        valuations,
        tradingStatus,
        sectors,
        macroPhase,
        rotationSignals,
        usSectors,
        fedCycle,
        usDivergence,
        usSignals,
        isLoading,
        lastUpdated,
        autoRefreshInterval,
        activeView,
        colorScheme,
        fetchAllData,
        setAutoRefreshInterval,
        setActiveView,
        setColorScheme,
    } = useMarketStore();

    const [showAiModal, setShowAiModal] = useState(false);
    const [rotationMarketTab, setRotationMarketTab] = useState<'A' | 'US'>('A');

    // 组件挂载时首次拉取数据
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // 自动轮询刷新定时器
    useEffect(() => {
        if (autoRefreshInterval <= 0) return;

        const timer = setInterval(() => {
            fetchAllData();
        }, autoRefreshInterval * 1000);

        return () => clearInterval(timer);
    }, [autoRefreshInterval, fetchAllData]);

    const viewTabs: { key: MarketViewType; label: string; icon: string }[] = [
        { key: 'overview', label: '全球宏观全景', icon: '🌐' },
        { key: 'a_share', label: 'A股深度看板', icon: '🇨🇳' },
        { key: 'sector_rotation', label: '板块轮动与雷达', icon: '🧭' },
        { key: 'us_stock', label: '美股深度看板', icon: '🇺🇸' },
        { key: 'valuation', label: '估值与周期水位', icon: '⚖️' },
        { key: 'watchlist', label: '个人自选监控', icon: '⭐' },
    ];

    const refreshIntervalOptions = [
        { label: '暂停', value: 0 },
        { label: '5 秒', value: 5 },
        { label: '15 秒', value: 15 },
        { label: '30 秒', value: 30 },
        { label: '60 秒', value: 60 },
    ];

    return (
        <div className="market-dashboard-root">
            {/* 顶部状态与综合控制栏 */}
            <div className="dashboard-control-header">
                {/* 交易时段指示灯 */}
                <div className="trading-status-strip">
                    <div className="status-indicator-item">
                        <span className="dot dot-a" />
                        <span className="market-tag">A股:</span>
                        <span className="status-label">{tradingStatus.aShareStatus}</span>
                    </div>
                    <div className="status-indicator-item">
                        <span className="dot dot-us" />
                        <span className="market-tag">美股:</span>
                        <span className="status-label">{tradingStatus.usStockStatus}</span>
                    </div>
                    <div className="status-indicator-item">
                        <span className="dot dot-hk" />
                        <span className="market-tag">港股:</span>
                        <span className="status-label">{tradingStatus.hkStockStatus}</span>
                    </div>
                    {lastUpdated && (
                        <div className="last-updated-text">
                            更新时间: <span>{lastUpdated}</span>
                        </div>
                    )}
                </div>

                {/* 右侧交互控件 */}
                <div className="header-control-buttons">
                    {/* 红绿配色习惯切换 */}
                    <button
                        className="btn-toggle-color"
                        onClick={() => setColorScheme(colorScheme === 'cn' ? 'us' : 'cn')}
                        title="切换涨跌颜色习惯"
                    >
                        {colorScheme === 'cn' ? '🇨🇳 红涨绿跌' : '🇺🇸 绿涨红跌'}
                    </button>

                    {/* 自动刷新频率 */}
                    <div className="auto-refresh-selector">
                        <span className="selector-label">刷新:</span>
                        <select
                            value={autoRefreshInterval}
                            onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                            className="refresh-select-input"
                        >
                            {refreshIntervalOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* 手动即时刷新 */}
                    <button
                        className={`btn-instant-refresh ${isLoading ? 'spinning' : ''}`}
                        onClick={() => fetchAllData()}
                        disabled={isLoading}
                        title="立即刷新行情"
                    >
                        🔄 {isLoading ? '更新中' : '刷新'}
                    </button>

                    {/* AI 宏观联动研报 */}
                    <button
                        className="btn-open-ai-modal"
                        onClick={() => setShowAiModal(true)}
                        title="基于当前全盘数据生成 AI 宏观联动研报"
                    >
                        🤖 AI 盘面复盘
                    </button>
                </div>
            </div>

            {/* 核心主视图切换 Tab */}
            <div className="dashboard-navigation-tabs">
                {viewTabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`nav-tab-pill ${activeView === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveView(tab.key)}
                    >
                        <span className="tab-pill-icon">{tab.icon}</span>
                        <span className="tab-pill-label">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* 主内容区域 */}
            <div className="dashboard-view-content">
                {/* 视图 1：全球宏观全景 */}
                {activeView === 'overview' && (
                    <div className="overview-view-layout">
                        {/* 核心宽基指数卡片 */}
                        <div className="section-block">
                            <IndexHeroCards
                                indices={indices}
                                colorScheme={colorScheme}
                                marketFilter="ALL"
                            />
                        </div>

                        {/* A股两市总成交额与量能、情绪晴雨表、VIX */}
                        <div className="section-block">
                            <MarketBreadthBar breadth={breadth} colorScheme={colorScheme} />
                        </div>

                        {/* 全市场主力/散户资金流向与两融杠杆监测 */}
                        <div className="section-block">
                            <MarketCapitalFlowBar breadth={breadth} colorScheme={colorScheme} />
                        </div>

                        {/* 宏观信用时钟与板块轮动信号雷达 */}
                        <div className="section-block">
                            <SectorRotationRadar
                                sectors={sectors}
                                macroPhase={macroPhase}
                                signals={rotationSignals}
                                colorScheme={colorScheme}
                            />
                        </div>

                        {/* 宏观跨资产风向标 (黄金、原油、白银、离岸人民币、美元指数) */}
                        <div className="section-block">
                            <CrossAssetBarometer
                                macroAssets={macroAssets}
                                colorScheme={colorScheme}
                            />
                        </div>

                        {/* 核心股票矩阵 (Mag 7 / 中概龙头 / A股核心白马) */}
                        <div className="section-block">
                            <StockMatrixTable
                                stockMetrics={stockMetrics}
                                colorScheme={colorScheme}
                            />
                        </div>

                        {/* 宏观估值与周期水位简要概览 */}
                        <div className="section-block">
                            <ValuationCycleGauges valuations={valuations} />
                        </div>
                    </div>
                )}

                {/* 视图 2：A股深度看板 */}
                {activeView === 'a_share' && (
                    <div className="ashare-view-layout">
                        <div className="section-block">
                            <IndexHeroCards
                                indices={indices}
                                colorScheme={colorScheme}
                                marketFilter="A"
                            />
                        </div>

                        <div className="section-block">
                            <MarketBreadthBar breadth={breadth} colorScheme={colorScheme} />
                        </div>

                        <div className="section-block">
                            <MarketCapitalFlowBar breadth={breadth} colorScheme={colorScheme} />
                        </div>

                        <div className="section-block">
                            <SectorRotationRadar
                                sectors={sectors}
                                macroPhase={macroPhase}
                                signals={rotationSignals}
                                colorScheme={colorScheme}
                            />
                        </div>

                        <div className="section-block">
                            <StockMatrixTable
                                stockMetrics={stockMetrics.filter(s => s.category === 'a_pillar')}
                                colorScheme={colorScheme}
                            />
                        </div>

                        <div className="section-block">
                            <ValuationCycleGauges
                                valuations={valuations.filter(v => v.market === 'A')}
                            />
                        </div>
                    </div>
                )}

                {/* 视图 3：板块轮动与周期信号雷达 (A股 / 美股双市场独立雷达) */}
                {activeView === 'sector_rotation' && (
                    <div className="sector-rotation-view-layout">
                        {/* 市场切换栏 */}
                        <div className="backtest-market-switcher-bar" style={{ marginBottom: 12 }}>
                            <div className="market-btn-group">
                                <button
                                    className={`market-switch-btn ${rotationMarketTab === 'A' ? 'active' : ''}`}
                                    onClick={() => setRotationMarketTab('A')}
                                >
                                    🇨🇳 A股中信一级行业轮动 (货币/信用时钟 + 拥挤度)
                                </button>
                                <button
                                    className={`market-switch-btn ${rotationMarketTab === 'US' ? 'active' : ''}`}
                                    onClick={() => setRotationMarketTab('US')}
                                >
                                    🇺🇸 美股 GICS 11大行业ETF轮动 (美联储利率时钟 + 广度背离)
                                </button>
                            </div>
                            <div className="market-meta-badge">
                                {rotationMarketTab === 'A' ? (
                                    <span>申万/中信行业 · 货币信用四象限 · 成交拥挤度预警</span>
                                ) : (
                                    <span>GICS 11大行业ETF · 美联储利率时钟 · SPY/RSP剪刀差</span>
                                )}
                            </div>
                        </div>

                        {rotationMarketTab === 'A' ? (
                            <SectorRotationRadar
                                sectors={sectors}
                                macroPhase={macroPhase}
                                signals={rotationSignals}
                                colorScheme={colorScheme}
                            />
                        ) : (
                            <UsSectorRotationRadar
                                sectors={usSectors}
                                fedCycle={fedCycle}
                                divergence={usDivergence}
                                signals={usSignals}
                                colorScheme={colorScheme}
                            />
                        )}
                    </div>
                )}

                {/* 视图 4：美股深度看板 */}
                {activeView === 'us_stock' && (
                    <div className="us-view-layout">
                        <div className="section-block">
                            <IndexHeroCards
                                indices={indices}
                                colorScheme={colorScheme}
                                marketFilter="US"
                            />
                        </div>

                        {/* 美股 GICS 11 大行业板块轮动、美联储时钟与广度剪刀差 */}
                        <div className="section-block">
                            <UsSectorRotationRadar
                                sectors={usSectors}
                                fedCycle={fedCycle}
                                divergence={usDivergence}
                                signals={usSignals}
                                colorScheme={colorScheme}
                            />
                        </div>

                        <div className="section-block">
                            <CrossAssetBarometer
                                macroAssets={macroAssets.filter(m => m.category === 'volatility' || m.id === 'DXY')}
                                colorScheme={colorScheme}
                            />
                        </div>

                        <div className="section-block">
                            <StockMatrixTable
                                stockMetrics={stockMetrics.filter(s => s.category === 'mag7' || s.category === 'china_concept')}
                                colorScheme={colorScheme}
                            />
                        </div>

                        <div className="section-block">
                            <ValuationCycleGauges
                                valuations={valuations.filter(v => v.market === 'US')}
                            />
                        </div>
                    </div>
                )}

                {/* 视图 4：估值与周期水位 */}
                {activeView === 'valuation' && (
                    <div className="valuation-view-layout">
                        <ValuationCycleGauges valuations={valuations} />
                    </div>
                )}

                {/* 视图 5：个人自选监控 */}
                {activeView === 'watchlist' && (
                    <div className="watchlist-view-layout">
                        <MarketWatchlist colorScheme={colorScheme} />
                    </div>
                )}
            </div>

            {/* AI 宏观跨市场联动研报弹窗 */}
            <MarketAiAnalysisModal
                visible={showAiModal}
                onClose={() => setShowAiModal(false)}
            />
        </div>
    );
};
