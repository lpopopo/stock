export type MarketType = 'A' | 'US' | 'HK';

export interface MarketIndex {
    code: string;           // 带前缀代码，如 sh000001, usDJI, usIXIC, hkHSI
    symbol: string;         // 纯代码，如 000001, .DJI
    name: string;           // 显示名称，如 上证指数, 纳斯达克
    market: MarketType;
    current: number;
    change: number;
    changePct: number;
    open: number;
    prevClose: number;
    high: number;
    low: number;
    amplitude: number;      // 振幅 %
    volume: number;         // 成交量
    turnover: number;       // 成交额 (元 / USD)
    turnoverDisplay: string;// 格式化展示，如 "9,468.19 亿"
    turnoverRate?: number;  // 换手率 %
    peRatio?: number;       // 市盈率 (TTM)
    totalCapDisplay?: string;// 总市值展示
    time: string;
}

export type StockCategory = 'mag7' | 'china_concept' | 'a_pillar' | 'custom';

export interface StockMetric {
    code: string;           // 纯代码，如 AAPL, 600519
    rawCode: string;        // 查询代码，如 usAAPL, sh600519
    name: string;
    market: MarketType;
    category: StockCategory;
    price: number;
    change: number;
    changePct: number;
    open: number;
    prevClose: number;
    high: number;
    low: number;
    turnoverDisplay: string;
    turnoverRate?: number;
    peRatio?: number;
    marketCapDisplay?: string;
    time: string;
}

export interface MacroAsset {
    id: string;
    name: string;
    category: 'commodity' | 'forex' | 'volatility' | 'rate';
    value: number;
    change: number;
    changePct: number;
    unit: string;
    description: string;
    impactSummary: string;  // 对股市的联动影响简要说明
    time: string;
}

export interface MarketCapitalFlow {
    date: string;
    mainNetInflow: number;         // 主力净流入 (亿元)
    mainNetInflowRatio: number;    // 主力净流入占比 %
    superLargeNetInflow: number;   // 超大单净流入 (亿元)
    superLargeRatio: number;       // 超大单净流入占比 %
    largeNetInflow: number;        // 大单净流入 (亿元)
    largeRatio: number;            // 大单净流入占比 %
    midNetInflow: number;          // 中单净流入 (亿元)
    midRatio: number;              // 中单净流入占比 %
    smallNetInflow: number;        // 小单净流入 (亿元)
    smallRatio: number;            // 小单净流入占比 %
    retailNetInflow: number;       // 散户净流入 (中单+小单) (亿元)
}

export interface MarginTradingData {
    date: string;
    totalBalance: number;          // 两融总余额 (亿元)
    marginBalance: number;         // 融资余额 (亿元)
    shortBalance: number;          // 融券余额 (亿元)
    netBuyAmount: number;          // 融资净买入 (亿元)
    marginRatio: number;           // 融资余额占流通市值比 %
}

export interface MarketBreadth {
    shTurnover: number;     // 沪市成交额 (亿元)
    szTurnover: number;     // 深市成交额 (亿元)
    totalTurnover: number;  // 两市合计 (亿元)
    volumeStatus: 'surge' | 'expand' | 'normal' | 'shrink'; // 放量暴增 / 适度温和 / 正常中性 / 显著缩量
    volumeChangePct: number;// 相比基准均量的增减比例
    sentimentScore: number; // 市场情绪综合评分 0-100
    sentimentLevel: '极度恐慌' | '恐慌' | '中性' | '贪婪' | '极度贪婪';
    vixValue: number;
    vixStatus: '低风险(贪婪)' | '正常区间' | '警戒波动' | '极高恐慌';
    // 真实全市场涨跌统计 (沪深两市)
    upCount?: number;       // 上涨家数
    downCount?: number;     // 下跌家数
    flatCount?: number;     // 平盘家数
    upRatio?: number;       // 上涨占比 %
    // 资金流向与两融杠杆
    capitalFlow?: MarketCapitalFlow;
    marginData?: MarginTradingData;
}

export interface ValuationMetric {
    name: string;
    market: MarketType;
    code: string;
    currentPe: number;
    percentile: number;     // 历史分位数 (0-100%)
    level: '极低估' | '偏低估' | '估值合理' | '偏高估' | '极高估';
    erp: number;            // 股债性价比 / 风险溢价 (1/PE - 10Y国债) %
    historicalMedianPe: number;
    assessment: string;
}

export interface WatchlistStock {
    code: string;
    rawCode: string;
    name: string;
    market: MarketType;
    addedAt: number;
}

export interface TradingStatus {
    aShareStatus: '盘中交易' | '午间休市' | '已收盘' | '未开盘';
    usStockStatus: '盘中交易' | '盘前交易' | '盘后交易' | '已休市';
    hkStockStatus: '盘中交易' | '午间休市' | '已收盘' | '未开盘';
}

