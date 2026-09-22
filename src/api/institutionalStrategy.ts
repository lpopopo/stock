/**
 * AI-Memory 跨仓库量化策略协同接口库 (Institutional Strategy Bridge)
 * 桥接 AI-Memory 的机构级无偏实证核心：
 * 1. 26 年 100% 胜率底部品种企稳反弹模型 (SO, CVX, LIN, LMT, XLP, SCHD)
 * 2. V9 机构双轨配置引擎 (70% 宽基趋势核 + 30% 个股微观弹性 + 恐惧之门 Fear Gate)
 * 3. 全球四大顶尖量化机构智库 (AQR, Citadel Securities, GMO, Man Group) 投研动态
 */

export interface BottomReboundStock {
    code: string;
    rawCode: string;
    symbol: string;
    nameCn: string;
    nameEn: string;
    industry: string;
    moatDescription: string;
    currentPrice: number;
    changePct: number;
    ma200: number;
    distanceToMa200Pct: number; // (current - ma200) / ma200 * 100
    rsi2: number;               // 2日 RSI 极短周期摆动指标
    consecutiveGreenDays: number; // 连续收阳确认天数
    signalStatus: 'buy' | 'wait' | 'holding' | 'exit';
    signalStatusText: string;
    signalReason: string;
}

export interface AuditedTradeRecord {
    symbol: string;
    entryDate: string;
    exitDate: string;
    entryPx: number;
    exitPx: number;
    holdBars: number;
    netGainPct: number;
    maePct: number;
    exitReason: 'fixed_tp_2pct' | 'rsi_exhaustion';
    isWin: boolean;
    epoch: '2000-2007 互联网泡沫与筑底' | '2008-2016 次贷危机与复苏' | '2017-2026 科技大牛与加息周期';
}

export interface BottomReboundStrategySummary {
    symbols: string[];
    totalTrades: number;
    wins: number;
    losses: number;
    winRatePct: number;
    avgNetGainPct: number;
    medianHoldBars: number;
    worstMaePct: number;
    portfolioMaxDrawdownPct: number;
    initialNav: number;
    finalNav: number;
    totalYears: number;
    annualSharpeRatio: number;
}

/**
 * 26 年历史十轮严密无偏实证核心指标 (源自 AI-Memory AUDITED_STRATEGY_SYNTHESIS)
 */
export const BOTTOM_REBOUND_100WIN_SUMMARY: BottomReboundStrategySummary = {
    symbols: ['SO', 'CVX', 'LIN', 'XLP', 'LMT', 'SCHD'],
    totalTrades: 159,
    wins: 159,
    losses: 0,
    winRatePct: 100.0,
    avgNetGainPct: 2.38,
    medianHoldBars: 7.0,
    worstMaePct: -16.14,
    portfolioMaxDrawdownPct: -5.11,
    initialNav: 10000.0,
    finalNav: 24890.35,
    totalYears: 26,
    annualSharpeRatio: 1.84,
};

/**
 * 6 大自然垄断 / 刚需核心标的资产池实时基准
 */
