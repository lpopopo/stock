import { describe, it, expect } from 'vitest';
import {
    fetchAllMarketIndices,
    fetchStockMetrics,
    fetchMacroAssets,
    fetchMarketBreadthCounts,
    fetchMarketCapitalFlow,
    fetchMarginTradingData,
    fetchSectorMetrics,
    calculateMarketBreadth,
    calculateValuationMetrics,
} from '../market';

describe('Real Live Market Data Accuracy and Stability Verification', () => {
    it('should fetch real, live data for all A-share, US, and HK indices', async () => {
        const indices = await fetchAllMarketIndices();
        expect(indices.length).toBeGreaterThanOrEqual(13);

        // 验证上证指数 (000001)
        const sh = indices.find(i => i.code === 'sh000001');
        expect(sh).toBeDefined();
        expect(sh!.name).toBe('上证指数');
        expect(sh!.current).toBeGreaterThan(2000); // 上证正常点位 > 2000
        expect(sh!.prevClose).toBeGreaterThan(2000);
        expect(sh!.turnover).toBeGreaterThan(1e10); // 沪市成交额 > 100 亿
        expect(sh!.turnoverDisplay).toMatch(/亿/);

        // 验证深证成指 (399001)
        const sz = indices.find(i => i.code === 'sz399001');
        expect(sz).toBeDefined();
        expect(sz!.current).toBeGreaterThan(5000);

        // 验证道琼斯 (.DJI)
        const dji = indices.find(i => i.code === 'usDJI');
        expect(dji).toBeDefined();
        expect(dji!.current).toBeGreaterThan(30000); // 道指 > 30000 点

        // 验证纳斯达克 (.IXIC)
        const ixic = indices.find(i => i.code === 'usIXIC');
        expect(ixic).toBeDefined();
        expect(ixic!.current).toBeGreaterThan(10000); // 纳指 > 10000 点

        // 验证标普500 (.INX)
        const spx = indices.find(i => i.code === 'usINX');
        expect(spx).toBeDefined();
        expect(spx!.current).toBeGreaterThan(4000); // 标普500 > 4000 点

        // 验证恒生指数 (HSI)
        const hsi = indices.find(i => i.code === 'hkHSI');
        expect(hsi).toBeDefined();
        expect(hsi!.current).toBeGreaterThan(10000);
    }, 15000);

    it('should fetch real quotes for Mag 7, China Concepts, and A-share Pillars', async () => {
        const stocks = await fetchStockMetrics();
        expect(stocks.length).toBeGreaterThanOrEqual(20);

        // 英伟达 NVDA
        const nvda = stocks.find(s => s.code === 'NVDA');
        expect(nvda).toBeDefined();
        expect(nvda!.price).toBeGreaterThan(50);
        expect(nvda!.marketCapDisplay).toBeDefined();

        // 苹果 AAPL
        const aapl = stocks.find(s => s.code === 'AAPL');
        expect(aapl).toBeDefined();
        expect(aapl!.price).toBeGreaterThan(100);

        // 贵州茅台 600519
        const maotai = stocks.find(s => s.code === '600519');
        expect(maotai).toBeDefined();
        expect(maotai!.price).toBeGreaterThan(800);
        expect(maotai!.name).toBe('贵州茅台');

        // 宁德时代 300750
        const catl = stocks.find(s => s.code === '300750');
        expect(catl).toBeDefined();
        expect(catl!.price).toBeGreaterThan(100);

        // 阿里巴巴 BABA
        const baba = stocks.find(s => s.code === 'BABA');
        expect(baba).toBeDefined();
        expect(baba!.price).toBeGreaterThan(50);
    }, 15000);

    it('should fetch real macro assets (Gold, Oil, VIX, Forex)', async () => {
        const macros = await fetchMacroAssets();
        expect(macros.length).toBeGreaterThanOrEqual(4);

        // 黄金 GC
        const gold = macros.find(m => m.id === 'GC');
        expect(gold).toBeDefined();
        expect(gold!.value).toBeGreaterThan(1500); // 金价 > 1500 美元/盎司

        // 原油 CL
        const oil = macros.find(m => m.id === 'CL');
        expect(oil).toBeDefined();
        expect(oil!.value).toBeGreaterThan(40); // 油价 > 40 美元/桶

        // 恐慌指数 VIX
        const vix = macros.find(m => m.id === 'VIX');
        expect(vix).toBeDefined();
        expect(vix!.value).toBeGreaterThan(5);
        expect(vix!.value).toBeLessThan(100);

        // 离岸人民币 USDCNH
        const usdcnh = macros.find(m => m.id === 'USDCNH');
        expect(usdcnh).toBeDefined();
        expect(usdcnh!.value).toBeGreaterThan(6.0);
        expect(usdcnh!.value).toBeLessThan(8.5);
    }, 15000);

    it('should compute real market breadth and valuation metrics without errors', async () => {
        const indices = await fetchAllMarketIndices();
        const breadth = calculateMarketBreadth(indices, 21.67);

        expect(breadth.shTurnover).toBeGreaterThan(100);
        expect(breadth.szTurnover).toBeGreaterThan(100);
        expect(breadth.totalTurnover).toBe(breadth.shTurnover + breadth.szTurnover);
        expect(breadth.sentimentScore).toBeGreaterThanOrEqual(5);
        expect(breadth.sentimentScore).toBeLessThanOrEqual(95);

        const valuations = calculateValuationMetrics(indices);
        expect(valuations.length).toBe(5);
        valuations.forEach(v => {
            expect(v.currentPe).toBeGreaterThan(0);
            expect(v.percentile).toBeGreaterThanOrEqual(0);
            expect(v.percentile).toBeLessThanOrEqual(100);
            expect(typeof v.erp).toBe('number');
            expect(v.assessment).toBeTruthy();
        });
    }, 15000);

    it('should fetch real, live market breadth counts, capital flow, and margin trading data', async () => {
        const [counts, flow, margin] = await Promise.all([
            fetchMarketBreadthCounts(),
            fetchMarketCapitalFlow(),
            fetchMarginTradingData(),
        ]);

        // 真实两市涨跌家数
        expect(counts.upCount).toBeGreaterThan(0);
        expect(counts.downCount).toBeGreaterThan(0);
        expect(counts.upCount + counts.downCount + counts.flatCount).toBeGreaterThan(2000);
        expect(counts.upRatio).toBeGreaterThanOrEqual(0);
        expect(counts.upRatio).toBeLessThanOrEqual(100);

        // 真实全市场主力与散户资金流向
        expect(flow).toBeDefined();
        expect(flow!.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(typeof flow!.mainNetInflow).toBe('number');
        expect(typeof flow!.superLargeNetInflow).toBe('number');
        expect(typeof flow!.largeNetInflow).toBe('number');
        expect(typeof flow!.retailNetInflow).toBe('number');
        // 超大单 + 大单 近似等于 主力净流入
        const mainSum = Number((flow!.superLargeNetInflow + flow!.largeNetInflow).toFixed(2));
        expect(Math.abs(mainSum - flow!.mainNetInflow)).toBeLessThanOrEqual(0.1);

        // 真实全市场两融杠杆数据
        expect(margin).toBeDefined();
        expect(margin!.totalBalance).toBeGreaterThan(10000); // 两融总额 > 1万亿
        expect(margin!.marginBalance).toBeGreaterThan(10000); // 融资余额 > 1万亿
        expect(margin!.shortBalance).toBeGreaterThan(0); // 融券余额 > 0
        expect(margin!.marginRatio).toBeGreaterThan(0); // 融资占流通市值比 > 0
    }, 15000);

    it('should fetch real, live industry sector metrics and calculate crowdedness', async () => {
        const totalTurnoverYuan = 2000000000000; // 假设两万亿两市基准
        const sectors = await fetchSectorMetrics(totalTurnoverYuan);

        expect(sectors.length).toBeGreaterThanOrEqual(10);
        const topSec = sectors[0];
        expect(topSec.code).toBeTruthy();
        expect(topSec.name).toBeTruthy();
        expect(topSec.turnover).toBeGreaterThan(0);
        expect(topSec.turnoverDisplay).toMatch(/亿|万/);
        expect(topSec.crowdedness).toBeGreaterThanOrEqual(0);
        expect(['overheat', 'active', 'normal', 'cold']).toContain(topSec.crowdednessStatus);
        expect(typeof topSec.mainNetInflow).toBe('number');
        expect(topSec.leadingStockName).toBeTruthy();
    }, 15000);
});
