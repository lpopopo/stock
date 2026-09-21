import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IndexHeroCards } from '../components/IndexHeroCards';
import { MarketBreadthBar } from '../components/MarketBreadthBar';
import { MarketCapitalFlowBar } from '../components/MarketCapitalFlowBar';
import { SectorRotationRadar } from '../components/SectorRotationRadar';
import { UsSectorRotationRadar } from '../components/UsSectorRotationRadar';
import { CrossAssetBarometer } from '../components/CrossAssetBarometer';
import { ValuationCycleGauges } from '../components/ValuationCycleGauges';
import { StockMatrixTable } from '../components/StockMatrixTable';
import { MarketWatchlist } from '../components/MarketWatchlist';
import { SectorBacktestPanel } from '../components/SectorBacktestPanel';
import { MarketAiAnalysisModal } from '../components/MarketAiAnalysisModal';
import type {
    MarketIndex,
    MarketBreadth,
    MacroAsset,
    ValuationMetric,
    StockMetric,
    SectorMetric,
    MacroCyclePhase,
    SectorRotationSignal,
    UsSectorMetric,
    FedPolicyCycle,
    UsMarketBreadthDivergence,
    UsSectorSignal,
} from '../../../types/market.types';
import { useMarketStore } from '../../../store/market.store';

