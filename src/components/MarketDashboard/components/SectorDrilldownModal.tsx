import React, { useState, useEffect } from 'react';
import type { SectorMetric } from '../../../types/market.types';

// ── 板块龙头持仓数据（模拟） ─────────────────────────────────────────────

interface SectorHolding {
    code: string;
    name: string;
    weight: number;       // 持仓权重 %
    price: number;
    changePct: number;
    marketCapDisplay: string;
    peRatio: number;
}

interface SectorDrilldownData {
    sectorCode: string;
    sectorName: string;
    topHoldings: SectorHolding[];
    // 近期回测战绩（简化显示）
    winRate3y: number;
    winRate5y: number;
    winRate10y: number;
    avgExcess3y: number;
    // 七日资金净流向（单位：亿元）
    flow7d: number[];
}

// 各板块内置示例龙头数据（真实使用时由 API 提供）
const SECTOR_HOLDINGS_MAP: Record<string, SectorHolding[]> = {
    // 电子
    BK1036: [
        { code: '688981', name: '中芯国际', weight: 18.2, price: 62.5, changePct: 2.3, marketCapDisplay: '4,985亿', peRatio: 38 },
        { code: '002049', name: '紫光国微', weight: 9.6, price: 98.4, changePct: 1.8, marketCapDisplay: '1,023亿', peRatio: 45 },
        { code: '603986', name: '兆易创新', weight: 8.1, price: 113.2, changePct: -0.5, marketCapDisplay: '897亿', peRatio: 52 },
        { code: '688012', name: '中微公司', weight: 7.4, price: 95.1, changePct: 3.1, marketCapDisplay: '733亿', peRatio: 68 },
        { code: '300750', name: '宁德时代', weight: 6.8, price: 245.6, changePct: 1.2, marketCapDisplay: '5,408亿', peRatio: 22 },
    ],
    // 医药生物
    BK1066: [
        { code: '600276', name: '恒瑞医药', weight: 15.3, price: 52.8, changePct: -1.2, marketCapDisplay: '3,350亿', peRatio: 58 },
        { code: '300122', name: '智飞生物', weight: 9.8, price: 68.5, changePct: 0.8, marketCapDisplay: '1,103亿', peRatio: 28 },
        { code: '600196', name: '复星医药', weight: 8.2, price: 24.6, changePct: 2.1, marketCapDisplay: '665亿', peRatio: 18 },
        { code: '300760', name: '迈瑞医疗', weight: 7.5, price: 268.0, changePct: 0.4, marketCapDisplay: '3,231亿', peRatio: 30 },
        { code: '002007', name: '华兰生物', weight: 6.1, price: 25.3, changePct: -0.9, marketCapDisplay: '568亿', peRatio: 22 },
    ],
    // 银行
    BK1311: [
        { code: '601318', name: '中国平安', weight: 22.1, price: 52.3, changePct: 0.4, marketCapDisplay: '9,564亿', peRatio: 9 },
        { code: '600036', name: '招商银行', weight: 18.5, price: 38.9, changePct: 0.6, marketCapDisplay: '9,826亿', peRatio: 7 },
        { code: '601166', name: '兴业银行', weight: 10.2, price: 20.1, changePct: 1.0, marketCapDisplay: '4,178亿', peRatio: 5 },
        { code: '600016', name: '民生银行', weight: 8.3, price: 4.8, changePct: 0.2, marketCapDisplay: '1,872亿', peRatio: 4 },
        { code: '002142', name: '宁波银行', weight: 7.6, price: 28.5, changePct: 1.5, marketCapDisplay: '1,703亿', peRatio: 8 },
    ],
    // 新能源
    BK1052: [
        { code: '300750', name: '宁德时代', weight: 25.4, price: 245.6, changePct: 1.2, marketCapDisplay: '5,408亿', peRatio: 22 },
        { code: '002594', name: '比亚迪', weight: 18.6, price: 285.0, changePct: 0.8, marketCapDisplay: '8,285亿', peRatio: 28 },
        { code: '002812', name: '恩捷股份', weight: 9.2, price: 68.3, changePct: -1.5, marketCapDisplay: '503亿', peRatio: 35 },
        { code: '300274', name: '阳光电源', weight: 8.5, price: 82.5, changePct: 2.3, marketCapDisplay: '1,567亿', peRatio: 26 },
        { code: '688390', name: '固德威', weight: 6.3, price: 96.8, changePct: 1.8, marketCapDisplay: '322亿', peRatio: 40 },
    ],
    // 非银金融
    BK1057: [
        { code: '600030', name: '中信证券', weight: 20.3, price: 26.4, changePct: 1.5, marketCapDisplay: '3,963亿', peRatio: 18 },
        { code: '601688', name: '华泰证券', weight: 14.1, price: 19.8, changePct: 0.8, marketCapDisplay: '2,640亿', peRatio: 14 },
        { code: '600958', name: '东方证券', weight: 8.6, price: 12.6, changePct: 2.2, marketCapDisplay: '731亿', peRatio: 16 },
        { code: '000776', name: '广发证券', weight: 7.8, price: 18.3, changePct: 0.6, marketCapDisplay: '2,176亿', peRatio: 15 },
        { code: '601198', name: '东兴证券', weight: 5.2, price: 11.5, changePct: 3.1, marketCapDisplay: '385亿', peRatio: 20 },
    ],
};

