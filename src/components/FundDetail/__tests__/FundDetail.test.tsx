import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FundDetail from '../FundDetail';
import { useFundStore } from '../../../store/fund.store';
import type { FundDetail as FundDetailType, FundEstimate } from '../../../types/fund.types';

// Mock getStockQuotes to return simulated quotes synchronously
vi.mock('../../../api/fund', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../../api/fund')>();
    return {
        ...actual,
        getStockQuotes: vi.fn().mockResolvedValue({
            '515980': { code: '515980', price: '1.250', changeRaw: '0.025', changePct: '2.00' },
            '002230': { code: '002230', price: '45.00', changeRaw: '1.35', changePct: '3.00' },
        }),
        getFundAISummaryStream: vi.fn(),
    };
});

describe('FundDetail UI Component', () => {
    beforeEach(() => {
        useFundStore.setState({
            funds: [],
            selectedCode: null,
            estimates: {},
            details: {},
            loadingEstimate: {},
            loadingDetail: {},
        });
    });

    it('1. 未选中基金时显示引导空状态', () => {
        render(<FundDetail />);
        expect(screen.getByText('选择一只基金')).toBeDefined();
        expect(screen.getByText('在左侧选择基金，查看详细持仓信息')).toBeDefined();
    });

    it('2. 选中 ETF 联接基金时，展示精准穿透估算面板、大类资产配置条及母ETF标签', async () => {
        const mockDetail: FundDetailType = {
            code: '008020',
            name: '华富人工智能ETF联接A',
            type: 'ETF联接',
            manager: '郜哲',
            updateDate: '2026-06-30',
            isEtfFeeder: true,
            parentEtfCode: '515980',
            parentEtfName: '人工智能ETF',
            parentEtfRatio: 93.5,
            assetAllocation: {
                stockRatio: 0,
                bondRatio: 0,
                cashRatio: 6.5,
                etfRatio: 93.5,
                date: '2026-06-30',
            },
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
                },
            ],
        };

        const mockEstimate: FundEstimate = {
            code: '008020',
            name: '华富人工智能ETF联接A',
            dwjz: '1.2000',
            gsz: '1.2000',
            gszzl: '0.00',
            gztime: '2026-09-21 15:00',
        };

        useFundStore.setState({
            selectedCode: '008020',
            details: { '008020': mockDetail },
            estimates: { '008020': mockEstimate },
        });

        render(<FundDetail />);

        // 验证基本信息与静态结构
        expect(screen.getByText('华富人工智能ETF联接A')).toBeDefined();
        expect(screen.getByText('008020')).toBeDefined();
        expect(screen.getByText('郜哲')).toBeDefined();
        expect(screen.getByText(/大类资产配置/)).toBeDefined();
        expect(screen.getByText(/标的母ETF: 人工智能ETF \(515980\)/)).toBeDefined();

        // 验证大类资产配置条图例
        expect(screen.getByText('母ETF/基金')).toBeDefined();
        expect(screen.getByText('93.5%')).toBeDefined();
        expect(screen.getByText('现金')).toBeDefined();
        expect(screen.getByText('6.5%')).toBeDefined();

        // 验证持仓表格表头及标的
        expect(screen.getByText('今日贡献')).toBeDefined();
        expect(screen.getByText('母ETF')).toBeDefined();
        expect(screen.getByText('人工智能ETF (场内母基金)')).toBeDefined();
        expect(screen.getByText('科大讯飞')).toBeDefined();

        // 等待行情异步到达后触发重新计算
        await waitFor(() => {
            expect(screen.getByText('🎯 ETF联接联动')).toBeDefined();
        });

        // 验证测算规则卡片
        expect(screen.getByText(/估值测算逻辑与准确性保障/)).toBeDefined();
        expect(screen.getByText(/ETF 联接穿透：/)).toBeDefined();
    });

    it('3. 平台切换按钮正常切换 active 状态', () => {
        const mockDetail: FundDetailType = {
            code: '008020',
            name: '华富人工智能ETF联接A',
            holdings: [
                { stockCode: '515980', stockName: '人工智能ETF', ratio: '93.50' }
            ]
        };

        useFundStore.setState({
            selectedCode: '008020',
            details: { '008020': mockDetail },
            estimates: { '008020': { code: '008020', name: '华富人工智能', dwjz: '1.0', gsz: '1.0', gszzl: '0', gztime: '' } }
        });

        render(<FundDetail />);

        const thsBtn = screen.getByText('同花顺');
        expect(thsBtn.className).not.toContain('active');

        fireEvent.click(thsBtn);
        expect(thsBtn.className).toContain('active');

        const emBtn = screen.getByText('东方财富');
        fireEvent.click(emBtn);
        expect(emBtn.className).toContain('active');
        expect(thsBtn.className).not.toContain('active');
    });
});
