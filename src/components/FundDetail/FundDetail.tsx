import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useFundStore } from '../../store/fund.store';
import { getFundDetail, getStockJumpUrl, getStockQuotes, getFundAISummaryStream } from '../../api/fund';
import type { StockQuote } from '../../api/fund';
import type { JumpPlatform } from '../../types/fund.types';
import './FundDetail.css';

/**
 * 判断当前是否处于交易时间（A股及港股的开盘阶段）
 * 周一至周五 09:00-12:00, 13:00-16:00
 */
function isTradingTime(): boolean {
    const now = new Date();
    const day = now.getDay();
    // 周末不开盘
    if (day === 0 || day === 6) return false;

    const h = now.getHours();
    const m = now.getMinutes();
    const timeNum = h * 100 + m; // 转换为 900, 1600 类似的格式方便判断

    if (timeNum >= 900 && timeNum <= 1200) return true;
    if (timeNum >= 1300 && timeNum < 1600) return true;

    return false;
}

const FundDetail: React.FC = () => {
    const {
        selectedCode,
        funds,
        estimates,
        details,
        loadingDetail,
        setDetail,
        setLoadingDetail,
    } = useFundStore();

    const [platform, setPlatform] = useState<JumpPlatform>('xueqiu');

    const selectedFund = funds.find((f) => f.code === selectedCode);
    const estimate = selectedCode ? estimates[selectedCode] : null;
    const detail = selectedCode ? details[selectedCode] : null;
    const isLoading = selectedCode ? loadingDetail[selectedCode] : false;

    const [quotes, setQuotes] = useState<Record<string, StockQuote>>({});

    // AI 诊断状态
    const [aiSummary, setAiSummary] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('AGY_API_KEY') || '');
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);

    // 当切换基金时清空之前的 AI 分析
    useEffect(() => {
        setAiSummary('');
        setAiError('');
        setIsAiLoading(false);
    }, [selectedCode]);

    // 监听 apiKey 变化并保存到 localStorage
    useEffect(() => {
        if (apiKey) {
            localStorage.setItem('AGY_API_KEY', apiKey);
        } else {
            localStorage.removeItem('AGY_API_KEY');
        }
    }, [apiKey]);

    // 实时估算计算逻辑
    const { estimatedChangePct, realTimeEstimatedNav, totalKnownRatio } = React.useMemo(() => {
        if (!detail || !detail.holdings || detail.holdings.length === 0 || Object.keys(quotes).length === 0 || !estimate) {
            return { estimatedChangePct: null, realTimeEstimatedNav: null, totalKnownRatio: 0 };
        }

        let totalWeightedChange = 0;
        let totalRatio = 0;
        let hasValidData = false;

        detail.holdings.forEach((stock) => {
            const quote = quotes[stock.stockCode];
            if (quote && quote.changePct !== undefined && quote.changePct !== '--') {
                const ratio = parseFloat(stock.ratio) / 100; // e.g., 2.44% -> 0.0244
                const change = parseFloat(quote.changePct); // e.g., 0.47
                if (!isNaN(ratio) && !isNaN(change)) {
                    totalWeightedChange += ratio * change;
                    totalRatio += ratio;
                    hasValidData = true;
                }
            }
        });

        if (!hasValidData || totalRatio === 0) {
            return { estimatedChangePct: null, realTimeEstimatedNav: null, totalKnownRatio: 0 };
        }

        // 放大倍数推算整体涨跌幅：假设未披露部分的涨跌幅与已披露前十大重仓股加权平均涨跌幅一致
        const extrapolatedChangePct = totalWeightedChange / totalRatio;

        const baseNav = parseFloat(estimate.gsz || '0');
        const estimatedNav = baseNav * (1 + extrapolatedChangePct / 100);

        return {
            estimatedChangePct: extrapolatedChangePct,
            realTimeEstimatedNav: estimatedNav,
            totalKnownRatio: totalRatio * 100
        };
    }, [detail, quotes, estimate]);

    useEffect(() => {
        if (!selectedCode) return;
        if (details[selectedCode] || loadingDetail[selectedCode]) return;
        setLoadingDetail(selectedCode, true);
        getFundDetail(selectedCode).then((d) => {
            setLoadingDetail(selectedCode, false);
            if (d) setDetail(selectedCode, d);
        });
    }, [selectedCode]);

    // 加载股票实时行情
    useEffect(() => {
        if (detail && detail.holdings.length > 0) {
            const stockCodes = detail.holdings.map((h) => h.stockCode);
            getStockQuotes(stockCodes).then((res) => {
                setQuotes(res);
            });
        } else {
            setQuotes({});
        }
    }, [detail]);

    const handleStockClick = (stockCode: string) => {
        const url = getStockJumpUrl(stockCode, platform);
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleAiDiagnosis = async () => {
        if (!detail || !detail.holdings.length) return;
        setAiSummary('');
        setAiError('');
        setIsAiLoading(true);

        const prompt = `
基金名称: ${fundName} (${selectedCode})
当前最新净值: ${estimate?.gsz || '未知'}
今日实时估算涨跌幅: ${estimatedChangePct !== null ? estimatedChangePct.toFixed(2) : '--'}%
前十大重仓股票及其实时盘中涨跌幅表现如下：
${detail.holdings.slice(0, 10).map(h => {
            const q = quotes[h.stockCode];
            const change = q && q.changePct !== '--' ? `${q.changePct}%` : '停牌或无数据';
            return `- ${h.stockName} (占比 ${h.ratio}%): 实时表现 ${change}`;
        }).join('\n')}
请根据上述硬核数据，快速诊断今天该基金的情况并给出总结。
        `.trim();

        await getFundAISummaryStream(
            prompt,
            apiKey,
            (chunk) => {
                setAiSummary(prev => prev + chunk);
            },
            (err) => {
                setAiError(err);
                setIsAiLoading(false);
            },
            () => {
                setIsAiLoading(false);
            }
        );
    };

    const formatChange = (val: string | undefined) => {
        if (!val) return { text: '--', cls: '' };
        const num = parseFloat(val);
        if (isNaN(num)) return { text: '--', cls: '' };
        return {
            text: `${num > 0 ? '+' : ''}${num.toFixed(2)}%`,
            cls: num > 0 ? 'up' : num < 0 ? 'down' : 'flat',
        };
    };

    if (!selectedCode) {
        return (
            <div className="fund-detail empty">
                <div className="empty-state">
                    <div className="empty-icon">📈</div>
                    <div className="empty-title">选择一只基金</div>
                    <div className="empty-hint">在左侧选择基金，查看详细持仓信息</div>
                </div>
            </div>
        );
    }

    const change = formatChange(estimate?.gszzl);
    const estChange = estimatedChangePct !== null ? formatChange(estimatedChangePct.toString()) : null;
    const fundName = detail?.name || estimate?.name || selectedFund?.name || selectedCode;
    const aiActive = !!(aiSummary || isAiLoading || aiError);

    return (
        <div className={`fund-detail ${aiActive ? 'split-layout' : ''}`}>
            <div className="fund-detail-left-pane">
                {/* 顶部基金概要 */}
                <div className="detail-header">
                    <div className="detail-header-main">
                        <div className="detail-title-row">
                            <div className="detail-fund-name">{fundName}</div>
                            {detail && detail.holdings.length > 0 && (
                                <div className="ai-controls">
                                    {showApiKeyInput ? (
                                        <div className="api-key-input-wrapper">
                                            <input
                                                type="password"
                                                className="api-key-input"
                                                placeholder="输入 Antigravity Manager sk-xxx"
                                                value={apiKey}
                                                onChange={(e) => setApiKey(e.target.value)}
                                            />
                                            <button className="api-key-save-btn" onClick={() => setShowApiKeyInput(false)}>保存</button>
                                        </div>
                                    ) : (
                                        <>
                                            <button
                                                className="ai-btn"
                                                onClick={() => {
                                                    if (!apiKey) {
                                                        setShowApiKeyInput(true);
                                                    } else {
                                                        handleAiDiagnosis();
                                                    }
                                                }}
                                                disabled={isAiLoading}
                                            >
                                                ✨ AI 盘面诊断
                                            </button>
                                            <button
                                                className="api-key-toggle-btn"
                                                onClick={() => setShowApiKeyInput(true)}
                                                title="设置 API Key"
                                            >
                                                ⚙️
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="detail-fund-meta">
                            <span className="detail-code">{selectedCode}</span>
                            {detail?.type && <span className="detail-tag">{detail.type}</span>}
                            {detail?.manager && (
                                <span className="detail-manager">
                                    <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
                                        <path d="M10.561 8.073a6.005 6.005 0 0 1 3.432 5.142.75.75 0 1 1-1.498.07 4.5 4.5 0 0 0-8.99 0 .75.75 0 0 1-1.498-.07 6.004 6.004 0 0 1 3.431-5.142A3.5 3.5 0 1 1 10.561 8.073ZM7.5 9a2 2 0 1 0-.001-3.999A2 2 0 0 0 7.5 9Z" />
                                    </svg>
                                    {detail.manager}
                                </span>
                            )}
                        </div>
                    </div>

                    {estimate && (
                        <div className="detail-estimate">
                            <div className={`detail-change ${change.cls}`}>{change.text}</div>
                            <div className="detail-gsz">{parseFloat(estimate.gsz || '0').toFixed(4)}</div>
                            <div className="detail-gsz-label">最新净值</div>
                            <div className="detail-time">{estimate.gztime}</div>
                        </div>
                    )}
                </div>

                {/* 实时持仓估算数据行 (仅盘中展示) */}
                {realTimeEstimatedNav !== null && estChange !== null && isTradingTime() && (
                    <div className="nav-bar estimated-bar">
                        <div className="nav-item">
                            <span className="nav-label" title={`根据前十大已披露重仓股（占比 ${totalKnownRatio.toFixed(2)}%）的走势同比例推算整体基金`}>实时估算净值</span>
                            <span className={`nav-value ${estChange.cls}`}>{realTimeEstimatedNav.toFixed(4)}</span>
                        </div>
                        <div className="nav-divider" />
                        <div className="nav-item">
                            <span className="nav-label" title={`根据前十大已披露重仓股（占比 ${totalKnownRatio.toFixed(2)}%）的走势同比例推算整体基金`}>估算涨跌幅</span>
                            <span className={`nav-value ${estChange.cls}`}>{estChange.text}</span>
                        </div>
                    </div>
                )}

                {/* 最新数据行 */}
                {estimate && (
                    <div className="nav-bar">
                        <div className="nav-item">
                            <span className="nav-label">最新净值</span>
                            <span className={`nav-value ${change.cls}`}>{parseFloat(estimate.gsz || '0').toFixed(4)}</span>
                        </div>
                        <div className="nav-divider" />
                        <div className="nav-item">
                            <span className="nav-label">日涨跌幅</span>
                            <span className={`nav-value ${change.cls}`}>{change.text}</span>
                        </div>
                    </div>
                )}

                {/* 持仓详情区域 */}
                <div className="holdings-section">
                    <div className="holdings-header">
                        <div className="holdings-title">
                            持仓明细
                            {detail?.updateDate && (
                                <span className="holdings-date">（{detail.updateDate} 数据）</span>
                            )}
                        </div>

                        {/* 跳转平台选择 */}
                        <div className="platform-selector">
                            <span className="platform-label">跳转至：</span>
                            {(
                                [
                                    { key: 'xueqiu', label: '雪球' },
                                    { key: 'tonghuashun', label: '同花顺' },
                                    { key: 'eastmoney', label: '东方财富' },
                                ] as { key: JumpPlatform; label: string }[]
                            ).map((p) => (
                                <button
                                    key={p.key}
                                    className={`platform-btn ${platform === p.key ? 'active' : ''}`}
                                    onClick={() => setPlatform(p.key)}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="holdings-loading">
                            <div className="spinner" />
                            <span>正在加载持仓数据...</span>
                        </div>
                    ) : detail && detail.holdings.length > 0 ? (
                        <div className="holdings-content">
                            {/* 股票持仓表格 */}
                            <div className="holdings-table">
                                <div className="table-header">
                                    <span>股票名称</span>
                                    <span>代码</span>
                                    <span>当前价</span>
                                    <span>涨跌幅</span>
                                    <span>持仓比例</span>
                                </div>
                                {detail.holdings.map((stock, idx) => (
                                    <div
                                        key={`${stock.stockCode}-${idx}`}
                                        className="table-row clickable"
                                        onClick={() => handleStockClick(stock.stockCode)}
                                        title={`点击在${platform === 'xueqiu' ? '雪球' : platform === 'tonghuashun' ? '同花顺' : '东方财富'}查看`}
                                    >
                                        <div className="stock-name-cell">
                                            <span className="stock-rank">{idx + 1}</span>
                                            <span className="stock-name">{stock.stockName}</span>
                                        </div>
                                        <span className="stock-code-cell">{stock.stockCode}</span>
                                        <span className="stock-price-cell">
                                            {quotes[stock.stockCode]
                                                ? <span className={parseFloat(quotes[stock.stockCode].changeRaw) > 0 ? 'upText' : parseFloat(quotes[stock.stockCode].changeRaw) < 0 ? 'downText' : ''}>{quotes[stock.stockCode].price}</span>
                                                : '--'}
                                        </span>
                                        <span className="stock-change-cell">
                                            {quotes[stock.stockCode]
                                                ? <span className={parseFloat(quotes[stock.stockCode].changePct) > 0 ? 'upText' : parseFloat(quotes[stock.stockCode].changePct) < 0 ? 'downText' : ''}>{parseFloat(quotes[stock.stockCode].changePct) > 0 ? '+' : ''}{quotes[stock.stockCode].changePct}%</span>
                                                : '--'}
                                        </span>
                                        <div className="stock-ratio-cell">
                                            <div className="ratio-bar-wrapper">
                                                <div
                                                    className="ratio-bar"
                                                    style={{ width: `${Math.min(parseFloat(stock.ratio) * 4, 100)}%` }}
                                                />
                                            </div>
                                            <span className="ratio-text">{stock.ratio}%</span>
                                        </div>
                                        <span className="row-arrow">›</span>
                                    </div>
                                ))}
                            </div>

                            {/* 债券持仓（如有） */}
                            {detail.bondHoldings && detail.bondHoldings.length > 0 && (
                                <div className="bond-section">
                                    <div className="bond-title">债券持仓</div>
                                    <div className="holdings-table">
                                        <div className="table-header">
                                            <span>债券名称</span>
                                            <span>代码</span>
                                            <span>持仓比例</span>
                                        </div>
                                        {detail.bondHoldings.map((bond, idx) => (
                                            <div key={`${bond.bondCode}-${idx}`} className="table-row">
                                                <div className="stock-name-cell">
                                                    <span className="stock-rank">{idx + 1}</span>
                                                    <span className="stock-name">{bond.bondName}</span>
                                                </div>
                                                <span className="stock-code-cell">{bond.bondCode}</span>
                                                <div className="stock-ratio-cell">
                                                    <div className="ratio-bar-wrapper">
                                                        <div
                                                            className="ratio-bar bond-bar"
                                                            style={{ width: `${Math.min(parseFloat(bond.ratio) * 4, 100)}%` }}
                                                        />
                                                    </div>
                                                    <span className="ratio-text">{bond.ratio}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : detail && detail.holdings.length === 0 ? (
                        <div className="holdings-empty">
                            <div>暂无持仓数据</div>
                            <div className="holdings-empty-hint">该基金可能为货币基金或暂未披露持仓</div>
                        </div>
                    ) : (
                        <div className="holdings-empty">
                            <div>暂无持仓数据</div>
                            <div className="holdings-empty-hint">点击刷新重新加载</div>
                        </div>
                    )}
                </div>
            </div>

            {/* 右侧 AI 诊断结果面板 */}
            {aiActive && (
                <div className="fund-detail-right-pane">
                    <div className="ai-summary-card">
                        <div className="ai-card-header">
                            <div className="ai-icon">✨</div>
                            <span className="ai-title">AI 实时诊断引擎</span>
                        </div>
                        <div className="ai-card-content">
                            {aiError ? (
                                <div className="ai-error">{aiError}</div>
                            ) : (
                                <>
                                    <div className="markdown-body">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {aiSummary}
                                        </ReactMarkdown>
                                    </div>
                                    {isAiLoading && <span className="ai-cursor"></span>}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FundDetail;
