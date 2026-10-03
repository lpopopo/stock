import React, { useState, useEffect, useMemo } from 'react';
import type { ColorScheme } from '../../../types/market.types';
import { useMarketStore } from '../../../store/market.store';
import {
    AI_MEMORY_PORTFOLIO_LEDGER,
    recalculateHitStocksWithLiveQuotes,
    recalculatePortfolioLedgerWithLiveQuotes,
    calculateSmartPeggingOrder,
    streamAiStrategyAnalysis,
    fetchLiveStrategyAnalysisFeed,
    checkTicketAuthorization,
    generateAuthorizedExecutionTicket,
    generateSynthesizedStrategyAnalysis,
    type AiMemoryStrategyFeed,
    type AiMemoryPortfolioLedger,
    type AiMemoryHolding,
    type AiMemoryRealTrade,
    type AiMemoryNavMilestone,
    type AiMemoryAuditItem,
    type StrategyHitStock,
} from '../../../api/institutionalStrategy';

interface PortfolioExecutionHubProps {
    colorScheme?: ColorScheme;
    onNavigateToLab?: () => void;
    onNavigateToWatchlist?: () => void;
}

interface RadarValidationRecord {
    record_sha256: string;
    observed_at_utc: string;
    feed_generated_at_utc: string;
    quotes_as_of_utc?: string;
    model_session?: string | null;
    validation_status: 'FORMAL_OBSERVATION' | 'OBSERVATION_ONLY';
    formal_actions: Array<{ id: string; symbol: string }>;
    audit_observations: Array<{ id: string; symbol: string }>;
}

