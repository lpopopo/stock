import React from 'react';
import type { MarketIndex, ColorScheme, MarketType } from '../../../types/market.types';

interface IndexHeroCardsProps {
    indices: MarketIndex[];
    colorScheme: ColorScheme;
    marketFilter?: MarketType | 'ALL';
    onSelectIndex?: (index: MarketIndex) => void;
}

export const IndexHeroCards: React.FC<IndexHeroCardsProps> = ({
    indices,
    colorScheme,
    marketFilter = 'ALL',
    onSelectIndex,
}) => {
    const filtered = indices.filter(item => {
        if (marketFilter === 'ALL') return true;
        return item.market === marketFilter;
    });

    if (filtered.length === 0) {
        return (
            <div className="empty-indices-notice">
                <span>暂无指数数据，请稍后刷新重试...</span>
            </div>
        );
    }

    return (
        <div className="index-cards-grid">
            {filtered.map(item => {
                const isUp = item.change > 0;
                const isDown = item.change < 0;

                // 配色逻辑
                // 'cn': 红涨绿跌; 'us': 绿涨红跌
                let trendClass = 'neutral';
                if (colorScheme === 'cn') {
                    trendClass = isUp ? 'trend-up-red' : isDown ? 'trend-down-green' : 'trend-flat';
                } else {
                    trendClass = isUp ? 'trend-up-green' : isDown ? 'trend-down-red' : 'trend-flat';
                }

                const sign = isUp ? '+' : '';
                const marketBadge = item.market === 'A' ? 'A股' : item.market === 'US' ? '美股' : '港股';

                return (
                    <div
                        key={item.code}
                        className={`index-hero-card ${trendClass}`}
                        onClick={() => onSelectIndex?.(item)}
                    >
                        <div className="index-card-header">
                            <div className="index-name-box">
                                <span className="index-name">{item.name}</span>
                                <span className="index-symbol">{item.symbol}</span>
                            </div>
                            <span className={`index-market-badge badge-${item.market.toLowerCase()}`}>
                                {marketBadge}
                            </span>
                        </div>

                        <div className="index-card-main">
                            <div className="index-current-price">
                                {item.current.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </div>
                            <div className="index-change-row">
                                <span className="index-change-val">
                                    {sign}{item.change.toFixed(2)}
                                </span>
                                <span className="index-change-pct">
                                    {sign}{item.changePct.toFixed(2)}%
                                </span>
                            </div>
                        </div>

                        <div className="index-card-footer">
                            <div className="index-footer-item">
                                <span className="footer-label">成交额</span>
                                <span className="footer-val">{item.turnoverDisplay}</span>
                            </div>
                            <div className="index-footer-item">
                                <span className="footer-label">振幅</span>
                                <span className="footer-val">{item.amplitude}%</span>
                            </div>
                            {item.peRatio && (
                                <div className="index-footer-item">
                                    <span className="footer-label">PE(TTM)</span>
                                    <span className="footer-val">{item.peRatio.toFixed(1)}x</span>
                                </div>
                            )}
                        </div>

                        <div className="index-range-bar-wrapper">
                            <div className="range-labels">
                                <span>低: {item.low.toFixed(1)}</span>
                                <span>高: {item.high.toFixed(1)}</span>
                            </div>
                            <div className="range-bar-bg">
                                {item.high > item.low && (
                                    <div
                                        className="range-bar-cursor"
                                        style={{
                                            left: `${Math.max(0, Math.min(100, ((item.current - item.low) / (item.high - item.low)) * 100))}%`
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
