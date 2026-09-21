import { create } from 'zustand';
import type {
    MarketIndex,
    StockMetric,
    MacroAsset,
    MarketBreadth,
    ValuationMetric,
    TradingStatus,
    WatchlistStock,
    MarketViewType,
    ColorScheme,
    SectorMetric,
    MacroCyclePhase,
    SectorRotationSignal,
    UsSectorMetric,
    FedPolicyCycle,
    UsMarketBreadthDivergence,
    UsSectorSignal,
} from '../types/market.types';
import {
    fetchAllMarketIndices,
    fetchStockMetrics,
    fetchMacroAssets,
    fetchMarketBreadthCounts,
    fetchMarketCapitalFlow,
    fetchMarginTradingData,
    fetchSectorMetrics,
    fetchUsSectorMetrics,
    calculateMacroCyclePhase,
    calculateFedPolicyCycle,
    generateSectorRotationSignals,
    generateUsSectorSignals,
    calculateMarketBreadth,
    calculateValuationMetrics,
    getTradingStatus,
    fetchWatchlistQuotes,
} from '../api/market';

const WATCHLIST_STORAGE_KEY = 'MARKET_WATCHLIST_ITEMS';
const COLOR_SCHEME_KEY = 'MARKET_COLOR_SCHEME';

// 初始默认自选股标配
const DEFAULT_WATCHLIST: WatchlistStock[] = [
    { code: 'NVDA', rawCode: 'usNVDA', name: '英伟达', market: 'US', addedAt: Date.now() },
    { code: 'AAPL', rawCode: 'usAAPL', name: '苹果', market: 'US', addedAt: Date.now() },
    { code: '600519', rawCode: 'sh600519', name: '贵州茅台', market: 'A', addedAt: Date.now() },
    { code: '300750', rawCode: 'sz300750', name: '宁德时代', market: 'A', addedAt: Date.now() },
    { code: 'BABA', rawCode: 'usBABA', name: '阿里巴巴', market: 'US', addedAt: Date.now() },
    { code: '00700', rawCode: 'hk00700', name: '腾讯控股', market: 'HK', addedAt: Date.now() },
];

