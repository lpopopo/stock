import React from 'react';
import type { MarketBreadth } from '../../../types/market.types';

interface MarketBreadthBarProps {
    breadth: MarketBreadth | null;
    colorScheme?: 'cn' | 'us';
}

export const MarketBreadthBar: React.FC<MarketBreadthBarProps> = ({ breadth, colorScheme = 'cn' }) => {
    if (!breadth) return null;

    const shRatio = breadth.totalTurnover > 0
        ? Math.round((breadth.shTurnover / breadth.totalTurnover) * 100)
        : 46;
    const szRatio = 100 - shRatio;

    const isCn = colorScheme === 'cn';
    const upColor = isCn ? '#f85149' : '#3fb950';
    const downColor = isCn ? '#3fb950' : '#f85149';

    // 量能状态样式
    const statusTagMap = {
        surge: { text: '🔥 超级天量放量 (流动性极度亢奋)', className: 'status-surge' },
        expand: { text: '⚡ 温和放量活跃 (健康做多窗口)', className: 'status-expand' },
        normal: { text: '⚖️ 常态中性博弈 (量能平稳)', className: 'status-normal' },
        shrink: { text: '🧊 缩量观望防守 (存量资金抱团)', className: 'status-shrink' },
    };

    const currentStatus = statusTagMap[breadth.volumeStatus] || statusTagMap.normal;

    // 情绪颜色判定
    let sentimentColor = '#58a6ff';
    if (breadth.sentimentScore >= 75) sentimentColor = '#f85149'; // 极热
    else if (breadth.sentimentScore >= 60) sentimentColor = '#d29922'; // 贪婪
    else if (breadth.sentimentScore <= 35) sentimentColor = '#3fb950'; // 冰点逆向
    else if (breadth.sentimentScore <= 20) sentimentColor = '#a371f7'; // 极度恐慌

    // 涨跌分布计算
    const hasBreadthCounts = breadth.upCount !== undefined && breadth.downCount !== undefined;
    const upCount = breadth.upCount || 0;
    const downCount = breadth.downCount || 0;
    const flatCount = breadth.flatCount || 0;
    const totalCount = upCount + downCount + flatCount;
    const upRatio = totalCount > 0 ? (upCount / totalCount) * 100 : 50;
    const flatRatio = totalCount > 0 ? (flatCount / totalCount) * 100 : 5;
    const downRatio = Math.max(0, 100 - upRatio - flatRatio);

    return (
        <div className="market-breadth-container">
            {/* 左侧：A股两市量能总成交额与全市场涨跌真实广度 */}
            <div className="breadth-card volume-overview-card">
                <div className="card-top-title">
                    <span className="title-icon">📊</span>
                    <span className="title-text">A股两市总成交额</span>
                    <span className={`volume-status-badge ${currentStatus.className}`}>
                        {currentStatus.text}
                    </span>
                </div>

                <div className="volume-metric-main">
                    <div className="turnover-giant-num">
                        {breadth.totalTurnover.toLocaleString()}
                        <span className="unit-text">亿元</span>
                    </div>
                    <div className="volume-change-tag">
                        较5日均量: <span className={breadth.volumeChangePct >= 0 ? 'text-red' : 'text-green'}>
                            {breadth.volumeChangePct >= 0 ? '+' : ''}{breadth.volumeChangePct}%
                        </span>
                    </div>
                </div>

                {/* 沪深成交分配条 */}
                <div className="volume-split-bar-section">
                    <div className="split-labels">
                        <span>沪市: {breadth.shTurnover.toLocaleString()} 亿 ({shRatio}%)</span>
                        <span>深市: {breadth.szTurnover.toLocaleString()} 亿 ({szRatio}%)</span>
                    </div>
                    <div className="split-progress-bar">
                        <div className="split-sh" style={{ width: `${shRatio}%` }} />
                        <div className="split-sz" style={{ width: `${szRatio}%` }} />
                    </div>
                </div>

                {/* 全市场真实涨跌家数与分布 */}
                {hasBreadthCounts && (
                    <div className="advance-decline-section">
                        <div className="ad-header">
                            <span className="ad-title">沪深全市场涨跌统计</span>
                            <span className="ad-ratio-tag" style={{ color: upColor }}>
                                上涨占比 {breadth.upRatio}%
                            </span>
                        </div>
                        <div className="ad-counts-row">
                            <div className="ad-count-badge ad-up" style={{ color: upColor }}>
                                <span className="badge-dot" style={{ backgroundColor: upColor }} />
                                上涨: <strong>{upCount.toLocaleString()}</strong> 家
                            </div>
                            <div className="ad-count-badge ad-flat">
                                <span className="badge-dot" style={{ backgroundColor: '#8b949e' }} />
                                平盘: <strong>{flatCount.toLocaleString()}</strong> 家
                            </div>
                            <div className="ad-count-badge ad-down" style={{ color: downColor }}>
                                <span className="badge-dot" style={{ backgroundColor: downColor }} />
                                下跌: <strong>{downCount.toLocaleString()}</strong> 家
                            </div>
                        </div>
                        <div className="ad-progress-bar">
                            <div className="ad-segment-up" style={{ width: `${upRatio}%`, backgroundColor: upColor }} title={`上涨: ${upCount} 家 (${upRatio.toFixed(1)}%)`} />
                            <div className="ad-segment-flat" style={{ width: `${flatRatio}%`, backgroundColor: '#8b949e' }} title={`平盘: ${flatCount} 家`} />
                            <div className="ad-segment-down" style={{ width: `${downRatio}%`, backgroundColor: downColor }} title={`下跌: ${downCount} 家 (${downRatio.toFixed(1)}%)`} />
                        </div>
                    </div>
                )}
            </div>

            {/* 中间：市场综合情绪温度计 (量化多因子模型) */}
            <div className="breadth-card sentiment-gauge-card">
                <div className="card-top-title">
                    <span className="title-icon">🌡️</span>
                    <span className="title-text">A股情绪晴雨表 (多因子量化)</span>
                    <span className="sentiment-level-badge" style={{ color: sentimentColor, borderColor: sentimentColor }}>
                        {breadth.sentimentLevel}
                    </span>
                </div>

                <div className="sentiment-metric-main">
                    <div className="sentiment-score-num" style={{ color: sentimentColor }}>
                        {breadth.sentimentScore}
                        <span className="unit-text">/ 100</span>
                    </div>
                    <div className="sentiment-indicator-scale">
                        <div className="scale-track">
                            <div
                                className="scale-thumb"
                                style={{
                                    left: `${breadth.sentimentScore}%`,
                                    backgroundColor: sentimentColor,
                                }}
                            />
                        </div>
                        <div className="scale-labels">
                            <span>0 极度恐慌</span>
                            <span>50 均衡</span>
                            <span>100 极度亢奋</span>
                        </div>
                    </div>
                </div>

                {/* 5 因子模型加权说明 */}
                <div className="multi-factor-badges">
                    <span className="factor-tag">广度 25%</span>
                    <span className="factor-tag">量能 25%</span>
                    <span className="factor-tag">主力 20%</span>
                    <span className="factor-tag">VIX 15%</span>
                    <span className="factor-tag">两融 15%</span>
                </div>

                <div className="sentiment-desc">
                    {breadth.sentimentScore >= 75
                        ? '短线市场处于亢奋过热区间，情绪与杠杆做多一致性极高，需警惕冲高分歧。'
                        : breadth.sentimentScore >= 60
                        ? '多头主导行情，成交充沛且涨跌广度良好，做多动能充沛活跃。'
                        : breadth.sentimentScore <= 35
                        ? '市场情绪处于冰点或筑底期，恐慌盘出清释放较充分，留意右侧逆向反弹机会。'
                        : '多空博弈力量相对均衡，结构性轮动加快，重视业绩与估值安全边际。'}
                </div>
            </div>

            {/* 右侧：美股波动率与恐慌指标 VIX */}
            <div className="breadth-card vix-overview-card">
                <div className="card-top-title">
                    <span className="title-icon">⚡</span>
                    <span className="title-text">美股恐慌指数 (VIX)</span>
                    <span className={`vix-status-badge ${breadth.vixValue > 25 ? 'vix-high' : 'vix-normal'}`}>
                        {breadth.vixStatus}
                    </span>
                </div>

                <div className="vix-metric-main">
                    <div className="vix-value-num">
                        {breadth.vixValue.toFixed(2)}
                        <span className="unit-text">点</span>
                    </div>
                    <div className="vix-threshold-tag">
                        正常警戒线: 20.00 点
                    </div>
                </div>

                <div className="vix-range-bar-wrapper">
                    <div className="vix-bar-track">
                        <div
                            className="vix-bar-pointer"
                            style={{
                                left: `${Math.min(100, Math.max(0, (breadth.vixValue / 50) * 100))}%`
                            }}
                        />
                    </div>
                    <div className="vix-bar-scale">
                        <span>12 极稳</span>
                        <span>20 警戒</span>
                        <span>35 恐慌</span>
                        <span>50+ 危机</span>
                    </div>
                </div>

                <div className="vix-desc">
                    {breadth.vixValue > 25
                        ? '⚠️ 美股期权隐含波动剧烈，对冲基金避险仓位增加，成长股估值受压。'
                        : '✅ 波动率处于低位中性区间，美股多头趋势阻力较小。'}
                </div>
            </div>
        </div>
    );
};
