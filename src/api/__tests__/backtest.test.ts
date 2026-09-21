import { describe, it, expect } from 'vitest';
import {
    HISTORICAL_ANNUAL_DATA,
    calculateCumulativeNav,
    calculateCAGR,
    calculateMaxDrawdown,
    calculateSharpeRatio,
    getBacktestSummary,
    getFactorAblationData,
    getRegimeWinRateBreakdown,
    simulateParametricBacktest,
    getMonthlyBacktestData,
    get2026H1Summary,
    calculateAnnualTradingCost,
} from '../backtest';

describe('20-Year Sector Rotation Quantitative Backtest Engine', () => {
    it('1. should contain complete historical annual data for 21 years (2005 - 2025)', () => {
        expect(HISTORICAL_ANNUAL_DATA.length).toBe(21);
        expect(HISTORICAL_ANNUAL_DATA[0].year).toBe(2005);
        expect(HISTORICAL_ANNUAL_DATA[HISTORICAL_ANNUAL_DATA.length - 1].year).toBe(2025);

        HISTORICAL_ANNUAL_DATA.forEach(record => {
            expect(record.year).toBeGreaterThanOrEqual(2005);
            expect(record.year).toBeLessThanOrEqual(2025);
            expect(['bull', 'bear', 'oscillating']).toContain(record.regime);
            expect(typeof record.strategyReturn).toBe('number');
            expect(typeof record.csi300Return).toBe('number');
            expect(typeof record.equityFundReturn).toBe('number');
            expect(record.heldSectors.length).toBeGreaterThan(0);
            expect(record.keyLogic.length).toBeGreaterThan(5);
        });
    });

    it('2. should accurately calculate cumulative net asset values (NAV)', () => {
        const navSeries = calculateCumulativeNav(HISTORICAL_ANNUAL_DATA);
        expect(navSeries.length).toBe(22); // 2004 base + 21 years
        expect(navSeries[0].year).toBe(2004);
        expect(navSeries[0].strategyNav).toBe(1.0);
        expect(navSeries[0].csi300Nav).toBe(1.0);

        // Verify end NAV growth
        const endNav = navSeries[navSeries.length - 1];
        expect(endNav.year).toBe(2025);
        expect(endNav.strategyNav).toBeGreaterThan(40); // 策略20年累计实现40倍以上增长
        expect(endNav.csi300Nav).toBeGreaterThan(3.0); // 沪深300约4倍
        expect(endNav.strategyNav).toBeGreaterThan(endNav.equityFundNav);
        expect(endNav.equityFundNav).toBeGreaterThan(endNav.csi300Nav);
    });

    it('3. should calculate CAGR mathematically correctly', () => {
        // 1.0 to 2.0 in 1 year = 100%
        expect(calculateCAGR(1.0, 2.0, 1)).toBe(100);
        // 1.0 to 1.21 in 2 years = 10%
        expect(calculateCAGR(1.0, 1.21, 2)).toBe(10);
        // Edge cases
        expect(calculateCAGR(1.0, 1.0, 0)).toBe(0);
        expect(calculateCAGR(0, 10, 5)).toBe(0);
    });

    it('4. should calculate maximum drawdown correctly', () => {
        const simpleSeries = [100, 120, 110, 90, 130];
        // Peak = 120, lowest after peak = 90 -> (90 - 120) / 120 = -25%
        expect(calculateMaxDrawdown(simpleSeries)).toBe(-25);

        // Monotonic increase has 0 drawdown
        expect(calculateMaxDrawdown([100, 110, 120, 130])).toBe(0);
        // Short series
        expect(calculateMaxDrawdown([100])).toBe(0);
    });

    it('5. should calculate Sharpe ratio correctly', () => {
        const returns = [10, 15, 20, 15]; // Mean = 15, rf = 2.5
        const sharpe = calculateSharpeRatio(returns, 2.5);
        expect(sharpe).toBeGreaterThan(0);

        // Negative excess return
        const badReturns = [1, 2, 1, 2]; // Mean = 1.5, rf = 2.5 -> negative
        expect(calculateSharpeRatio(badReturns, 2.5)).toBeLessThan(0);
    });

    it('6. should generate comprehensive BacktestSummary with superior strategy metrics', () => {
        const summary = getBacktestSummary();
        expect(summary.totalYears).toBe(21);
        expect(summary.cagrStrategy).toBeGreaterThan(20); // 策略年化复合收益率 > 20%
        expect(summary.cagrStrategy).toBeGreaterThan(summary.cagrCsi300);
        expect(summary.cagrStrategy).toBeGreaterThan(summary.cagrEquityFund);

        // 策略最大回撤大幅优于沪深300 (-26.3% vs -72.3%)
        expect(Math.abs(summary.maxDrawdownStrategy)).toBeLessThan(35);
        expect(Math.abs(summary.maxDrawdownCsi300)).toBeGreaterThan(60);

        // 夏普比率与卡玛比率优势
        expect(summary.sharpeStrategy).toBeGreaterThan(0.7);
        expect(summary.sharpeStrategy).toBeGreaterThan(summary.sharpeCsi300 * 2); // 策略夏普为沪深300两倍以上
        expect(summary.calmarStrategy).toBeGreaterThan(0.7);

        // 胜率检验: 年度跑赢胜率高于 90%
        expect(summary.annualWinRate).toBeGreaterThanOrEqual(90);
        expect(summary.monthlyWinRate).toBeGreaterThan(60);
        expect(summary.profitFactor).toBeGreaterThan(3.0);
    });

    it('7. should provide factor ablation proving crowdedness & macro clock significance', () => {
        const ablation = getFactorAblationData();
        expect(ablation.length).toBe(4);

        const benchmark = ablation[0];
        const pureMomentum = ablation[1];
        const withCrowdedness = ablation[2];
        const fullStrategy = ablation[3];

        // 纯动量虽然收益提高，但回撤巨大 (-52.4%)
        expect(pureMomentum.cagr).toBeGreaterThan(benchmark.cagr);
        expect(Math.abs(pureMomentum.maxDrawdown)).toBeGreaterThan(45);

        // 加入拥挤度止盈后，最大回撤显著收窄 (-31.2% vs -52.4%)
        expect(Math.abs(withCrowdedness.maxDrawdown)).toBeLessThan(Math.abs(pureMomentum.maxDrawdown));
        expect(withCrowdedness.sharpeRatio).toBeGreaterThan(pureMomentum.sharpeRatio);

        // 全因子宏观时钟策略具有最优的夏普与卡玛
        expect(fullStrategy.sharpeRatio).toBeGreaterThan(withCrowdedness.sharpeRatio);
        expect(fullStrategy.cagr).toBeGreaterThan(withCrowdedness.cagr);
        expect(Math.abs(fullStrategy.maxDrawdown)).toBeLessThan(Math.abs(withCrowdedness.maxDrawdown));
    });

    it('8. should calculate regime win rate breakdowns across bull, bear, and oscillating markets', () => {
        const regimes = getRegimeWinRateBreakdown();
        expect(regimes.length).toBe(4);

        const allRegime = regimes.find(r => r.regime === 'all');
        const bullRegime = regimes.find(r => r.regime === 'bull');
        const bearRegime = regimes.find(r => r.regime === 'bear');
        const oscRegime = regimes.find(r => r.regime === 'oscillating');

        expect(allRegime?.annualWinRate).toBeGreaterThanOrEqual(90);
        expect(bullRegime?.avgAnnualReturn).toBeGreaterThan(50); // 牛市平均爆发力
        expect(bearRegime?.avgExcessReturn).toBeGreaterThan(20);  // 熊市显著避险超额
        expect(oscRegime?.annualWinRate).toBe(100);             // 震荡市轮动胜率极高
    });

    it('9. should accurately calculate US stock 20-year backtest and beat S&P 500 benchmark', () => {
        const usSummary = getBacktestSummary('US');
        expect(usSummary.market).toBe('US');
        expect(usSummary.benchmarkName).toBe('标普500 (S&P 500)');
        expect(usSummary.cagrStrategy).toBeGreaterThan(20); // 美股行业轮动年化复合 > 20%
        expect(usSummary.cagrStrategy).toBeGreaterThan(usSummary.cagrCsi300);
        expect(Math.abs(usSummary.maxDrawdownStrategy)).toBeLessThan(25);
        expect(usSummary.annualWinRate).toBe(100);

        const usAblation = getFactorAblationData('US');
        expect(usAblation.length).toBe(4);
        expect(usAblation[3].cagr).toBeGreaterThan(usAblation[0].cagr * 2);
    });

    it('10. should dynamically recalculate performance in simulateParametricBacktest sandbox', () => {
        // 1. 基准参数运行
        const baseResult = simulateParametricBacktest({
            market: 'A',
            lookbackDays: 60,
            crowdednessThreshold: 12,
            portfolioSize: 2,
            macroFilterEnabled: true,
            rebalanceFreq: 'monthly',
        });
        expect(baseResult.records.length).toBe(21);
        expect(baseResult.summary.cagrStrategy).toBeGreaterThan(30);
        expect(baseResult.navPoints.length).toBe(22);

        // 2. 关闭宏观时钟对冲 (纯动量裸奔) -> 回撤加剧
        const noMacroResult = simulateParametricBacktest({
            market: 'A',
            lookbackDays: 60,
            crowdednessThreshold: 12,
            portfolioSize: 2,
            macroFilterEnabled: false,
            rebalanceFreq: 'monthly',
        });
        expect(Math.abs(noMacroResult.summary.maxDrawdownStrategy)).toBeGreaterThan(
            Math.abs(baseResult.summary.maxDrawdownStrategy)
        );

        // 3. 美股沙盘测试
        const usResult = simulateParametricBacktest({
            market: 'US',
            lookbackDays: 30,
            crowdednessThreshold: 85,
            portfolioSize: 1,
            macroFilterEnabled: true,
            rebalanceFreq: 'biweekly',
        });
        expect(usResult.summary.market).toBe('US');
        expect(usResult.summary.cagrStrategy).toBeGreaterThan(15);
    });

    it('11. should accurately verify 2026 H1 monthly backtest data and high-frequency win rate', () => {
        // A股 2026 H1 逐月实测验证
        const aMonthly = getMonthlyBacktestData('A');
        expect(aMonthly.length).toBe(6);
        expect(aMonthly[0].month).toBe('2026-01');
        expect(aMonthly[5].month).toBe('2026-06');

        const aH1 = get2026H1Summary('A');
        expect(aH1.totalMonths).toBe(6);
        expect(aH1.winCount).toBe(6);
        expect(aH1.winRate).toBe(100);
        expect(aH1.cumulativeStrategyReturn).toBeGreaterThan(15);
        expect(aH1.cumulativeExcessReturn).toBeGreaterThan(10);
        expect(aH1.maxDrawdown).toBeGreaterThan(-3.0); // 最大月次回撤控在-3%以内

        // 美股 2026 H1 逐月实测验证
        const usMonthly = getMonthlyBacktestData('US');
        expect(usMonthly.length).toBe(6);
        const usH1 = get2026H1Summary('US');
        expect(usH1.totalMonths).toBe(6);
        expect(usH1.winRate).toBe(100);
        expect(usH1.cumulativeStrategyReturn).toBeGreaterThan(15);
        expect(usH1.cumulativeExcessReturn).toBeGreaterThan(10);
    });

    it('12. should calculate realistic annual trading friction costs based on turnover and market', () => {
        // A股高频双周调仓 vs 月度调仓 vs 季度调仓
        const aBiweeklyCost = calculateAnnualTradingCost('A', 'biweekly', 2);
        const aMonthlyCost = calculateAnnualTradingCost('A', 'monthly', 2);
        const aQuarterlyCost = calculateAnnualTradingCost('A', 'quarterly', 2);

        expect(aBiweeklyCost).toBeGreaterThan(aMonthlyCost);
        expect(aMonthlyCost).toBeGreaterThan(aQuarterlyCost);
        expect(aMonthlyCost).toBeCloseTo(0.96, 1); // 12次 * 0.5换手 * 0.16% = ~0.96%

        // 美股因为无印花税且佣金规费极低，摩擦成本显著低于A股
        const usMonthlyCost = calculateAnnualTradingCost('US', 'monthly', 2);
        expect(usMonthlyCost).toBeLessThan(aMonthlyCost);
        expect(usMonthlyCost).toBeCloseTo(0.36, 1); // 12次 * 0.5换手 * 0.06% = ~0.36%
    });

    it('13. should simulate net performance after deducting trading friction in sandbox', () => {
        const grossResult = simulateParametricBacktest({
            market: 'A',
            lookbackDays: 60,
            crowdednessThreshold: 12,
            portfolioSize: 2,
            macroFilterEnabled: true,
            rebalanceFreq: 'monthly',
            deductTradingCost: false,
        });

        const netResult = simulateParametricBacktest({
            market: 'A',
            lookbackDays: 60,
            crowdednessThreshold: 12,
            portfolioSize: 2,
            macroFilterEnabled: true,
            rebalanceFreq: 'monthly',
            deductTradingCost: true,
        });

        // 扣费后收益率略微收窄，但真实反映实盘磨损
        expect(grossResult.summary.cagrStrategy).toBeGreaterThan(netResult.summary.cagrStrategy);
        expect(netResult.summary.estimatedAnnualCostPct).toBeGreaterThan(0);
        expect(netResult.summary.grossCagrStrategy).toBeDefined();

        // 扣除印花税/佣金/滑点后，策略年化收益依然大幅战胜沪深300基准
        expect(netResult.summary.cagrStrategy).toBeGreaterThan(netResult.summary.cagrCsi300 * 3);
        expect(netResult.summary.annualWinRate).toBeGreaterThanOrEqual(90);
    });
});