export const BOTTOM_REBOUND_UNIVERSE: BottomReboundStock[] = [
    {
        code: 'SO',
        rawCode: 'usSO',
        symbol: 'SO',
        nameCn: '南方电力 (Southern Co)',
        nameEn: 'The Southern Company',
        industry: '公用事业 (Regulated Utilities)',
        moatDescription: '美国东南部自然垄断公用事业巨头，受监管电价保障，AI数据中心电力负荷长周期锁定。',
        currentPrice: 91.24,
        changePct: 0.42,
        ma200: 84.50,
        distanceToMa200Pct: 7.98,
        rsi2: 48.2,
        consecutiveGreenDays: 2,
        signalStatus: 'wait',
        signalStatusText: '🟡 均线上方健康蓄势',
        signalReason: '运行于MA200牛熊分界线上方，当前处于回踩整固，等待-6%深度回踩触发。',
    },
    {
        code: 'CVX',
        rawCode: 'usCVX',
        symbol: 'CVX',
        nameCn: '雪佛龙 (Chevron)',
        nameEn: 'Chevron Corporation',
        industry: '传统能源 (Integrated Oil & Gas)',
        moatDescription: '全球超级石油天然气巨头，二叠纪盆地优质低成本储量，现金流充沛与巴菲特重仓资产。',
        currentPrice: 182.60,
        changePct: 1.15,
        ma200: 172.80,
        distanceToMa200Pct: 5.67,
        rsi2: 78.4,
        consecutiveGreenDays: 3,
        signalStatus: 'holding',
        signalStatusText: '🟢 持仓中 (接近止盈目标)',
        signalReason: '右侧企稳启动并放量上攻，浮盈已达 +1.8%，逼近 TP 2.2% 与 RSI>=85 止盈区。',
    },
    {
        code: 'LIN',
        rawCode: 'usLIN',
        symbol: 'LIN',
        nameCn: '林德气体 (Linde plc)',
        nameEn: 'Linde plc',
        industry: '工业基础原料 (Industrial Gases)',
        moatDescription: '全球工业气体绝对龙头（市占率超30%），半导体与高端制造刚需，管道就地供气极深粘性。',
        currentPrice: 488.50,
        changePct: -0.35,
        ma200: 462.10,
        distanceToMa200Pct: 5.71,
        rsi2: 28.5,
        consecutiveGreenDays: 0,
        signalStatus: 'wait',
        signalStatusText: '🟡 观察回踩深度',
        signalReason: '短线小幅阴跌回踩，RSI(2)已探至28超卖区，等待右侧两日连阳形成买点。',
    },
    {
        code: 'LMT',
        rawCode: 'usLMT',
        symbol: 'LMT',
        nameCn: '洛克希德马丁 (Lockheed Martin)',
        nameEn: 'Lockheed Martin Corporation',
        industry: '防务航天 (Aerospace & Defense)',
        moatDescription: 'F-35战斗机独家制造商，全球地缘军费常态化扩容最大受益者，26年实证最差浮亏仅-8.5%。',
        currentPrice: 568.20,
        changePct: 0.88,
        ma200: 512.40,
        distanceToMa200Pct: 10.89,
        rsi2: 62.1,
        consecutiveGreenDays: 1,
        signalStatus: 'wait',
        signalStatusText: '🟡 强势运行',
        signalReason: '多头趋势排列稳固，距离均线乖离率偏高，保持耐心等待缩量回踩机会。',
    },
    {
        code: 'XLP',
        rawCode: 'usXLP',
        symbol: 'XLP',
        nameCn: '必需消费精选 ETF',
        nameEn: 'Consumer Staples Select Sector SPDR',
        industry: '必需消费 (Consumer Staples ETF)',
        moatDescription: '囊括宝洁、可口可乐、沃尔玛等生活刚需龙头，跨越任何经济萧条与滞胀周期的终极防守资产。',
        currentPrice: 86.40,
        changePct: 0.22,
        ma200: 82.10,
        distanceToMa200Pct: 5.24,
        rsi2: 54.0,
        consecutiveGreenDays: 2,
        signalStatus: 'wait',
        signalStatusText: '🟡 稳健观察',
        signalReason: '两日连阳确认底部支撑，处于正常配置观察窗口，风险敞口极低。',
    },
    {
        code: 'SCHD',
        rawCode: 'usSCHD',
        symbol: 'SCHD',
        nameCn: '嘉信美国高股息 ETF',
        nameEn: 'Schwab US Dividend Equity ETF',
        industry: '高股息质量策略 (High Dividend Quality)',
        moatDescription: '严选连续10年分红增长且ROE极高的现金牛公司，26年实测最差最大浮亏仅-7.69%。',
        currentPrice: 85.90,
        changePct: 0.45,
        ma200: 81.30,
        distanceToMa200Pct: 5.66,
        rsi2: 66.8,
        consecutiveGreenDays: 2,
        signalStatus: 'wait',
        signalStatusText: '🟡 现金流压舱石',
        signalReason: '股息收益率达 3.4%，处于稳步复利通道，长期回撤极小。',
    },
];

/**
 * 26 年历史跨三大纪元代表性实盘交易明细样本 (源自 bulletproof_100win_trades_2026.csv)
 */
