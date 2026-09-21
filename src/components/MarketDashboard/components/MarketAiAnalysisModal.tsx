import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useMarketStore } from '../../../store/market.store';
import { getMarketAiReviewStream } from '../../../api/market';

interface MarketAiAnalysisModalProps {
    visible: boolean;
    onClose: () => void;
}

export const MarketAiAnalysisModal: React.FC<MarketAiAnalysisModalProps> = ({ visible, onClose }) => {
    const indices = useMarketStore(state => state.indices);
    const breadth = useMarketStore(state => state.breadth);
    const macroAssets = useMarketStore(state => state.macroAssets);
    const stockMetrics = useMarketStore(state => state.stockMetrics);
    const sectors = useMarketStore(state => state.sectors);
    const macroPhase = useMarketStore(state => state.macroPhase);
    const rotationSignals = useMarketStore(state => state.rotationSignals);
    const usSectors = useMarketStore(state => state.usSectors);
    const fedCycle = useMarketStore(state => state.fedCycle);
    const usDivergence = useMarketStore(state => state.usDivergence);
    const usSignals = useMarketStore(state => state.usSignals);

    const [apiKey, setApiKey] = useState(() => localStorage.getItem('AGY_API_KEY') || '');
    const [showKeyInput, setShowKeyInput] = useState(false);
    const [reportType, setReportType] = useState<'all' | 'a_share' | 'us_stock'>('all');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiOutput, setAiOutput] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [copied, setCopied] = useState(false);

    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (apiKey) {
            localStorage.setItem('AGY_API_KEY', apiKey);
        }
    }, [apiKey]);

    // 自动随内容滚动到底部
    useEffect(() => {
        if (contentRef.current && isGenerating) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [aiOutput, isGenerating]);

    if (!visible) return null;

    const handleStartAnalysis = async () => {
        if (!breadth) {
            setErrorMsg('尚未加载完成全盘数据，请稍后重试');
            return;
        }

        setAiOutput('');
        setErrorMsg('');
        setIsGenerating(true);

        await getMarketAiReviewStream({
            indices,
            breadth,
            macros: macroAssets,
            stocks: stockMetrics,
            apiKey,
            sectors,
            macroPhase,
            rotationSignals,
            usSectors,
            fedCycle,
            usDivergence,
            usSignals,
            reportType,
            onMessage: (chunk: string) => {
                setAiOutput(prev => prev + chunk);
            },
            onError: (err: string) => {
                setErrorMsg(err);
                setIsGenerating(false);
            },
            onFinish: () => {
                setIsGenerating(false);
            },
        });
    };

    const handleCopy = () => {
        if (!aiOutput) return;
        navigator.clipboard.writeText(aiOutput);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="ai-modal-overlay" onClick={onClose}>
            <div className="ai-modal-container" onClick={(e) => e.stopPropagation()}>
                {/* 顶部标题栏 */}
                <div className="ai-modal-header">
                    <div className="modal-title-box">
                        <span className="modal-icon">🤖</span>
                        <h3>A股与美股跨市场联动 · 每日宏观研报</h3>
                    </div>
                    <div className="modal-header-actions">
                        <button
                            className="btn-text-secondary"
                            onClick={() => setShowKeyInput(!showKeyInput)}
                        >
                            🔑 {apiKey ? '修改 API Key' : '配置 API Key'}
                        </button>
                        <button className="btn-modal-close" onClick={onClose}>✕</button>
                    </div>
                </div>

                {/* API Key 设置栏 */}
                {showKeyInput && (
                    <div className="api-key-config-bar">
                        <input
                            type="password"
                            className="api-key-text-input"
                            placeholder="请输入 Antigravity / OpenAI 格式的 API Key (例如 sk-xxx)"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                        <button
                            className="btn-key-save"
                            onClick={() => setShowKeyInput(false)}
                            disabled={!apiKey.trim()}
                        >
                            保存
                        </button>
                    </div>
                )}

                {/* 内容渲染区 */}
                <div className="ai-modal-body" ref={contentRef}>
                    {!aiOutput && !isGenerating && !errorMsg && (
                        <div className="ai-placeholder-intro">
                            <span className="intro-big-icon">🌐</span>
                            <h4>一键生成深度跨市场联动策略研报</h4>
                            <p>
                                系统将实时抓取并注入今日 **上证/纳指/标普500** 涨跌幅、两市合计 **{breadth?.totalTurnover.toLocaleString()} 亿元** 成交额、
                                **CBOE VIX {breadth?.vixValue}** 恐慌指数、**中信31一级行业主力流向与拥挤度**、**美联储利率时钟** 与 **标普SPY/RSP广度剪刀差**：
                            </p>

                            {/* 研报类型切换 */}
                            <div className="ai-report-type-selector">
                                <span className="type-label">报告主题：</span>
                                <div className="type-pills">
                                    <button
                                        className={`type-pill-btn ${reportType === 'all' ? 'active' : ''}`}
                                        onClick={() => setReportType('all')}
                                    >
                                        🌐 全景宏观联动研报
                                    </button>
                                    <button
                                        className={`type-pill-btn ${reportType === 'a_share' ? 'active' : ''}`}
                                        onClick={() => setReportType('a_share')}
                                    >
                                        🇨🇳 A股中信轮动专报
                                    </button>
                                    <button
                                        className={`type-pill-btn ${reportType === 'us_stock' ? 'active' : ''}`}
                                        onClick={() => setReportType('us_stock')}
                                    >
                                        🇺🇸 美股行业时钟专报
                                    </button>
                                </div>
                            </div>

                            <div className="intro-bullets">
                                <div>🔹 <strong>全球资产联动机制</strong>：美债收益率与汇率变动对 A股外资流向的直接传导</div>
                                <div>🔹 <strong>A股结构分化与拥挤度</strong>：31个中信一级行业主力资金抢筹与 12% 极值止盈红绿灯</div>
                                <div>🔹 <strong>美股行业与等权剪刀差</strong>：标普500 (SPY vs RSP) 剪刀差与 GICS 11 ETF 相对动量</div>
                                <div>🔹 <strong>实战操盘指引</strong>：跨周期防御与进攻配置比例建议</div>
                            </div>
                            <button
                                className="btn-trigger-ai"
                                onClick={handleStartAnalysis}
                                disabled={isGenerating}
                            >
                                🚀 立即基于实时数据生成 {reportType === 'all' ? '全景宏观联动' : reportType === 'a_share' ? 'A股板块轮动' : '美股行业时钟'}研报
                            </button>
                        </div>
                    )}

                    {isGenerating && !aiOutput && (
                        <div className="ai-loading-state">
                            <div className="spinner-dots" />
                            <span>正在聚合跨市场多维数据并调用策略模型，请稍候...</span>
                        </div>
                    )}

                    {errorMsg && (
                        <div className="ai-error-box">
                            <span className="error-icon">⚠️</span>
                            <div>
                                <p className="error-title">AI 生成失败</p>
                                <p className="error-desc">{errorMsg}</p>
                            </div>
                        </div>
                    )}

                    {aiOutput && (
                        <div className="ai-markdown-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {aiOutput}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {/* 底部操作栏 */}
                <div className="ai-modal-footer">
                    <div className="footer-left-info">
                        {isGenerating && <span className="streaming-badge">● 正在实时流式分析...</span>}
                    </div>
                    <div className="footer-right-buttons">
                        {aiOutput && (
                            <button className="btn-footer-secondary" onClick={handleCopy}>
                                {copied ? '✓ 已复制到剪贴板' : '📋 复制研报'}
                            </button>
                        )}
                        {!isGenerating && aiOutput && (
                            <button className="btn-footer-primary" onClick={handleStartAnalysis}>
                                🔄 重新生成
                            </button>
                        )}
                        <button className="btn-footer-secondary" onClick={onClose}>
                            关闭
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
