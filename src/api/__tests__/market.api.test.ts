import { describe, it, expect } from 'vitest';
import {
    formatQuoteTime,
    formatAmount,
    calculateMarketBreadth,
    calculateValuationMetrics,
    getTradingStatus,
    calculateMacroCyclePhase,
    generateSectorRotationSignals,
} from '../market';
import type { MarketIndex, SectorMetric, MarketBreadth } from '../../types/market.types';

describe('Market API Helpers and Calculators', () => {
    describe('formatQuoteTime', () => {
        it('should format 14-digit timestamp correctly', () => {
            const result = formatQuoteTime('20260921152000');
            expect(result).toBe('15:20:00');
        });

        it('should format space-separated timestamp correctly', () => {
            const result = formatQuoteTime('2026-09-18 17:52:27');
            expect(result).toBe('17:52:27');
        });

        it('should return empty string for empty input', () => {
            expect(formatQuoteTime('')).toBe('');
        });

        it('should return raw input if format does not match known patterns', () => {
            expect(formatQuoteTime('15:30')).toBe('15:30');
        });
    });

    describe('formatAmount', () => {
        it('should format A-share turnover in 亿 or 万', () => {
            expect(formatAmount(946819120000, 'A')).toBe('9468.19 亿');
            expect(formatAmount(50000000, 'A')).toBe('5000.00 万');
            expect(formatAmount(5000, 'A')).toBe('5000.00');
        });

        it('should format US stock turnover in $B or $M', () => {
            expect(formatAmount(29101577281, 'US')).toBe('$29.10 B');
            expect(formatAmount(350000000, 'US')).toBe('$350.00 M');
            expect(formatAmount(500000, 'US')).toBe('$500000.00');
        });

        it('should return -- for 0 or NaN', () => {
            expect(formatAmount(0)).toBe('--');
            expect(formatAmount(NaN)).toBe('--');
        });
    });

    describe('calculateMarketBreadth', () => {
        const mockIndices: MarketIndex[] = [
            {
                code: 'sh000001',
                symbol: '000001',
                name: '上证指数',
                market: 'A',
                current: 3949.91,
                change: 38.04,
                changePct: 0.97,
                open: 3920.27,
                prevClose: 3911.87,
                high: 3950.94,
                low: 3918.13,
                amplitude: 0.84,
                volume: 502354877,
                turnover: 946819120000, // 9468 亿
                turnoverDisplay: '9468.19 亿',
                time: '15:20:00',
            },
            {
                code: 'sz399001',
                symbol: '399001',
                name: '深证成指',
                market: 'A',
                current: 13730.02,
                change: 89.15,
                changePct: 0.65,
                open: 13716.22,
                prevClose: 13640.87,
                high: 13779.00,
                low: 13643.95,
                amplitude: 0.99,
                volume: 631708071,
                turnover: 1084694360000, // 10846 亿
                turnoverDisplay: '10846.94 亿',
                time: '15:20:00',
            },
        ];

        it('should correctly sum two-market turnover and diagnose surge status', () => {
            const breadth = calculateMarketBreadth(mockIndices, 21.67);
            expect(breadth.shTurnover).toBe(9468);
            expect(breadth.szTurnover).toBe(10847);
            expect(breadth.totalTurnover).toBe(9468 + 10847);
            expect(breadth.volumeStatus).toBe('surge'); // >= 20000 亿
            expect(breadth.vixValue).toBe(21.67);
            expect(breadth.sentimentScore).toBeGreaterThanOrEqual(5);
            expect(breadth.sentimentScore).toBeLessThanOrEqual(95);
        });

        it('should identify normal or shrink volume when turnover is moderate or low', () => {
            const lowVolumeIndices: MarketIndex[] = [
                { ...mockIndices[0], turnover: 300000000000 }, // 3000 亿
                { ...mockIndices[1], turnover: 400000000000 }, // 4000 亿
            ];
            const breadth = calculateMarketBreadth(lowVolumeIndices, 18.0);
            expect(breadth.totalTurnover).toBe(7000);
            expect(breadth.volumeStatus).toBe('shrink');
            expect(breadth.vixStatus).toBe('正常区间');
        });

        it('should correctly calculate multi-factor sentiment score with advance/decline, capital flow, and margin data', () => {
            const breadthCounts = {
                upCount: 4263,
                downCount: 929,
                flatCount: 94,
                upRatio: 80.6,
            };
            const capitalFlow = {
                date: '2026-09-21',
                mainNetInflow: 86.38,
                mainNetInflowRatio: 0.43,
                superLargeNetInflow: 104.76,
                superLargeRatio: 0.52,
                largeNetInflow: -18.38,
                largeRatio: -0.09,
                midNetInflow: -140.39,
                midRatio: -0.69,
                smallNetInflow: 54.01,
                smallRatio: 0.27,
                retailNetInflow: -86.38,
            };
            const marginData = {
                date: '2026-09-18',
                totalBalance: 26382.24,
                marginBalance: 26086.95,
                shortBalance: 295.28,
                netBuyAmount: -11.68,
                marginRatio: 2.62,
            };

            const breadth = calculateMarketBreadth(
                mockIndices,
                21.67,
                breadthCounts,
                capitalFlow,
                marginData
            );

            expect(breadth.upCount).toBe(4263);
            expect(breadth.downCount).toBe(929);
            expect(breadth.upRatio).toBe(80.6);
            expect(breadth.capitalFlow).toBeDefined();
            expect(breadth.capitalFlow?.mainNetInflow).toBe(86.38);
            expect(breadth.marginData).toBeDefined();
            expect(breadth.marginData?.totalBalance).toBe(26382.24);

            // Breadth: 80.6 * 0.25 = 20.15
            // Volume: total >= 20000 -> 88 * 0.25 = 22.0
            // Flow: mainNetInflow 86.38 >= 50 -> 70 * 0.20 = 14.0
            // VIX: 21.67 (20-25) -> 45 * 0.15 = 6.75
            // Margin: -11.68 (-50 to 0) -> 45 * 0.15 = 6.75
            // Sum = 20.15 + 22.0 + 14.0 + 6.75 + 6.75 = 69.65 -> 70 ('贪婪')
            expect(breadth.sentimentScore).toBe(70);
            expect(breadth.sentimentLevel).toBe('贪婪');
        });
    });

    describe('calculateValuationMetrics', () => {
        const mockIndices: MarketIndex[] = [
            {
                code: 'sh000300',
                symbol: '000300',
                name: '沪深300',
                market: 'A',
                current: 4539.57,
                change: 32.18,
                changePct: 0.71,
                open: 4524.34,
                prevClose: 4507.39,
                high: 4540.55,
                low: 4512.15,
                amplitude: 0.63,
                volume: 186361542,
                turnover: 495435930000,
                turnoverDisplay: '4954.36 亿',
                peRatio: 13.5,
                time: '15:20:00',
            },
            {
                code: 'usINX',
                symbol: '.INX',
                name: '标普500',
                market: 'US',
                current: 7650.50,
                change: 12.74,
                changePct: 0.17,
                open: 7657.17,
                prevClose: 7637.76,
                high: 7657.17,
                low: 7610.52,
                amplitude: 0.61,
                volume: 6050102942,
                turnover: 0,
                turnoverDisplay: '60.50 亿股',
                peRatio: 27.5,
                time: '17:29:48',
            },
        ];

        it('should compute ERP and valuation levels for core indices', () => {
            const valuations = calculateValuationMetrics(mockIndices);
            expect(valuations.length).toBe(5);

            const hs300Val = valuations.find(v => v.code === 'sh000300');
            expect(hs300Val).toBeDefined();
            expect(hs300Val?.currentPe).toBe(13.5);
            // 100 / 13.5 - 1.85 = 7.41 - 1.85 = 5.56
            expect(hs300Val?.erp).toBe(5.56);
            expect(hs300Val?.level).toBe('偏低估');

            const spxVal = valuations.find(v => v.code === 'usINX');
            expect(spxVal).toBeDefined();
            expect(spxVal?.currentPe).toBe(27.5);
            // 100 / 27.5 - 4.10 = 3.64 - 4.10 = -0.46
            expect(spxVal?.erp).toBe(-0.46);
            expect(spxVal?.level).toBe('偏高估');
        });
    });

    describe('getTradingStatus', () => {
        it('should return valid trading status properties', () => {
            const status = getTradingStatus();
            expect(['盘中交易', '午间休市', '已收盘', '未开盘']).toContain(status.aShareStatus);
            expect(['盘中交易', '盘前交易', '盘后交易', '已休市']).toContain(status.usStockStatus);
            expect(['盘中交易', '午间休市', '已收盘', '未开盘']).toContain(status.hkStockStatus);
        });
    });

    describe('calculateMacroCyclePhase', () => {
        it('should determine liquidity re-rating phase when volume surges and margin expands', () => {
            const mockBreadth: MarketBreadth = {
                shTurnover: 9468,
                szTurnover: 10846,
                totalTurnover: 20314,
                volumeStatus: 'surge',
                volumeChangePct: 27.0,
                sentimentScore: 78,
                sentimentLevel: '极度贪婪',
                vixValue: 21.67,
                vixStatus: '正常区间',
                marginData: {
                    date: '2026-09-18',
                    totalBalance: 26382.24,
                    marginBalance: 26086.95,
                    shortBalance: 295.28,
                    netBuyAmount: 35.0,
                    marginRatio: 2.62,
                },
            };

            const phase = calculateMacroCyclePhase(mockBreadth, []);
            expect(phase.phaseName).toContain('流动性与风险偏好重估期');
            expect(phase.quadrant).toBe('宽货币+紧信用');
            expect(phase.recommendedStyles.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('generateSectorRotationSignals', () => {
        it('should trigger smart money inflow, overheat, and liquidity signals accurately', () => {
            const mockSectors: SectorMetric[] = [
                {
                    code: 'BK1216',
                    name: '医药生物',
                    changePct: 4.06,
                    turnover: 150000000000,
                    turnoverDisplay: '1500.00 亿',
                    crowdedness: 11.2, // > 10% overheat
                    crowdednessStatus: 'overheat',
                    mainNetInflow: 67.42, // >= 15 亿 smart money
                    mainNetInflowRatio: 4.47,
                    superLargeNetInflow: 51.23,
                    largeNetInflow: 16.19,
                    leadingStockName: '药明康德',
                    leadingStockCode: '603259',
                },
                {
                    code: 'BK1203',
                    name: '非银金融',
                    changePct: 1.72,
                    turnover: 34000000000,
                    turnoverDisplay: '340.00 亿',
                    crowdedness: 1.68, // < 2% cold
                    crowdednessStatus: 'cold',
                    mainNetInflow: 12.87, // > 5 cold reversal
                    mainNetInflowRatio: 3.78,
                    superLargeNetInflow: 9.06,
                    largeNetInflow: 3.81,
                    leadingStockName: '中国平安',
                    leadingStockCode: '601318',
                },
            ];

            const mockBreadth: MarketBreadth = {
                shTurnover: 9468,
                szTurnover: 10846,
                totalTurnover: 20314,
                volumeStatus: 'surge',
                volumeChangePct: 27.0,
                sentimentScore: 78,
                sentimentLevel: '极度贪婪',
                vixValue: 21.67,
                vixStatus: '正常区间',
                marginData: {
                    date: '2026-09-18',
                    totalBalance: 26382.24,
                    marginBalance: 26086.95,
                    shortBalance: 295.28,
                    netBuyAmount: 10.0,
                    marginRatio: 2.62,
                },
            };

            const signals = generateSectorRotationSignals(mockSectors, mockBreadth);
            expect(signals.length).toBeGreaterThanOrEqual(3);

            const flowInSignal = signals.find(s => s.type === 'smart_money_inflow');
            expect(flowInSignal).toBeDefined();
            expect(flowInSignal?.sectorName).toBe('医药生物');

            const overheatSignal = signals.find(s => s.type === 'crowdedness_warning');
            expect(overheatSignal).toBeDefined();
            expect(overheatSignal?.sectorName).toBe('医药生物');

            const coldSignal = signals.find(s => s.type === 'cold_reversal');
            expect(coldSignal).toBeDefined();
            expect(coldSignal?.sectorName).toBe('非银金融');

            const macroSignal = signals.find(s => s.type === 'macro_credit');
            expect(macroSignal).toBeDefined();
        });
    });
});