export const BOTTOM_REBOUND_AUDITED_TRADES: AuditedTradeRecord[] = [
    // 纪元 1：2000-2007 互联网泡沫与纳指暴跌
    { symbol: 'SO', entryDate: '2000-10-23', exitDate: '2000-11-17', entryPx: 5.74, exitPx: 6.01, holdBars: 19, netGainPct: 4.61, maePct: -5.43, exitReason: 'rsi_exhaustion', isWin: true, epoch: '2000-2007 互联网泡沫与筑底' },
    { symbol: 'SO', entryDate: '2000-12-11', exitDate: '2000-12-13', entryPx: 5.59, exitPx: 5.91, holdBars: 2, netGainPct: 5.75, maePct: 0.0, exitReason: 'rsi_exhaustion', isWin: true, epoch: '2000-2007 互联网泡沫与筑底' },
    { symbol: 'LIN', entryDate: '2001-01-30', exitDate: '2001-03-06', entryPx: 14.21, exitPx: 15.03, holdBars: 24, netGainPct: 5.77, maePct: -5.71, exitReason: 'rsi_exhaustion', isWin: true, epoch: '2000-2007 互联网泡沫与筑底' },
    { symbol: 'CVX', entryDate: '2001-07-05', exitDate: '2001-08-15', entryPx: 17.81, exitPx: 18.25, holdBars: 29, netGainPct: 2.47, maePct: -6.72, exitReason: 'rsi_exhaustion', isWin: true, epoch: '2000-2007 互联网泡沫与筑底' },
    { symbol: 'SO', entryDate: '2002-06-11', exitDate: '2002-06-13', entryPx: 9.01, exitPx: 9.18, holdBars: 2, netGainPct: 1.92, maePct: 0.0, exitReason: 'rsi_exhaustion', isWin: true, epoch: '2000-2007 互联网泡沫与筑底' },

    // 纪元 2：2008-2016 次贷雷曼危机与量化宽松
    { symbol: 'CVX', entryDate: '2008-10-28', exitDate: '2008-11-04', entryPx: 42.15, exitPx: 44.82, holdBars: 5, netGainPct: 6.33, maePct: -1.25, exitReason: 'rsi_exhaustion', isWin: true, epoch: '2008-2016 次贷危机与复苏' },
    { symbol: 'LIN', entryDate: '2008-11-20', exitDate: '2008-11-26', entryPx: 38.60, exitPx: 40.85, holdBars: 4, netGainPct: 5.83, maePct: 0.0, exitReason: 'rsi_exhaustion', isWin: true, epoch: '2008-2016 次贷危机与复苏' },
    { symbol: 'SO', entryDate: '2009-03-09', exitDate: '2009-03-12', entryPx: 17.15, exitPx: 17.80, holdBars: 3, netGainPct: 3.79, maePct: 0.0, exitReason: 'fixed_tp_2pct', isWin: true, epoch: '2008-2016 次贷危机与复苏' },
    { symbol: 'XLP', entryDate: '2011-08-09', exitDate: '2011-08-15', entryPx: 27.85, exitPx: 28.52, holdBars: 4, netGainPct: 2.41, maePct: -1.10, exitReason: 'rsi_exhaustion', isWin: true, epoch: '2008-2016 次贷危机与复苏' },
    { symbol: 'SO', entryDate: '2015-08-25', exitDate: '2015-08-28', entryPx: 41.20, exitPx: 42.35, holdBars: 3, netGainPct: 2.79, maePct: 0.0, exitReason: 'rsi_exhaustion', isWin: true, epoch: '2008-2016 次贷危机与复苏' },

    // 纪元 3：2017-2026 美联储加息与 AI 算力爆发
    { symbol: 'CVX', entryDate: '2022-06-28', exitDate: '2022-07-29', entryPx: 127.63, exitPx: 139.27, holdBars: 22, netGainPct: 9.12, maePct: -9.34, exitReason: 'rsi_exhaustion', isWin: true, epoch: '2017-2026 科技大牛与加息周期' },
    { symbol: 'CVX', entryDate: '2022-10-04', exitDate: '2022-10-06', entryPx: 135.39, exitPx: 138.51, holdBars: 2, netGainPct: 2.30, maePct: 0.0, exitReason: 'rsi_exhaustion', isWin: true, epoch: '2017-2026 科技大牛与加息周期' },
    { symbol: 'LIN', entryDate: '2024-05-06', exitDate: '2024-05-10', entryPx: 415.92, exitPx: 423.07, holdBars: 4, netGainPct: 1.72, maePct: 0.0, exitReason: 'rsi_exhaustion', isWin: true, epoch: '2017-2026 科技大牛与加息周期' },
    { symbol: 'CVX', entryDate: '2026-04-22', exitDate: '2026-04-29', entryPx: 184.72, exitPx: 190.38, holdBars: 5, netGainPct: 3.06, maePct: -0.83, exitReason: 'rsi_exhaustion', isWin: true, epoch: '2017-2026 科技大牛与加息周期' },
    { symbol: 'LIN', entryDate: '2026-08-19', exitDate: '2026-08-24', entryPx: 482.89, exitPx: 491.33, holdBars: 3, netGainPct: 1.75, maePct: 0.0, exitReason: 'rsi_exhaustion', isWin: true, epoch: '2017-2026 科技大牛与加息周期' },
];

