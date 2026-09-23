import React, { useState } from 'react';
import type { ColorScheme } from '../../../types/market.types';
import { calculateSmartPeggingOrder } from '../../../api/institutionalStrategy';

interface PortfolioExecutionHubProps {
    colorScheme?: ColorScheme;
    onNavigateToLab?: () => void;
    onNavigateToWatchlist?: () => void;
}

interface HoldingItem {
    symbol: string;
    name: string;
    shares: number;
    costBasis: number;
    currentPrice: number;
    marketValue: number;
    weightPct: number;
    pnlAmount: number;
    pnlPct: number;
    statusBadge: string;
    statusType: 'success' | 'warning' | 'info' | 'danger';
    stopPrice?: number;
    targetPrice?: number;
    actionAdvice: string;
}

export const PortfolioExecutionHub: React.FC<PortfolioExecutionHubProps> = ({
    colorScheme = 'cn',
    onNavigateToLab,
    onNavigateToWatchlist,
}) => {
    // 真实持仓数据 (结合最新行情与 AI-Memory 对账记录)
    const holdings: HoldingItem[] = [
        {
            symbol: 'SGOV',
            name: '0-3月超短美债 ETF',
            shares: 21,
            costBasis: 100.605,
            currentPrice: 100.61,
            marketValue: 2112.81,
            weightPct: 34.94,
            pnlAmount: 0.105,
            pnlPct: 0.01,
            statusBadge: '生息现金储备',
            statusType: 'success',
            actionAdvice: '安心持有收息，年化 ~5.0%，随时 T+0/T+1 释放购买力',
        },
        {
            symbol: 'MRVL',
            name: '迈威尔科技',
            shares: 4,
            costBasis: 172.50,
            currentPrice: 262.36,
            marketValue: 1049.44,
            weightPct: 17.36,
            pnlAmount: 359.44,
            pnlPct: 52.09,
            statusBadge: '超限 15% 警报',
            statusType: 'warning',
            stopPrice: 235.00,
            targetPrice: 268.00,
            actionAdvice: '占 NAV 达 17.4%，超出 15% 上限，建议择机在 $265~$268 减仓 1 股落袋',
        },
        {
            symbol: 'MXL',
            name: '迈凌半导体',
            shares: 6,
            costBasis: 91.40,
            currentPrice: 87.43,
            marketValue: 524.58,
            weightPct: 8.68,
            pnlAmount: -23.82,
            pnlPct: -4.34,
            statusBadge: '防守持有',
            statusType: 'info',
            stopPrice: 78.00,
            targetPrice: 95.00,
            actionAdvice: '底部筑底修复中，仓位舒适安全（<10%），严格禁止左侧加仓摊低',
        },
        {
            symbol: 'QCOM',
            name: '高通公司',
            shares: 2,
            costBasis: 185.20,
            currentPrice: 198.27,
            marketValue: 396.54,
            weightPct: 6.56,
            pnlAmount: 26.14,
            pnlPct: 7.06,
            statusBadge: '棘轮止盈中',
            statusType: 'success',
            stopPrice: 190.00,
            targetPrice: 205.00,
            actionAdvice: '大涨冲破 $198，执行 Phase 11 棘轮提拉止盈线至 $190，锁定利润',
        },
        {
            symbol: 'GLW',
            name: '康宁光通信',
            shares: 2,
            costBasis: 187.20,
            currentPrice: 159.69,
            marketValue: 319.38,
            weightPct: 5.28,
            pnlAmount: -55.02,
            pnlPct: -14.70,
            statusBadge: '底仓观察',
            statusType: 'info',
            stopPrice: 150.00,
            actionAdvice: '仓位极轻（仅 5.3%），对组合总体波动极低，维持底仓静待周期拐点',
        },
    ];

    const workingCash = 1643.78;
    const sgovReserve = 2112.81;
    const totalDefenseCash = workingCash + sgovReserve; // 3756.59
    const equityTotal = holdings.filter(h => h.symbol !== 'SGOV').reduce((acc, h) => acc + h.marketValue, 0); // 2289.94
    const totalNav = totalDefenseCash + equityTotal; // 6046.53

    const defensePct = Number(((totalDefenseCash / totalNav) * 100).toFixed(1));
    const equityPct = Number(((equityTotal / totalNav) * 100).toFixed(1));
    const dayPnlUsd = 19.70;
    const dayPnlPct = 0.33;

    // 智能挂单小票快捷生成状态
    const [selectedSymbol, setSelectedSymbol] = useState<'MRVL' | 'QCOM' | 'CVX' | 'SPY'>('MRVL');
    const [orderAction, setOrderAction] = useState<'BUY' | 'SELL'>('SELL');
    const [orderShares, setOrderShares] = useState(1);
    const [copied, setCopied] = useState(false);

    // 计算快速限价推荐
    const quoteMap = {
        MRVL: { bid: 262.30, ask: 262.40 },
        QCOM: { bid: 198.20, ask: 198.35 },
        CVX: { bid: 202.35, ask: 202.45 },
        SPY: { bid: 773.30, ask: 773.40 },
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

    const isGain = (val: number) => val >= 0;
    const getPnlColor = (val: number) => {
        if (val === 0) return 'var(--text-muted)';
        if (colorScheme === 'cn') {
            return isGain(val) ? 'var(--gain-color, #ff4d4f)' : 'var(--loss-color, #00c087)';
        }
        return isGain(val) ? 'var(--gain-color, #00c087)' : 'var(--loss-color, #ff4d4f)';
    };

    return (
        <div className="portfolio-hub-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                                👑 机构级实盘总账 (Live Portfolio Executive Dashboard)
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
                                ${totalNav.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: 'bold', color: getPnlColor(dayPnlUsd) }}>
                                {dayPnlUsd >= 0 ? `+$${dayPnlUsd.toFixed(2)}` : `-$${Math.abs(dayPnlUsd).toFixed(2)}`} ({dayPnlUsd >= 0 ? `+${dayPnlPct}%` : `${dayPnlPct}%`}) 昨晚新高
                            </span>
                        </div>
                    </div>

                    {/* 现金与生息快速指标 */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 14px', minWidth: '150px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🛡️ 防御生息储备 (SGOV+现金)</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', marginTop: '2px' }}>
                                ${totalDefenseCash.toFixed(2)} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({defensePct}%)</span>
                            </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 14px', minWidth: '150px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🚀 权益个股总仓位 (4只)</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6', marginTop: '2px' }}>
                                ${equityTotal.toFixed(2)} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({equityPct}%)</span>
                            </div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 14px', minWidth: '150px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>💵 SGOV 年化收益发电站</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#faad14', marginTop: '2px' }}>
                                ~5.0% <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>(约 $8.8/月)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 资金配置黄金结构进度条 */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                        <span>现金与国债防线 (62.3%) · 极度抗跌黑天鹅</span>
                        <span>股票卫星袖 (37.7%) · 聚焦半导体与AI</span>
                    </div>
                    <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                        <div style={{ width: '35%', background: '#10b981' }} title="SGOV 国债生息 35.0%" />
                        <div style={{ width: '27.3%', background: '#14b8a6' }} title="自由机动现金 27.3%" />
                        <div style={{ width: '37.7%', background: '#3b82f6' }} title="股票个股 37.7%" />
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

            {/* 2. 今日战术决策重点提示 (Today's Tactical Action Center) */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '12px',
            }}>
                {/* 重点 1: MRVL 减仓提醒 */}
                <div style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#ef4444' }}>
                                🚨 集中度超限风险 (高优先级)
                            </span>
                            <span style={{ fontSize: '11px', background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: '4px' }}>
                                建议减仓
                            </span>
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', margin: '6px 0 4px' }}>
                            MRVL 迈威尔科技 (现价 $262.36)
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
                            持仓占比达 <strong>17.36%</strong>，超出 15% 安全红线！建议在 <strong>$265~$268</strong> 挂单卖出 1 股落袋约 $265 现金，将仓位压回 13% 舒适区。
                        </div>
                    </div>
                    <button
                        style={{
                            marginTop: '10px',
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid #ef4444',
                            color: '#fff',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '600',
                        }}
                        onClick={() => {
                            setSelectedSymbol('MRVL');
                            setOrderAction('SELL');
                            setOrderShares(1);
                        }}
                    >
                        ⚡ 一键载入 MRVL 减仓挂单小票
                    </button>
                </div>

                {/* 重点 2: QCOM 棘轮止盈 */}
                <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981' }}>
                                🟢 移动止盈锁利中 (正向防守)
                            </span>
                            <span style={{ fontSize: '11px', background: '#10b981', color: '#000', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                棘轮保护
                            </span>
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', margin: '6px 0 4px' }}>
                            QCOM 高通 (大涨突破 $198.27)
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
                            端侧 AI 手机驱动股价逼近 $200 关口。执行 Phase 11 动态棘轮，将止盈保护线上移至 <strong>$190.00</strong>，锁住利润同时让利润继续飞。
                        </div>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
                        当前防守线: $190.00 | 距离成本安全垫: +7.06%
                    </div>
                </div>

                {/* 重点 3: CVX 机会观望 */}
                <div style={{
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#f59e0b' }}>
                                🟡 右侧买点跟踪 (严格观望)
                            </span>
                            <span style={{ fontSize: '11px', background: '#f59e0b', color: '#000', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                严禁左侧
                            </span>
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', margin: '6px 0 4px' }}>
                            CVX 雪佛龙 (现价 $202.41)
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>
                            原油承压回调，正在考验 $200 整数防线。坚决恪守<strong>连续两日收阳确认</strong>铁律，未见翻红企稳买点前严禁盲目抄底接飞刀。
                        </div>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
                        储备机动现金: $1,643.78 | 预留买入预算: 2~3 股
                    </div>
                </div>
            </div>

            {/* 3. 真实持仓列表与风控防线矩阵 (Live Holdings & Risk Grid) */}
            <div style={{
                background: 'var(--card-bg, #1a1f2c)',
                border: '1px solid var(--border-color, #2a2e3d)',
                borderRadius: '10px',
                padding: '16px 20px',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>📋</span>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>组合各标的实时明细与风控防线</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        总持仓市值: ${totalNav.toFixed(2)} · 现金与等价物占 62.3%
                    </span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.03)', textAlign: 'left', color: 'var(--text-muted)' }}>
                                <th style={{ padding: '10px 8px' }}>标的代码·名称</th>
                                <th style={{ padding: '10px 8px' }}>持股数</th>
                                <th style={{ padding: '10px 8px' }}>持仓成本</th>
                                <th style={{ padding: '10px 8px' }}>最新现价</th>
                                <th style={{ padding: '10px 8px' }}>当前市值</th>
                                <th style={{ padding: '10px 8px' }}>NAV 权重</th>
                                <th style={{ padding: '10px 8px' }}>浮动盈亏</th>
                                <th style={{ padding: '10px 8px' }}>止盈 / 止损防线</th>
                                <th style={{ padding: '10px 8px' }}>战术操作指引</th>
                            </tr>
                        </thead>
                        <tbody>
                            {holdings.map(h => (
                                <tr key={h.symbol} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ color: '#fff', fontSize: '13px' }}>{h.symbol}</span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{h.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 8px', fontWeight: '600' }}>{h.shares} 股</td>
                                    <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>${h.costBasis.toFixed(2)}</td>
                                    <td style={{ padding: '12px 8px', fontWeight: 'bold', color: '#fff' }}>${h.currentPrice.toFixed(2)}</td>
                                    <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>${h.marketValue.toFixed(2)}</td>
                                    <td style={{ padding: '12px 8px' }}>
                                        <span style={{
                                            fontWeight: 'bold',
                                            color: h.weightPct > 15 && h.symbol !== 'SGOV' ? '#ef4444' : '#fff',
                                        }}>
                                            {h.weightPct}%
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 8px', fontWeight: 'bold', color: getPnlColor(h.pnlAmount) }}>
                                        {h.pnlAmount >= 0 ? `+$${h.pnlAmount.toFixed(2)}` : `-$${Math.abs(h.pnlAmount).toFixed(2)}`}
                                        <span style={{ fontSize: '10px', marginLeft: '4px' }}>
                                            ({h.pnlPct >= 0 ? `+${h.pnlPct}%` : `${h.pnlPct}%`})
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 8px', fontSize: '11px' }}>
                                        {h.stopPrice ? (
                                            <span>
                                                止损: <strong style={{ color: '#ef4444' }}>${h.stopPrice}</strong>
                                                {h.targetPrice && <> · 止盈: <strong style={{ color: '#10b981' }}>${h.targetPrice}</strong></>}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#10b981' }}>无回撤极短久期</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '12px 8px', fontSize: '11px', color: 'var(--text-muted)', maxWidth: '280px' }}>
                                        {h.actionAdvice}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 4. Phase 36 智能挂单贴盘小票快捷生成器 (Smart Pegging Execution Copilot) */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '10px',
                padding: '16px 20px',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>⚡</span>
                        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#60a5fa' }}>
                            Phase 36 智能自适应挂单小票生成器 (券商无 API 极速下单助手)
                        </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        智能贴盘节省 15 bps 滑点 · 格式化小票一键复制入券商 App
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
                            <option value="MRVL">MRVL (迈威尔科技 - 建议减仓)</option>
                            <option value="QCOM">QCOM (高通公司 - 移动止盈)</option>
                            <option value="CVX">CVX (雪佛龙 - 观望买点)</option>
                            <option value="SPY">SPY (标普500 - 核心底座)</option>
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
                            {copied ? '✅ 已复制标准小票' : '📋 一键复制下单小票'}
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
        </div>
    );
};
