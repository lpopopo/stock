import { describe, it, expect } from 'vitest';
import { calculateFundEstimation, getFundPhase } from '../fund';
import type { FundDetail, FundEstimate } from '../../types/fund.types';
import type { StockQuote } from '../fund';

describe('calculateFundEstimation - 精准基金估算算法', () => {
    it('1. ETF 联接基金：精准穿透目标母ETF行情，并扣除现金拖累', () => {
        const detail: FundDetail = {
            code: '008020',
            name: '华富人工智能ETF联接A',
            type: '联接基金',
            isEtfFeeder: true,
            parentEtfCode: '515980',
            parentEtfName: '人工智能ETF',
            parentEtfRatio: 93.5,
            holdings: [
                {
                    stockCode: '515980',
                    stockName: '人工智能ETF (场内母基金)',
                    ratio: '93.50',
                    isParentEtf: true,
                },
                {
                    stockCode: '002230',
                    stockName: '科大讯飞',
                    ratio: '1.50',
                }
            ],
            assetAllocation: {
                stockRatio: 0,
                bondRatio: 0,
                cashRatio: 5.0,
                etfRatio: 93.5,
            }
        };

        const quotes: Record<string, StockQuote> = {
            '515980': { code: '515980', price: '1.250', changeRaw: '0.025', changePct: '2.00' },
            '002230': { code: '002230', price: '45.00', changeRaw: '1.35', changePct: '3.00' },
        };

        const estimate: FundEstimate = {
            code: '008020',
            name: '华富人工智能ETF联接A',
            dwjz: '1.2000',
            gsz: '1.2000',
            gszzl: '0.00',
            gztime: '2026-09-21 15:00',
        };

        const result = calculateFundEstimation(detail, quotes, estimate);

        expect(result.modelType).toBe('etf_feeder');
        // 母ETF贡献: 93.5% * 2.0% / 100 = 1.87%
        // 个股贡献: 1.5% * 3.0% / 100 = 0.045%
        // 总估算: 1.87 + 0.045 = 1.915%
        expect(result.estimatedChangePct).toBeCloseTo(1.915, 2);

        // 估算净值 = 1.2000 * (1 + 1.915 / 100) = 1.22298
        expect(result.realTimeEstimatedNav).toBeCloseTo(1.223, 2);

        // 母基金的 contribution
        const parentHolding = result.holdingsWithContribution.find(h => h.isParentEtf);
        expect(parentHolding).toBeDefined();
        expect(parentHolding?.contribution).toBeCloseTo(1.87, 2);
    });

    it('2. 偏股型基金：根据前十大股票 Beta 仅外推至实际股票仓位（80%），扣除现金拖累', () => {
        const detail: FundDetail = {
            code: '000001',
            name: '华夏成长混合',
            type: '偏股混合型',
            holdings: [
                { stockCode: '600519', stockName: '贵州茅台', ratio: '8.00' },
                { stockCode: '300750', stockName: '宁德时代', ratio: '7.00' },
            ],
            assetAllocation: {
                stockRatio: 80.0,
                bondRatio: 0,
                cashRatio: 18.0,
                etfRatio: 0,
            }
        };

        const quotes: Record<string, StockQuote> = {
            '600519': { code: '600519', price: '1800.00', changeRaw: '36.00', changePct: '2.00' },
            '300750': { code: '300750', price: '200.00', changeRaw: '8.00', changePct: '4.00' },
        };

        const estimate: FundEstimate = {
            code: '000001',
            name: '华夏成长混合',
            dwjz: '1.5000',
            gsz: '1.5000',
            gszzl: '0.00',
            gztime: '2026-09-21 14:00',
        };

        const result = calculateFundEstimation(detail, quotes, estimate);

        expect(result.modelType).toBe('equity_weighted');
        // 加权 Beta: (8 * 2.0 + 7 * 4.0) / (8 + 7) = (16 + 28) / 15 = 44 / 15 = 2.9333%
        // 外推至 80% 实际股票仓位: 2.9333% * 0.80 = 2.3467%
        expect(result.estimatedChangePct).toBeCloseTo(2.3467, 2);

        // 估算净值 = 1.5000 * (1 + 2.3467 / 100) = 1.5352
        expect(result.realTimeEstimatedNav).toBeCloseTo(1.5352, 2);

        // 验证单只股票贡献度
        const moutai = result.holdingsWithContribution.find(h => h.stockCode === '600519');
        expect(moutai?.contribution).toBeCloseTo(0.16, 2); // 8% * 2% / 100 = 0.16%
    });

    it('3. 固收+/纯债型基金：股票持仓仅作绝对贡献计入，严禁除以低股票权重虚假放大', () => {
        const detail: FundDetail = {
            code: '001234',
            name: '易方达稳健收益债券',
            type: '债券型',
            holdings: [
                { stockCode: '600519', stockName: '贵州茅台', ratio: '3.00' },
            ],
            assetAllocation: {
                stockRatio: 5.0,
                bondRatio: 88.0,
                cashRatio: 7.0,
                etfRatio: 0,
            }
        };

        const quotes: Record<string, StockQuote> = {
            '600519': { code: '600519', price: '1800.00', changeRaw: '-90.00', changePct: '-5.00' },
        };

        const estimate: FundEstimate = {
            code: '001234',
            name: '易方达稳健收益债券',
            dwjz: '1.1000',
            gsz: '1.1000',
            gszzl: '0.00',
            gztime: '2026-09-21 15:00',
        };

        const result = calculateFundEstimation(detail, quotes, estimate);

        expect(result.modelType).toBe('bond_conservative');
        // 股票贡献: 3.0% * (-5.0%) / 100 = -0.15% (绝对不会变成 -5.0% 全盘暴跌!)
        // 债券日利息: (88 / 100) * (2.5 / 250) ≈ +0.0088%
        // 总估算变动: -0.15% + 0.0088% ≈ -0.1412%
        expect(result.estimatedChangePct).toBeCloseTo(-0.1412, 2);
    });

    it('4. 空持仓或无行情时优雅降级，返回 safe fallback', () => {
        const emptyResult = calculateFundEstimation(null, {}, null);
        expect(emptyResult.estimatedChangePct).toBeNull();
        expect(emptyResult.realTimeEstimatedNav).toBeNull();
        expect(emptyResult.holdingsWithContribution).toEqual([]);
    });
});