export const ANTIGRAVITY_MODELS = [
    { id: 'gemini-3.8-flash-high', name: 'Gemini 3.8 Flash (High · 极速高算力推演)', badge: 'High' },
    { id: 'gemini-3.1-pro-high', name: 'Gemini 3.1 Pro (High · 旗舰深度思考推演)', badge: 'High' },
    { id: 'gemini-3.7-flash-high', name: 'Gemini 3.7 Flash (High · 自适应混合推演)', badge: 'High' },
    { id: 'gemini-3.6-flash-high', name: 'Gemini 3.6 Flash (High · 稳定量化推演)', badge: 'High' },
    { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6 (Thinking · 深度逻辑思维)', badge: 'Thinking' },
    { id: 'claude-opus-4-6-thinking', name: 'Claude Opus 4.6 (Thinking · 超强量化架构)', badge: 'Thinking' },
    { id: 'gpt-oss-120b-medium', name: 'GPT-OSS 120B (Medium · 本地开源大模型)', badge: 'Medium' },
];

export const PortfolioExecutionHub: React.FC<PortfolioExecutionHubProps> = ({
    colorScheme = 'cn',
    onNavigateToLab,
    onNavigateToWatchlist,
}) => {
    const { livePortfolioQuotes, lastUpdated, fetchAllData } = useMarketStore();

    const [aiMemoryFeed, setAiMemoryFeed] = useState<AiMemoryStrategyFeed | null>(null);
    const [feedRefreshing, setFeedRefreshing] = useState(false);
    const [validationRecords, setValidationRecords] = useState<RadarValidationRecord[]>([]);
    const [validationRecording, setValidationRecording] = useState(false);
    const [validationMessage, setValidationMessage] = useState('');

    const loadFeed = async (forceRefresh = false) => {
        setFeedRefreshing(true);
        try {
            const feed = await fetchLiveStrategyAnalysisFeed(forceRefresh);
            setAiMemoryFeed(feed);
        } catch (err) {
            console.error('Failed to load AI-Memory feed:', err);
            setAiMemoryFeed(null);
        } finally {
            setFeedRefreshing(false);
        }
    };

    useEffect(() => {
        loadFeed();
        fetch('/api/ai-memory/radar-validation')
            .then(res => res.ok ? res.json() : Promise.reject(new Error('验证记录不可用')))
            .then(data => setValidationRecords(data.records || []))
            .catch(() => setValidationMessage('验证记录服务不可用'));
    }, []);

    const recordRadarObservation = async () => {
        setValidationRecording(true);
        setValidationMessage('');
        try {
            const response = await fetch('/api/ai-memory/radar-validation', { method: 'POST' });
            if (!response.ok) throw new Error('AI-Memory 刷新或记录失败');
            const data = await response.json();
            const record = data.record as RadarValidationRecord;
            setValidationRecords(previous => [record, ...previous].slice(0, 20));
            setValidationMessage(record.validation_status === 'FORMAL_OBSERVATION'
                ? '已记录正式策略观察快照；仍需人工复核与券商对账。'
                : '已记录只读观察快照；当前没有可用于实盘动作验证的正式信号。');
            await loadFeed(false);
        } catch (error) {
            setValidationMessage(error instanceof Error ? error.message : '验证记录失败');
        } finally {
            setValidationRecording(false);
        }
    };

    // 动态重算持仓账本与策略筛选命中雷达（实时盘口联动）
    const ledger = useMemo(() => {
        const rawLedger = aiMemoryFeed?.portfolio_ledger;
        const baseLedger: AiMemoryPortfolioLedger = {
            ...AI_MEMORY_PORTFOLIO_LEDGER,
            ...(rawLedger || {}),
            realTrades: (rawLedger?.realTrades && rawLedger.realTrades.length > 0) ? rawLedger.realTrades : AI_MEMORY_PORTFOLIO_LEDGER.realTrades,
            navMilestones: (rawLedger?.navMilestones && rawLedger.navMilestones.length > 0) ? rawLedger.navMilestones : AI_MEMORY_PORTFOLIO_LEDGER.navMilestones,
            holdings: (rawLedger?.holdings && rawLedger.holdings.length > 0) ? rawLedger.holdings : AI_MEMORY_PORTFOLIO_LEDGER.holdings,
        };
        return recalculatePortfolioLedgerWithLiveQuotes(baseLedger, livePortfolioQuotes);
    }, [aiMemoryFeed, livePortfolioQuotes]);

    const formalHits = useMemo(() => recalculateHitStocksWithLiveQuotes(
        aiMemoryFeed?.formal_actions || [], livePortfolioQuotes
    ), [aiMemoryFeed, livePortfolioQuotes]);
    const hitStocks = useMemo(() => {
        const formalIds = new Set(formalHits.map(hit => hit.id));
        const observations = (aiMemoryFeed?.hit_stocks || []).filter(hit => !formalIds.has(hit.id));
        return [...formalHits, ...recalculateHitStocksWithLiveQuotes(observations, livePortfolioQuotes)];
    }, [aiMemoryFeed, formalHits, livePortfolioQuotes]);
    const isFormalHit = (hit: StrategyHitStock) => formalHits.some(action => action.id === hit.id);
    const reviewHitCount = hitStocks.filter(hit => hit.signalTier === 'BROKER_PORTFOLIO_REVIEW').length;
    const observationLabel = reviewHitCount === hitStocks.length - formalHits.length && reviewHitCount > 0 ? '持仓复核' : '只读观察';
    const accountObservation = aiMemoryFeed?.account_observation;
    const screenCanonical = Boolean(
        aiMemoryFeed?.account_reconciled
        || accountObservation?.positions_amounts_canonical
        || accountObservation?.reconciliation_status === 'RECONCILED_SCREEN_CANONICAL'
    );
    const displayNav = (ledger?.totalNav && ledger.totalNav > 0) ? ledger.totalNav : (accountObservation?.reported_nav ?? 0);
    const displayCash = (ledger?.workingCash && ledger.workingCash > 0) ? ledger.workingCash : (accountObservation?.reported_cash ?? 0);
    const portfolioReview = aiMemoryFeed?.portfolio_review;
    const moduleAnalysis = aiMemoryFeed?.strategy_module_analysis;
    const reboundPreScreens = (aiMemoryFeed?.research_observations || []).filter(item =>
        (item.signalTier === 'RESEARCH_SHADOW_ONLY' || item.signalTier === 'FORWARD_LIVE_VALIDATION') &&
        (item.screeningStatus === 'PROVISIONAL_TECHNICAL_PRE_SCREEN' || item.screeningStatus === 'FORWARD_BUY_CANDIDATE') &&
        item.isOrderAuthorized === false
    );
    const forwardBuyCandidates = (aiMemoryFeed?.forward_validation_buys || []).length
        ? (aiMemoryFeed?.forward_validation_buys || [])
        : reboundPreScreens.filter(item => item.signalTier === 'FORWARD_LIVE_VALIDATION');
    const quoteTime = aiMemoryFeed?.quotes_as_of_utc ? new Date(aiMemoryFeed.quotes_as_of_utc).toLocaleString('zh-CN') : '未知';
    const strategyTime = aiMemoryFeed?.model_generated_at_utc ? new Date(aiMemoryFeed.model_generated_at_utc).toLocaleString('zh-CN') : '无已核验正式会话';
    const [hubView, setHubView] = useState<'holdings' | 'hits' | 'trades' | 'milestones' | 'ticket'>('holdings');
    const [hitFilter, setHitFilter] = useState<'ALL' | 'FORMAL' | 'OBSERVATION'>('ALL');
    const filteredHits = hitStocks.filter(hit => hitFilter === 'ALL' || (hitFilter === 'FORMAL' ? isFormalHit(hit) : !isFormalHit(hit)));

    // 智能挂单小票快捷生成状态
    const [selectedSymbol, setSelectedSymbol] = useState<string>('MRVL');
    const [orderAction, setOrderAction] = useState<'BUY' | 'SELL'>('SELL');
    const [orderShares, setOrderShares] = useState(1);
    const [customLimitPrice, setCustomLimitPrice] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);

    // Antigravity 实时多因子策略诊断状态
    const [analyzingStock, setAnalyzingStock] = useState<StrategyHitStock | null>(null);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiAnalysisContent, setAiAnalysisContent] = useState('');
    const [isAiStreaming, setIsAiStreaming] = useState(false);
    const [aiCopied, setAiCopied] = useState(false);
    const isReviewModal = analyzingStock?.signalTier === 'BROKER_PORTFOLIO_REVIEW';

    // Option C: 8045 本地代理服务与 Antigravity 原生模型配置状态 (Gemini 全系默认 High 推理深度)
    const [selectedModel, setSelectedModel] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('AGY_MODEL') || 'gemini-3.8-flash-high' : 'gemini-3.8-flash-high'));
    const [showAiSettings, setShowAiSettings] = useState(false);
    const [proxyOnline, setProxyOnline] = useState<boolean | null>(null);

    // 探测 8045 本地代理服务健康度
    useEffect(() => {
        fetch('/api/ai/health')
            .then(res => res.json())
            .then(d => {
                if (d && d.status === 'ok') setProxyOnline(true);
                else setProxyOnline(false);
            })
            .catch(() => setProxyOnline(false));
    }, [isAiModalOpen]);

    const handleSelectModel = (model: string) => {
        setSelectedModel(model);
        localStorage.setItem('AGY_MODEL', model);
    };

    const handleTriggerAiAnalysis = (stock: StrategyHitStock) => {
        if (stock.signalTier !== 'FORMAL_EXECUTION' || stock.isOrderAuthorized !== true) {
            setAnalyzingStock(stock);
            setIsAiModalOpen(true);
            setAiAnalysisContent(generateSynthesizedStrategyAnalysis(stock));
            setIsAiStreaming(false);
            setAiCopied(false);
            return;
        }
        setAnalyzingStock(stock);
        setIsAiModalOpen(true);
        setAiAnalysisContent('');
        setIsAiStreaming(true);
        setAiCopied(false);

        streamAiStrategyAnalysis(
            stock,
            (chunk) => {
                setAiAnalysisContent((prev) => prev + chunk);
            },
            () => {
                setIsAiStreaming(false);
            },
            (err) => {
                setIsAiStreaming(false);
                setAiAnalysisContent((prev) => prev + `\n\n> ⚠️ [诊断提示] ${err}`);
            },
            { model: selectedModel }
        );
    };

    const handleCopyAiAnalysis = () => {
        if (!aiAnalysisContent) return;
        navigator.clipboard.writeText(aiAnalysisContent).then(() => {
            setAiCopied(true);
            setTimeout(() => setAiCopied(false), 2000);
        });
    };

    // 实时盘口参考价 (动态联动实时盘口)
    const quoteMap = useMemo<Record<string, { bid: number; ask: number }>>(() => {
        const baseMap: Record<string, { bid: number; ask: number }> = {
            MRVL: { bid: 260.85, ask: 260.95 },
            QCOM: { bid: 197.20, ask: 197.30 },
            CVX: { bid: 205.45, ask: 205.55 },
            SPY: { bid: 767.75, ask: 767.85 },
            SGOV: { bid: 100.61, ask: 100.62 },
            SO: { bid: 91.20, ask: 91.30 },
            LIN: { bid: 488.40, ask: 488.60 },
        };
        if (!livePortfolioQuotes) return baseMap;
        for (const [sym, q] of Object.entries(livePortfolioQuotes)) {
            if (q.price > 0) {
                const spread = q.price > 200 ? 0.10 : 0.05;
                baseMap[sym] = {
                    bid: Number((q.price - spread / 2).toFixed(2)),
                    ask: Number((q.price + spread / 2).toFixed(2)),
                };
            }
        }
        return baseMap;
    }, [livePortfolioQuotes]);

    const curQuote = quoteMap[selectedSymbol] || { bid: 100.0, ask: 100.1 };

    // 依据 DECISION.md Rule 5：首先对选中的标的、方向、股数进行权威授权初筛
    const baseTicketAuth = checkTicketAuthorization(selectedSymbol, orderAction, orderShares, aiMemoryFeed);

    // 若已获正式策略授权，默认锁定上游正式动作建议限价；若用户手工改价，则作为候选限价供完整校验
    const effectiveLimitPrice = customLimitPrice !== null
        ? customLimitPrice
        : (baseTicketAuth.matchedAction ? baseTicketAuth.matchedAction.suggestedLimitPrice : undefined);

    const smartOrder = calculateSmartPeggingOrder({
        symbol: selectedSymbol,
        direction: orderAction,
        targetShares: orderShares,
        bidPrice: curQuote.bid,
        askPrice: curQuote.ask,
        urgency: 'midpoint',
        feeEstimateUsd: 1.00,
        overridePrice: effectiveLimitPrice,
    });

    const handleCopy = () => {
        // 复制前进行全要素（标的、方向、股数、最终执行限价）严格校验
        const auth = checkTicketAuthorization(
            selectedSymbol,
            orderAction,
            orderShares,
            aiMemoryFeed,
            customLimitPrice !== null ? customLimitPrice : effectiveLimitPrice
        );
        if (!auth.isAuthorized) {
            alert(`【风控拦截】下单小票已被物理锁死：${auth.reason}`);
            return;
        }
        // 依据 DECISION.md Rule 5：已授权小票必须从 matchedAction 使用 AI-Memory 正式动作的 suggestedLimitPrice
        const textToCopy = auth.authorizedTicketText || generateAuthorizedExecutionTicket(auth.matchedAction!).ticketText;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePresetOrder = (
        sym: string,
        act: 'BUY' | 'SELL',
        shares: number,
        limitPrice?: number
    ) => {
        const auth = checkTicketAuthorization(sym, act, shares, aiMemoryFeed, limitPrice);
        if (!auth.isAuthorized) {
            alert(`【风控拦截】无法装入下单小票：${auth.reason}`);
            return;
        }
        setSelectedSymbol(sym as any);
        setOrderAction(act);
        setOrderShares(shares);
        const targetPrice = limitPrice !== undefined ? limitPrice : auth.matchedAction?.suggestedLimitPrice;
        if (targetPrice !== undefined) {
            setCustomLimitPrice(targetPrice);
        } else {
            setCustomLimitPrice(null);
        }
        setHubView('ticket');
    };

    const isGain = (val: number) => val >= 0;
    const getPnlColor = (val: number) => {
        if (colorScheme === 'cn') {
            return isGain(val) ? 'var(--gain-color, #ff4d4f)' : 'var(--loss-color, #00c087)';
        }
        return isGain(val) ? 'var(--gain-color, #00c087)' : 'var(--loss-color, #ff4d4f)';
    };

    if (!aiMemoryFeed) {
        return <div className="portfolio-hub-container" style={{ padding: '24px', color: '#cbd5e1', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '12px' }}>
            <div>{feedRefreshing ? '正在读取 AI-Memory 策略与账户快照…' : '策略数据不可用，账户与建议暂不显示。'}</div>
            {!feedRefreshing && <button onClick={() => loadFeed(true)} style={{ marginTop: '12px', padding: '6px 12px', cursor: 'pointer' }}>重新读取</button>}
        </div>;
    }

    return (
        <div className="portfolio-hub-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* 0. AI-Memory 官方对账同步标识条 */}
            <div style={{
                background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '10px',
                padding: '10px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{
                        fontSize: '12px',
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                        研究账本快照
                    </span>
                    <span style={{
                        fontSize: '11px',
                        background: 'rgba(59, 130, 246, 0.2)',
                        color: '#60a5fa',
                        border: '1px solid rgba(59, 130, 246, 0.4)',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }} />
                        ● 盘口现价已实时联动 {lastUpdated ? `(${lastUpdated})` : ''}
                    </span>
                    <button
                        onClick={() => {
                            fetchAllData();
                            loadFeed(true);
                        }}
                        disabled={feedRefreshing}
                        style={{
                            padding: '2px 8px',
                            fontSize: '11px',
                            borderRadius: '6px',
                            border: '1px solid rgba(59, 130, 246, 0.4)',
                            background: feedRefreshing ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.12)',
                            color: '#93c5fd',
                            cursor: feedRefreshing ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 'bold',
                        }}
                        title="点击立即触发全网盘口实时拉取并同步 AI-Memory 量化策略"
                    >
                        {feedRefreshing ? '⏳ 正在重算策略...' : '🔄 刷新盘口与策略'}
                    </button>
                    {aiMemoryFeed ? (
                        aiMemoryFeed.is_stale || aiMemoryFeed.feed_source === 'OFFLINE_MIRROR_READONLY' ? (
                            <span style={{
                                fontSize: '11px',
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#fca5a5',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                            }}>
                                ⚠️ 正式交易指令暂不可用 · 人工复核建议仍可查看
                            </span>
                        ) : (
                            <span style={{
                                fontSize: '11px',
                                background: 'rgba(168, 85, 247, 0.2)',
                                color: '#d8b4fe',
                                border: '1px solid rgba(168, 85, 247, 0.4)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                            }}>
                                🧠 策略直连 AI-Memory (正式策略: {aiMemoryFeed.ratified_official_strategy?.name || 'V9 Rule E'} | 买入授权: {aiMemoryFeed.ratified_official_strategy?.new_buy_authorization ?? 0})
                            </span>
                        )
                    ) : (
                        <span style={{
                            fontSize: '11px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#fca5a5',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}>
                            ⚠️ 策略数据不可用 / 待人工核对
                        </span>
                    )}
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', opacity: 0.8 }}>
                        核验时间: {ledger.auditTimestamp}
                    </span>
                </div>

                {/* 内部小视图切换导航 */}
                <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '8px' }}>
                    <button
                        onClick={() => setHubView('holdings')}
                        style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            borderRadius: '6px',
                            border: 'none',
                            background: hubView === 'holdings' ? '#2563eb' : 'transparent',
                            color: hubView === 'holdings' ? '#fff' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontWeight: hubView === 'holdings' ? 'bold' : 'normal',
                        }}
                    >
                        📋 持仓全景与风控
                    </button>
                    <button
                        onClick={() => setHubView('hits')}
                        style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            borderRadius: '6px',
                            border: 'none',
                            background: hubView === 'hits' ? '#2563eb' : 'transparent',
                            color: hubView === 'hits' ? '#fff' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontWeight: hubView === 'hits' ? 'bold' : 'normal',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}
                    >
                        🎯 策略筛选与限价指令 ({formalHits.length} 正式 / {hitStocks.length - formalHits.length} {observationLabel})
                    </button>
                    <button
                        onClick={() => setHubView('trades')}
                        style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            borderRadius: '6px',
                            border: 'none',
                            background: hubView === 'trades' ? '#2563eb' : 'transparent',
                            color: hubView === 'trades' ? '#fff' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontWeight: hubView === 'trades' ? 'bold' : 'normal',
                        }}
                    >
                        📜 历史成交归档·待核 ({(ledger?.realTrades || []).length})
                    </button>
                    <button
                        onClick={() => setHubView('milestones')}
                        style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            borderRadius: '6px',
                            border: 'none',
                            background: hubView === 'milestones' ? '#2563eb' : 'transparent',
                            color: hubView === 'milestones' ? '#fff' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontWeight: hubView === 'milestones' ? 'bold' : 'normal',
                        }}
                    >
                        📈 历史净值归档·待核
                    </button>
                    <button
                        onClick={() => setHubView('ticket')}
                        style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            borderRadius: '6px',
                            border: 'none',
                            background: hubView === 'ticket' ? '#2563eb' : 'transparent',
                            color: hubView === 'ticket' ? '#fff' : 'var(--text-muted)',
                            cursor: 'pointer',
                            fontWeight: hubView === 'ticket' ? 'bold' : 'normal',
                        }}
                    >
                        ⚡ Phase 36 下单小票
                    </button>
                </div>
            </div>

            {/* 1. 资产总账英雄卡 (Portfolio Executive Header Banner) */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(26, 31, 44, 0.95), rgba(18, 22, 34, 0.95))',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '20px 24px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                👑 {screenCanonical ? '券商截图权威净值' : accountObservation ? '券商截图账户净值' : 'AI-Memory 持仓观察快照'}
                            </span>
                            <span style={{
                                fontSize: '11px',
                                background: screenCanonical ? 'rgba(16, 185, 129, 0.18)' : 'rgba(245, 158, 11, 0.15)',
                                color: screenCanonical ? '#34d399' : '#fbbf24',
                                border: `1px solid ${screenCanonical ? 'rgba(16, 185, 129, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`,
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: '600',
                            }}>
                                ● {screenCanonical
                                    ? 'RECONCILED · 10-02 实盘减仓已入账 · 4股前瞻接管(10-05)'
                                    : accountObservation
                                        ? '持仓与现金已见截图 · 订单未核对'
                                        : '账户未对账 · 只读估值'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginTop: '6px' }}>
                            <span style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'SF Pro Display, -apple-system, sans-serif', color: '#fff' }}>
                                ${displayNav.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            {accountObservation ? (
                                <span style={{ fontSize: '13px', color: getPnlColor(accountObservation.reported_day_pnl) }}>
                                    {accountObservation.reported_day_pnl >= 0 ? '+' : '-'}${Math.abs(accountObservation.reported_day_pnl).toFixed(2)} · 今日盘口损益
                                </span>
                            ) : ledger?.dayPnlUsd !== null && ledger?.dayPnlUsd !== undefined && ledger?.dayPnlPct !== null && ledger?.dayPnlPct !== undefined ? (
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: getPnlColor(ledger.dayPnlUsd), display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>{ledger.dayPnlUsd >= 0 ? `+$${ledger.dayPnlUsd.toFixed(2)}` : `-$${Math.abs(ledger.dayPnlUsd).toFixed(2)}`}</span>
                                    <span>({ledger.dayPnlUsd >= 0 ? `+${ledger.dayPnlPct}%` : `${ledger.dayPnlPct}%`})</span>
                                    <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                            {aiMemoryFeed?.account_reconciled ? '日损益' : '报价估算变化 · 账户未对账'}
                                    </span>
                                </span>
                            ) : (
                                <span style={{ fontSize: '13px', fontWeight: '500', color: '#94a3b8' }}>
                                    日损益 计算中...
                                </span>
                            )}
                        </div>
                        {accountObservation && (
                            <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '5px', lineHeight: 1.5 }}>
                                数据基准 {accountObservation.displayed_local_time} · 实时可用现金 ${displayCash.toFixed(2)} · 正式世代: {aiMemoryFeed?.governance?.formal_version || 'v9-formal-20261002-r11'} (新买授权 $0 · 4股策略接管待命)
                            </div>
                        )}
                    </div>

                    {/* 现金与生息快速指标 */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 14px', minWidth: '150px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>💵 自由现金 (实盘入账)</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#14b8a6', marginTop: '2px' }}>
                                ${displayCash.toFixed(2)} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({ledger?.workingCashPct ?? 0}%)</span>
                            </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 14px', minWidth: '150px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🛡️ 防御垫 (SGOV+现金)</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', marginTop: '2px' }}>
                                ${(ledger?.totalDefenseCash ?? 0).toFixed(2)} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({ledger?.totalDefensePct ?? 0}%)</span>
                            </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 14px', minWidth: '150px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>📈 个股袖 (4 只)</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: (ledger?.equityPct ?? 0) > 30 ? '#f87171' : '#3b82f6', marginTop: '2px' }}>
                                ${(ledger?.equityTotal ?? 0).toFixed(2)} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({ledger?.equityPct ?? 0}%{ (ledger?.equityPct ?? 0) > 30 ? ' · 超 30%' : ''})</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 资金配置黄金结构进度条 */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                        <span>现金与国债防线 ({ledger.totalDefensePct}%) · 极度抗跌黑天鹅</span>
                        <span>股票卫星袖 ({ledger.equityPct}%) · 聚焦半导体与AI</span>
                    </div>
                    <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                        <div style={{ width: `${ledger.sgovReservePct}%`, background: '#10b981' }} title={`SGOV 国债生息 ${ledger.sgovReservePct}%`} />
                        <div style={{ width: `${ledger.workingCashPct}%`, background: '#14b8a6' }} title={`自由机动现金 ${ledger.workingCashPct}%`} />
                        <div style={{ width: `${ledger.equityPct}%`, background: '#3b82f6' }} title={`股票个股 ${ledger.equityPct}%`} />
                    </div>
                </div>

                {/* 快捷跳转与实验舱入口 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        💡 <strong>归档风控规则</strong>：关注现金与 SGOV 占比，以及科技股单票 15% 集中度阈值；账户和正式策略信号核验前不生成交易动作。
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {onNavigateToLab && (
                            <button
                                onClick={onNavigateToLab}
                                style={{
                                    background: 'rgba(59, 130, 246, 0.15)',
                                    border: '1px solid rgba(59, 130, 246, 0.4)',
                                    color: '#60a5fa',
                                    borderRadius: '6px',
                                    padding: '5px 12px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}
                            >
                                🔬 机构量化实验室与回测 &rarr;
                            </button>
                        )}
                        {onNavigateToWatchlist && (
                            <button
                                onClick={onNavigateToWatchlist}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.12)',
                                    color: 'var(--text-muted)',
                                    borderRadius: '6px',
                                    padding: '5px 12px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                }}
                            >
                                ⭐ 自选行情监控
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 子视图 1：持仓全景与今日决策 */}
            {hubView === 'holdings' && (
                <>
                    {/* 今日战术决策重点提示 (Today's Tactical Action Center) */}
                    {/* 今日战术决策重点提示 (Today's Tactical Action Center) */}
                    {!portfolioReview && aiMemoryFeed && <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '12px',
                    }}>
                        {ledger.auditItems.map((item: AiMemoryAuditItem) => {
                            const isHigh = item.priority === 'HIGH';
                            const isCvx = item.targetSymbol === 'CVX';
                            const isResolved = item.status === 'RESOLVED';
                            const isTriggered = item.status === 'TRIGGERED';
                            const isActive = item.status === 'ACTIVE';

                            const badgeColor = isResolved ? '#10b981' : isTriggered ? (isHigh ? '#ef4444' : '#f59e0b') : isActive ? '#3b82f6' : isCvx ? '#eab308' : '#94a3b8';
                            const bgColor = isResolved ? 'rgba(16, 185, 129, 0.08)' : isTriggered ? (isHigh ? 'rgba(239, 68, 68, 0.08)' : 'rgba(245, 158, 11, 0.08)') : isActive ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255, 255, 255, 0.04)';
                            const borderColor = isResolved ? 'rgba(16, 185, 129, 0.3)' : isTriggered ? (isHigh ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)') : isActive ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.12)';

                            const statusTagText = isResolved ? '✅ 已处置达成' : isTriggered ? '⚡ 审计重点触发' : isActive ? '🛡️ 规则持续生效' : item.status === 'WATCHING' ? '🔬 跟踪观察' : item.status;

                            return (
                                <div
                                    key={item.id}
                                    style={{
                                        background: bgColor,
                                        border: `1px solid ${borderColor}`,
                                        borderRadius: '10px',
                                        padding: '14px 16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: badgeColor }}>
                                                📋 策略审计与风控决策 ({item.priority})
                                            </span>
                                            <span style={{ fontSize: '11px', background: badgeColor, color: '#fff', padding: '2px 7px', borderRadius: '4px', fontWeight: 'bold' }}>
                                                {statusTagText}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginTop: '8px' }}>
                                            {item.title}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
                                            {item.condition || '账户快照仅供风险观察；正式操作以 AI-Memory 已核验动作为准。'}
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '12px' }}>
                                        {item.recommendation && (
                                            <div style={{
                                                fontSize: '11px',
                                                color: isResolved ? '#6ee7b7' : isHigh ? '#fca5a5' : '#93c5fd',
                                                background: isResolved ? 'rgba(16, 185, 129, 0.12)' : isHigh ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                                                border: `1px solid ${isResolved ? 'rgba(16, 185, 129, 0.3)' : isHigh ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                                                borderRadius: '6px',
                                                padding: '7px 10px',
                                                lineHeight: 1.45,
                                            }}>
                                                <strong>策略指引：</strong>{item.recommendation}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>}

                    {/* 2.5 策略多因子选股命中与建议限价雷达 */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(23, 37, 84, 0.35), rgba(15, 23, 42, 0.7))',
                        border: '1px solid rgba(59, 130, 246, 0.35)',
                        borderRadius: '12px',
                        padding: '16px 20px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '18px' }}>🎯</span>
                                <div>
                                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {portfolioReview ? 'V9 策略动作与实盘持仓复核雷达' : '策略筛选命中个股与限价指令雷达'}
                                        <span style={{ fontSize: '11px', background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '1px 6px', borderRadius: '4px' }}>
                                            {formalHits.length} 条正式动作 · {hitStocks.length - formalHits.length} 条{observationLabel} · {reboundPreScreens.length} 条抄底预筛
                                        </span>
                                        <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                                            报价抓取: {quoteTime}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                        正式策略会话: {strategyTime} · 账户对账: {screenCanonical ? 'RECONCILED（截图权威）' : (aiMemoryFeed?.account_reconciled ? '已核验' : '未核验')}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setHubView('hits')}
                                style={{
                                    padding: '6px 12px',
                                    background: 'rgba(59, 130, 246, 0.2)',
                                    border: '1px solid rgba(59, 130, 246, 0.5)',
                                    color: '#93c5fd',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                }}
                            >
                                展开完整选股池与测算依据 ({hitStocks.length}) →
                            </button>
                        </div>

                        {moduleAnalysis && <div style={{ marginBottom: '16px' }}>
                            <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 700, marginBottom: '5px' }}>① 各策略模块的操作建议</div>
                            <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '9px' }}>以下是基于券商截图和 V9 仓位规则的人工复核建议；正式交易指令仍为 0 条。</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '10px' }}>
                                {moduleAnalysis.modules.map(module => <section key={module.id} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px', padding: '12px 14px' }}>
                                    <div style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>{module.name}</div>
                                    <div style={{ color: '#93c5fd', fontSize: '12px', marginTop: '5px' }}>截图持仓 ${module.observed_value_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · 约 {module.observed_weight_pct.toFixed(2)}%</div>
                                    <div style={{ color: '#fde68a', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.28)', borderRadius: '6px', padding: '8px 9px', fontSize: '12px', lineHeight: 1.5, marginTop: '9px' }}><strong>建议：</strong>{module.advisory_action}</div>
                                    <div style={{ color: '#cbd5e1', fontSize: '11px', lineHeight: 1.5, marginTop: '7px' }}>{module.analysis}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', lineHeight: 1.5, marginTop: '5px' }}>策略规则：{module.rule}</div>
                                    <div style={{ color: '#93c5fd', fontSize: '11px', lineHeight: 1.5, marginTop: '7px' }}>核对事项：{module.review_action}</div>
                                    <div style={{ color: '#93c5fd', fontSize: '11px', marginTop: '6px' }}>当前状态：{module.operation_status_text} · 正式指令 {module.formal_action_count} 条</div>
                                </section>)}
                            </div>
                        </div>}

                        {moduleAnalysis && <div style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 700, marginBottom: '9px' }}>② 个股复核与正式操作</div>}

                        {/* 核心命中股票限价卡片网格 / 无指令安全展示 */}
                        {hitStocks.length === 0 ? (
                            <div style={{
                                background: 'rgba(15, 23, 42, 0.6)',
                                border: '1px dashed rgba(59, 130, 246, 0.3)',
                                borderRadius: '8px',
                                padding: '24px',
                                textAlign: 'center',
                                color: '#94a3b8',
                                fontSize: '13px',
                            }}>
                                <div style={{ fontSize: '20px', marginBottom: '8px' }}>🛡️</div>
                                <div style={{ fontWeight: 'bold', color: '#e2e8f0', marginBottom: '4px' }}>
                                    {aiMemoryFeed ? '当前无正式操作指令' : '策略数据不可用 / 待人工核对'}
                                </div>
                                <div style={{ fontSize: '12px', maxWidth: '520px', margin: '0 auto', lineHeight: 1.6 }}>
                                    {aiMemoryFeed
                                        ? 'AI-Memory 当前未给出通过正式会话和账户对账核验的操作指令。可记录只读观察，不能据此下单。'
                                        : '未能连接到 AI-Memory 量化策略服务或策略生成中，按安全边界严禁回退到本地硬编码建议。'}
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '12px' }}>
                                {hitStocks.filter((h: StrategyHitStock) => h.hitStatus !== 'PRESET_WATCH').map((hit: StrategyHitStock) => {
                                    const formal = isFormalHit(hit);
                                    const isReview = hit.signalTier === 'BROKER_PORTFOLIO_REVIEW';
                                    const positionReview = isReview && hit.symbol === 'MRVL'
                                        ? portfolioReview?.items.find(item => item.id === 'V9_MRVL_NAME_REVIEW')
                                        : undefined;
                                    const isSell = hit.actionType === 'SELL_LIMIT';
                                    const isStop = hit.actionType === 'STOP_LIMIT';
                                    const isBuy = hit.actionType === 'BUY_LIMIT';
                                    const themeColor = isSell ? '#ef4444' : isStop ? '#10b981' : isBuy ? '#3b82f6' : '#94a3b8';
                                    const newBuyAuth = aiMemoryFeed?.ratified_official_strategy?.new_buy_authorization ?? 0;
                                    const isActionDisabled = !formal || !hit.isOrderAuthorized || (isBuy && newBuyAuth <= 0);

                                    return (
                                        <div
                                            key={hit.id}
                                            style={{
                                                background: 'rgba(15, 23, 42, 0.8)',
                                                border: `1px solid ${isSell ? 'rgba(239, 68, 68, 0.4)' : isStop ? 'rgba(16, 185, 129, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`,
                                                borderRadius: '10px',
                                                padding: '14px 16px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                gap: '10px',
                                            }}
                                        >
                                            <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>{hit.symbol}</span>
                                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{hit.nameCn}</span>
                                                    </div>
                                                    <span style={{
                                                        fontSize: '11px',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        fontWeight: 'bold',
                                                        background: isSell ? 'rgba(239,68,68,0.2)' : isStop ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)',
                                                        color: themeColor,
                                                        border: `1px solid ${themeColor}66`,
                                                    }}>
                                                        {hit.actionBadge}
                                                    </span>
                                                </div>

                                                {/* 限价核心高亮框 */}
                                                <div style={{
                                                    marginTop: '10px',
                                                    background: 'rgba(0, 0, 0, 0.45)',
                                                    border: '1px dashed rgba(255, 255, 255, 0.15)',
                                                    borderRadius: '8px',
                                                    padding: '10px 12px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}>
                                                    <div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                            {formal ? (isSell ? 'AI-Memory 正式卖出限价' : 'AI-Memory 正式买入限价') : isReview ? '持仓风险复核 · 暂无限价指令' : '只读观察 · 无授权限价'}
                                                        </div>
                                                        <div style={{ fontSize: '22px', fontWeight: 'bold', color: themeColor, fontFamily: 'SF Pro Display, monospace', marginTop: '2px' }}>
                                                            {formal ? `$${hit.suggestedLimitPrice.toFixed(2)}` : '—'}
                                                        </div>
                                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                                                            {formal ? `区间: ${hit.limitPriceRange}` : isReview ? '需完成正式信号与账户复核后再定操作' : '历史观察不可生成订单'}
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                            现价: <strong style={{ color: '#fff' }}>${(hit.currentPrice ?? 0).toFixed(2)}</strong>
                                                            {hit.dayChangePct !== undefined && (
                                                                <span style={{
                                                                    marginLeft: '6px',
                                                                    fontSize: '11px',
                                                                    fontWeight: 'bold',
                                                                    color: getPnlColor(hit.dayChangePct),
                                                                }}>
                                                                    {(hit.dayChangePct ?? 0) >= 0 ? `+${(hit.dayChangePct ?? 0).toFixed(2)}%` : `${(hit.dayChangePct ?? 0).toFixed(2)}%`}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#93c5fd', marginTop: '4px' }}>
                                                            {formal ? <>建议 {isSell ? '卖出' : '买入'} <strong>{hit.suggestedShares} 股</strong></> : '当前授权股数: 0 股'}
                                                        </div>
                                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                            {formal ? `预估 $${(hit.estimatedAmountUsd ?? 0).toFixed(2)}` : isReview ? '真实持仓 · 报价供复核' : '仅记录报价，不参与交易'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                                    <strong style={{ color: '#cbd5e1' }}>{formal ? '限价依据：' : isReview ? '复核依据：' : '观察依据：'}</strong>{hit.limitFormula}
                                                </div>
                                                <div style={{ marginTop: '4px', fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
                                                    <strong style={{ color: '#cbd5e1' }}>先决条件：</strong>{hit.prerequisite || '无'}
                                                </div>
                                                {positionReview && <div style={{ marginTop: '5px', fontSize: '11px', color: '#93c5fd', lineHeight: 1.4 }}>
                                                    <strong>人工复核动作：</strong>{positionReview.review_action}
                                                </div>}
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleTriggerAiAnalysis(hit)}
                                                    style={{
                                                        padding: '7px 8px',
                                                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(99, 102, 241, 0.25))',
                                                        border: '1px solid rgba(168, 85, 247, 0.5)',
                                                        color: '#e9d5ff',
                                                        borderRadius: '6px',
                                                        fontSize: '11px',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '4px',
                                                    }}
                                                >
                                                    {isReview ? '📋 查看复核依据' : '🤖 AI 实时诊断'}
                                                </button>
                                                {isActionDisabled ? (
                                                    <button
                                                        disabled
                                                        style={{
                                                            padding: '7px 10px',
                                                            background: 'rgba(255, 255, 255, 0.05)',
                                                            border: '1px solid rgba(255, 255, 255, 0.15)',
                                                            color: '#94a3b8',
                                                            borderRadius: '6px',
                                                            fontSize: '11px',
                                                            cursor: 'not-allowed',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '4px',
                                                        }}
                                                    >
                                                        {isReview ? '📋 实盘持仓待人工复核 · 暂无下单授权' : '🔬 仅供研究观察 · 禁止下单'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handlePresetOrder(
                                                            hit.symbol as any,
                                                            hit.actionType === 'SELL_LIMIT' ? 'SELL' : 'BUY',
                                                            hit.suggestedShares,
                                                            hit.suggestedLimitPrice
                                                        )}
                                                        style={{
                                                            padding: '7px 10px',
                                                            background: isSell ? 'rgba(239, 68, 68, 0.25)' : isStop ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.25)',
                                                            border: `1px solid ${themeColor}`,
                                                            color: '#fff',
                                                            borderRadius: '6px',
                                                            fontSize: '11px',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: '4px',
                                                        }}
                                                    >
                                                        ⚡ 挂单小票 (${(hit.suggestedLimitPrice ?? 0).toFixed(2)})
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {aiMemoryFeed && <section style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '9px', padding: '12px 14px', marginTop: '16px' }}>
                            <div style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>
                                ③a 前向实盘验证 BUY · {forwardBuyCandidates.length} 只
                            </div>
                            <div style={{ color: '#6ee7b7', fontSize: '11px', lineHeight: 1.6, marginTop: '5px' }}>
                                池子条件满足时发出 BUY 观察信号，供共同前向实盘验证。正式买入授权仍为 {aiMemoryFeed.new_buy_authorization ?? 0}，不自动下单。
                                {aiMemoryFeed.forward_live_validation?.note ? ` ${aiMemoryFeed.forward_live_validation.note}` : ''}
                            </div>
                            {forwardBuyCandidates.length ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px', marginTop: '10px' }}>
                                {forwardBuyCandidates.map(item => <div key={item.id} style={{ padding: '9px 10px', borderRadius: '7px', border: '1px solid rgba(16, 185, 129, 0.35)', background: 'rgba(6, 78, 59, 0.25)' }}>
                                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '12px' }}>{item.symbol} <span style={{ color: '#94a3b8', fontWeight: 400 }}>{item.nameCn}</span></div>
                                    <div style={{ color: '#a7f3d0', fontSize: '11px', marginTop: '3px' }}>{item.actionBadge || '🟢 前向实盘验证 BUY'}</div>
                                    <div style={{ color: '#cbd5e1', fontSize: '11px', lineHeight: 1.5, marginTop: '4px' }}>{item.limitFormula}</div>
                                    <div style={{ color: '#94a3b8', fontSize: '10px', lineHeight: 1.4, marginTop: '4px' }}>
                                        日线截至 {item.sourceBarLastDate || '未知'} · 参考 ${Number(item.currentPrice || 0).toFixed(2)} · 人工确认
                                    </div>
                                </div>)}
                            </div> : <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '8px' }}>当前池子尚未触发前向验证 BUY。</div>}
                        </section>}
                        {aiMemoryFeed && <section style={{ background: 'rgba(76, 29, 149, 0.08)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '9px', padding: '12px 14px', marginTop: '16px' }}>
                            <div style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>③ 抄底战法技术预筛 · {reboundPreScreens.length} 只</div>
                            <div style={{ color: '#c4b5fd', fontSize: '11px', lineHeight: 1.6, marginTop: '5px' }}>
                                Candidate 173838 池信号按最新已完成美股交易日日线滚动更新
                                {aiMemoryFeed?.research_daily_bars?.target_asof
                                    ? `（日线截至 ${aiMemoryFeed.research_daily_bars.target_asof}）`
                                    : ''}
                                ；条件满足时升级为前向实盘验证 BUY（仍非正式授权）。
                            </div>
                            {reboundPreScreens.length ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px', marginTop: '10px' }}>
                                {reboundPreScreens.map(item => <div key={item.id} style={{ padding: '9px 10px', borderRadius: '7px', border: item.signalTier === 'FORWARD_LIVE_VALIDATION' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(168, 85, 247, 0.25)', background: item.signalTier === 'FORWARD_LIVE_VALIDATION' ? 'rgba(6, 78, 59, 0.2)' : 'rgba(76, 29, 149, 0.12)' }}>
                                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '12px' }}>{item.symbol} <span style={{ color: '#94a3b8', fontWeight: 400 }}>{item.nameCn}</span></div>
                                    <div style={{ color: '#cbd5e1', fontSize: '11px', lineHeight: 1.5, marginTop: '4px' }}>{item.limitFormula}</div>
                                    <div style={{ color: '#94a3b8', fontSize: '10px', lineHeight: 1.4, marginTop: '4px' }}>
                                        历史日线截至 {item.sourceBarLastDate || '未知'} · {item.signalTier === 'FORWARD_LIVE_VALIDATION' ? '前向验证 BUY · 人工确认' : '不可下单'}
                                    </div>
                                </div>)}
                            </div> : <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '8px' }}>当前数据未产生技术预筛观察，或数据尚不可用。</div>}
                        </section>}
                        {moduleAnalysis && <section style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.28)', borderRadius: '9px', padding: '12px 14px', marginTop: '16px' }}>
                            <div style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>④ 账户情况汇总</div>
                            <div style={{ color: '#cbd5e1', fontSize: '12px', marginTop: '6px' }}>
                                券商净值 ${moduleAnalysis.account_summary.reported_nav.toFixed(2)} · 证券 ${moduleAnalysis.account_summary.reported_securities_value.toFixed(2)} · 现金 ${moduleAnalysis.account_summary.reported_cash.toFixed(2)} · 持仓 {moduleAnalysis.account_summary.positions_count} 项
                            </div>
                            <div style={{ color: '#fbbf24', fontSize: '11px', marginTop: '6px' }}>风险复核：{moduleAnalysis.account_summary.risk_flags.join('；')}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '5px' }}>尚待核验：{moduleAnalysis.account_summary.unverified.join('；')}</div>
                            <div style={{ color: '#93c5fd', fontSize: '11px', marginTop: '6px' }}>{moduleAnalysis.account_summary.conclusion}</div>
                        </section>}
                    </div>

                    {/* 3. 组合各标的实时明细与风控防线 */}
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '16px 20px',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '16px' }}>🗃️</span>
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>
                                    {screenCanonical ? '截图权威持仓明细' : '券商截图持仓与独立行情估值'}
                                </span>
                                {screenCanonical && (
                                    <span style={{ fontSize: '10px', color: '#6ee7b7', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', padding: '1px 6px', borderRadius: '4px' }}>
                                        盘中减仓已核算 · 独立行情实时联动
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                实时 NAV ${displayNav.toFixed(2)} {accountObservation?.screen_baseline_nav ? `(截图基准 $${accountObservation.screen_baseline_nav.toFixed(2)})` : ''} · 防御垫 {ledger?.totalDefensePct ?? 0}%
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)' }}>
                                        <th style={{ padding: '10px 8px' }}>标的 / 行业</th>
                                        <th style={{ padding: '10px 8px' }}>股数</th>
                                        <th style={{ padding: '10px 8px' }}>成本 / 接管锚点</th>
                                        <th style={{ padding: '10px 8px' }}>实时现价</th>
                                        <th style={{ padding: '10px 8px' }}>实时市值</th>
                                        <th style={{ padding: '10px 8px' }}>权重 (限15%)</th>
                                        <th style={{ padding: '10px 8px' }}>持仓浮盈</th>
                                        <th style={{ padding: '10px 8px' }}>移动保护线 (Stop)</th>
                                        <th style={{ padding: '10px 8px' }}>2R 止盈参考</th>
                                        <th style={{ padding: '10px 8px' }}>角色 / 接管状态</th>
                                        <th style={{ padding: '10px 8px' }}>策略处置指引</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(ledger?.holdings || []).map((h: AiMemoryHolding) => {
                                        const costBasis = Number(h.costBasis ?? (h as any).costPrice ?? 0);
                                        const liveQuote = Number(h.liveQuotePrice ?? 0);
                                        const rawCurrentPrice = Number(h.currentPrice ?? (h as any).price ?? 0);
                                        const currentPrice = liveQuote > 0 ? liveQuote : rawCurrentPrice;
                                        const shares = Number(h.shares ?? 0);
                                        const marketValue = Number((currentPrice * shares).toFixed(2));
                                        const pnlAmount = Number(((currentPrice - costBasis) * shares).toFixed(2));
                                        const pnlPct = costBasis > 0 ? Number((((currentPrice - costBasis) / costBasis) * 100).toFixed(2)) : 0;
                                        const dayChangePct = typeof h.dayChangePct === 'number' ? h.dayChangePct : undefined;
                                        const navWeightPct = (ledger?.totalNav && ledger.totalNav > 0)
                                            ? Number(((marketValue / ledger.totalNav) * 100).toFixed(2))
                                            : Number(h.navWeightPct ?? 0);
                                        const screenPrice = Number((h as any).screenPrice ?? 0);

                                        // 保护线与止盈计算
                                        const protectiveStop = h.protectiveStop ? Number(h.protectiveStop) : null;
                                        const stopBufferPct = (protectiveStop && currentPrice > 0)
                                            ? Number((((currentPrice - protectiveStop) / currentPrice) * 100).toFixed(1))
                                            : null;

                                        const twoRTrim = h.twoRTrimReference ? Number(h.twoRTrimReference) : null;
                                        const distTo2RPct = (twoRTrim && currentPrice > 0)
                                            ? Number((((twoRTrim - currentPrice) / currentPrice) * 100).toFixed(1))
                                            : null;

                                        return (
                                            <tr key={h.symbol} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                                                <td style={{ padding: '12px 8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{h.symbol}</span>
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{h.name || (h as any).nameCn}</span>
                                                        {h.sleeve === 'defense' && (
                                                            <span style={{ fontSize: '10px', background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '1px 5px', borderRadius: '3px' }}>
                                                                国债防御
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{h.factorGroup || (h as any).theme}</div>
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{shares} 股</div>
                                                    {h.symbol === 'MXL' && shares === 3 && (
                                                        <div style={{ fontSize: '10px', color: '#34d399', marginTop: '2px' }}>10-02 已减半仓</div>
                                                    )}
                                                    {h.symbol === 'MRVL' && shares === 3 && (
                                                        <div style={{ fontSize: '10px', color: '#93c5fd', marginTop: '2px' }}>09-25 减仓合规</div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    <div style={{ color: '#fff', fontSize: '12px' }}>成本 ${costBasis.toFixed(2)}</div>
                                                    {h.managementReference ? (
                                                        <div style={{ fontSize: '11px', color: '#60a5fa', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <span>接管 ${Number(h.managementReference).toFixed(2)}</span>
                                                            <span style={{ fontSize: '9px', color: '#94a3b8' }}>(10-02收盘)</span>
                                                        </div>
                                                    ) : (
                                                        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>防守底座无需锚点</div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    <div style={{ fontWeight: 'bold', color: '#fff' }}>${currentPrice.toFixed(2)}</div>
                                                    {screenPrice > 0 && Math.abs(screenPrice - currentPrice) > 0.01 && (
                                                        <div style={{ fontSize: '10px', color: '#64748b' }}>截图 ${screenPrice.toFixed(2)}</div>
                                                    )}
                                                    {dayChangePct !== undefined && (
                                                        <div style={{ fontSize: '11px', fontWeight: '500', color: getPnlColor(dayChangePct) }}>
                                                            {dayChangePct >= 0 ? `+${dayChangePct.toFixed(2)}%` : `${dayChangePct.toFixed(2)}%`}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#fff' }}>${marketValue.toFixed(2)}</td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    <span style={{
                                                        fontWeight: 'bold',
                                                        color: navWeightPct > 15 && h.sleeve !== 'defense' ? '#ef4444' : '#fff',
                                                    }}>
                                                        {navWeightPct.toFixed(2)}%
                                                    </span>
                                                    {navWeightPct > 15 && h.sleeve !== 'defense' && (
                                                        <div style={{ fontSize: '9px', color: '#ef4444' }}>超 15% 上限</div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '12px 8px', fontWeight: 'bold', color: getPnlColor(pnlAmount) }}>
                                                    {pnlAmount >= 0 ? `+$${pnlAmount.toFixed(2)}` : `-$${Math.abs(pnlAmount).toFixed(2)}`}
                                                    <div style={{ fontSize: '11px', color: getPnlColor(pnlAmount) }}>
                                                        ({pnlPct >= 0 ? `+${pnlPct.toFixed(2)}%` : `${pnlPct.toFixed(2)}%`})
                                                    </div>
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    {protectiveStop ? (
                                                        <div>
                                                            <div style={{ color: '#fff', fontWeight: '600', fontSize: '12px' }}>${protectiveStop.toFixed(2)}</div>
                                                            {stopBufferPct !== null && (
                                                                <div style={{
                                                                    fontSize: '10px',
                                                                    marginTop: '2px',
                                                                    color: stopBufferPct < 0 ? '#ef4444' : stopBufferPct <= 5 ? '#f59e0b' : '#10b981',
                                                                    fontWeight: stopBufferPct < 0 || stopBufferPct <= 5 ? 'bold' : 'normal',
                                                                }}>
                                                                    {stopBufferPct < 0 ? `🚨 跌破 -${Math.abs(stopBufferPct)}%` : `🛡️ 缓冲 +${stopBufferPct}%`}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: '#64748b', fontSize: '11px' }}>- (无风险防守)</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    {twoRTrim ? (
                                                        <div>
                                                            <div style={{ color: '#38bdf8', fontWeight: '600', fontSize: '12px' }}>${twoRTrim.toFixed(2)}</div>
                                                            {distTo2RPct !== null && (
                                                                <div style={{
                                                                    fontSize: '10px',
                                                                    marginTop: '2px',
                                                                    color: distTo2RPct <= 0 ? '#10b981' : '#94a3b8',
                                                                    fontWeight: distTo2RPct <= 0 ? 'bold' : 'normal',
                                                                }}>
                                                                    {distTo2RPct <= 0 ? `🎯 已触及 (建议减半仓)` : `距目标 +${distTo2RPct}%`}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: '#64748b', fontSize: '11px' }}>-</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '12px 8px' }}>
                                                    <span style={{
                                                        padding: '3px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '11px',
                                                        fontWeight: '500',
                                                        display: 'inline-block',
                                                        background: h.statusType === 'warning' ? 'rgba(239,68,68,0.2)' :
                                                                    h.statusType === 'success' ? 'rgba(16,185,129,0.2)' :
                                                                    'rgba(59,130,246,0.2)',
                                                        color: h.statusType === 'warning' ? '#fca5a5' :
                                                               h.statusType === 'success' ? '#6ee7b7' :
                                                               '#93c5fd',
                                                        border: `1px solid ${h.statusType === 'warning' ? 'rgba(239,68,68,0.3)' :
                                                                              h.statusType === 'success' ? 'rgba(16,185,129,0.3)' :
                                                                              'rgba(59,130,246,0.3)'}`,
                                                    }}>
                                                        {h.statusBadge || h.aiRole || 'defensive hold'}
                                                    </span>
                                                    {h.longTermExemption === false && (
                                                        <div style={{ fontSize: '10px', color: '#93c5fd', marginTop: '3px' }}>
                                                            🛡️ 10-05 策略前瞻接管
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '11px', maxWidth: '300px', lineHeight: 1.45 }}>
                                                    {screenCanonical
                                                        ? (h.actionAdvice || '风险观察 · 新买授权 0')
                                                        : '截图持仓观察；无正式交易授权'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* AI-Memory 审计总结备注 */}
                        <div style={{ marginTop: '16px', padding: '12px 14px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#60a5fa', marginBottom: '6px' }}>
                                📑 账户对账状态
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                {screenCanonical
                                    ? (ledger.summaryComments || []).map((comment, idx) => <li key={idx}>{comment}</li>)
                                    : <li>截图持仓和现金已记录；订单、成交及费用尚未核对。行情估值不能据此生成交易动作。</li>}
                            </ul>
                        </div>
                    </div>
                </>
            )}

            {/* 子视图：策略筛选命中个股与限价指令深度工作台 */}
            {hubView === 'hits' && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(59, 130, 246, 0.35)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                }}>
                    {/* 头部与统计横幅 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                🎯 {portfolioReview ? 'V9 策略动作与实盘持仓复核中心' : '策略筛选命中个股与限价指令中心'}
                                <span style={{ fontSize: '12px', background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '2px 8px', borderRadius: '4px' }}>
                                    {portfolioReview ? '券商截图持仓 · 人工复核' : 'AI-Memory 前向观察'}
                                </span>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                正式指令仅来自 AI-Memory 已核验动作；截图持仓复核与历史研究分别标记，均不授予下单权限。
                            </div>
                        </div>

                        {/* 筛选与观察记录 */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={recordRadarObservation}
                                disabled={validationRecording}
                                style={{
                                    padding: '5px 12px',
                                    fontSize: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(168, 85, 247, 0.6)',
                                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(99, 102, 241, 0.3))',
                                    color: '#f3e8ff',
                                    fontWeight: 'bold',
                                    cursor: validationRecording ? 'wait' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                {validationRecording ? '⏳ 正在记录...' : '📋 记录当前实盘观察快照'}
                            </button>
                            <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '8px' }}>
                                {[
                                    { key: 'ALL', label: `全部 (${hitStocks.length})` },
                                    { key: 'FORMAL', label: `正式动作 (${formalHits.length})` },
                                    { key: 'OBSERVATION', label: `${observationLabel} (${hitStocks.length - formalHits.length})` },
                                ].map((tab) => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setHitFilter(tab.key as any)}
                                        style={{
                                            padding: '4px 10px',
                                            fontSize: '12px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            background: hitFilter === tab.key ? '#2563eb' : 'transparent',
                                            color: hitFilter === tab.key ? '#fff' : 'var(--text-muted)',
                                            cursor: 'pointer',
                                            fontWeight: hitFilter === tab.key ? 'bold' : 'normal',
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: '12px 14px', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', color: '#cbd5e1', fontSize: '12px', lineHeight: 1.7 }}>
                        <div>正式动作 {formalHits.length} 条 · {observationLabel} {hitStocks.length - formalHits.length} 条 · 新买入授权 {aiMemoryFeed?.new_buy_authorization ?? 0}</div>
                        <div>策略完成时间: {strategyTime} · 报价抓取时间: {quoteTime} · 账户快照: {aiMemoryFeed?.portfolio_as_of_date || '未知'}</div>
                        <div>{aiMemoryFeed?.stale_reason || (aiMemoryFeed?.is_stale ? '策略数据已失效，禁止生成订单' : '可按 AI-Memory 正式动作进行人工复核')}</div>
                        {validationMessage && <div role="status" style={{ color: '#93c5fd' }}>{validationMessage}</div>}
                        {validationRecords.length > 0 && <div style={{ marginTop: '8px' }}>
                            <strong>最近验证快照</strong>
                            {validationRecords.slice(0, 5).map(record => <div key={record.record_sha256}>
                                {new Date(record.observed_at_utc).toLocaleString('zh-CN')} · {record.validation_status === 'FORMAL_OBSERVATION' ? '正式动作观察' : '只读观察'} · 正式 {record.formal_actions.length} / 观察 {record.audit_observations.length} · 校验码 {record.record_sha256.slice(0, 12)}
                            </div>)}
                        </div>}
                    </div>

                    {/* 完整卡片列表 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '14px' }}>
                        {filteredHits.length === 0 ? (
                            <div style={{
                                gridColumn: '1 / -1',
                                background: 'rgba(15, 23, 42, 0.4)',
                                border: '1px dashed rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                padding: '36px',
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                            }}>
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🛡️</div>
                                <div style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 600 }}>暂无符合筛选条件的记录</div>
                                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                    当前展示 AI-Memory 正式动作与持仓复核；无授权时不生成限价指令。
                                </div>
                            </div>
                        ) : (
                            filteredHits
                                .map((hit) => {
                                    const formal = isFormalHit(hit);
                                    const isReview = hit.signalTier === 'BROKER_PORTFOLIO_REVIEW';
                                    const isSell = hit.actionType === 'SELL_LIMIT';
                                    const isStop = hit.actionType === 'STOP_LIMIT';
                                    const isBuy = hit.actionType === 'BUY_LIMIT';
                                    const isUnauthorizedBuy = isBuy && ((aiMemoryFeed?.new_buy_authorization ?? 0) <= 0 || hit.isOrderAuthorized === false);
                                    const isActionDisabled = !formal || isUnauthorizedBuy || hit.isOrderAuthorized === false || hit.suggestedShares <= 0;
                                    const themeColor = isSell ? '#ef4444' : isStop ? '#10b981' : isBuy ? '#3b82f6' : '#94a3b8';

                                    return (
                                        <div
                                            key={hit.id}
                                            style={{
                                                background: 'rgba(15, 23, 42, 0.85)',
                                                border: `1px solid ${themeColor}66`,
                                                borderRadius: '12px',
                                                padding: '18px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                gap: '14px',
                                                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                                            }}
                                        >
                                            <div>
                                                {/* 头部信息 */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div>
                                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                                            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>{hit.symbol}</span>
                                                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{hit.nameCn} ({hit.nameEn})</span>
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                                            来源：{hit.strategySource}
                                                        </div>
                                                    </div>
                                                    <span style={{
                                                        fontSize: '11px',
                                                        padding: '3px 8px',
                                                        borderRadius: '4px',
                                                        fontWeight: 'bold',
                                                        background: `${themeColor}22`,
                                                        color: themeColor,
                                                        border: `1px solid ${themeColor}66`,
                                                    }}>
                                                        {hit.actionBadge}
                                                    </span>
                                                </div>

                                                {/* 建议挂单限价核心横幅 */}
                                                <div style={{
                                                    marginTop: '12px',
                                                    background: 'rgba(0, 0, 0, 0.5)',
                                                    border: `1px solid ${themeColor}44`,
                                                    borderRadius: '8px',
                                                    padding: '12px 14px',
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                                {formal ? (isSell ? 'AI-Memory 正式卖出限价' : 'AI-Memory 正式买入限价') : isReview ? '持仓风险复核 · 暂无限价指令' : '只读观察 · 无授权限价'}
                                                            </span>
                                                            <div style={{ fontSize: '26px', fontWeight: 'bold', color: themeColor, fontFamily: 'SF Pro Display, monospace', marginTop: '2px' }}>
                                                                {formal ? `$${hit.suggestedLimitPrice.toFixed(2)}` : '—'}
                                                            </div>
                                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                                {formal ? <>正式限价区间: <strong style={{ color: '#e2e8f0' }}>{hit.limitPriceRange}</strong></> : isReview ? '真实持仓复核，不提供挂单区间' : '历史审计观察，不提供挂单区间'}
                                                            </div>
                                                        </div>

                                                        <div style={{ textAlign: 'right' }}>
                                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>现价</div>
                                                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                                                <span>${(hit.currentPrice ?? 0).toFixed(2)}</span>
                                                                {hit.dayChangePct !== undefined && (
                                                                    <span style={{
                                                                        fontSize: '12px',
                                                                        fontWeight: 'bold',
                                                                        color: getPnlColor(hit.dayChangePct),
                                                                    }}>
                                                                        ({(hit.dayChangePct ?? 0) >= 0 ? `+${(hit.dayChangePct ?? 0).toFixed(2)}%` : `${(hit.dayChangePct ?? 0).toFixed(2)}%`})
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div style={{ fontSize: '11px', color: '#93c5fd', marginTop: '4px' }}>
                                                                {formal ? <>建议 {isSell ? '卖出' : '买入'} <strong>{hit.suggestedShares} 股</strong></> : '授权股数: 0 股'}
                                                            </div>
                                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                                                                {formal ? `约 $${(hit.estimatedAmountUsd ?? 0).toFixed(2)}` : isReview ? '真实持仓 · 报价供复核' : '仅用于观察，不参与交易'}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 测算公式与依据 */}
                                                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.08)', fontSize: '11px', color: '#cbd5e1', lineHeight: 1.5 }}>
                                                        <strong>📐 {formal ? '限价依据：' : isReview ? '复核依据：' : '观察依据：'}</strong>{hit.limitFormula}
                                                    </div>
                                                </div>

                                                {/* 目标价与止损价卡片 */}
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '10px', fontSize: '11px', textAlign: 'center' }}>
                                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '6px' }}>
                                                        <div style={{ color: 'var(--text-muted)' }}>目标止盈价</div>
                                                        <div style={{ fontWeight: 'bold', color: '#10b981', marginTop: '2px' }}>
                                                            {formal && typeof hit.targetPrice === 'number' ? `$${hit.targetPrice.toFixed(2)}` : '--'}
                                                        </div>
                                                    </div>
                                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '6px' }}>
                                                        <div style={{ color: 'var(--text-muted)' }}>硬止损防线</div>
                                                        <div style={{ fontWeight: 'bold', color: '#ef4444', marginTop: '2px' }}>
                                                            {formal && typeof hit.stopLossPrice === 'number' ? `$${hit.stopLossPrice.toFixed(2)}` : '--'}
                                                        </div>
                                                    </div>
                                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '6px' }}>
                                                        <div style={{ color: 'var(--text-muted)' }}>确定性/胜率</div>
                                                        <div style={{ fontWeight: 'bold', color: '#3b82f6', marginTop: '2px' }}>
                                                            {formal ? `${hit.confidenceScore}%` : '--'}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 决策逻辑与先决条件 */}
                                                <div style={{ marginTop: '10px', fontSize: '11px', color: '#94a3b8', lineHeight: 1.5 }}>
                                                    <div><strong>🎯 策略决策逻辑：</strong>{hit.rationale}</div>
                                                    <div style={{ marginTop: '4px', color: '#e2e8f0' }}>
                                                        <strong>⚡ 触发先决条件：</strong>{hit.prerequisite || '无额外条件'}
                                                    </div>
                                                    <div style={{ marginTop: '4px', color: 'var(--text-muted)', fontSize: '10px' }}>
                                                        <strong>📋 审计出处：</strong>{hit.auditCitation}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 操作按钮组：AI 诊断 + 小票装入 */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleTriggerAiAnalysis(hit)}
                                                    style={{
                                                        padding: '9px 12px',
                                                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(99, 102, 241, 0.25))',
                                                        border: '1px solid rgba(168, 85, 247, 0.5)',
                                                        color: '#e9d5ff',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                    }}
                                                >
                                                    {isReview ? '📋 查看复核依据' : '🤖 AI 深度诊断'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (isActionDisabled) return;
                                                        handlePresetOrder(
                                                            hit.symbol as any,
                                                            hit.actionType === 'SELL_LIMIT' ? 'SELL' : 'BUY',
                                                            hit.suggestedShares,
                                                            hit.suggestedLimitPrice
                                                        );
                                                    }}
                                                    disabled={isActionDisabled}
                                                    style={{
                                                        padding: '9px 14px',
                                                        background: isActionDisabled
                                                            ? 'rgba(71, 85, 105, 0.2)'
                                                            : isSell ? 'rgba(239, 68, 68, 0.25)' : isStop ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.25)',
                                                        border: `1px solid ${isActionDisabled ? 'rgba(148, 163, 184, 0.25)' : themeColor}`,
                                                        color: isActionDisabled ? '#94a3b8' : '#fff',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        cursor: isActionDisabled ? 'not-allowed' : 'pointer',
                                                        fontWeight: 'bold',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        opacity: isActionDisabled ? 0.6 : 1,
                                                    }}
                                                >
                                                    {isActionDisabled ? (
                                                        isReview ? '📋 实盘持仓待人工复核 · 暂无下单授权' : hit.actionType === 'RESEARCH_OBSERVATION'
                                                            ? '🔬 影子研究标的 (禁止实盘下单)'
                                                            : '🔒 未获实盘授权 (禁止下单)'
                                                    ) : (
                                                        `⚡ 装入 Phase 36 下单小票 ($${(hit.suggestedLimitPrice ?? 0).toFixed(2)})`
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </div>
            )}

            {/* 子视图 2：真实成交流水与账本 */}
            {hubView === 'trades' && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '20px',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
                                📜 AI-Memory 实盘成交流水与账本
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                记录已确认实盘成交、减仓获利及资金回流变动
                            </div>
                            {accountObservation && (ledger?.realTrades || []).length > 0 && (() => {
                                const latestTrade = (ledger?.realTrades || [])[0];
                                const isCashReconciled = latestTrade && Math.abs(latestTrade.postTradeCash - accountObservation.reported_cash) < 0.01;
                                return (
                                    <div style={{ fontSize: '12px', color: isCashReconciled ? '#10b981' : '#f59e0b', marginTop: '4px' }}>
                                        {isCashReconciled
                                            ? `✅ 最新成交入账 (${latestTrade.date} ${latestTrade.symbol} ${latestTrade.direction}) 执行后现金 $${latestTrade.postTradeCash.toFixed(2)} 与当前账户可用现金 $${accountObservation.reported_cash.toFixed(2)} 完全一致。`
                                            : `归档末笔交易后现金 $${latestTrade?.postTradeCash.toFixed(2)}，当前截图现金 $${accountObservation.reported_cash.toFixed(2)}；期间现金变动待核。`}
                                    </div>
                                );
                            })()}
                        </div>
                        <span style={{ fontSize: '11px', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.3)' }}>
                            {(ledger?.realTrades || [])[0]?.tradeId.startsWith('REAL-20261002') ? '10-02 实盘已对账' : '待券商流水核对'}
                        </span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)' }}>
                                    <th style={{ padding: '10px 8px' }}>成交流水单号</th>
                                    <th style={{ padding: '10px 8px' }}>成交时间</th>
                                    <th style={{ padding: '10px 8px' }}>标的代码</th>
                                    <th style={{ padding: '10px 8px' }}>买卖方向</th>
                                    <th style={{ padding: '10px 8px' }}>成交股数</th>
                                    <th style={{ padding: '10px 8px' }}>成交均价</th>
                                    <th style={{ padding: '10px 8px' }}>名义成交金额</th>
                                    <th style={{ padding: '10px 8px' }}>券商规费 / 扣除状态</th>
                                    <th style={{ padding: '10px 8px' }}>工作现金划转前后</th>
                                    <th style={{ padding: '10px 8px' }}>策略归属与目的</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(ledger?.realTrades || []).map((t: AiMemoryRealTrade) => (
                                    <tr key={t.tradeId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                                        <td style={{ padding: '12px 8px', fontFamily: 'monospace', color: '#93c5fd' }}>{t.tradeId}</td>
                                        <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>{t.date} {t.time}</td>
                                        <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#fff' }}>{t.symbol}</td>
                                        <td style={{ padding: '12px 8px' }}>
                                            <span style={{
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                background: t.direction === 'BUY' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                                                color: t.direction === 'BUY' ? '#10b981' : '#ef4444',
                                            }}>
                                                {t.direction}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#fff' }}>{t.shares ?? 0} 股</td>
                                        <td style={{ padding: '12px 8px', color: '#fff' }}>${(t.fillPrice ?? 0).toFixed(3)}</td>
                                        <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#fff' }}>${(t.grossAmount ?? 0).toFixed(2)}</td>
                                        <td style={{ padding: '12px 8px', fontSize: '11px' }}>
                                            <div style={{ color: t.feeStatus === 'unverified_pending_settlement' ? '#f59e0b' : '#94a3b8' }}>
                                                {t.feeUsd !== null && t.feeUsd !== undefined ? `$${Number(t.feeUsd).toFixed(2)}` : '未核实'}
                                            </div>
                                            <div style={{ fontSize: '10px', color: t.feeStatus === 'unverified_pending_settlement' ? '#faad14' : 'var(--text-muted)' }}>
                                                {t.feeStatus === 'unverified_pending_settlement' ? '费用与现金变动待核' : '已从现金扣除'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '11px' }}>
                                            ${(t.preTradeCash ?? 0).toFixed(2)} ➔ <strong style={{ color: '#fff' }}>${(t.postTradeCash ?? 0).toFixed(2)}</strong>
                                        </td>
                                        <td style={{ padding: '12px 8px', color: '#94a3b8', fontSize: '11px', maxWidth: '300px' }}>
                                            <div style={{ color: '#60a5fa', fontWeight: '500' }}>{t.strategyRole}</div>
                                            <div style={{ fontSize: '10px', marginTop: '2px' }}>{t.rationale}</div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 子视图 3：历史净值攀升与资产配置里程碑 */}
            {hubView === 'milestones' && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '20px',
                }}>
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
                            📈 AI-Memory 历史净值归档与配置演进
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            历史记录尚未与券商完整流水核对；当前截图净值为 ${accountObservation?.reported_nav.toFixed(2) ?? '未知'}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                        {(ledger?.navMilestones || []).map((m: AiMemoryNavMilestone, idx) => (
                            <div key={m.date} style={{
                                background: idx === (ledger?.navMilestones || []).length - 1 ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                                border: `1px solid ${idx === (ledger?.navMilestones || []).length - 1 ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
                                borderRadius: '8px',
                                padding: '12px 14px',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.date}</span>
                                    {idx === (ledger?.navMilestones || []).length - 1 && (
                                        <span style={{ fontSize: '10px', background: '#3b82f6', color: '#fff', padding: '1px 6px', borderRadius: '4px' }}>
                                            当前最新
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', marginTop: '6px' }}>
                                    ${m.nav.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <div style={{ display: 'flex', gap: '8px', fontSize: '11px', marginTop: '6px', color: 'var(--text-muted)' }}>
                                    <span>防御现金: {m.cashPct}%</span>
                                    <span>股票权益: {m.equityPct}%</span>
                                </div>
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
                                    {m.note}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 子视图 4：Phase 36 智能挂单小票生成器 */}
            {(hubView === 'ticket' || hubView === 'holdings') && (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px' }}>⚡</span>
                            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#60a5fa' }}>
                                Phase 36 智能自适应挂单小票生成器 (券商无 API 极速下单助手)
                            </span>
                            <span style={{
                                fontSize: '11px',
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                            }}>
                                SIMULATED / 沙盒演示
                            </span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            沙盒演示小票 · 盘口为写死数据，禁止当作券商指令
                        </span>
                    </div>

                    {/* 授权拦截警示横幅 (Codex Defect 3) */}
                    <div style={{
                        padding: '10px 14px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#fca5a5',
                        marginBottom: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}>
                        <span>🛡️</span>
                        <span>
                            <strong>策略授权边界：</strong>依据 CURRENT_STRATEGY.md，订单小票需要 AI-Memory 已核验的正式动作和券商账户对账。当前正式动作 {formalHits.length} 条，新买入授权 {aiMemoryFeed?.new_buy_authorization ?? 0}；只读观察不能生成小票。
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
                        <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>选择标的</label>
                            <select
                                value={selectedSymbol}
                                onChange={(e) => {
                                    const val = e.target.value as any;
                                    setSelectedSymbol(val);
                                    const matchedHit = formalHits.find(h => h.symbol === val);
                                    if (matchedHit) {
                                        setOrderAction(matchedHit.actionType === 'SELL_LIMIT' ? 'SELL' : 'BUY');
                                        setOrderShares(matchedHit.suggestedShares);
                                        setCustomLimitPrice(matchedHit.suggestedLimitPrice);
                                    }
                                }}
                                style={{ width: '100%', padding: '6px 8px', marginTop: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '4px' }}
                            >
                                {formalHits.length === 0 && <option value={selectedSymbol} disabled>当前无获授权正式动作</option>}
                                {formalHits.map(hit => <option key={hit.id} value={hit.symbol}>{hit.symbol} · {hit.nameCn} · {hit.actionType === 'SELL_LIMIT' ? '卖出' : '买入'}</option>)}
                                <option value="SGOV" disabled={true}>SGOV (0-3月美债 - [不可执行历史示例] 现金清扫/未对账)</option>
                                <option value="SO" disabled={true}>SO (南方电力 - [不可执行历史示例] 归档假说)</option>
                                <option value="LIN" disabled={true}>LIN (林德气体 - [不可执行历史示例] 归档假说)</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>交易方向与股数</label>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                <select
                                    value={orderAction}
                                    onChange={(e) => setOrderAction(e.target.value as any)}
                                    style={{ flex: 1, padding: '6px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: orderAction === 'BUY' ? '#10b981' : '#ef4444', borderRadius: '4px', fontWeight: 'bold' }}
                                >
                                    <option value="SELL">卖出 (SELL)</option>
                                    <option value="BUY">买入 (BUY)</option>
                                </select>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={orderShares}
                                    onChange={(e) => setOrderShares(Math.max(1, Number(e.target.value)))}
                                    style={{ width: '60px', padding: '6px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '4px', textAlign: 'center' }}
                                />
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    {baseTicketAuth.matchedAction ? '建议挂单限价 (策略授权锁定)' : '建议挂单限价 (USD)'}
                                </label>
                                {baseTicketAuth.matchedAction && customLimitPrice === null && (
                                    <span style={{ fontSize: '10px', color: '#10b981' }}>● 策略限价锁定</span>
                                )}
                                {customLimitPrice !== null && baseTicketAuth.matchedAction && Math.abs(customLimitPrice - baseTicketAuth.matchedAction.suggestedLimitPrice) > 1e-4 && (
                                    <span style={{ fontSize: '10px', color: '#ef4444' }}>⚠️ 手工价格 (仅供独立参考 · 无法授权)</span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={customLimitPrice !== null ? customLimitPrice : (baseTicketAuth.matchedAction ? baseTicketAuth.matchedAction.suggestedLimitPrice : smartOrder.recommendedPrice)}
                                    onChange={(e) => setCustomLimitPrice(Number(e.target.value))}
                                    style={{
                                        width: '100%',
                                        padding: '6px 8px',
                                        background: 'var(--bg-secondary)',
                                        border: customLimitPrice !== null && baseTicketAuth.matchedAction && Math.abs(customLimitPrice - baseTicketAuth.matchedAction.suggestedLimitPrice) > 1e-4
                                            ? '1px solid #ef4444'
                                            : '1px solid var(--border-color)',
                                        color: customLimitPrice !== null && baseTicketAuth.matchedAction && Math.abs(customLimitPrice - baseTicketAuth.matchedAction.suggestedLimitPrice) > 1e-4
                                            ? '#ef4444'
                                            : '#10b981',
                                        borderRadius: '4px',
                                        fontWeight: 'bold',
                                    }}
                                />
                                {customLimitPrice !== null && (
                                    <button
                                        onClick={() => setCustomLimitPrice(null)}
                                        title="重置为策略授权限价"
                                        style={{ padding: '0 8px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', whiteSpace: 'nowrap' }}
                                    >
                                        重置
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>实时盘口参考 (仅供独立参考)</div>
                            <div style={{ marginTop: '6px', fontSize: '12px' }}>
                                <span>买一: ${(curQuote?.bid ?? 0).toFixed(2)} · 卖一: ${(curQuote?.ask ?? 0).toFixed(2)}</span>
                                <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '13px', marginTop: '2px' }}>
                                    {baseTicketAuth.matchedAction ? (
                                        <span>策略授权执行限价: ${(baseTicketAuth.matchedAction.suggestedLimitPrice ?? 0).toFixed(2)}</span>
                                    ) : (
                                        <span>盘口推算参考价: ${(smartOrder?.recommendedPrice ?? 0).toFixed(2)}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {(() => {
                            const ticketAuth = checkTicketAuthorization(
                                selectedSymbol,
                                orderAction,
                                orderShares,
                                aiMemoryFeed,
                                customLimitPrice !== null ? customLimitPrice : effectiveLimitPrice
                            );
                            return (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '10px', color: ticketAuth.isAuthorized ? '#f59e0b' : '#ef4444', fontWeight: 'bold' }}>
                                            {ticketAuth.isAuthorized ? 'SIMULATED / 授权测试' : '🔒 物理锁死 / 未获实盘授权'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        disabled={!ticketAuth.isAuthorized}
                                        style={{
                                            width: '100%',
                                            padding: '8px 14px',
                                            background: !ticketAuth.isAuthorized ? 'rgba(71, 85, 105, 0.3)' : copied ? '#10b981' : '#2563eb',
                                            border: !ticketAuth.isAuthorized ? '1px solid rgba(148, 163, 184, 0.25)' : 'none',
                                            color: !ticketAuth.isAuthorized ? '#94a3b8' : '#fff',
                                            borderRadius: '6px',
                                            fontWeight: 'bold',
                                            fontSize: '12px',
                                            cursor: !ticketAuth.isAuthorized ? 'not-allowed' : 'pointer',
                                            opacity: !ticketAuth.isAuthorized ? 0.6 : 1,
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {!ticketAuth.isAuthorized ? (
                                            `🔒 复制已被锁死 (${ticketAuth.reason.length > 18 ? ticketAuth.reason.slice(0, 16) + '...' : ticketAuth.reason})`
                                        ) : (
                                            copied ? '✅ 已复制标准小票' : '📋 一键复制下单小票 (SIMULATED)'
                                        )}
                                    </button>
                                </div>
                            );
                        })()}
                    </div>

                    {/* 格式化小票预览条 */}
                    {(() => {
                        const ticketAuth = checkTicketAuthorization(
                            selectedSymbol,
                            orderAction,
                            orderShares,
                            aiMemoryFeed,
                            customLimitPrice !== null ? customLimitPrice : effectiveLimitPrice
                        );
                        const displayTicketText = ticketAuth.isAuthorized && ticketAuth.authorizedTicketText
                            ? ticketAuth.authorizedTicketText
                            : smartOrder.ticketText;
                        const displayPrice = ticketAuth.isAuthorized && ticketAuth.authorizedLimitPrice
                            ? ticketAuth.authorizedLimitPrice
                            : smartOrder.recommendedPrice;

                        return (
                            <div style={{
                                marginTop: '10px',
                                padding: '8px 12px',
                                background: !ticketAuth.isAuthorized ? 'rgba(239, 68, 68, 0.08)' : 'rgba(0,0,0,0.3)',
                                border: !ticketAuth.isAuthorized ? '1px dashed rgba(239, 68, 68, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '6px',
                                fontFamily: 'SF Mono, Menlo, monospace',
                                fontSize: '11px',
                                color: '#94a3b8',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}>
                                <span>
                                    {!ticketAuth.isAuthorized ? (
                                        <span style={{ color: '#fca5a5' }}>
                                            [不可执行历史示例 · 物理锁死] 🔒 {ticketAuth.reason}
                                        </span>
                                    ) : (
                                        `${displayTicketText.split('\n')[0]} · 策略授权限价 $${(displayPrice ?? 0).toFixed(2)}`
                                    )}
                                </span>
                                <span style={{ fontSize: '10px', color: !ticketAuth.isAuthorized ? '#f87171' : '#10b981' }}>
                                    {!ticketAuth.isAuthorized ? '实盘执行授权: 0 股' : `预估名义额: $${((displayPrice ?? 0) * orderShares).toFixed(2)}`}
                                </span>
                            </div>
                        );
                    })()}
                </div>
            )}

            {/* Antigravity 实时多因子策略诊断弹窗 (AI Strategy Audit Modal) */}
            {isAiModalOpen && analyzingStock && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99999,
                    background: 'rgba(0, 0, 0, 0.78)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                }}>
                    <div style={{
                        background: '#090d16',
                        border: '1px solid rgba(168, 85, 247, 0.45)',
                        borderRadius: '16px',
                        width: '100%',
                        maxWidth: '860px',
                        maxHeight: '88vh',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 35px rgba(168, 85, 247, 0.25)',
                        overflow: 'hidden',
                        animation: 'fadeIn 0.2s ease-out',
                    }}>
                        {/* 弹窗头部 */}
                        <div style={{
                            padding: '16px 22px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'linear-gradient(90deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95))',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '20px',
                                    boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)',
                                }}>
                                    🤖
                                </div>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                        {isReviewModal ? 'AI-Memory 实盘持仓复核依据' : 'Antigravity 实时多因子策略诊断'} · {analyzingStock.symbol}
                                        <span style={{ fontSize: '11px', background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                                            {analyzingStock.nameCn}
                                        </span>
                                        {!isReviewModal && <span style={{ fontSize: '11px', background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                                            建议限价 ${(analyzingStock.suggestedLimitPrice ?? 0).toFixed(2)}
                                        </span>}
                                        {!isReviewModal && <span style={{
                                            fontSize: '11px',
                                            background: proxyOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                                            color: proxyOnline ? '#10b981' : '#f59e0b',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            border: `1px solid ${proxyOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                        }}>
                                            {proxyOnline ? '🟢 8045 本地代理已就绪' : '🟡 离线量化引擎'}
                                        </span>}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                                        {isReviewModal ? `券商截图持仓 · ${analyzingStock.strategySource} · 待人工复核` : `模型: ${ANTIGRAVITY_MODELS.find(m => m.id === selectedModel)?.name.split(' ')[0] || selectedModel} · 策略: ${analyzingStock.strategySource} · ${isAiStreaming ? '⚡ 正在通过本地 8045 端口流式推演中...' : '✅ 诊断推演完成'}`}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {!isReviewModal && <button
                                    onClick={() => setShowAiSettings(!showAiSettings)}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        color: '#cbd5e1',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                >
                                    ⚙️ {showAiSettings ? '收起选项' : '切换 Antigravity 模型'}
                                </button>}
                                <button
                                    onClick={() => setIsAiModalOpen(false)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-muted)',
                                        fontSize: '20px',
                                        cursor: 'pointer',
                                        padding: '4px 8px',
                                        lineHeight: 1,
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        {/* 可折叠设置栏 (Antigravity 官方内置模型切换) */}
                        {showAiSettings && !isReviewModal && (
                            <div style={{
                                padding: '12px 22px',
                                background: 'rgba(15, 23, 42, 0.95)',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                flexWrap: 'wrap',
                                fontSize: '12px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '280px' }}>
                                    <span style={{
                                        fontSize: '11px',
                                        background: 'rgba(16, 185, 129, 0.15)',
                                        color: '#10b981',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                        padding: '4px 10px',
                                        borderRadius: '6px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        🛡️ Antigravity 本地原生认证 · 免密直连
                                    </span>
                                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                        环境内置授权已就绪，全系模型即刻调用，无需输入外部 API Key
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>🧠 内置推演模型:</span>
                                    <select
                                        value={selectedModel}
                                        onChange={(e) => handleSelectModel(e.target.value)}
                                        style={{
                                            background: '#1e293b',
                                            border: '1px solid rgba(168, 85, 247, 0.4)',
                                            color: '#fff',
                                            borderRadius: '6px',
                                            padding: '5px 10px',
                                            fontSize: '11px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                        }}
                                    >
                                        {ANTIGRAVITY_MODELS.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={() => handleTriggerAiAnalysis(analyzingStock)}
                                    style={{
                                        padding: '4px 12px',
                                        background: 'rgba(168, 85, 247, 0.25)',
                                        border: '1px solid rgba(168, 85, 247, 0.5)',
                                        color: '#d8b4fe',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                    }}
                                >
                                    🔄 重新发起推演
                                </button>
                            </div>
                        )}

                        {/* 诊断正文内容 (支持打字机光标动画) */}
                        <div style={{
                            padding: '22px',
                            overflowY: 'auto',
                            flex: 1,
                            fontSize: '13px',
                            lineHeight: 1.75,
                            color: '#e2e8f0',
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            whiteSpace: 'pre-wrap',
                            background: 'rgba(15, 23, 42, 0.6)',
                        }}>
                            {aiAnalysisContent ? (
                                <div>
                                    {aiAnalysisContent}
                                    {isAiStreaming && (
                                        <span style={{
                                            display: 'inline-block',
                                            width: '8px',
                                            height: '14px',
                                            background: '#a855f7',
                                            marginLeft: '4px',
                                            verticalAlign: 'middle',
                                            boxShadow: '0 0 8px #a855f7',
                                        }} />
                                    )}
                                </div>
                            ) : (
                                <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '28px', marginBottom: '10px' }}>⚡</div>
                                    <div style={{ fontSize: '14px', color: '#cbd5e1' }}>正在装配实时盘口与持仓上下文，唤起 Antigravity 本地大模型...</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                                        已挂载 Phase 1~40 六门控仲裁调度器与做市商 GEX 盘口微结构
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 底部操作工具栏 */}
                        <div style={{
                            padding: '14px 22px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: 'rgba(9, 13, 22, 0.98)',
                        }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {isReviewModal ? '依据券商截图与 V9 规则整理；无交易授权' : isAiStreaming ? '正在由 Antigravity 量化模型运算...' : '模型诊断仅供复核，正式操作仍需独立授权'}
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={handleCopyAiAnalysis}
                                    disabled={!aiAnalysisContent}
                                    style={{
                                        padding: '8px 14px',
                                        background: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        color: '#fff',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {aiCopied ? '✓ 已复制' : isReviewModal ? '📋 复制复核记录' : '📋 复制研报'}
                                </button>
                                {(() => {
                                    const isModalBuy = analyzingStock.actionType === 'BUY_LIMIT';
                                    const isModalUnauthorizedBuy = isModalBuy && ((aiMemoryFeed?.new_buy_authorization ?? 0) <= 0 || analyzingStock.isOrderAuthorized === false);
                                    const isModalActionDisabled = isModalUnauthorizedBuy || analyzingStock.isOrderAuthorized === false || analyzingStock.suggestedShares <= 0;

                                    return (
                                        <button
                                            onClick={() => {
                                                if (isModalActionDisabled) return;
                                                setIsAiModalOpen(false);
                                                handlePresetOrder(
                                                    analyzingStock.symbol as any,
                                                    analyzingStock.actionType === 'SELL_LIMIT' ? 'SELL' : 'BUY',
                                                    analyzingStock.suggestedShares,
                                                    analyzingStock.suggestedLimitPrice
                                                );
                                            }}
                                            disabled={isModalActionDisabled}
                                            style={{
                                                padding: '8px 16px',
                                                background: isModalActionDisabled ? 'rgba(71, 85, 105, 0.3)' : '#2563eb',
                                                border: isModalActionDisabled ? '1px solid rgba(148, 163, 184, 0.3)' : 'none',
                                                color: isModalActionDisabled ? '#94a3b8' : '#fff',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                cursor: isModalActionDisabled ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                opacity: isModalActionDisabled ? 0.6 : 1,
                                            }}
                                        >
                                            {isModalActionDisabled ? (
                                                isReviewModal ? '📋 持仓待人工复核 · 暂无下单授权' : analyzingStock.actionType === 'RESEARCH_OBSERVATION'
                                                    ? '🔬 影子研究标的 (禁止实盘下单)'
                                                    : '🔒 未获实盘授权 (禁止下单)'
                                            ) : (
                                                `⚡ 确认并装入 Phase 36 下单小票 ($${(analyzingStock.suggestedLimitPrice ?? 0).toFixed(2)})`
                                            )}
                                        </button>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