describe('Market Dashboard UI Components', () => {
    beforeEach(() => {
        localStorage.clear();
        useMarketStore.setState({
            watchlist: [],
            watchlistMetrics: [],
            colorScheme: 'cn',
        });
    });

    describe('IndexHeroCards', () => {
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
                turnover: 946819120000,
                turnoverDisplay: '9468.19 亿',
                time: '15:20:00',
            },
            {
                code: 'usDJI',
                symbol: '.DJI',
                name: '道琼斯',
                market: 'US',
                current: 51682.64,
                change: -95.40,
                changePct: -0.18,
                open: 51826.78,
                prevClose: 51778.04,
                high: 51826.78,
                low: 51497.47,
                amplitude: 0.64,
                volume: 858494006,
                turnover: 0,
                turnoverDisplay: '8.58 亿股',
                time: '17:52:27',
            },
        ];

        it('should render all index cards and display prices', () => {
            render(<IndexHeroCards indices={mockIndices} colorScheme="cn" />);
            expect(screen.getByText('上证指数')).toBeDefined();
            expect(screen.getByText('道琼斯')).toBeDefined();
            expect(screen.getByText('9468.19 亿')).toBeDefined();
            expect(screen.getByText('8.58 亿股')).toBeDefined();
        });

        it('should trigger onSelectIndex callback when card is clicked', () => {
            const onSelect = vi.fn();
            render(<IndexHeroCards indices={mockIndices} colorScheme="cn" onSelectIndex={onSelect} />);
            fireEvent.click(screen.getByText('上证指数'));
            expect(onSelect).toHaveBeenCalledWith(mockIndices[0]);
        });

        it('should filter by market when marketFilter is provided', () => {
            render(<IndexHeroCards indices={mockIndices} colorScheme="cn" marketFilter="US" />);
            expect(screen.queryByText('上证指数')).toBeNull();
            expect(screen.getByText('道琼斯')).toBeDefined();
        });
    });

    describe('MarketBreadthBar', () => {
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
        };

        it('should render total turnover and volume surge status badge', () => {
            render(<MarketBreadthBar breadth={mockBreadth} />);
            expect(screen.getByText('A股两市总成交额')).toBeDefined();
            expect(screen.getByText('20,314')).toBeDefined();
            expect(screen.getByText(/超级天量放量/)).toBeDefined();
            expect(screen.getByText('极度贪婪')).toBeDefined();
            expect(screen.getByText('21.67')).toBeDefined();
        });

        it('should render advance/decline distribution and multi-factor badges when counts are present', () => {
            const richBreadth: MarketBreadth = {
                ...mockBreadth,
                upCount: 4263,
                downCount: 929,
                flatCount: 94,
                upRatio: 80.6,
            };
            render(<MarketBreadthBar breadth={richBreadth} colorScheme="cn" />);
            expect(screen.getByText('沪深全市场涨跌统计')).toBeDefined();
            expect(screen.getByText('4,263')).toBeDefined();
            expect(screen.getByText('929')).toBeDefined();
            expect(screen.getByText(/上涨占比 80.6%/)).toBeDefined();
            expect(screen.getByText('广度 25%')).toBeDefined();
        });
    });

    describe('MarketCapitalFlowBar', () => {
        const mockBreadthWithFlow: MarketBreadth = {
            shTurnover: 9468,
            szTurnover: 10846,
            totalTurnover: 20314,
            volumeStatus: 'surge',
            volumeChangePct: 27.0,
            sentimentScore: 70,
            sentimentLevel: '贪婪',
            vixValue: 21.67,
            vixStatus: '正常区间',
            capitalFlow: {
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
            },
            marginData: {
                date: '2026-09-18',
                totalBalance: 26382.24,
                marginBalance: 26086.95,
                shortBalance: 295.28,
                netBuyAmount: -11.68,
                marginRatio: 2.62,
            },
        };

        it('should render main capital flow, retail flow, and margin leverage data correctly', () => {
            render(<MarketCapitalFlowBar breadth={mockBreadthWithFlow} colorScheme="cn" />);
            expect(screen.getByText('全市场主力资金流向')).toBeDefined();
            expect(screen.getByText('+86.38')).toBeDefined();
            expect(screen.getByText(/超大单净额:/)).toBeDefined();
            expect(screen.getByText(/\+104.76 亿/)).toBeDefined();

            expect(screen.getByText('散户与中小单资金博弈')).toBeDefined();
            expect(screen.getByText('-86.38')).toBeDefined();

            expect(screen.getByText('全市场两融杠杆水位')).toBeDefined();
            expect(screen.getByText('26,382.24')).toBeDefined();
            expect(screen.getByText(/26,086.95 亿/)).toBeDefined();
            expect(screen.getByText(/-11.68 亿/)).toBeDefined();
        });

        it('should return null if breadth or capital flow / margin data is missing', () => {
            const { container } = render(<MarketCapitalFlowBar breadth={null} />);
            expect(container.firstChild).toBeNull();
        });
    });

    describe('CrossAssetBarometer', () => {
        const mockAssets: MacroAsset[] = [
            {
                id: 'GC',
                name: 'COMEX 纽约黄金',
                category: 'commodity',
                value: 4386.66,
                change: -0.86,
                changePct: -0.86,
                unit: '美元/盎司',
                description: '避险与抗通胀风向标',
                impactSummary: '全球流动性与避险偏好中性',
                time: '15:12:03',
            },
            {
                id: 'USDCNH',
                name: '美元 / 离岸人民币',
                category: 'forex',
                value: 6.6953,
                change: 0.0009,
                changePct: 0.01,
                unit: 'USD/CNH',
                description: '外资对人民币资产风险偏好风向标',
                impactSummary: '汇率平稳，资本流动均衡',
                time: '15:14:19',
            },
        ];

        it('should render macro commodities and foreign exchange cards', () => {
            render(<CrossAssetBarometer macroAssets={mockAssets} colorScheme="cn" />);
            expect(screen.getByText('COMEX 纽约黄金')).toBeDefined();
            expect(screen.getByText('美元 / 离岸人民币')).toBeDefined();
            expect(screen.getByText('全球流动性与避险偏好中性')).toBeDefined();
        });
    });

    describe('ValuationCycleGauges', () => {
        const mockValuations: ValuationMetric[] = [
            {
                name: '沪深300 (核心蓝筹)',
                market: 'A',
                code: 'sh000300',
                currentPe: 13.5,
                historicalMedianPe: 12.8,
                percentile: 38,
                level: '偏低估',
                erp: 5.56,
                assessment: '股债风险溢价高，配置胜率极高',
            },
        ];

        it('should render valuation metrics and assessment', () => {
            render(<ValuationCycleGauges valuations={mockValuations} />);
            expect(screen.getByText('沪深300 (核心蓝筹)')).toBeDefined();
            expect(screen.getByText('13.5x')).toBeDefined();
            expect(screen.getByText('+5.56%')).toBeDefined();
            expect(screen.getByText('偏低估')).toBeDefined();
        });
    });

    describe('StockMatrixTable', () => {
        const mockStocks: StockMetric[] = [
            {
                code: 'NVDA',
                rawCode: 'usNVDA',
                name: '英伟达',
                market: 'US',
                category: 'mag7',
                price: 222.27,
                change: 2.93,
                changePct: 1.34,
                open: 219.35,
                prevClose: 219.34,
                high: 222.73,
                low: 218.03,
                turnoverDisplay: '$42.06 B',
                peRatio: 28.1,
                marketCapDisplay: '$5367.15 B',
                time: '16:00:02',
            },
            {
                code: '600519',
                rawCode: 'sh600519',
                name: '贵州茅台',
                market: 'A',
                category: 'a_pillar',
                price: 1252.57,
                change: -4.50,
                changePct: -0.36,
                open: 1250.00,
                prevClose: 1257.07,
                high: 1260.00,
                low: 1248.00,
                turnoverDisplay: '45.20 亿',
                peRatio: 21.5,
                marketCapDisplay: '15700.00 亿',
                time: '15:00:00',
            },
        ];

        it('should render stocks under active category tab and allow tab switching', () => {
            render(<StockMatrixTable stockMetrics={mockStocks} colorScheme="cn" />);
            // Default tab is mag7
            expect(screen.getByText('英伟达')).toBeDefined();
            expect(screen.queryByText('贵州茅台')).toBeNull();

            // Switch to a_pillar tab
            fireEvent.click(screen.getByText(/A股核心行业支柱白马/));
            expect(screen.getByText('贵州茅台')).toBeDefined();
            expect(screen.queryByText('英伟达')).toBeNull();
        });
    });

    describe('MarketWatchlist', () => {
        it('should render empty state when watchlist is empty', () => {
            render(<MarketWatchlist colorScheme="cn" />);
            expect(screen.getByText('当前自选池为空')).toBeDefined();
        });

        it('should render watchlist stock items', () => {
            useMarketStore.setState({
                watchlistMetrics: [
                    {
                        code: 'AAPL',
                        rawCode: 'usAAPL',
                        name: '苹果',
                        market: 'US',
                        category: 'custom',
                        price: 336.13,
                        change: -0.87,
                        changePct: -0.26,
                        open: 337.91,
                        prevClose: 337.00,
                        high: 338.49,
                        low: 332.53,
                        turnoverDisplay: '$29.10 B',
                        time: '16:00:02',
                    },
                ],
            });

            render(<MarketWatchlist colorScheme="cn" />);
            expect(screen.getByText('苹果')).toBeDefined();
            expect(screen.getByText('AAPL')).toBeDefined();
            expect(screen.getByText('$336.13')).toBeDefined();
        });
    });

    describe('SectorRotationRadar', () => {
        const mockMacroPhase: MacroCyclePhase = {
            phaseName: '宽货币 + 流动性与风险偏好重估期',
            quadrant: '宽货币+紧信用',
            characteristics: '流动性极度宽裕，场内两融杠杆稳步上升，做多意愿强烈。',
            recommendedStyles: [
                '高弹性科技成长 (AI算力/半导体)',
                '高股息央国企红利 (底仓压舱石)',
            ],
            cautions: [
                '交易拥挤度超 15% 的题材微盘股',
            ],
        };

        const mockSectors: SectorMetric[] = [
            {
                code: 'BK1216',
                name: '医药生物',
                changePct: 4.06,
                turnover: 150000000000,
                turnoverDisplay: '1500.00 亿',
                crowdedness: 7.5,
                crowdednessStatus: 'active',
                mainNetInflow: 67.42,
                mainNetInflowRatio: 4.47,
                superLargeNetInflow: 51.23,
                largeNetInflow: 16.19,
                leadingStockName: '药明康德',
                leadingStockCode: '603259',
            },
            {
                code: 'BK0422',
                name: '煤炭行业',
                changePct: -0.45,
                turnover: 19800000000,
                turnoverDisplay: '198.00 亿',
                crowdedness: 0.99,
                crowdednessStatus: 'cold',
                mainNetInflow: -12.30,
                mainNetInflowRatio: -6.21,
                superLargeNetInflow: -7.50,
                largeNetInflow: -4.80,
                leadingStockName: '中国神华',
                leadingStockCode: '601088',
            },
        ];

        const mockSignals: SectorRotationSignal[] = [
            {
                id: 'sig-1',
                type: 'smart_money_inflow',
                level: 'bullish',
                sectorName: '医药生物',
                title: '🚀 主力资金深度抢筹 (+67.42 亿元)',
                description: '主力超大单与大单集中增仓，领涨标杆药明康德动能强劲。',
                timestamp: '15:30:00',
            },
        ];

        it('should render macro compass, sector flow table, crowdedness meter, and signals', () => {
            render(
                <SectorRotationRadar
                    sectors={mockSectors}
                    macroPhase={mockMacroPhase}
                    signals={mockSignals}
                    colorScheme="cn"
                />
            );

            // 宏观时钟罗盘
            expect(screen.getByText('宏观信用时钟与周期罗盘')).toBeDefined();
            expect(screen.getByText(/宽货币\+紧信用 · 宽货币 \+ 流动性与风险偏好重估期/)).toBeDefined();
            expect(screen.getByText(/高弹性科技成长/)).toBeDefined();

            // 行业主力资金排行榜
            expect(screen.getByText('行业主力资金排行榜')).toBeDefined();
            expect(screen.getAllByText('医药生物').length).toBeGreaterThanOrEqual(1);
            expect(screen.getByText('药明康德')).toBeDefined();
            expect(screen.getByText('+67.42 亿')).toBeDefined();

            // 切换流出 Tab
            fireEvent.click(screen.getByText(/主力净流出 Top/));
            expect(screen.getAllByText('煤炭行业').length).toBeGreaterThanOrEqual(1);
            expect(screen.getByText('中国神华')).toBeDefined();

            // 板块拥挤度红绿灯
            expect(screen.getByText('板块交易拥挤度红绿灯')).toBeDefined();
            expect(screen.getByText('7.5%')).toBeDefined();

            // 轮动信号清单
            expect(screen.getByText('实时捕获的高胜率轮动信号清单')).toBeDefined();
            expect(screen.getByText(/主力资金深度抢筹/)).toBeDefined();

            // 切换到 20年量化回测与胜率检验 Tab
            fireEvent.click(screen.getByText(/20年历史量化回测与胜率检验/));
            expect(screen.getByText(/板块轮动策略历史回测与胜率检验/)).toBeDefined();
            expect(screen.getByText('年化复合收益率 (CAGR)')).toBeDefined();
            expect(screen.getByText('历史年度跑赢胜率')).toBeDefined();
            expect(screen.getByText('历史最大回撤 (MDD)')).toBeDefined();
            expect(screen.getByText(/21 \/ 21 年超额/)).toBeDefined();
            expect(screen.getByText(/夏普 0.76/)).toBeDefined();

            // 切换因子剥离子标签
            fireEvent.click(screen.getByText(/因子剥离实验/));
            expect(screen.getByText(/单靠动量容易死于踩踏/)).toBeDefined();

            // 切换历年明细表子标签
            fireEvent.click(screen.getByText(/20年历年调仓与轮动逻辑明细表/));
            expect(screen.getByText('超额收益 (Alpha)')).toBeDefined();

            // 切换到美股 20年回测
            fireEvent.click(screen.getByText(/美股市场 20年回测/));
            expect(screen.getByText(/美股市场板块轮动策略历史回测与胜率检验/)).toBeDefined();
            expect(screen.getAllByText(/标普500/).length).toBeGreaterThan(0);
        });
    });

    describe('UsSectorRotationRadar', () => {
        const mockUsSectors: UsSectorMetric[] = [
            {
                code: 'XLK',
                rawCode: 'usXLK',
                name: '信息科技 (Technology)',
                nameCn: '信息科技',
                nameEn: 'Technology',
                price: 228.45,
                change: 2.82,
                changePct: 1.25,
                relativeStrength: 1.12,
                macroStyle: 'growth',
                breadth200Sma: 76.5,
                breadthStatus: 'healthy',
                aumDisplay: '$78.5 B',
                leadingHoldings: 'AAPL, NVDA, MSFT',
            },
            {
                code: 'XLF',
                rawCode: 'usXLF',
                name: '金融行业 (Financials)',
                nameCn: '金融行业',
                nameEn: 'Financials',
                price: 47.80,
                change: 0.17,
                changePct: 0.35,
                relativeStrength: 0.22,
                macroStyle: 'cyclical',
                breadth200Sma: 82.0,
                breadthStatus: 'healthy',
                aumDisplay: '$42.1 B',
                leadingHoldings: 'BRK.B, JPM, V',
            },
            {
                code: 'XLU',
                rawCode: 'usXLU',
                name: '公用事业 (Utilities)',
                nameCn: '公用事业',
                nameEn: 'Utilities',
                price: 78.90,
                change: -0.52,
                changePct: -0.65,
                relativeStrength: -0.78,
                macroStyle: 'defensive',
                breadth200Sma: 42.0,
                breadthStatus: 'neutral',
                aumDisplay: '$18.9 B',
                leadingHoldings: 'NEE, SO, DUK',
            },
        ];

        const mockFedCycle: FedPolicyCycle = {
            phaseName: '降息周期 + 软着陆博弈',
            quadrant: '降息+软着陆(成长)',
            us10yYield: 4.28,
            fedRateExpectation: '2025年降息预期稳固',
            yieldCurveSpread: 0.15,
            characteristics: '流动性充裕支持高成长与优质现金流板块',
            recommendedSectors: ['科技信息 (XLK)', '通信服务 (XLC)'],
            cautions: ['能源 (XLE) 周期弱势'],
            historicalWinRate: 75.8,
        };

        const mockDivergence: UsMarketBreadthDivergence = {
            spyPrice: 585.20,
            spyChangePct: 0.45,
            rspPrice: 172.80,
            rspChangePct: -0.12,
            divergencePct: 0.57,
            divergenceStatus: 'mega_cap_dominant',
            divergenceDesc: '当前标普市值权重明显强于等权，资金聚集于巨头。',
        };

        const mockSignals: UsSectorSignal[] = [
            {
                id: 'sig-us-1',
                sectorCode: 'XLK',
                sectorName: '科技信息',
                type: 'momentum_breakout',
                level: 'bullish',
                title: '🚀 科技成长领跑 (相对SPY超额 +1.12%)',
                description: '降息预期下科技龙头估值扩张，动量与均线广度持续走强。',
                timestamp: '16:00:00',
            },
        ];

        it('should render fed cycle compass, divergence card, GICS table, and signals', () => {
            render(
                <UsSectorRotationRadar
                    sectors={mockUsSectors}
                    fedCycle={mockFedCycle}
                    divergence={mockDivergence}
                    signals={mockSignals}
                    colorScheme="us"
                />
            );

            // 美联储利率时钟卡片
            expect(screen.getByText('美联储利率时钟与周期配置罗盘')).toBeDefined();
            expect(screen.getByText('降息+软着陆(成长)')).toBeDefined();
            expect(screen.getByText(/4.28%/)).toBeDefined();
            expect(screen.getByText(/科技信息 \(XLK\)/)).toBeDefined();
            expect(screen.getByText(/能源 \(XLE\) 周期弱势/)).toBeDefined();

            // 标普500市值加权 vs 等权剪刀差
            expect(screen.getByText(/标普500 权重集中度与市场广度剪刀差/)).toBeDefined();
            expect(screen.getByText('$585.20')).toBeDefined();
            expect(screen.getByText('$172.80')).toBeDefined();
            expect(screen.getByText(/大市值领跑/)).toBeDefined();

            // GICS 11 ETF 列表
            expect(screen.getByText(/美股 GICS 11 大行业 ETF 相对强弱动量排行/)).toBeDefined();
            expect(screen.getByText('XLK')).toBeDefined();
            expect(screen.getByText('信息科技')).toBeDefined();
            expect(screen.getByText('XLF')).toBeDefined();

            // 筛选风格
            fireEvent.click(screen.getByRole('button', { name: /🚀 科技成长/ }));
            expect(screen.getByText('XLK')).toBeDefined();
            expect(screen.queryByText('XLF')).toBeNull();

            // 恢复全部
            fireEvent.click(screen.getByRole('button', { name: /全部\(11\)/ }));
            expect(screen.getByText('XLF')).toBeDefined();

            // 轮动信号
            expect(screen.getByText('美股实时高胜率轮动捕捉信号清单')).toBeDefined();
            expect(screen.getByText(/科技成长领跑/)).toBeDefined();

            // 切换到 20年量化回测标签
            fireEvent.click(screen.getByText(/20年美股量化回测与胜率检验/));
            expect(screen.getByText(/板块轮动策略历史回测与胜率检验/)).toBeDefined();
            expect(screen.getByText(/年化复合收益率 \(CAGR\)/)).toBeDefined();
        });

        it('should switch to backtest when bottom banner button is clicked', () => {
            render(
                <UsSectorRotationRadar
                    sectors={mockUsSectors}
                    fedCycle={mockFedCycle}
                    divergence={mockDivergence}
                    signals={mockSignals}
                    colorScheme="us"
                />
            );

            // 点击底部引导栏
            fireEvent.click(screen.getByText(/查看美股 20 年回测与胜率实证 →/));
            expect(screen.getByText(/板块轮动策略历史回测与胜率检验/)).toBeDefined();
        });
    });

    describe('SectorBacktestPanel & Factor Sandbox', () => {
        it('should render backtest summary and switch to parameter sandbox', () => {
            render(<SectorBacktestPanel colorScheme="cn" initialMarket="A" />);

            // Check baseline summary
            expect(screen.getByText(/板块轮动策略历史回测与胜率检验/)).toBeDefined();
            expect(screen.getByText(/年化复合收益率 \(CAGR\)/)).toBeDefined();

            // Switch to sandbox tab
            const sandboxTabBtn = screen.getByRole('button', { name: /策略因子参数沙盘/ });
            fireEvent.click(sandboxTabBtn);

            // Sandbox controls rendered
            expect(screen.getByText(/策略因子参数调节沙盘/)).toBeDefined();
            expect(screen.getByText(/动量回看窗口/)).toBeDefined();
            expect(screen.getByText(/成交占比拥挤度止盈阈值/)).toBeDefined();
            expect(screen.getByText(/持仓行业数量/)).toBeDefined();

            // Toggle lookback window
            const btn90D = screen.getByRole('button', { name: /90天/ });
            fireEvent.click(btn90D);

            // Toggle macro hedge
            const hedgeToggle = screen.getByRole('button', { name: /关闭对冲/ });
            fireEvent.click(hedgeToggle);

            // Verify market switch
            const usMarketBtn = screen.getByRole('button', { name: /美股市场 20年回测/ });
            fireEvent.click(usMarketBtn);
            expect(screen.getByText(/美股市场策略因子参数调节沙盘/)).toBeDefined();
        });
    });

    describe('MarketAiAnalysisModal', () => {
        it('should render modal, switch report types, and allow closing', () => {
            const onClose = vi.fn();
            const { unmount } = render(<MarketAiAnalysisModal visible={true} onClose={onClose} />);

            expect(screen.getByText(/A股与美股跨市场联动 · 每日宏观研报/)).toBeDefined();
            expect(screen.getByRole('button', { name: /🌐 全景宏观联动研报/ })).toBeDefined();
            expect(screen.getByRole('button', { name: /🇨🇳 A股中信轮动专报/ })).toBeDefined();
            expect(screen.getByRole('button', { name: /🇺🇸 美股行业时钟专报/ })).toBeDefined();

            // Switch report types
            fireEvent.click(screen.getByRole('button', { name: /🇨🇳 A股中信轮动专报/ }));
            fireEvent.click(screen.getByRole('button', { name: /🇺🇸 美股行业时钟专报/ }));

            // Click close
            fireEvent.click(screen.getByText('✕'));
            expect(onClose).toHaveBeenCalled();

            unmount();
        });
    });
});