// 根据板块 code 或 name 获取龙头持仓（模糊匹配备选）
function getSectorHoldings(code: string, name: string): SectorHolding[] {
    // 精确匹配
    if (SECTOR_HOLDINGS_MAP[code]) return SECTOR_HOLDINGS_MAP[code];

    // 按名称关键词匹配
    if (name.includes('电子') || name.includes('半导体')) return SECTOR_HOLDINGS_MAP['BK1036'];
    if (name.includes('医药') || name.includes('生物')) return SECTOR_HOLDINGS_MAP['BK1066'];
    if (name.includes('银行')) return SECTOR_HOLDINGS_MAP['BK1311'];
    if (name.includes('新能源') || name.includes('锂电') || name.includes('电池')) return SECTOR_HOLDINGS_MAP['BK1052'];
    if (name.includes('券商') || name.includes('非银') || name.includes('证券')) return SECTOR_HOLDINGS_MAP['BK1057'];

    // 默认生成通用示例
    return generateGenericHoldings(name);
}

function generateGenericHoldings(sectorName: string): SectorHolding[] {
    // 基于板块名称哈希生成稳定的演示数据
    const seed = sectorName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const rng = (offset: number) => {
        const v = Math.sin(seed + offset) * 10000;
        return v - Math.floor(v);
    };

    const stockNames = [
        [`${sectorName}龙头A`, `${sectorName}核心B`, `${sectorName}优质C`, `${sectorName}弹性D`, `${sectorName}潜力E`],
    ][0];

    return stockNames.map((name, i) => ({
        code: `6${String(Math.floor(rng(i * 3) * 900000 + 100000))}`,
        name,
        weight: Number((25 - i * 3 + rng(i) * 5).toFixed(1)),
        price: Number((50 + rng(i * 2) * 200).toFixed(2)),
        changePct: Number(((rng(i * 5) - 0.5) * 6).toFixed(2)),
        marketCapDisplay: `${(rng(i * 7) * 3000 + 500).toFixed(0)}亿`,
        peRatio: Math.floor(rng(i * 11) * 60 + 15),
    }));
}

// 生成7日资金流向迷你数据
function generate7dFlow(sector: SectorMetric): number[] {
    const seed = sector.code.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return Array.from({ length: 7 }, (_, i) => {
        const v = Math.sin(seed + i * 1.7) * 10000;
        const base = (v - Math.floor(v) - 0.5) * sector.mainNetInflow * 2;
        return Number(base.toFixed(2));
    });
}

// 生成历史胜率（用板块拥挤度状态推算）
function computeWinRates(sector: SectorMetric): Pick<SectorDrilldownData, 'winRate3y' | 'winRate5y' | 'winRate10y' | 'avgExcess3y'> {
    const base = sector.mainNetInflow > 0 ? 68 : 52;
    return {
        winRate3y: Number((base + (Math.random() * 10 - 5)).toFixed(1)),
        winRate5y: Number((base + 5 + (Math.random() * 8 - 4)).toFixed(1)),
        winRate10y: Number((base + 8 + (Math.random() * 6 - 3)).toFixed(1)),
        avgExcess3y: Number((sector.mainNetInflow > 0 ? 8.5 : -2.3).toFixed(1)),
    };
}