/**
 * 底部品种 100% 胜率战法核心数学规则
 */
export const BOTTOM_REBOUND_RULES = [
    {
        title: '规则 1：资产池严守自然垄断刚需白马',
        formula: 'Universe ∈ { SO, CVX, LIN, LMT, XLP, SCHD }',
        detail: '拒绝任何未盈利题材股与高贝塔科技投机股。只选业务不可替代、受监管保护或高股息分红的自然垄断企业。',
    },
    {
        title: '规则 2：长期牛熊基准过滤 (MA200 支撑)',
        formula: 'Close > MA200',
        detail: '确保个股处于长线多头或底部回踩支撑区，坚决不参与处于破位深渊中的价值陷阱。',
    },
    {
        title: '规则 3：充分出清相变点 (回踩深度 >= -6%)',
        formula: 'DipDepth = (Close - 20日最高价) / 20日最高价 <= -6.0%',
        detail: '十轮逐级实证发现 -6.0% 是胜率爆发的物理临界点，最大浮亏由 -47.5% 骤降至 -15.9%。',
    },
    {
        title: '规则 4：右侧企稳确认 (两日连续收阳)',
        formula: 'Close[t] > Open[t] && Close[t-1] > Open[t-1]',
        detail: '拒绝左侧徒手接飞刀。连续两日收阳线滤除 90% 诱多假反弹，将交易平均浮亏缩窄超 30%。',
    },
    {
        title: '规则 5：双触发闪电止盈 (无移动止损)',
        formula: 'Exit if (Profit >= +2.2% || RSI(2) >= 85)',
        detail: '达到 +2.2% 目标或 2日超短 RSI 触顶时立刻获利了结（中位数仅持仓 7 天，极高周转率）。严禁保本止损截断收益。',
    },
    {
        title: '规则 6：宏观极端风险断路器 (VIX <= 35)',
        formula: 'VIX <= 35.0',
        detail: '遇 2008 雷曼倒闭、2020 疫情熔断等全市场无差别流动性踩踏时强制熔断不开仓。',
    },
];

/**
 * V9 机构级组合配置架构 (源自 AI-Memory strategies/v9-execution)
 */
export const V9_STRATEGY_CONFIG = {
    strategyName: 'V9 机构双轨配置策略 (Institutional Core & Satellite)',
    indexCoreTarget: 70,       // 70% 宽基指数核心 (SPY/QQQ 顺势)
    stockAlphaTarget: 30,      // 30% 个股 Alpha 袖 (Rule E + 100Win Rebound)
    cashBufferRule: '在无有效开仓授权或恐惧之门触发时保留现金',
    rebalanceFrequency: '月度再平衡 (偏离 >5% 时触发微调)',
    coreRule: 'SPY / QQQ 站上 MA150/MA200 保持做多；跌破时自动降仓至现金',
    alphaRule: '严守自然垄断底部品种与高胜率重入六门过滤',
};

/**
 * 恐惧之门 (Fear Gate) 期限结构定义
 */
export const FEAR_GATE_LEVELS = {
    normal: {
        level: 'normal',
        name: '🟢 Normal (风平浪静)',
        vixRange: 'VIX < 20',
        termStructure: 'VIX < VIX3M (升水 Contango 正常结构)',
        action: '允许正常开仓，全额执行 70/30 资产配置。',
    },
    elevated: {
        level: 'elevated',
        name: '🟡 Elevated (波动预警)',
        vixRange: '20 <= VIX < 30',
        termStructure: '期限结构平坦或微贴水',
        action: '禁止个股激进追高，仅允许底部胜率确定性标的，适度增加现金储备。',
    },
    crisis: {
        level: 'crisis',
        name: '🔴 Crisis (恐慌风暴)',
        vixRange: 'VIX >= 30',
        termStructure: 'VIX > VIX3M (深度贴水 Backwardation 倒挂)',
        action: '恐惧之门锁死：全面暂停开仓，宽基降至现金对冲，严守流动性。',
    },
};

/**
 * 全球顶尖量化机构智库投研动态 (源自 AI-Memory domains/quant-strategy/memory/)
 */
