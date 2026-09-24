import React, { useState, useEffect, useMemo } from 'react';
import type { ColorScheme } from '../../../types/market.types';
import { useMarketStore } from '../../../store/market.store';
import {
    AI_MEMORY_PORTFOLIO_LEDGER,
    STRATEGY_SCREENED_HIT_STOCKS,
    recalculateHitStocksWithLiveQuotes,
    recalculatePortfolioLedgerWithLiveQuotes,
    calculateSmartPeggingOrder,
    streamAiStrategyAnalysis,
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

    // 动态重算持仓账本与策略筛选命中雷达（实时盘口联动）
    const ledger = useMemo(() => {
        return recalculatePortfolioLedgerWithLiveQuotes(AI_MEMORY_PORTFOLIO_LEDGER, livePortfolioQuotes);
    }, [livePortfolioQuotes]);

    const hitStocks = useMemo(() => {
        return recalculateHitStocksWithLiveQuotes(STRATEGY_SCREENED_HIT_STOCKS, livePortfolioQuotes);
    }, [livePortfolioQuotes]);
    const [hubView, setHubView] = useState<'holdings' | 'hits' | 'trades' | 'milestones' | 'ticket'>('holdings');
    const [hitFilter, setHitFilter] = useState<'ALL' | 'HIT_NOW' | 'PENDING_CONFIRM' | 'PROTECTING'>('ALL');

    // 智能挂单小票快捷生成状态
    const [selectedSymbol, setSelectedSymbol] = useState<'MRVL' | 'QCOM' | 'CVX' | 'SPY' | 'SGOV' | 'SO' | 'LIN'>('MRVL');
    const [orderAction, setOrderAction] = useState<'BUY' | 'SELL'>('SELL');
    const [orderShares, setOrderShares] = useState(1);
    const [customLimitPrice, setCustomLimitPrice] = useState<number | null>(265.00);
    const [copied, setCopied] = useState(false);

    // Antigravity 实时多因子策略诊断状态
    const [analyzingStock, setAnalyzingStock] = useState<StrategyHitStock | null>(null);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiAnalysisContent, setAiAnalysisContent] = useState('');
    const [isAiStreaming, setIsAiStreaming] = useState(false);
    const [aiCopied, setAiCopied] = useState(false);

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
    const smartOrder = calculateSmartPeggingOrder({
        symbol: selectedSymbol,
        direction: orderAction,
        targetShares: orderShares,
        bidPrice: curQuote.bid,
        askPrice: curQuote.ask,
        urgency: 'midpoint',
        feeEstimateUsd: 1.00,
        overridePrice: customLimitPrice || undefined,
    });

    const handleCopy = () => {
        navigator.clipboard.writeText(smartOrder.ticketText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePresetOrder = (
        sym: 'MRVL' | 'QCOM' | 'CVX' | 'SPY' | 'SGOV' | 'SO' | 'LIN',
        act: 'BUY' | 'SELL',
        shares: number,
        limitPrice?: number
    ) => {
        setSelectedSymbol(sym);
        setOrderAction(act);
        setOrderShares(shares);
        if (limitPrice !== undefined) {
            setCustomLimitPrice(limitPrice);
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
                        onClick={() => fetchAllData()}
                        style={{
                            padding: '2px 8px',
                            fontSize: '11px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: '#e2e8f0',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}
                        title="点击立即触发全网盘口实时拉取"
                    >
                        🔄 刷新盘口
                    </button>
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
                        🎯 策略筛选与限价指令 ({hitStocks.filter(h => h.hitStatus !== 'PRESET_WATCH').length})
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
                        📜 真实成交流水 ({ledger.realTrades.length})
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
                        📈 净值爬坡里程碑
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
                                👑 AI-Memory 机构实盘总账 (Live Portfolio Executive Dashboard)
                            </span>
                            <span style={{
                                fontSize: '11px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#10b981',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: '600',
                            }}>
                                ● 生产账本对齐
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginTop: '6px' }}>
                            <span style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'SF Pro Display, -apple-system, sans-serif', color: '#fff' }}>
                                ${ledger.totalNav.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            {ledger.dayPnlUsd !== null && ledger.dayPnlPct !== null ? (
                                <span style={{ fontSize: '14px', fontWeight: 'bold', color: getPnlColor(ledger.dayPnlUsd), display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span>{ledger.dayPnlUsd >= 0 ? `+$${ledger.dayPnlUsd.toFixed(2)}` : `-$${Math.abs(ledger.dayPnlUsd).toFixed(2)}`}</span>
                                    <span>({ledger.dayPnlUsd >= 0 ? `+${ledger.dayPnlPct}%` : `${ledger.dayPnlPct}%`})</span>
                                    <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                                        实时日损益
                                    </span>
                                </span>
                            ) : (
                                <span style={{ fontSize: '13px', fontWeight: '500', color: '#94a3b8' }}>
                                    日损益 计算中...
                                </span>
                            )}
                        </div>
                    </div>

                    {/* 现金与生息快速指标 */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 14px', minWidth: '150px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🛡️ 防御生息储备 (SGOV+现金)</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', marginTop: '2px' }}>
                                ${ledger.totalDefenseCash.toFixed(2)} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({ledger.totalDefensePct}%)</span>
                            </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 14px', minWidth: '150px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🚀 权益个股总仓位 (4只)</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6', marginTop: '2px' }}>
                                ${ledger.equityTotal.toFixed(2)} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({ledger.equityPct}%)</span>
                            </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 14px', minWidth: '150px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>💵 SGOV 年化收益发电站</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#faad14', marginTop: '2px' }}>
                                ~5.0% <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>(约 ${ledger.monthlyDividendEstimateUsd}/月)</span>
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
                        💡 <strong>资金管理总原则</strong>：永远保持现金防御垫 &gt; 50%，任何单一科技股仓位不得突破 15%，触发阈值执行无感机械化减仓。
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
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '12px',
                    }}>
                        {ledger.auditItems.map((item: AiMemoryAuditItem) => {
                            const isHigh = item.priority === 'HIGH';
                            const isMedium = item.priority === 'MEDIUM';
                            const badgeColor = isHigh ? '#ef4444' : isMedium ? (item.targetSymbol === 'QCOM' ? '#10b981' : '#3b82f6') : '#f59e0b';
                            const bgColor = isHigh ? 'rgba(239, 68, 68, 0.08)' : isMedium ? (item.targetSymbol === 'QCOM' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(59, 130, 246, 0.08)') : 'rgba(245, 158, 11, 0.08)';
                            const borderColor = isHigh ? 'rgba(239, 68, 68, 0.3)' : isMedium ? (item.targetSymbol === 'QCOM' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)') : 'rgba(245, 158, 11, 0.3)';

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
                                                {isHigh ? '🚨 集中度风险' : isMedium ? (item.targetSymbol === 'QCOM' ? '🟢 移动止盈锁利' : '🔵 核心底座建仓') : '🟡 右侧买点跟踪'} ({item.priority})
                                            </span>
                                            <span style={{ fontSize: '11px', background: badgeColor, color: '#fff', padding: '1px 6px', borderRadius: '4px' }}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginTop: '8px' }}>
                                            {item.title}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
                                            {item.recommendation}
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {item.targetSymbol === 'MRVL' && (
                                            <button
                                                onClick={() => handlePresetOrder('MRVL', 'SELL', 1)}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: 'rgba(239, 68, 68, 0.2)',
                                                    border: '1px solid rgba(239, 68, 68, 0.5)',
                                                    color: '#fca5a5',
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    width: '100%',
                                                }}
                                            >
                                                ⚡ 装入 MRVL 减仓小票 ($265 卖出 1 股)
                                            </button>
                                        )}
                                        {item.targetSymbol === 'SPY' && (
                                            <button
                                                onClick={() => handlePresetOrder('SPY', 'BUY', 1)}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: 'rgba(59, 130, 246, 0.2)',
                                                    border: '1px solid rgba(59, 130, 246, 0.5)',
                                                    color: '#93c5fd',
                                                    borderRadius: '6px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer',
                                                    fontWeight: 'bold',
                                                    width: '100%',
                                                }}
                                            >
                                                ⚡ 装入 SPY 底座建仓小票 ($570 买入 1 股)
                                            </button>
                                        )}
                                        {item.targetSymbol === 'QCOM' && (
                                            <div style={{ fontSize: '11px', color: '#10b981', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                <span>防守线: $190.00</span>
                                                <span>当前安全垫: +7.06%</span>
                                            </div>
                                        )}
                                        {item.targetSymbol === 'CVX' && (
                                            <div style={{ fontSize: '11px', color: '#f59e0b', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                <span>机动现金: ${ledger.workingCash.toFixed(2)}</span>
                                                <span>等待连续2日收阳</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

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
                                        策略筛选命中个股与限价指令雷达
                                        <span style={{ fontSize: '11px', background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '1px 6px', borderRadius: '4px' }}>
                                            4 标的命中活跃指令
                                        </span>
                                        <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                                            现价实时流
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                        多因子量化选股与产业逻辑锁定 · 测算最优挂单限价、盘口防线与下单小票
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

                        {/* 4 大核心命中股票限价卡片网格 */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '12px' }}>
                            {hitStocks.filter((h: StrategyHitStock) => h.hitStatus !== 'PRESET_WATCH').map((hit: StrategyHitStock) => {
                                const isSell = hit.actionType === 'SELL_LIMIT';
                                const isStop = hit.actionType === 'STOP_LIMIT';
                                const isBuy = hit.actionType === 'BUY_LIMIT';
                                const themeColor = isSell ? '#ef4444' : isStop ? '#10b981' : isBuy ? '#3b82f6' : '#94a3b8';

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
                                                        {isSell ? '建议高抛挂单限价' : isStop ? '建议止盈保护限价' : '建议入场挂单限价'}
                                                    </div>
                                                    <div style={{ fontSize: '22px', fontWeight: 'bold', color: themeColor, fontFamily: 'SF Pro Display, monospace', marginTop: '2px' }}>
                                                        ${hit.suggestedLimitPrice.toFixed(2)}
                                                    </div>
                                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                                                        区间: {hit.limitPriceRange}
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                        现价: <strong style={{ color: '#fff' }}>${hit.currentPrice.toFixed(2)}</strong>
                                                        {hit.dayChangePct !== undefined && (
                                                            <span style={{
                                                                marginLeft: '6px',
                                                                fontSize: '11px',
                                                                fontWeight: 'bold',
                                                                color: getPnlColor(hit.dayChangePct),
                                                            }}>
                                                                {hit.dayChangePct >= 0 ? `+${hit.dayChangePct.toFixed(2)}%` : `${hit.dayChangePct.toFixed(2)}%`}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#93c5fd', marginTop: '4px' }}>
                                                        建议 {isSell ? '卖出' : isStop ? '防护' : '买入'} <strong>{hit.suggestedShares} 股</strong>
                                                    </div>
                                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                        预估 ${hit.estimatedAmountUsd.toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                                <strong style={{ color: '#cbd5e1' }}>限价测算：</strong>{hit.limitFormula}
                                            </div>
                                            <div style={{ marginTop: '4px', fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
                                                <strong style={{ color: '#cbd5e1' }}>先决条件：</strong>{hit.prerequisite || '无'}
                                            </div>
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
                                                🤖 AI 实时诊断
                                            </button>
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
                                                ⚡ 挂单小票 (${hit.suggestedLimitPrice.toFixed(2)})
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
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
                                    AI-Memory 实盘持仓穿透与策略角色明细
                                </span>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                总持仓市值: ${ledger.totalNav.toFixed(2)} · 现金与等价物占 {ledger.totalDefensePct}%
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--text-muted)' }}>
                                        <th style={{ padding: '10px 8px' }}>标的代码·名称</th>
                                        <th style={{ padding: '10px 8px' }}>持股数</th>
                                        <th style={{ padding: '10px 8px' }}>持仓成本</th>
                                        <th style={{ padding: '10px 8px' }}>最新现价</th>
                                        <th style={{ padding: '10px 8px' }}>当前市值</th>
                                        <th style={{ padding: '10px 8px' }}>NAV 权重</th>
                                        <th style={{ padding: '10px 8px' }}>浮动盈亏</th>
                                        <th style={{ padding: '10px 8px' }}>AI-Memory 策略角色</th>
                                        <th style={{ padding: '10px 8px' }}>战术操作指引</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ledger.holdings.map((h: AiMemoryHolding) => (
                                        <tr key={h.symbol} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                                            <td style={{ padding: '12px 8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{h.symbol}</span>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{h.name}</span>
                                                </div>
                                                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{h.factorGroup}</div>
                                            </td>
                                            <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#fff' }}>{h.shares} 股</td>
                                            <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>${h.costBasis.toFixed(2)}</td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <div style={{ fontWeight: 'bold', color: '#fff' }}>${h.currentPrice.toFixed(2)}</div>
                                                {h.dayChangePct !== undefined && (
                                                    <div style={{ fontSize: '11px', fontWeight: '500', color: getPnlColor(h.dayChangePct) }}>
                                                        {h.dayChangePct >= 0 ? `+${h.dayChangePct.toFixed(2)}%` : `${h.dayChangePct.toFixed(2)}%`}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#fff' }}>${h.marketValue.toFixed(2)}</td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <span style={{
                                                    fontWeight: 'bold',
                                                    color: h.navWeightPct > 15 ? '#ef4444' : '#fff',
                                                }}>
                                                    {h.navWeightPct}%
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 8px', fontWeight: 'bold', color: getPnlColor(h.pnlAmount) }}>
                                                {h.pnlAmount >= 0 ? `+$${h.pnlAmount.toFixed(2)}` : `-$${Math.abs(h.pnlAmount).toFixed(2)}`}
                                                <span style={{ fontSize: '11px', marginLeft: '4px' }}>
                                                    ({h.pnlPct >= 0 ? `+${h.pnlPct.toFixed(2)}%` : `${h.pnlPct.toFixed(2)}%`})
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <span style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '11px',
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
                                                    {h.aiRole}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '11px', maxWidth: '280px', lineHeight: 1.4 }}>
                                                {h.actionAdvice}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* AI-Memory 审计总结备注 */}
                        <div style={{ marginTop: '16px', padding: '12px 14px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#60a5fa', marginBottom: '6px' }}>
                                📑 AI-Memory 官方对账风控审计评语
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                                {ledger.summaryComments.map((comment, idx) => (
                                    <li key={idx}>{comment}</li>
                                ))}
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
                                🎯 策略筛选命中个股与限价指令中心
                                <span style={{ fontSize: '12px', background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', border: '1px solid rgba(59, 130, 246, 0.4)', padding: '2px 8px', borderRadius: '4px' }}>
                                    实盘风控与订单流驱动
                                </span>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                严格基于 AI-Memory 量化策略（Phase 1~40）、产业垄断护城河与微观订单流，对触发买入、减仓、止盈保护的标的输出确定性限价指令。
                            </div>
                        </div>

                        {/* 筛选标签与全局 AI 诊断 */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => handleTriggerAiAnalysis(hitStocks[0])}
                                style={{
                                    padding: '5px 12px',
                                    fontSize: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(168, 85, 247, 0.6)',
                                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3), rgba(99, 102, 241, 0.3))',
                                    color: '#f3e8ff',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                }}
                            >
                                🤖 唤起 Antigravity 策略总检 (MRVL)
                            </button>
                            <div style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: '8px' }}>
                                {[
                                    { key: 'ALL', label: `全部标的 (${hitStocks.length})` },
                                    { key: 'HIT_NOW', label: `已触发限价 (${hitStocks.filter(h => h.hitStatus === 'HIT_NOW').length})` },
                                    { key: 'PENDING_CONFIRM', label: `待右侧确认 (${hitStocks.filter(h => h.hitStatus === 'PENDING_CONFIRM').length})` },
                                    { key: 'PROTECTING', label: `移动止盈中 (${hitStocks.filter(h => h.hitStatus === 'PROTECTING').length})` },
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

                    {/* 统计指标卡片 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '12px 14px' }}>
                            <div style={{ fontSize: '11px', color: '#fca5a5' }}>🔴 建议高抛减仓限价</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>
                                MRVL @ $265.00
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                卖出 1 股 · 降仓位至 13% 舒适区
                            </div>
                        </div>

                        <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '12px 14px' }}>
                            <div style={{ fontSize: '11px', color: '#6ee7b7' }}>🟢 移动止盈防护限价</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>
                                QCOM @ $190.00
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                防护 2 股 · 锁死 +7.06% 安全垫
                            </div>
                        </div>

                        <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '12px 14px' }}>
                            <div style={{ fontSize: '11px', color: '#fcd34d' }}>🟡 右侧反弹买入限价</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>
                                CVX @ $204.00
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                买入 2 股 · 待今晚第 2 根收阳确认
                            </div>
                        </div>

                        <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '12px 14px' }}>
                            <div style={{ fontSize: '11px', color: '#93c5fd' }}>🔵 宏观宽基底座限价</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>
                                SPY @ $766.50
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                买入 1 股 · 消化闲置现金平抑波动
                            </div>
                        </div>
                    </div>

                    {/* 完整卡片列表 */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '14px' }}>
                        {hitStocks
                            .filter(hit => hitFilter === 'ALL' || hit.hitStatus === hitFilter)
                            .map((hit) => {
                                const isSell = hit.actionType === 'SELL_LIMIT';
                                const isStop = hit.actionType === 'STOP_LIMIT';
                                const isBuy = hit.actionType === 'BUY_LIMIT';
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
                                                            {isSell ? '建议高抛挂单限价' : isStop ? '建议动态止盈防守限价' : '建议入场挂单限价'}
                                                        </span>
                                                        <div style={{ fontSize: '26px', fontWeight: 'bold', color: themeColor, fontFamily: 'SF Pro Display, monospace', marginTop: '2px' }}>
                                                            ${hit.suggestedLimitPrice.toFixed(2)}
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                            浮动挂单区间: <strong style={{ color: '#e2e8f0' }}>{hit.limitPriceRange}</strong>
                                                        </div>
                                                    </div>

                                                    <div style={{ textAlign: 'right' }}>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>现价</div>
                                                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                                            <span>${hit.currentPrice.toFixed(2)}</span>
                                                            {hit.dayChangePct !== undefined && (
                                                                <span style={{
                                                                    fontSize: '12px',
                                                                    fontWeight: 'bold',
                                                                    color: getPnlColor(hit.dayChangePct),
                                                                }}>
                                                                    ({hit.dayChangePct >= 0 ? `+${hit.dayChangePct.toFixed(2)}%` : `${hit.dayChangePct.toFixed(2)}%`})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: '11px', color: '#93c5fd', marginTop: '4px' }}>
                                                            建议 {isSell ? '卖出' : isStop ? '防护' : '买入'} <strong>{hit.suggestedShares} 股</strong>
                                                        </div>
                                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>
                                                            约 ${hit.estimatedAmountUsd.toFixed(2)}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* 测算公式与依据 */}
                                                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.08)', fontSize: '11px', color: '#cbd5e1', lineHeight: 1.5 }}>
                                                    <strong>📐 限价测算依据：</strong>{hit.limitFormula}
                                                </div>
                                            </div>

                                            {/* 目标价与止损价卡片 */}
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '10px', fontSize: '11px', textAlign: 'center' }}>
                                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '6px' }}>
                                                    <div style={{ color: 'var(--text-muted)' }}>目标止盈价</div>
                                                    <div style={{ fontWeight: 'bold', color: '#10b981', marginTop: '2px' }}>
                                                        {hit.targetPrice ? `$${hit.targetPrice.toFixed(2)}` : '--'}
                                                    </div>
                                                </div>
                                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '6px' }}>
                                                    <div style={{ color: 'var(--text-muted)' }}>硬止损防线</div>
                                                    <div style={{ fontWeight: 'bold', color: '#ef4444', marginTop: '2px' }}>
                                                        {hit.stopLossPrice ? `$${hit.stopLossPrice.toFixed(2)}` : '--'}
                                                    </div>
                                                </div>
                                                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '6px' }}>
                                                    <div style={{ color: 'var(--text-muted)' }}>确定性/胜率</div>
                                                    <div style={{ fontWeight: 'bold', color: '#3b82f6', marginTop: '2px' }}>
                                                        {hit.confidenceScore}%
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
                                                🤖 AI 深度诊断
                                            </button>
                                            <button
                                                onClick={() => handlePresetOrder(
                                                    hit.symbol as any,
                                                    hit.actionType === 'SELL_LIMIT' ? 'SELL' : 'BUY',
                                                    hit.suggestedShares,
                                                    hit.suggestedLimitPrice
                                                )}
                                                style={{
                                                    padding: '9px 14px',
                                                    background: isSell ? 'rgba(239, 68, 68, 0.25)' : isStop ? 'rgba(16, 185, 129, 0.25)' : 'rgba(59, 130, 246, 0.25)',
                                                    border: `1px solid ${themeColor}`,
                                                    color: '#fff',
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
                                                ⚡ 装入 Phase 36 下单小票 (${hit.suggestedLimitPrice.toFixed(2)})
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
                                📜 AI-Memory 真实成交流水与对账流水记录
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                                记录用户确认的实盘真实下单与对账回写记录，不可篡改对齐 Git 仓库流水
                            </div>
                        </div>
                        <span style={{ fontSize: '11px', background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.3)' }}>
                            已核验通过
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
                                {ledger.realTrades.map((t: AiMemoryRealTrade) => (
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
                                        <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#fff' }}>{t.shares} 股</td>
                                        <td style={{ padding: '12px 8px', color: '#fff' }}>${t.fillPrice.toFixed(3)}</td>
                                        <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#fff' }}>${t.grossAmount.toFixed(2)}</td>
                                        <td style={{ padding: '12px 8px', fontSize: '11px' }}>
                                            <div style={{ color: t.feeStatus === 'unverified_pending_settlement' ? '#f59e0b' : '#94a3b8' }}>
                                                {t.feeUsd !== null ? `$${t.feeUsd.toFixed(2)}` : '未核实'}
                                            </div>
                                            <div style={{ fontSize: '10px', color: t.feeStatus === 'unverified_pending_settlement' ? '#faad14' : 'var(--text-muted)' }}>
                                                {t.feeStatus === 'unverified_pending_settlement' ? '待结算核实 (差额0)' : '已从现金扣除'}
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontSize: '11px' }}>
                                            ${t.preTradeCash.toFixed(2)} ➔ <strong style={{ color: '#fff' }}>${t.postTradeCash.toFixed(2)}</strong>
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
                            📈 AI-Memory 实盘历史净值爬坡与配置演进
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            从初始 $5,000 到突破 $6,046.53 的每个重要审计节点与防御垫演变
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                        {ledger.navMilestones.map((m: AiMemoryNavMilestone, idx) => (
                            <div key={m.date} style={{
                                background: idx === ledger.navMilestones.length - 1 ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                                border: `1px solid ${idx === ledger.navMilestones.length - 1 ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
                                borderRadius: '8px',
                                padding: '12px 14px',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.date}</span>
                                    {idx === ledger.navMilestones.length - 1 && (
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
                        <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>选择标的</label>
                            <select
                                value={selectedSymbol}
                                onChange={(e) => {
                                    const val = e.target.value as any;
                                    setSelectedSymbol(val);
                                    const matchedHit = hitStocks.find(h => h.symbol === val);
                                    if (matchedHit) {
                                        setOrderAction(matchedHit.actionType === 'SELL_LIMIT' ? 'SELL' : 'BUY');
                                        setOrderShares(matchedHit.suggestedShares);
                                        setCustomLimitPrice(matchedHit.suggestedLimitPrice);
                                    }
                                }}
                                style={{ width: '100%', padding: '6px 8px', marginTop: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '4px' }}
                            >
                                <option value="MRVL">MRVL (迈威尔 - 减仓限价 $265.00)</option>
                                <option value="QCOM">QCOM (高通 - 止盈防守 $190.00)</option>
                                <option value="CVX">CVX (雪佛龙 - 右侧买入 $204.00)</option>
                                <option value="SPY">SPY (标普500 - 底座买入 $766.50)</option>
                                <option value="SGOV">SGOV (0-3月美债 - 现金清扫 $100.61)</option>
                                <option value="SO">SO (南方电力 - 预设回踩 $88.50)</option>
                                <option value="LIN">LIN (林德气体 - 预设超卖 $478.00)</option>
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
                                <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>建议挂单限价 (USD)</label>
                                {customLimitPrice !== null && (
                                    <span style={{ fontSize: '10px', color: '#10b981' }}>● 策略锁定</span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={customLimitPrice !== null ? customLimitPrice : smartOrder.recommendedPrice}
                                    onChange={(e) => setCustomLimitPrice(Number(e.target.value))}
                                    style={{ width: '100%', padding: '6px 8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: '#10b981', borderRadius: '4px', fontWeight: 'bold' }}
                                />
                                {customLimitPrice !== null && (
                                    <button
                                        onClick={() => setCustomLimitPrice(null)}
                                        title="重置为盘口中位数"
                                        style={{ padding: '0 8px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', whiteSpace: 'nowrap' }}
                                    >
                                        重置
                                    </button>
                                )}
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>实时盘口参考</div>
                            <div style={{ marginTop: '6px', fontSize: '12px' }}>
                                <span>买一: ${curQuote.bid.toFixed(2)} · 卖一: ${curQuote.ask.toFixed(2)}</span>
                                <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '13px', marginTop: '2px' }}>
                                    实际执行限价: ${smartOrder.recommendedPrice.toFixed(2)}
                                </div>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
                                <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 'bold' }}>SIMULATED / 沙盒演示</span>
                            </div>
                            <button
                                onClick={handleCopy}
                                style={{
                                    width: '100%',
                                    padding: '8px 14px',
                                    background: copied ? '#10b981' : '#2563eb',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontWeight: 'bold',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {copied ? '✅ 已复制标准小票' : '📋 一键复制下单小票 (SIMULATED)'}
                            </button>
                        </div>
                    </div>

                    {/* 格式化小票预览条 */}
                    <div style={{
                        marginTop: '10px',
                        padding: '8px 12px',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '6px',
                        fontFamily: 'SF Mono, Menlo, monospace',
                        fontSize: '11px',
                        color: '#94a3b8',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                        <span>{smartOrder.ticketText.split('\n')[0]} · {smartOrder.peggingStrategy}</span>
                        <span style={{ fontSize: '10px', color: '#10b981' }}>预估名义额: ${(smartOrder.recommendedPrice * orderShares).toFixed(2)}</span>
                    </div>
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
                                        Antigravity 实时多因子策略诊断 · {analyzingStock.symbol}
                                        <span style={{ fontSize: '11px', background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                                            {analyzingStock.nameCn}
                                        </span>
                                        <span style={{ fontSize: '11px', background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                                            建议限价 ${analyzingStock.suggestedLimitPrice.toFixed(2)}
                                        </span>
                                        <span style={{
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
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px' }}>
                                        模型: {ANTIGRAVITY_MODELS.find(m => m.id === selectedModel)?.name.split(' ')[0] || selectedModel} · 策略: {analyzingStock.strategySource} · {isAiStreaming ? '⚡ 正在通过本地 8045 端口流式推演中...' : '✅ 诊断推演完成'}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
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
                                </button>
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
                        {showAiSettings && (
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
                                {isAiStreaming ? '正在由 Antigravity 量化双脑实时运算...' : '该诊断已结合 AI-Memory 账本 ($6,046.53) 与盘口深度校验'}
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
                                    {aiCopied ? '✓ 已复制研报' : '📋 复制研报'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsAiModalOpen(false);
                                        handlePresetOrder(
                                            analyzingStock.symbol as any,
                                            analyzingStock.actionType === 'SELL_LIMIT' ? 'SELL' : 'BUY',
                                            analyzingStock.suggestedShares,
                                            analyzingStock.suggestedLimitPrice
                                        );
                                    }}
                                    style={{
                                        padding: '8px 16px',
                                        background: '#2563eb',
                                        border: 'none',
                                        color: '#fff',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                    }}
                                >
                                    ⚡ 确认并装入 Phase 36 下单小票 (${analyzingStock.suggestedLimitPrice.toFixed(2)})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