function loadSavedWatchlist(): WatchlistStock[] {
    try {
        const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch {
        // ignore
    }
    return DEFAULT_WATCHLIST;
}

function loadSavedColorScheme(): ColorScheme {
    const stored = localStorage.getItem(COLOR_SCHEME_KEY);
    return stored === 'us' ? 'us' : 'cn';
}

interface MarketState {
    indices: MarketIndex[];
    stockMetrics: StockMetric[];
    macroAssets: MacroAsset[];
    breadth: MarketBreadth | null;
    valuations: ValuationMetric[];
    tradingStatus: TradingStatus;
    watchlist: WatchlistStock[];
    watchlistMetrics: StockMetric[];
    sectors: SectorMetric[];
    macroPhase: MacroCyclePhase | null;
    rotationSignals: SectorRotationSignal[];
    usSectors: UsSectorMetric[];
    fedCycle: FedPolicyCycle | null;
    usDivergence: UsMarketBreadthDivergence | null;
    usSignals: UsSectorSignal[];
    isLoading: boolean;
    lastUpdated: string;
    autoRefreshInterval: number; // 0: 暂停, 5, 15, 30, 60
    activeView: MarketViewType;
    colorScheme: ColorScheme;

    // Actions
    fetchAllData: () => Promise<void>;
    refreshWatchlist: () => Promise<void>;
    addToWatchlist: (stock: WatchlistStock) => void;
    removeFromWatchlist: (code: string) => void;
    setAutoRefreshInterval: (interval: number) => void;
    setActiveView: (view: MarketViewType) => void;
    setColorScheme: (scheme: ColorScheme) => void;
}

export const useMarketStore = create<MarketState>((set, get) => ({
    indices: [],
    stockMetrics: [],
    macroAssets: [],
    breadth: null,
    valuations: [],
    tradingStatus: getTradingStatus(),
    watchlist: loadSavedWatchlist(),
    watchlistMetrics: [],
    sectors: [],
    macroPhase: null,
    rotationSignals: [],
    usSectors: [],
    fedCycle: null,
    usDivergence: null,
    usSignals: [],
    isLoading: false,
    lastUpdated: '',
    autoRefreshInterval: 15, // 默认 15 秒自动刷新
    activeView: 'overview',
    colorScheme: loadSavedColorScheme(),

    fetchAllData: async () => {
        set({ isLoading: true });
        try {
            const [
                indices,
                stockMetrics,
                macroAssets,
                breadthCounts,
                capitalFlow,
                marginData,
                rawSectors,
                usSectorResult,
            ] = await Promise.all([
                fetchAllMarketIndices(),
                fetchStockMetrics(),
                fetchMacroAssets(),
                fetchMarketBreadthCounts(),
                fetchMarketCapitalFlow(),
                fetchMarginTradingData(),
                fetchSectorMetrics(),
                fetchUsSectorMetrics(),
            ]);

            const vixAsset = macroAssets.find(m => m.id === 'VIX');
            const vixVal = vixAsset ? vixAsset.value : 21.67;
            const breadth = calculateMarketBreadth(indices, vixVal, breadthCounts, capitalFlow, marginData);
            const valuations = calculateValuationMetrics(indices);
            const tradingStatus = getTradingStatus();
            const macroPhase = calculateMacroCyclePhase(breadth, macroAssets);

            const totalTurnoverYuan = breadth.totalTurnover * 1e8;
            const sectors = rawSectors.map(s => {
                const crowdedness = totalTurnoverYuan > 0
                    ? Number(((s.turnover / totalTurnoverYuan) * 100).toFixed(2))
                    : s.crowdedness;
                let crowdednessStatus: SectorMetric['crowdednessStatus'] = 'normal';
                if (crowdedness >= 10) crowdednessStatus = 'overheat';
                else if (crowdedness >= 5) crowdednessStatus = 'active';
                else if (crowdedness <= 2 && crowdedness > 0) crowdednessStatus = 'cold';
                return { ...s, crowdedness, crowdednessStatus };
            });

            const rotationSignals = generateSectorRotationSignals(sectors, breadth);

            // 美股 GICS 11 大行业轮动与美联储时钟计算
            const fedCycle = calculateFedPolicyCycle(macroAssets);
            const usSignals = generateUsSectorSignals(usSectorResult.sectors, usSectorResult.divergence, fedCycle);

            set({
                indices,
                stockMetrics,
                macroAssets,
                breadth,
                valuations,
                tradingStatus,
                sectors,
                macroPhase,
                rotationSignals,
                usSectors: usSectorResult.sectors,
                fedCycle,
                usDivergence: usSectorResult.divergence,
                usSignals,
                isLoading: false,
                lastUpdated: new Date().toLocaleTimeString(),
            });

            // 联动刷新自选股列表
            get().refreshWatchlist();
        } catch (e) {
            console.error('Failed to fetch market data:', e);
            set({ isLoading: false });
        }
    },

    refreshWatchlist: async () => {
        const { watchlist } = get();
        if (watchlist.length === 0) {
            set({ watchlistMetrics: [] });
            return;
        }
        try {
            const watchlistMetrics = await fetchWatchlistQuotes(watchlist);
            set({ watchlistMetrics });
        } catch (e) {
            console.error('Failed to refresh watchlist:', e);
        }
    },

    addToWatchlist: (stock: WatchlistStock) => {
        const current = get().watchlist;
        if (current.some(item => item.code.toUpperCase() === stock.code.toUpperCase())) {
            return;
        }
        const updated = [stock, ...current];
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
        set({ watchlist: updated });
        get().refreshWatchlist();
    },

    removeFromWatchlist: (code: string) => {
        const current = get().watchlist;
        const updated = current.filter(item => item.code.toUpperCase() !== code.toUpperCase());
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(updated));
        set({
            watchlist: updated,
            watchlistMetrics: get().watchlistMetrics.filter(m => m.code.toUpperCase() !== code.toUpperCase()),
        });
    },

    setAutoRefreshInterval: (interval: number) => {
        set({ autoRefreshInterval: interval });
    },

    setActiveView: (view: MarketViewType) => {
        set({ activeView: view });
    },

    setColorScheme: (scheme: ColorScheme) => {
        localStorage.setItem(COLOR_SCHEME_KEY, scheme);
        set({ colorScheme: scheme });
    },
}));
