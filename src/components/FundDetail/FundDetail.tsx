import React, { useEffect, useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useFundStore } from '../../store/fund.store';
import {
    getFundDetail,
    getStockJumpUrl,
    getStockQuotes,
    getFundAISummaryStream,
    calculateFundEstimation,
    getFundPhase,
} from '../../api/fund';
import type { StockQuote } from '../../api/fund';
import type { JumpPlatform } from '../../types/fund.types';
import './FundDetail.css';

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

    // 实时与收盘估算精准测算
    const estimationResult = useMemo(() => {
        return calculateFundEstimation(detail, quotes, estimate);
    }, [detail, quotes, estimate]);

    const phaseInfo = useMemo(() => {
        return getFundPhase();
    }, []);


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

        const currentFundName = detail?.name || estimate?.name || selectedFund?.name || selectedCode || '';
        const estChangeNum = estimationResult.estimatedChangePct;
        const prompt = `
基金名称: ${currentFundName} (${selectedCode})
当前最新净值: ${estimate?.gsz || '未知'}
今日实时估算涨跌幅: ${estChangeNum !== null ? estChangeNum.toFixed(2) : '--'}%
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

    const formatChange = (val: string | number | undefined | null) => {
        if (val === undefined || val === null || val === '') return { text: '--', cls: '' };
        const num = typeof val === 'number' ? val : parseFloat(val);
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
    const estChange = formatChange(estimationResult.estimatedChangePct);
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

                {/* 核心净值与估值看板 */}
                <div className="estimation-card-wrapper">
                    <div className="estimation-card-header">
                        <div className="phase-tags">
                            <span className={`phase-badge ${phaseInfo.badgeCls}`}>
                                {phaseInfo.label}
                            </span>
                            <span className="model-badge" title={estimationResult.modelDescription}>
                                {estimationResult.modelType === 'etf_feeder'
                                    ? '🎯 ETF联接联动'
                                    : estimationResult.modelType === 'bond_conservative'
                                    ? '🛡️ 固收+保守计量'
                                    : '📊 权益持仓加权'}
                            </span>
                            {estimationResult.effectiveCoverageRatio > 0 && (
                                <span className="coverage-badge">
                                    覆盖度 {estimationResult.effectiveCoverageRatio.toFixed(1)}%
                                </span>
                            )}
                        </div>
                        <div className="phase-note">{phaseInfo.subLabel}</div>
                    </div>

                    <div className="nav-bar estimated-bar">
                        <div className="nav-item highlight-item">
                            <span className="nav-label">
                                {phaseInfo.phase === 'post_market' ? '今日收盘估算' : '实时估算净值'}
                            </span>
                            <span className={`nav-value ${estChange ? estChange.cls : ''}`}>
                                {estimationResult.realTimeEstimatedNav !== null
                                    ? estimationResult.realTimeEstimatedNav.toFixed(4)
                                    : '--'}
                            </span>
                        </div>
                        <div className="nav-divider" />
                        <div className="nav-item highlight-item">
                            <span className="nav-label">估算涨跌幅</span>
                            <span className={`nav-value ${estChange ? estChange.cls : ''}`}>
                                {estChange ? estChange.text : '--'}
                            </span>
                        </div>
                        <div className="nav-divider" />
                        <div className="nav-item">
                            <span className="nav-label">官方最新公布净值</span>
                            <span className={`nav-value ${change.cls}`}>
                                {estimate?.dwjz ? parseFloat(estimate.dwjz).toFixed(4) : (estimate?.gsz ? parseFloat(estimate.gsz).toFixed(4) : '--')}
                            </span>
                        </div>
                        <div className="nav-divider" />
                        <div className="nav-item">
                            <span className="nav-label">官方公布日涨幅</span>
                            <span className={`nav-value ${change.cls}`}>
                                {change.text}
                            </span>
                        </div>
                    </div>

                    {estimationResult.modelDescription && (
                        <div className="model-tip-row">
                            <span className="model-tip-icon">ℹ️</span>
                            <span className="model-tip-text">{estimationResult.modelDescription}</span>
                        </div>
                    )}
                </div>

                {/* 大类资产配置概览 (股票、债券、现金、ETF、其他) */}
                {detail?.assetAllocation && (
                    <div className="asset-allocation-card">
                        <div className="allocation-header">
                            <div className="allocation-title-row">
                                <span className="allocation-title">大类资产配置</span>
                                {detail.assetAllocation.date && (
                                    <span className="allocation-date">（报告期: {detail.assetAllocation.date}）</span>
                                )}
                            </div>
                            {detail.isEtfFeeder && detail.parentEtfCode && (
                                <span className="etf-feeder-tag">
                                    标的母ETF: {detail.parentEtfName || ''} ({detail.parentEtfCode})
                                </span>
                            )}
                        </div>

                        <div className="allocation-bar-container">
                            {detail.assetAllocation.stockRatio > 0 && (
                                <div
                                    className="allocation-segment seg-stock"
                                    style={{ width: `${detail.assetAllocation.stockRatio}%` }}
                                    title={`股票: ${detail.assetAllocation.stockRatio}%`}
                                />
                            )}
                            {detail.assetAllocation.etfRatio > 0 && (
                                <div
                                    className="allocation-segment seg-etf"
                                    style={{ width: `${detail.assetAllocation.etfRatio}%` }}
                                    title={`基金/母ETF: ${detail.assetAllocation.etfRatio}%`}
                                />
                            )}
                            {detail.assetAllocation.bondRatio > 0 && (
                                <div
                                    className="allocation-segment seg-bond"
                                    style={{ width: `${detail.assetAllocation.bondRatio}%` }}
                                    title={`债券: ${detail.assetAllocation.bondRatio}%`}
                                />
                            )}
                            {detail.assetAllocation.cashRatio > 0 && (
                                <div
                                    className="allocation-segment seg-cash"
                                    style={{ width: `${detail.assetAllocation.cashRatio}%` }}
                                    title={`现金/货币: ${detail.assetAllocation.cashRatio}%`}
                                />
                            )}
                            {detail.assetAllocation.otherRatio && detail.assetAllocation.otherRatio > 0 ? (
                                <div
                                    className="allocation-segment seg-other"
                                    style={{ width: `${detail.assetAllocation.otherRatio}%` }}
                                    title={`其他: ${detail.assetAllocation.otherRatio}%`}
                                />
                            ) : null}
                        </div>

                        <div className="allocation-legend">
                            {detail.assetAllocation.stockRatio > 0 && (
                                <div className="legend-item">
                                    <span className="legend-dot seg-stock-dot" />
                                    <span className="legend-name">股票</span>
                                    <span className="legend-val">{detail.assetAllocation.stockRatio.toFixed(1)}%</span>
                                </div>
                            )}
                            {detail.assetAllocation.etfRatio > 0 && (
                                <div className="legend-item">
                                    <span className="legend-dot seg-etf-dot" />
                                    <span className="legend-name">母ETF/基金</span>
                                    <span className="legend-val">{detail.assetAllocation.etfRatio.toFixed(1)}%</span>
                                </div>
                            )}
                            {detail.assetAllocation.bondRatio > 0 && (
                                <div className="legend-item">
                                    <span className="legend-dot seg-bond-dot" />
                                    <span className="legend-name">债券</span>
                                    <span className="legend-val">{detail.assetAllocation.bondRatio.toFixed(1)}%</span>
                                </div>
                            )}
                            {detail.assetAllocation.cashRatio > 0 && (
                                <div className="legend-item">
                                    <span className="legend-dot seg-cash-dot" />
                                    <span className="legend-name">现金</span>
                                    <span className="legend-val">{detail.assetAllocation.cashRatio.toFixed(1)}%</span>
                                </div>
                            )}
                            {detail.assetAllocation.otherRatio && detail.assetAllocation.otherRatio > 0 ? (
                                <div className="legend-item">
                                    <span className="legend-dot seg-other-dot" />
                                    <span className="legend-name">其他</span>
                                    <span className="legend-val">{detail.assetAllocation.otherRatio.toFixed(1)}%</span>
                                </div>
                            ) : null}
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
                            {/* 股票/标的持仓表格 */}
                            <div className="holdings-table">
                                <div className="table-header">
                                    <span>股票/标的</span>
                                    <span>代码</span>
                                    <span>当前价</span>
                                    <span>涨跌幅</span>
                                    <span>持仓比例</span>
                                    <span>今日贡献</span>
                                    <span></span>
                                </div>
                                {estimationResult.holdingsWithContribution.map((stock, idx) => (
                                    <div
                                        key={`${stock.stockCode}-${idx}`}
                                        className={`table-row clickable ${stock.isParentEtf ? 'parent-etf-row' : ''}`}
                                        onClick={() => handleStockClick(stock.stockCode)}
                                        title={`点击在${platform === 'xueqiu' ? '雪球' : platform === 'tonghuashun' ? '同花顺' : '东方财富'}查看`}
                                    >
                                        <div className="stock-name-cell">
                                            <span className="stock-rank">{idx + 1}</span>
                                            <div className="stock-name-wrapper">
                                                <span className="stock-name">{stock.stockName}</span>
                                                {stock.isParentEtf && (
                                                    <span className="mother-etf-tag">母ETF</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="stock-code-cell">{stock.stockCode}</span>
                                        <span className="stock-price-cell">
                                            {stock.price
                                                ? <span className={parseFloat(stock.changeRaw || '0') > 0 ? 'upText' : parseFloat(stock.changeRaw || '0') < 0 ? 'downText' : ''}>{stock.price}</span>
                                                : '--'}
                                        </span>
                                        <span className="stock-change-cell">
                                            {stock.changePct !== undefined
                                                ? <span className={parseFloat(stock.changePct) > 0 ? 'upText' : parseFloat(stock.changePct) < 0 ? 'downText' : ''}>{parseFloat(stock.changePct) > 0 ? '+' : ''}{stock.changePct}%</span>
                                                : '--'}
                                        </span>
                                        <div className="stock-ratio-cell">
                                            <div className="ratio-bar-wrapper">
                                                <div
                                                    className={`ratio-bar ${stock.isParentEtf ? 'parent-etf-bar' : ''}`}
                                                    style={{ width: `${Math.min(parseFloat(stock.ratio) * 1.5, 100)}%` }}
                                                />
                                            </div>
                                            <span className="ratio-text">{stock.ratio}%</span>
                                        </div>
                                        <div className="stock-contribution-cell">
                                            {stock.contribution !== undefined ? (
                                                <span className={`contribution-pill ${stock.contribution > 0 ? 'up' : stock.contribution < 0 ? 'down' : 'flat'}`}>
                                                    {stock.contribution > 0 ? '+' : ''}{stock.contribution.toFixed(2)}%
                                                </span>
                                            ) : (
                                                <span className="contribution-empty">--</span>
                                            )}
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

                            {/* 估值测算规则说明 */}
                            <div className="calc-explanation-card">
                                <div className="explanation-title">📐 估值测算逻辑与准确性保障</div>
                                <div className="explanation-grid">
                                    <div className="explanation-item">
                                        <strong>ETF 联接穿透：</strong>
                                        <span>穿透追踪场内母 ETF 实时走势，按母 ETF 真实仓位测算，剔除约 5%~10% 现金拖累。</span>
                                    </div>
                                    <div className="explanation-item">
                                        <strong>权益持仓加权：</strong>
                                        <span>前十大重仓股加权 Beta 仅外推至实际股票仓位（如 85%），现金与债券不放大股票波动。</span>
                                    </div>
                                    <div className="explanation-item">
                                        <strong>单标的贡献度：</strong>
                                        <span>贡献 = 标的涨跌幅 × 权重 ÷ 100，清晰拆解拉动与拖累净值的具体个股。</span>
                                    </div>
                                    <div className="explanation-item">
                                        <strong>全时段状态追踪：</strong>
                                        <span>盘中实时推算，盘后定格今日收盘估算等待官方净值，收盘后不再突兀消失。</span>
                                    </div>
                                </div>
                            </div>
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
