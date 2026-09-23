import React, { useState } from 'react';
import type { ColorScheme } from '../../../types/market.types';
import {
    AI_MEMORY_PORTFOLIO_LEDGER,
    calculateSmartPeggingOrder,
    type AiMemoryHolding,
    type AiMemoryRealTrade,
    type AiMemoryNavMilestone,
    type AiMemoryAuditItem,
} from '../../../api/institutionalStrategy';

interface PortfolioExecutionHubProps {
    colorScheme?: ColorScheme;
    onNavigateToLab?: () => void;
    onNavigateToWatchlist?: () => void;
}

export const PortfolioExecutionHub: React.FC<PortfolioExecutionHubProps> = ({
    colorScheme = 'cn',
    onNavigateToLab,
    onNavigateToWatchlist,
}) => {
    const ledger = AI_MEMORY_PORTFOLIO_LEDGER;
    const [hubView, setHubView] = useState<'holdings' | 'trades' | 'milestones' | 'ticket'>('holdings');

    // 智能挂单小票快捷生成状态
    const [selectedSymbol, setSelectedSymbol] = useState<'MRVL' | 'QCOM' | 'CVX' | 'SPY' | 'SGOV'>('MRVL');
    const [orderAction, setOrderAction] = useState<'BUY' | 'SELL'>('SELL');
    const [orderShares, setOrderShares] = useState(1);
    const [copied, setCopied] = useState(false);

    // 实时盘口参考价
    const quoteMap = {
        MRVL: { bid: 262.30, ask: 262.40 },
        QCOM: { bid: 198.20, ask: 198.35 },
        CVX: { bid: 202.35, ask: 202.45 },
        SPY: { bid: 773.30, ask: 773.40 },
        SGOV: { bid: 100.60, ask: 100.61 },
    };

    const curQuote = quoteMap[selectedSymbol];
    const smartOrder = calculateSmartPeggingOrder({
        symbol: selectedSymbol,
        direction: orderAction,
        targetShares: orderShares,
        bidPrice: curQuote.bid,
        askPrice: curQuote.ask,
        urgency: 'midpoint',
        feeEstimateUsd: 1.00,
    });

    const handleCopy = () => {
        navigator.clipboard.writeText(smartOrder.ticketText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePresetOrder = (sym: 'MRVL' | 'QCOM' | 'CVX' | 'SPY' | 'SGOV', act: 'BUY' | 'SELL', shares: number) => {
        setSelectedSymbol(sym);
        setOrderAction(act);
        setOrderShares(shares);
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                        研究账本快照（展示用，非成交回执）
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        对账源: <code style={{ color: '#93c5fd', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>{ledger.sourceFile}</code>
                    </span>
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
                            <span style={{ fontSize: '14px', fontWeight: 'bold', color: getPnlColor(ledger.dayPnlUsd) }}>
                                {ledger.dayPnlUsd >= 0 ? `+$${ledger.dayPnlUsd.toFixed(2)}` : `-$${Math.abs(ledger.dayPnlUsd).toFixed(2)}`} ({ledger.dayPnlUsd >= 0 ? `+${ledger.dayPnlPct}%` : `${ledger.dayPnlPct}%`}) 昨晚新高
                            </span>
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
                                            <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#fff' }}>${h.currentPrice.toFixed(2)}</td>
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
                        <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>选择标的</label>
                            <select
                                value={selectedSymbol}
                                onChange={(e) => setSelectedSymbol(e.target.value as any)}
                                style={{ width: '100%', padding: '6px 8px', marginTop: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '4px' }}
                            >
                                <option value="MRVL">MRVL (迈威尔科技 - 建议减仓 1 股)</option>
                                <option value="QCOM">QCOM (高通公司 - 移动棘轮止盈)</option>
                                <option value="CVX">CVX (雪佛龙 - 观望买点)</option>
                                <option value="SPY">SPY (标普500 - 核心底座)</option>
                                <option value="SGOV">SGOV (0-3月国债 - 现金清扫)</option>
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
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>实时盘口与最优限价</div>
                            <div style={{ marginTop: '6px', fontSize: '12px' }}>
                                <span>买一: ${curQuote.bid.toFixed(2)} · 卖一: ${curQuote.ask.toFixed(2)}</span>
                                <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '14px', marginTop: '2px' }}>
                                    建议贴盘价: ${smartOrder.recommendedPrice.toFixed(2)}
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
        </div>
    );
};
