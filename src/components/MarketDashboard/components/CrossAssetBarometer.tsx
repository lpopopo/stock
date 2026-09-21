import React from 'react';
import type { MacroAsset, ColorScheme } from '../../../types/market.types';

interface CrossAssetBarometerProps {
    macroAssets: MacroAsset[];
    colorScheme: ColorScheme;
}

export const CrossAssetBarometer: React.FC<CrossAssetBarometerProps> = ({ macroAssets, colorScheme }) => {
    if (macroAssets.length === 0) return null;

    return (
        <div className="cross-asset-section">
            <div className="section-header-title">
                <div className="title-left">
                    <span className="title-icon">🌍</span>
                    <span className="title-text">宏观跨资产风向标 (汇率、大宗商品与流动性)</span>
                </div>
                <span className="title-tip">全球资金定价之锚与风险偏好传导</span>
            </div>

            <div className="macro-cards-grid">
                {macroAssets.map(asset => {
                    const isUp = asset.changePct > 0;
                    const isDown = asset.changePct < 0;

                    let trendClass = 'neutral';
                    if (colorScheme === 'cn') {
                        trendClass = isUp ? 'trend-up-red' : isDown ? 'trend-down-green' : 'trend-flat';
                    } else {
                        trendClass = isUp ? 'trend-up-green' : isDown ? 'trend-down-red' : 'trend-flat';
                    }

                    const sign = isUp ? '+' : '';

                    return (
                        <div key={asset.id} className={`macro-card ${trendClass}`}>
                            <div className="macro-card-top">
                                <span className="macro-name">{asset.name}</span>
                                <span className="macro-unit">{asset.unit}</span>
                            </div>

                            <div className="macro-card-middle">
                                <div className="macro-price">
                                    {asset.value.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: asset.id === 'USDCNH' ? 4 : 2,
                                    })}
                                </div>
                                <div className="macro-change-badge">
                                    <span>{sign}{asset.changePct.toFixed(2)}%</span>
                                    {asset.change !== 0 && (
                                        <span className="macro-change-abs">
                                            ({sign}{asset.change.toFixed(asset.id === 'USDCNH' ? 4 : 2)})
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="macro-card-desc">
                                {asset.description}
                            </div>

                            <div className="macro-card-impact">
                                <span className="impact-tag">传导</span>
                                <span className="impact-text">{asset.impactSummary}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
