import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getMarketTrendAnalysisStream, savePredictionLocally } from '../../api/fund';
import './TrendAnalysis.css';

const TrendAnalysis: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [aiSummary, setAiSummary] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiError, setAiError] = useState('');
    const [apiKey, setApiKey] = useState(() => localStorage.getItem('AGY_API_KEY') || '');
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);
    const resultRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (apiKey) {
            localStorage.setItem('AGY_API_KEY', apiKey);
        } else {
            localStorage.removeItem('AGY_API_KEY');
        }
    }, [apiKey]);

    // 自动滚动到底部
    useEffect(() => {
        if (resultRef.current && isAiLoading) {
            resultRef.current.scrollTop = resultRef.current.scrollHeight;
        }
    }, [aiSummary, isAiLoading]);

    const handleGenerate = async () => {
        if (!apiKey) {
            setShowApiKeyInput(true);
            return;
        }

        setAiSummary('');
        setAiError('');
        setIsAiLoading(true);

        let fullContent = '';
        await getMarketTrendAnalysisStream(
            prompt,
            apiKey,
            (chunk) => {
                fullContent += chunk;
                setAiSummary(prev => prev + chunk);
            },
            (err) => {
                setAiError(err);
                setIsAiLoading(false);
            },
            () => {
                setIsAiLoading(false);
                if (fullContent) {
                    savePredictionLocally(fullContent, prompt).then(success => {
                        if (success) {
                            console.log('Prediction saved to local file successfully');
                        } else {
                            console.error('Failed to save prediction to local file');
                        }
                    });
                }
            }
        );
    };

    const aiActive = !!(aiSummary || isAiLoading || aiError);

    return (
        <div className={`trend-analysis ${aiActive ? 'split-layout' : ''}`}>
            <div className="trend-analysis-left-pane">
                <div className="trend-header">
                    <div className="trend-title-wrapper">
                        <span className="trend-icon">🔮</span>
                        <h2>市场宏观推演与热点预测</h2>
                    </div>
                </div>

                <div className="trend-controls">
                    <textarea
                        className="trend-prompt-input"
                        placeholder="（选填）输入您关注的焦点，例如：'分析一下最近中东局势对能源板块的影响'。如果不输入，AI将自动捕捉当前全球最具爆发潜力的预设主线。"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isAiLoading}
                        rows={4}
                    />
                    <div className="trend-actions" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', alignItems: 'center' }}>
                        {showApiKeyInput ? (
                            <div className="api-key-input-wrapper">
                                <input
                                    type="password"
                                    className="api-key-input"
                                    placeholder="输入 API Key"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                />
                                <button className="api-key-save-btn" onClick={() => setShowApiKeyInput(false)}>保存</button>
                            </div>
                        ) : (
                            <button
                                className="api-key-toggle-btn"
                                onClick={() => setShowApiKeyInput(true)}
                                title="设置 API Key"
                            >
                                ⚙️
                            </button>
                        )}
                        <button
                            className="trend-generate-btn"
                            onClick={handleGenerate}
                            disabled={isAiLoading || !apiKey}
                        >
                            {isAiLoading ? (
                                <>
                                    <div className="spinner small"></div>
                                    <span>推演中...</span>
                                </>
                            ) : (
                                <>✨ <span>开始生成专业研报</span></>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* 右侧结果面板 */}
            {aiActive && (
                <div className="trend-analysis-right-pane">
                    <div className="trend-result-container">
                        {aiError ? (
                            <div className="trend-error">
                                ⚠️ {aiError}
                            </div>
                        ) : (
                            <div className="trend-content" ref={resultRef}>
                                <div className="markdown-body">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {aiSummary}
                                    </ReactMarkdown>
                                </div>
                                {isAiLoading && <span className="ai-cursor"></span>}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrendAnalysis;