export interface SectorMetric {
    code: string;           // 板块代码，如 BK1216
    name: string;           // 板块名称，如 医药生物
    changePct: number;      // 涨跌幅 %
    turnover: number;       // 成交额 (元)
    turnoverDisplay: string;// 成交额展示，如 "1507.89 亿"
    crowdedness: number;    // 交易拥挤度 (成交额占两市比例 %)
    crowdednessStatus: 'overheat' | 'active' | 'normal' | 'cold'; // 过热(>12%) / 活跃(5-12%) / 平稳(2-5%) / 冰点(<2%)
    mainNetInflow: number;  // 主力净流入 (亿元)
    mainNetInflowRatio: number; // 主力净占比 %
    superLargeNetInflow: number;// 超大单净流入 (亿元)
    largeNetInflow: number; // 大单净流入 (亿元)
    leadingStockName: string; // 领涨龙头名称
    leadingStockCode: string; // 领涨龙头代码
}

export interface MacroCyclePhase {
    phaseName: string;      // 例如 "宽货币 + 流动性重估期"
    quadrant: '宽货币+宽信用' | '宽货币+紧信用' | '紧货币+宽信用' | '紧货币+紧信用';
    characteristics: string;// 核心宏观特征
    recommendedStyles: string[]; // 推荐配置风格 (如 "高弹性科技成长", "高股息红利底仓")
    cautions: string[];     // 规避或谨慎方向
}

export interface SectorRotationSignal {
    id: string;
    type: 'crowdedness_warning' | 'smart_money_inflow' | 'cold_reversal' | 'macro_credit';
    level: 'info' | 'warning' | 'bullish' | 'bearish';
    sectorName: string;
    title: string;
    description: string;
    timestamp: string;
}

// ========== 美股 GICS 11 大行业轮动与美联储时钟体系 ==========
export interface UsSectorMetric {
    code: string;            // 'XLK'
    rawCode: string;         // 'usXLK'
    name: string;            // '信息科技 (Technology)'
    nameCn: string;          // '信息科技'
    nameEn: string;          // 'Technology'
    price: number;           // 189.60
    change: number;          // 1.54
    changePct: number;       // 0.82
    relativeStrength: number;// 相对标普500超额 = changePct - spyChangePct
    breadth200Sma: number;   // 成份股站上200日均线比例 % (例如 82.5%)
    breadthStatus: 'overheat' | 'healthy' | 'neutral' | 'oversold'; // >80% 过热 | 50-80% 健康 | 30-50% 中性 | <30% 超跌
    aumDisplay: string;      // '$68.2 B'
    leadingHoldings: string; // 'NVDA, AAPL, MSFT'
    macroStyle: 'growth' | 'cyclical' | 'defensive';
}

export interface FedPolicyCycle {
    phaseName: string;       // 例如 "降息周期 + 经济软着陆博弈"
    quadrant: '降息+软着陆(成长)' | '加息+滞胀对冲(能源)' | '降息+衰退防御(防御)' | '降息+复苏大繁荣(顺周期)';
    fedRateExpectation: string; // "降息中继 (中性利率 3.5%~3.75%)"
    us10yYield: number;      // 4.12%
    yieldCurveSpread: number;// 10Y - 2Y 利差 (如 +0.18% 倒挂结束正常化)
    characteristics: string; // 核心宏观特征
    recommendedSectors: string[]; // 推荐配置行业代码，如 ['XLK', 'XLF', 'XLC']
    cautions: string[];      // 谨慎行业
    historicalWinRate?: number; // 策略实证胜率 %
}

export interface UsMarketBreadthDivergence {
    spyPrice: number;
    spyChangePct: number;
    rspPrice: number;
    rspChangePct: number;
    divergencePct: number;   // SPY - RSP (剪刀差: 正值表示权重科技虹吸，负值表示全市场普涨)
    divergenceStatus: 'mega_cap_dominant' | 'broad_rally' | 'market_pullback';
    divergenceDesc: string;
}

export interface UsSectorSignal {
    id: string;
    type: 'breadth_warning' | 'stagflation_hedge' | 'recession_defense' | 'momentum_breakout';
    level: 'bullish' | 'bearish' | 'warning' | 'info';
    sectorCode: string;
    sectorName: string;
    title: string;
    description: string;
    timestamp: string;
}

export type MarketViewType = 'overview' | 'a_share' | 'us_stock' | 'valuation' | 'watchlist' | 'sector_rotation';
export type ColorScheme = 'cn' | 'us'; // 'cn': 红涨绿跌; 'us': 绿涨红跌
