import React from 'react';
import type { MarketBreadth } from '../../../types/market.types';

interface MarketCapitalFlowBarProps {
    breadth: MarketBreadth | null;
    colorScheme?: 'cn' | 'us';
}

export const MarketCapitalFlowBar: React.FC<MarketCapitalFlowBarProps> = ({
    breadth,
    colorScheme = 'cn',
}) => {
    if (!breadth || (!breadth.capitalFlow && !breadth.marginData)) {
        return null;
    }

    const flow = breadth.capitalFlow;
    const margin = breadth.marginData;

    const isCn = colorScheme === 'cn';
    const getTrendClass = (val: number) => {
        if (val === 0) return 'text-neutral';
        if (isCn) {
            return val > 0 ? 'text-red' : 'text-green';
        } else {
            return val > 0 ? 'text-green' : 'text-red';
        }
    };

    // 主力 vs 散户博弈诊断
    let gameAnalysis = '多空资金处于均衡观望博弈态势。';
    if (flow) {
        if (flow.mainNetInflow > 30 && flow.retailNetInflow < -20) {
            gameAnalysis = '机构主力持续大额净买入沉淀筹码，散户逢高止盈兑现，筹码结构向机构集中。';
        } else if (flow.mainNetInflow < -30 && flow.retailNetInflow > 20) {
            gameAnalysis = '机构主力出现分歧资金净流出，中小散户接盘意愿较强，短线需防范主力调仓扰动。';
        } else if (flow.mainNetInflow > 20 && flow.retailNetInflow > 0) {
            gameAnalysis = '机构与散户资金形成做多共振，两市风险偏好高涨，场内增量充裕。';
        } else if (flow.mainNetInflow < -20 && flow.retailNetInflow < 0) {
            gameAnalysis = '主力与散户同步净卖出，市场呈存量缩量防御特征，防御低估值板块韧性更强。';
        } else {
            gameAnalysis = '资金在不同风格板块间高低切换轮动，全市场流动性相对平衡。';
        }
    }

    // 杠杆两融状态评估
    let marginAnalysis = '两融杠杆规模保持平稳。';
    if (margin) {
        if (margin.netBuyAmount > 50) {
            marginAnalysis = '🔥 融资杠杆资金大幅净买入超 50 亿元，高风险偏好做多动能极其激进！';
        } else if (margin.netBuyAmount >= 0) {
            marginAnalysis = '⚡ 融资杠杆呈温和净买入态势，杠杆风险溢价与持仓心态稳健。';
        } else if (margin.netBuyAmount < -50) {
            marginAnalysis = '⚠️ 融资资金大额净流出降杠杆，场内杠杆避险离场意愿显著。';
        } else {
            marginAnalysis = '🧊 融资资金小幅净偿还，场内杠杆资金略偏谨慎收缩。';
        }
    }

    return (
        <div className="capital-flow-container">
            {/* 卡片 1：全市场主力资金流向 (机构超大单与大单) */}
            <div className="flow-card main-capital-card">
                <div className="card-top-title">
                    <span className="title-icon">🏦</span>
                    <span className="title-text">全市场主力资金流向</span>
                    {flow && (
                        <span className={`flow-ratio-badge ${getTrendClass(flow.mainNetInflowRatio)}`}>
                            净占比 {flow.mainNetInflowRatio > 0 ? '+' : ''}{flow.mainNetInflowRatio}%
                        </span>
                    )}
                </div>

                {flow ? (
                    <>
                        <div className="flow-metric-main">
                            <div className={`flow-giant-num ${getTrendClass(flow.mainNetInflow)}`}>
                                {flow.mainNetInflow > 0 ? '+' : ''}{flow.mainNetInflow.toFixed(2)}
                                <span className="unit-text">亿元</span>
                            </div>
                            <div className="flow-sub-label">
                                超大单 + 大单 (机构合力)
                            </div>
                        </div>

                        <div className="flow-breakdown-grid">
                            <div className="breakdown-item">
                                <span className="item-name">超大单净额:</span>
                                <span className={`item-val ${getTrendClass(flow.superLargeNetInflow)}`}>
                                    {flow.superLargeNetInflow > 0 ? '+' : ''}{flow.superLargeNetInflow.toFixed(2)} 亿
                                </span>
                                <span className="item-ratio">({flow.superLargeRatio > 0 ? '+' : ''}{flow.superLargeRatio}%)</span>
                            </div>
                            <div className="breakdown-item">
                                <span className="item-name">大单净额:</span>
                                <span className={`item-val ${getTrendClass(flow.largeNetInflow)}`}>
                                    {flow.largeNetInflow > 0 ? '+' : ''}{flow.largeNetInflow.toFixed(2)} 亿
                                </span>
                                <span className="item-ratio">({flow.largeRatio > 0 ? '+' : ''}{flow.largeRatio}%)</span>
                            </div>
                        </div>

                        <div className="flow-date-tag">
                            统计时段: {flow.date} 盘中实时清算
                        </div>
                    </>
                ) : (
                    <div className="flow-placeholder">暂无主力资金数据</div>
                )}
            </div>

            {/* 卡片 2：散户资金流向与博弈态势 (中单与小单) */}
            <div className="flow-card retail-capital-card">
                <div className="card-top-title">
                    <span className="title-icon">👥</span>
                    <span className="title-text">散户与中小单资金博弈</span>
                    {flow && (
                        <span className={`flow-ratio-badge ${getTrendClass(flow.retailNetInflow)}`}>
                            散户净额 {flow.retailNetInflow > 0 ? '+' : ''}{flow.retailNetInflow.toFixed(2)} 亿
                        </span>
                    )}
                </div>

                {flow ? (
                    <>
                        <div className="flow-metric-main">
                            <div className={`flow-giant-num ${getTrendClass(flow.retailNetInflow)}`}>
                                {flow.retailNetInflow > 0 ? '+' : ''}{flow.retailNetInflow.toFixed(2)}
                                <span className="unit-text">亿元</span>
                            </div>
                            <div className="flow-sub-label">
                                中单 + 小单 (个人与游资散单)
                            </div>
                        </div>

                        <div className="flow-breakdown-grid">
                            <div className="breakdown-item">
                                <span className="item-name">中单净额:</span>
                                <span className={`item-val ${getTrendClass(flow.midNetInflow)}`}>
                                    {flow.midNetInflow > 0 ? '+' : ''}{flow.midNetInflow.toFixed(2)} 亿
                                </span>
                                <span className="item-ratio">({flow.midRatio > 0 ? '+' : ''}{flow.midRatio}%)</span>
                            </div>
                            <div className="breakdown-item">
                                <span className="item-name">小单净额:</span>
                                <span className={`item-val ${getTrendClass(flow.smallNetInflow)}`}>
                                    {flow.smallNetInflow > 0 ? '+' : ''}{flow.smallNetInflow.toFixed(2)} 亿
                                </span>
                                <span className="item-ratio">({flow.smallRatio > 0 ? '+' : ''}{flow.smallRatio}%)</span>
                            </div>
                        </div>

                        <div className="flow-game-desc">
                            💡 {gameAnalysis}
                        </div>
                    </>
                ) : (
                    <div className="flow-placeholder">暂无散户资金数据</div>
                )}
            </div>

            {/* 卡片 3：全市场两融杠杆水位 (杠杆风险情绪) */}
            <div className="flow-card margin-leverage-card">
                <div className="card-top-title">
                    <span className="title-icon">⚡</span>
                    <span className="title-text">全市场两融杠杆水位</span>
                    {margin && (
                        <span className="margin-ratio-badge">
                            融资占比 {margin.marginRatio}%
                        </span>
                    )}
                </div>

                {margin ? (
                    <>
                        <div className="flow-metric-main">
                            <div className="flow-giant-num text-cyan">
                                {margin.totalBalance.toLocaleString()}
                                <span className="unit-text">亿元</span>
                            </div>
                            <div className="flow-sub-label">
                                两融总额 (约 {(margin.totalBalance / 10000).toFixed(2)} 万亿)
                            </div>
                        </div>

                        <div className="margin-breakdown-grid">
                            <div className="margin-item">
                                <span className="item-name">融资余额:</span>
                                <span className="item-val">{margin.marginBalance.toLocaleString()} 亿</span>
                            </div>
                            <div className="margin-item">
                                <span className="item-name">融券余额:</span>
                                <span className="item-val">{margin.shortBalance.toLocaleString()} 亿</span>
                            </div>
                            <div className="margin-item">
                                <span className="item-name">融资净买入:</span>
                                <span className={`item-val ${getTrendClass(margin.netBuyAmount)}`}>
                                    {margin.netBuyAmount > 0 ? '+' : ''}{margin.netBuyAmount.toFixed(2)} 亿
                                </span>
                            </div>
                        </div>

                        <div className="margin-desc">
                            {marginAnalysis}
                        </div>
                    </>
                ) : (
                    <div className="flow-placeholder">暂无两融数据</div>
                )}
            </div>
        </div>
    );
};
