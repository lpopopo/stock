import React, { useState } from 'react';
import type { ColorScheme } from '../../../types/market.types';
import { useMarketStore } from '../../../store/market.store';
import { querySingleStock } from '../../../api/market';

interface MarketWatchlistProps {
    colorScheme: ColorScheme;
}

export const MarketWatchlist: React.FC<MarketWatchlistProps> = ({ colorScheme }) => {
    const [inputCode, setInputCode] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [searchSuccess, setSearchSuccess] = useState('');

    const watchlistMetrics = useMarketStore(state => state.watchlistMetrics);
    const addToWatchlist = useMarketStore(state => state.addToWatchlist);
    const removeFromWatchlist = useMarketStore(state => state.removeFromWatchlist);
    const refreshWatchlist = useMarketStore(state => state.refreshWatchlist);

    const handleAddStock = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = inputCode.trim().toUpperCase();
        if (!code) return;

        setIsSearching(true);
        setSearchError('');
        setSearchSuccess('');

        try {
            const stock = await querySingleStock(code);
            if (!stock) {
                setSearchError(`未查询到标的 "${code}"，请检查代码格式 (如 A股 600519，美股 NVDA，港股 00700)`);
                setIsSearching(false);
                return;
            }

            addToWatchlist({
                code: stock.code,
                rawCode: stock.rawCode,
                name: stock.name,
                market: stock.market,
                addedAt: Date.now(),
            });

            setSearchSuccess(`已成功将「${stock.name} (${stock.code})」加入自选监控！`);
            setInputCode('');
        } catch {
            setSearchError('查询发生异常，请稍后重试');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="watchlist-section">
            <div className="section-header-row">
                <div className="title-left">
                    <span className="title-icon">⭐</span>
                    <span className="title-text">个人专属跨市场自选池</span>
                    <span className="watchlist-count-badge">{watchlistMetrics.length} 只标的</span>
                </div>

                <button
                    className="btn-refresh-watchlist"
                    onClick={() => refreshWatchlist()}
                    title="立即刷新自选股行情"
                >
                    🔄 刷新自选
                </button>
            </div>

            {/* 快速搜索添加栏 */}
            <div className="watchlist-search-card">
                <form className="search-form" onSubmit={handleAddStock}>
                    <div className="input-group">
                        <span className="search-prefix-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="输入股票代码添加自选 (如 A股: 600519 / 300750，美股: NVDA / TSLA / PLTR，港股: 00700)"
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value)}
                            disabled={isSearching}
                        />
                        <button
                            type="submit"
                            className="btn-submit-add"
                            disabled={isSearching || !inputCode.trim()}
                        >
                            {isSearching ? '查询中...' : '+ 添加至自选池'}
                        </button>
                    </div>
                </form>

                {searchError && <div className="search-msg error-msg">⚠️ {searchError}</div>}
                {searchSuccess && <div className="search-msg success-msg">✅ {searchSuccess}</div>}
            </div>

            {/* 自选股矩阵列表 */}
            <div className="watchlist-table-card">
                {watchlistMetrics.length === 0 ? (
                    <div className="empty-watchlist-box">
                        <span className="empty-icon">📭</span>
                        <p className="empty-title">当前自选池为空</p>
                        <p className="empty-sub">在上方输入框中输入任何 A股、美股或港股代码即可添加实时监控</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="market-custom-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '180px' }}>股票代码 / 名称</th>
                                    <th className="text-right">最新价</th>
                                    <th className="text-right">涨跌幅</th>
                                    <th className="text-right">涨跌额</th>
                                    <th className="text-right">成交额</th>
                                    <th className="text-right">换手率</th>
                                    <th className="text-right">PE(TTM)</th>
                                    <th className="text-right">总市值</th>
                                    <th className="text-center" style={{ width: '90px' }}>管理</th>
                                </tr>
                            </thead>
                            <tbody>
                                {watchlistMetrics.map(stock => {
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

                                    return (
                                        <tr key={stock.rawCode} className="table-data-row">
                                            <td className="cell-stock-identity">
                                                <div className="stock-name-cell">
                                                    <span className="stock-main-name">{stock.name}</span>
                                                    <div className="stock-sub-meta">
                                                        <span className="stock-code-tag">{stock.code}</span>
                                                        <span className={`stock-market-tag tag-${stock.market.toLowerCase()}`}>
                                                            {stock.market === 'A' ? 'A股' : stock.market === 'US' ? '美股' : '港股'}
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
                                                    className="btn-remove-stock"
                                                    title="移出自选"
                                                    onClick={() => removeFromWatchlist(stock.code)}
                                                >
                                                    ✕ 移除
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
