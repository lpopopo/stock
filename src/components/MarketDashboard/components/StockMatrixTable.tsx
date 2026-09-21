import React, { useState } from 'react';
import type { StockMetric, ColorScheme, StockCategory } from '../../../types/market.types';
import { useMarketStore } from '../../../store/market.store';

interface StockMatrixTableProps {
    stockMetrics: StockMetric[];
    colorScheme: ColorScheme;
}

export const StockMatrixTable: React.FC<StockMatrixTableProps> = ({ stockMetrics, colorScheme }) => {
    const [activeCategory, setActiveCategory] = useState<StockCategory>('mag7');
    const [sortField, setSortField] = useState<'changePct' | 'price' | 'peRatio'>('changePct');
    const [sortAsc, setSortAsc] = useState<boolean>(false);

    const addToWatchlist = useMarketStore(state => state.addToWatchlist);
    const watchlist = useMarketStore(state => state.watchlist);

    const categories: { key: StockCategory; label: string; icon: string; count: number }[] = [
        {
            key: 'mag7',
            label: '美股科技七巨头 (Mag 7)',
            icon: '🌟',
            count: stockMetrics.filter(s => s.category === 'mag7').length,
        },
        {
            key: 'china_concept',
            label: '热门中概互联顶流',
            icon: '🐉',
            count: stockMetrics.filter(s => s.category === 'china_concept').length,
        },
        {
            key: 'a_pillar',
            label: 'A股核心行业支柱白马',
            icon: '🏛️',
            count: stockMetrics.filter(s => s.category === 'a_pillar').length,
        },
    ];

    const filtered = stockMetrics.filter(s => s.category === activeCategory);

    // 排序
    const sorted = [...filtered].sort((a, b) => {
        let valA = a[sortField] ?? 0;
        let valB = b[sortField] ?? 0;
        return sortAsc ? valA - valB : valB - valA;
    });

    const handleSort = (field: 'changePct' | 'price' | 'peRatio') => {
        if (sortField === field) {
            setSortAsc(!sortAsc);
        } else {
            setSortField(field);
            setSortAsc(false);
        }
    };

    const isInWatchlist = (code: string) => {
        return watchlist.some(w => w.code.toUpperCase() === code.toUpperCase());
    };

    return (
        <div className="stock-matrix-section">
            <div className="section-header-row">
                <div className="title-left">
                    <span className="title-icon">🏆</span>
                    <span className="title-text">核心权重与明星领军标的矩阵</span>
                </div>

                {/* 子 Tab 切换 */}
                <div className="matrix-tabs">
                    {categories.map(cat => (
                        <button
                            key={cat.key}
                            className={`matrix-tab-btn ${activeCategory === cat.key ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.key)}
                        >
                            <span className="tab-icon">{cat.icon}</span>
                            <span className="tab-label">{cat.label}</span>
                            <span className="tab-count">({cat.count})</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="matrix-table-card">
                <div className="table-responsive">
                    <table className="market-custom-table">
                        <thead>
                            <tr>
                                <th style={{ width: '180px' }}>股票代码 / 名称</th>
                                <th
                                    className="sortable-th text-right"
                                    onClick={() => handleSort('price')}
                                >
                                    最新价 {sortField === 'price' && (sortAsc ? '▲' : '▼')}
                                </th>
                                <th
                                    className="sortable-th text-right"
                                    onClick={() => handleSort('changePct')}
                                >
                                    涨跌幅 {sortField === 'changePct' && (sortAsc ? '▲' : '▼')}
                                </th>
                                <th className="text-right">涨跌额</th>
                                <th className="text-right">成交额</th>
                                <th className="text-right">换手率</th>
                                <th
                                    className="sortable-th text-right"
                                    onClick={() => handleSort('peRatio')}
                                >
                                    PE(TTM) {sortField === 'peRatio' && (sortAsc ? '▲' : '▼')}
                                </th>
                                <th className="text-right">总市值</th>
                                <th className="text-center" style={{ width: '100px' }}>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map(stock => {
                                const isUp = stock.change > 0;
                                const isDown = stock.change < 0;

                                let trendClass = 'neutral';
                                if (colorScheme === 'cn') {
                                    trendClass = isUp ? 'trend-up-red' : isDown ? 'trend-down-green' : 'trend-flat';
                                } else {
                                    trendClass = isUp ? 'trend-up-green' : isDown ? 'trend-down-red' : 'trend-flat';
                                }

                                const sign = isUp ? '+' : '';
                                const currencySign = stock.market === 'A' ? '¥' : '$';
                                const watched = isInWatchlist(stock.code);

                                return (
                                    <tr key={stock.rawCode} className="table-data-row">
                                        <td className="cell-stock-identity">
                                            <div className="stock-name-cell">
                                                <span className="stock-main-name">{stock.name}</span>
                                                <div className="stock-sub-meta">
                                                    <span className="stock-code-tag">{stock.code}</span>
                                                    <span className={`stock-market-tag tag-${stock.market.toLowerCase()}`}>
                                                        {stock.market === 'A' ? 'A股' : '美股'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="cell-price text-right">
                                            <span className="price-bold">
                                                {currencySign}{stock.price.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className={`cell-change-pct text-right ${trendClass}`}>
                                            <span className="pct-pill">
                                                {sign}{stock.changePct.toFixed(2)}%
                                            </span>
                                        </td>
                                        <td className={`cell-change-val text-right ${trendClass}`}>
                                            <span>{sign}{stock.change.toFixed(2)}</span>
                                        </td>
                                        <td className="cell-turnover text-right">
                                            <span className="cell-text-muted">{stock.turnoverDisplay}</span>
                                        </td>
                                        <td className="cell-turnover-rate text-right">
                                            <span>{stock.turnoverRate ? `${stock.turnoverRate.toFixed(2)}%` : '--'}</span>
                                        </td>
                                        <td className="cell-pe text-right">
                                            <span className="pe-val">{stock.peRatio ? `${stock.peRatio.toFixed(1)}x` : '--'}</span>
                                        </td>
                                        <td className="cell-market-cap text-right">
                                            <span className="cap-val">{stock.marketCapDisplay || '--'}</span>
                                        </td>
                                        <td className="cell-action text-center">
                                            <button
                                                className={`btn-action-star ${watched ? 'active' : ''}`}
                                                title={watched ? '已在自选监控池' : '加入自选池'}
                                                onClick={() => {
                                                    if (!watched) {
                                                        addToWatchlist({
                                                            code: stock.code,
                                                            rawCode: stock.rawCode,
                                                            name: stock.name,
                                                            market: stock.market,
                                                            addedAt: Date.now(),
                                                        });
                                                    }
                                                }}
                                            >
                                                {watched ? '★ 已选' : '+ 自选'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