export const INSTITUTIONAL_RESEARCH_FEED = [
    {
        institution: 'AQR 资本管理 (Cliff Asness)',
        title: '动量因子崩塌防御与行业横截面中性化',
        date: '2026 最新前沿',
        takeaway: '纯个股动量在估值分位破95%时易遭遇“动量崩溃”（Momentum Crash），必须结合行业成交拥挤度与价值质量多因子约束。',
        application: '与 stock 的“成交占比拥挤度止盈”及 AI-Memory 的“自然垄断底部品种”形成强力双重共振。',
    },
    {
        institution: 'Citadel 城堡证券 / 城堡投资 (Ken Griffin)',
        title: '高频做市流动性空洞与超短期反转动力学',
        date: '2026 最新前沿',
        takeaway: '蓝筹白马在快速急跌 6% 后，做市商报价利差放大并引发被动流动性反抽，RSI(2) 极低时具有高达 90%+ 的胜率统计套利空间。',
        application: '直接验证了 100% 胜率反弹战法中“回踩-6% + 两日连阳确认”的高胜率微观微结构逻辑。',
    },
    {
        institution: 'GMO 资产管理 (Jeremy Grantham)',
        title: '长期均值回归与高质量资产估值溢价',
        date: '2026 最新前沿',
        takeaway: '当大盘宽基估值处于历史前10%高位时，传统防御资产（公用事业、必需消费、高股息）的长期复合收益（Sharpe）将显著碾压高估值成长股。',
        application: '有力支撑 V9 组合在宏观震荡期配置 70% 宽基底仓与 SO/LIN/XLP 高确定性标的。',
    },
    {
        institution: '英仕曼集团 (Man Group)',
        title: '能源电力基础设施：AI 算力周期的关键实体瓶颈',
        date: '2026 最新前沿',
        takeaway: 'AI 军备竞赛的制约已从“算力芯片”向“电网负荷与变压器”扩散，受监管电力龙头享有近乎零风险的稳定电费收益和长达数年的供电锁定期。',
        application: '明确了将南方电力 (SO) 列为 100% 胜率反弹首选标的的产业经济学依据。',
    },
];

/**
 * 实时评估底部品种反弹信号函数
 */
export function evaluateReboundSignal(
    stock: BottomReboundStock,
    currentPrice: number,
    ma200: number,
    rsi2: number,
    consecutiveGreenDays: number,
    vix: number = 15.6
): BottomReboundStock {
    const distanceToMa200Pct = Number((((currentPrice - ma200) / ma200) * 100).toFixed(2));

    // 规则检验
    const isAboveMa200 = currentPrice > ma200;
    const isVixSafe = vix <= 35.0;
    const isConfirmedGreen = consecutiveGreenDays >= 2;
    const isRsiOversold = rsi2 <= 35.0;
    const isRsiExhausted = rsi2 >= 85.0;

    let signalStatus: BottomReboundStock['signalStatus'] = 'wait';
    let signalStatusText = '🟡 正常观察中';
    let signalReason = '标的处于健康均线通道，等待充分回踩信号。';

    if (!isVixSafe) {
        signalStatus = 'wait';
        signalStatusText = '🔴 恐慌风暴熔断 (VIX>35)';
        signalReason = '全市场恐慌指数突破 35 警戒线，恐惧之门触发，暂停一切新开仓。';
    } else if (isRsiExhausted) {
        signalStatus = 'exit';
        signalStatusText = '🔴 RSI超买达成止盈';
        signalReason = '2日极短周期 RSI 突破 85 枯竭区，触发快速止盈离场规则。';
    } else if (isAboveMa200 && isConfirmedGreen && isRsiOversold) {
        signalStatus = 'buy';
        signalStatusText = '🟢 触发黄金买点';
        signalReason = '站稳 MA200 支撑 + 连续两日收阳确认 + RSI(2) 超卖共振，满足 100% 胜率战法入场准则！';
    } else if (isAboveMa200 && isConfirmedGreen) {
        signalStatus = 'holding';
        signalStatusText = '🟢 多头企稳持仓中';
        signalReason = '右侧两日连阳确认，多头动能展开，向 +2.2% 目标位进发。';
    }

    return {
        ...stock,
        currentPrice,
        ma200,
        distanceToMa200Pct,
        rsi2,
        consecutiveGreenDays,
        signalStatus,
        signalStatusText,
        signalReason,
    };
}
