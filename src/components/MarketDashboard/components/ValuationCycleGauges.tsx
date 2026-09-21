import React from 'react';
import type { ValuationMetric } from '../../../types/market.types';

interface ValuationCycleGaugesProps {
    valuations: ValuationMetric[];
}

export const ValuationCycleGauges: React.FC<ValuationCycleGaugesProps> = ({ valuations }) => {
    if (valuations.length === 0) return null;

    const getLevelColor = (level: ValuationMetric['level']) => {
        switch (level) {
            case '极低估':
            case '偏低估':
                return '#3fb950'; // 绿色/安全
            case '估值合理':
                return '#58a6ff'; // 蓝色/中性
            case '偏高估':
            case '极高估':
                return '#f85149'; // 红色/预警
            default:
                return '#8b949e';
        }
    };

    return (
        <div className="valuation-cycle-section">
            <div className="section-header-title">
                <div className="title-left">
                    <span className="title-icon">⚖️</span>
                    <span className="title-text">宏观估值与周期水位 (PE-TTM、分位数与股债风险溢价 ERP)</span>
                </div>
                <span className="title-tip">穿透周期迷雾，衡量大类资产安全边际与中长期配置赔率</span>
            </div>

            <div className="valuation-cards-grid">
                {valuations.map(metric => {
                    const levelColor = getLevelColor(metric.level);
                    return (
                        <div key={metric.code} className="valuation-card">
                            <div className="val-card-header">
                                <div className="val-name-box">
                                    <span className="val-index-name">{metric.name}</span>
                                    <span className="val-market-badge">{metric.market === 'A' ? 'A股' : '美股'}</span>
                                </div>
                                <span
                                    className="val-level-tag"
                                    style={{ color: levelColor, borderColor: levelColor }}
                                >
                                    {metric.level}
                                </span>
                            </div>

                            <div className="val-metrics-row">
                                <div className="val-metric-item">
                                    <span className="metric-label">当前 PE-TTM</span>
                                    <span className="metric-val">{metric.currentPe.toFixed(1)}x</span>
                                </div>
                                <div className="val-metric-item">
                                    <span className="metric-label">历史中位数</span>
                                    <span className="metric-val">{metric.historicalMedianPe.toFixed(1)}x</span>
                                </div>
                                <div className="val-metric-item">
                                    <span className="metric-label">股债风险溢价 (ERP)</span>
                                    <span className="metric-val highlight-erp" style={{ color: metric.erp > 3 ? '#3fb950' : '#d29922' }}>
                                        {metric.erp >= 0 ? '+' : ''}{metric.erp}%
                                    </span>
                                </div>
                            </div>

                            {/* 历史分位进度条 */}
                            <div className="val-percentile-section">
                                <div className="percentile-label-row">
                                    <span>历史估值分位数</span>
                                    <span className="percentile-bold" style={{ color: levelColor }}>
                                        {metric.percentile}% 分位
                                    </span>
                                </div>
                                <div className="percentile-track-bar">
                                    <div
                                        className="percentile-fill-bar"
                                        style={{
                                            width: `${metric.percentile}%`,
                                            backgroundColor: levelColor,
                                        }}
                                    />
                                    {/* 50% 中位参考锚点 */}
                                    <div className="percentile-median-marker" title="50% 中位数" />
                                </div>
                                <div className="percentile-scale-marks">
                                    <span>0% 极度低估</span>
                                    <span>50% 历史中枢</span>
                                    <span>100% 极度泡沫</span>
                                </div>
                            </div>

                            <div className="val-card-footer-assessment">
                                <span className="val-footer-icon">💡</span>
                                <span>{metric.assessment}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 周期框架方法论说明 */}
            <div className="valuation-methodology-box">
                <div className="methodology-title">📌 宏观估值分析框架与指标解读指南：</div>
                <div className="methodology-points">
                    <div className="point-item">
                        <strong>① 股债风险溢价 (Equity Risk Premium, ERP)</strong>：
                        公式为 <code>1 / PE(TTM) - 10年期国债收益率</code>。ERP 代表股票资产相对于无风险债券的超额收益预期。A股沪深300 ERP 超过 5% 时，代表股市极度便宜、未来 1~3 年胜率极高；美股标普500 ERP 跌至负值时，代表国债收益率高于股票盈利率，权益资产性价比偏紧。
                    </div>
                    <div className="point-item">
                        <strong>② 巴菲特指标 (美股市值 / GDP)</strong>：
                        巴菲特最推崇的长期大盘温度计。正常中枢在 100%~120% 之间，超过 180% 意味着美股处于严重超买或高估区间，需要强劲的科技生产力革新 (如 AI) 推动 GDP 快速增长来消化溢价。
                    </div>
                </div>
            </div>
        </div>
    );
};