describe('getFundPhase - 市场交易时段状态判断', () => {
    it('周三 10:30 (盘中交易时段): 返回 trading 阶段', () => {
        const date = new Date('2026-09-23T10:30:00'); // 周三
        const phase = getFundPhase(date);
        expect(phase.phase).toBe('trading');
        expect(phase.label).toContain('盘中实时估算');
        expect(phase.canShowEstimate).toBe(true);
    });

    it('周三 16:30 (收盘后待发布官方净值): 返回 post_market 阶段', () => {
        const date = new Date('2026-09-23T16:30:00'); // 周三 16:30
        const phase = getFundPhase(date);
        expect(phase.phase).toBe('post_market');
        expect(phase.label).toContain('今日收盘估算');
        expect(phase.canShowEstimate).toBe(true);
    });

    it('周三 23:00 (夜间已公布净值/次日盘前): 返回 closed 阶段', () => {
        const date = new Date('2026-09-23T23:00:00');
        const phase = getFundPhase(date);
        expect(phase.phase).toBe('closed');
        expect(phase.canShowEstimate).toBe(true);
    });

    it('周日任意时段 (周末休市): 返回 closed 阶段，且提示周末休市', () => {
        const date = new Date('2026-09-27T14:00:00'); // 周日
        const phase = getFundPhase(date);
        expect(phase.phase).toBe('closed');
        expect(phase.label).toContain('周末休市');
        expect(phase.canShowEstimate).toBe(true);
    });
});