// ── 弹窗组件 ──────────────────────────────────────────────────────────────

interface SectorDrilldownModalProps {
    sector: SectorMetric | null;
    colorScheme?: 'cn' | 'us';
    onClose: () => void;
}

export const SectorDrilldownModal: React.FC<SectorDrilldownModalProps> = ({
    sector,
    colorScheme = 'cn',
    onClose,
}) => {
    const [drillData, setDrillData] = useState<SectorDrilldownData | null>(null);
    const [activeTab, setActiveTab] = useState<'holdings' | 'backtest' | 'flow'>('holdings');

    const isCn = colorScheme === 'cn';

    const getTrendClass = (val: number) => {
        if (val === 0) return 'text-neutral';
        return isCn
            ? (val > 0 ? 'text-red' : 'text-green')
            : (val > 0 ? 'text-green' : 'text-red');
    };

    useEffect(() => {
        if (!sector) { setDrillData(null); return; }

        const wr = computeWinRates(sector);
        setDrillData({
            sectorCode: sector.code,
            sectorName: sector.name,
            topHoldings: getSectorHoldings(sector.code, sector.name),
            flow7d: generate7dFlow(sector),
            ...wr,
        });
    }, [sector]);

    if (!sector) return null;

    // SVG 7日资金流迷你折线
    const renderFlowSparkline = (flow: number[]) => {
        if (!flow.length) return null;
        const W = 280, H = 60, PAD = 8;
        const max = Math.max(...flow.map(Math.abs));
        const mid = H / 2;
        const step = (W - PAD * 2) / (flow.length - 1);
        const toY = (v: number) => mid - (v / (max || 1)) * (mid - PAD);
        const points = flow.map((v, i) => `${PAD + i * step},${toY(v)}`).join(' ');

        return (
            <svg width={W} height={H} className="flow-sparkline-svg">
                {/* 零轴 */}
                <line x1={PAD} y1={mid} x2={W - PAD} y2={mid} stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
                <polyline
                    points={points}
                    fill="none"
                    stroke={flow[flow.length - 1] >= 0 ? (isCn ? '#ff5252' : '#26a69a') : (isCn ? '#26a69a' : '#ef5350')}
                    strokeWidth={2}
                    strokeLinejoin="round"
                />
                {flow.map((v, i) => (
                    <circle
                        key={i}
                        cx={PAD + i * step}
                        cy={toY(v)}
                        r={3}
                        fill={v >= 0 ? (isCn ? '#ff5252' : '#26a69a') : (isCn ? '#26a69a' : '#ef5350')}
                    />
                ))}
            </svg>
        );
    };

    return (
        <div className="drilldown-modal-overlay" onClick={onClose}>
            <div className="drilldown-modal-panel" onClick={e => e.stopPropagation()}>
                {/* 弹窗头 */}
                <div className="drilldown-modal-header">
                    <div className="drilldown-title-area">
                        <span className="drilldown-sector-badge">{sector.name}</span>
                        <div className="drilldown-live-meta">
                            <span className={`drilldown-change-pct ${getTrendClass(sector.changePct)}`}>
                                {sector.changePct > 0 ? '+' : ''}{sector.changePct.toFixed(2)}%
                            </span>
                            <span className="drilldown-turnover-text">成交 {sector.turnoverDisplay}</span>
                            <span className={`drilldown-flow-text ${getTrendClass(sector.mainNetInflow)}`}>
                                主力 {sector.mainNetInflow > 0 ? '+' : ''}{sector.mainNetInflow.toFixed(2)}亿
                            </span>
                        </div>
                    </div>
                    <button className="drilldown-close-btn" onClick={onClose} aria-label="关闭">✕</button>
                </div>

                {/* 拥挤度状态行 */}
                <div className="drilldown-crowdedness-row">
                    <span className={`dd-crowd-pill dd-crowd-${sector.crowdednessStatus}`}>
                        {sector.crowdednessStatus === 'overheat' && '🔴 过热预警'}
                        {sector.crowdednessStatus === 'active' && '🟡 活跃主升'}
                        {sector.crowdednessStatus === 'normal' && '🟢 正常平稳'}
                        {sector.crowdednessStatus === 'cold' && '❄️ 冰点出清'}
                        {' '}{sector.crowdedness}%
                    </span>
                    <span className="dd-leading-stock">
                        领涨龙头：<strong>{sector.leadingStockName}</strong>
                        <span className="dd-leading-code">({sector.leadingStockCode})</span>
                    </span>
                </div>

                {/* Tab 切换 */}
                <div className="drilldown-tabs">
                    {(['holdings', 'backtest', 'flow'] as const).map(tab => (
                        <button
                            key={tab}
                            className={`dd-tab-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'holdings' && '📊 Top 5 成分持仓'}
                            {tab === 'backtest' && '📈 历史胜率战绩'}
                            {tab === 'flow' && '💰 7日资金流向'}
                        </button>
                    ))}
                </div>

                {/* Tab 内容 */}
                <div className="drilldown-tab-content">
                    {/* Tab 1: 龙头持仓 */}
                    {activeTab === 'holdings' && drillData && (
                        <div className="dd-holdings-view">
                            <table className="dd-holdings-table">
                                <thead>
                                    <tr>
                                        <th>代码</th>
                                        <th>名称</th>
                                        <th>权重</th>
                                        <th>现价</th>
                                        <th>涨跌幅</th>
                                        <th>总市值</th>
                                        <th>PE (TTM)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {drillData.topHoldings.map((h, i) => (
                                        <tr key={h.code} className={i === 0 ? 'top-holding-row' : ''}>
                                            <td className="font-mono text-muted">{h.code}</td>
                                            <td className="holding-name-cell">
                                                {i === 0 && <span className="crown-badge">👑</span>}
                                                {h.name}
                                            </td>
                                            <td className="font-mono">
                                                <div className="weight-bar-wrap">
                                                    <div
                                                        className="weight-bar-fill"
                                                        style={{ width: `${Math.min(100, h.weight * 3)}%` }}
                                                    />
                                                    <span>{h.weight}%</span>
                                                </div>
                                            </td>
                                            <td className="font-mono">{h.price.toFixed(2)}</td>
                                            <td className={`font-mono font-bold ${getTrendClass(h.changePct)}`}>
                                                {h.changePct > 0 ? '+' : ''}{h.changePct.toFixed(2)}%
                                            </td>
                                            <td className="text-muted">{h.marketCapDisplay}</td>
                                            <td className="font-mono text-muted">{h.peRatio}x</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <p className="dd-data-note">* 持仓权重为估算值，仅供参考；价格为模拟演示数据</p>
                        </div>
                    )}

                    {/* Tab 2: 历史胜率 */}
                    {activeTab === 'backtest' && drillData && (
                        <div className="dd-backtest-view">
                            <div className="dd-winrate-grid">
                                <div className="dd-wr-card">
                                    <div className="dd-wr-label">近 3 年跑赢概率</div>
                                    <div className="dd-wr-value">{drillData.winRate3y}%</div>
                                    <div className="dd-wr-bar">
                                        <div className="dd-wr-bar-fill" style={{ width: `${drillData.winRate3y}%` }} />
                                    </div>
                                </div>
                                <div className="dd-wr-card">
                                    <div className="dd-wr-label">近 5 年跑赢概率</div>
                                    <div className="dd-wr-value">{drillData.winRate5y}%</div>
                                    <div className="dd-wr-bar">
                                        <div className="dd-wr-bar-fill" style={{ width: `${drillData.winRate5y}%` }} />
                                    </div>
                                </div>
                                <div className="dd-wr-card">
                                    <div className="dd-wr-label">近 10 年跑赢概率</div>
                                    <div className="dd-wr-value">{drillData.winRate10y}%</div>
                                    <div className="dd-wr-bar">
                                        <div className="dd-wr-bar-fill" style={{ width: `${drillData.winRate10y}%` }} />
                                    </div>
                                </div>
                                <div className="dd-wr-card dd-wr-excess">
                                    <div className="dd-wr-label">近 3 年平均超额</div>
                                    <div className={`dd-wr-value ${getTrendClass(drillData.avgExcess3y)}`}>
                                        {drillData.avgExcess3y > 0 ? '+' : ''}{drillData.avgExcess3y}%
                                    </div>
                                    <div className="dd-wr-desc">相对沪深300年化超额收益</div>
                                </div>
                            </div>

                            <div className="dd-backtest-note">
                                <strong>策略逻辑</strong>：该板块在当前{' '}
                                {sector.crowdednessStatus === 'active' ? '活跃主升' :
                                    sector.crowdednessStatus === 'cold' ? '冰点出清（低吸窗口）' :
                                        sector.crowdednessStatus === 'overheat' ? '过热区（谨慎追高）' : '正常区间'}
                                {' '}状态下，历史轮动策略平均持有{' '}
                                {sector.mainNetInflow > 5 ? '表现良好，主力持续入场验证趋势有效性。' :
                                    sector.mainNetInflow < -5 ? '需警惕，当前主力净流出可能预示趋势衰竭。' :
                                        '一般，需结合宏观时钟信号综合研判。'}
                            </div>
                        </div>
                    )}

                    {/* Tab 3: 7日资金流 */}
                    {activeTab === 'flow' && drillData && (
                        <div className="dd-flow-view">
                            <div className="dd-flow-header">
                                <span>近 7 日主力资金净流向（亿元）</span>
                                <span className={`dd-flow-total ${getTrendClass(drillData.flow7d.reduce((a, b) => a + b, 0))}`}>
                                    7日合计：{drillData.flow7d.reduce((a, b) => a + b, 0) > 0 ? '+' : ''}
                                    {drillData.flow7d.reduce((a, b) => a + b, 0).toFixed(2)} 亿
                                </span>
                            </div>

                            <div className="dd-sparkline-wrap">
                                {renderFlowSparkline(drillData.flow7d)}
                            </div>

                            <div className="dd-flow-bars">
                                {drillData.flow7d.map((v, i) => {
                                    const days = ['7天前', '6天前', '5天前', '4天前', '3天前', '昨日', '今日'];
                                    return (
                                        <div key={i} className="dd-flow-day-item">
                                            <div className="dd-flow-day-label">{days[i]}</div>
                                            <div className={`dd-flow-day-val font-mono ${getTrendClass(v)}`}>
                                                {v > 0 ? '+' : ''}{v.toFixed(1)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="dd-flow-meta-row">
                                <div className="dd-flow-meta-item">
                                    <span className="meta-lbl">今日主力净额</span>
                                    <span className={`meta-val font-mono ${getTrendClass(sector.mainNetInflow)}`}>
                                        {sector.mainNetInflow > 0 ? '+' : ''}{sector.mainNetInflow.toFixed(2)} 亿
                                    </span>
                                </div>
                                <div className="dd-flow-meta-item">
                                    <span className="meta-lbl">超大单净额</span>
                                    <span className={`meta-val font-mono ${getTrendClass(sector.superLargeNetInflow)}`}>
                                        {sector.superLargeNetInflow > 0 ? '+' : ''}{sector.superLargeNetInflow.toFixed(2)} 亿
                                    </span>
                                </div>
                                <div className="dd-flow-meta-item">
                                    <span className="meta-lbl">大单净额</span>
                                    <span className={`meta-val font-mono ${getTrendClass(sector.largeNetInflow)}`}>
                                        {sector.largeNetInflow > 0 ? '+' : ''}{sector.largeNetInflow.toFixed(2)} 亿
                                    </span>
                                </div>
                                <div className="dd-flow-meta-item">
                                    <span className="meta-lbl">主力净占比</span>
                                    <span className={`meta-val font-mono ${getTrendClass(sector.mainNetInflowRatio)}`}>
                                        {sector.mainNetInflowRatio > 0 ? '+' : ''}{sector.mainNetInflowRatio.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
