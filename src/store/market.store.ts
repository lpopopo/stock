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
    fetchLivePortfolioQuotes,
    type LivePortfolioQuote,
} from '../api/market';
import { fetchAiMemoryWatchlist } from '../api/institutionalStrategy';



const WATCHLIST_STORAGE_KEY = 'MARKET_WATCHLIST_ITEMS';
const COLOR_SCHEME_KEY = 'MARKET_COLOR_SCHEME';
// 标记 localStorage 是否曾经被 AI-Memory 初始化过，避免重复覆盖用户的增删操作
const WATCHLIST_AI_INIT_KEY = 'MARKET_WATCHLIST_AI_INIT';

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
    return [];  // 空列表：等 AI-Memory feed 异步填充
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
    livePortfolioQuotes: Record<string, LivePortfolioQuote>;
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
    livePortfolioQuotes: {},
    isLoading: false,
    lastUpdated: '',
    autoRefreshInterval: 15, // 默认 15 秒自动刷新
    activeView: 'portfolio',
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
                livePortfolioQuotes,
            ] = await Promise.all([
                fetchAllMarketIndices(),
                fetchStockMetrics(),
                fetchMacroAssets(),
                fetchMarketBreadthCounts(),
                fetchMarketCapitalFlow(),
                fetchMarginTradingData(),
                fetchSectorMetrics(),
                fetchUsSectorMetrics(),
                fetchLivePortfolioQuotes(),
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
                livePortfolioQuotes,
                isLoading: false,
                lastUpdated: new Date().toLocaleTimeString(),
            });

            // 若用户从未初始化过自选池（localStorage 为空），则从 AI-Memory Feed 加载自选池
            const hasAiInit = localStorage.getItem(WATCHLIST_AI_INIT_KEY);
            const currentWatchlist = get().watchlist;
            if (!hasAiInit && currentWatchlist.length === 0) {
                try {
                    const aiWatchlist = await fetchAiMemoryWatchlist();
                    if (aiWatchlist.length > 0) {
                        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(aiWatchlist));
                        localStorage.setItem(WATCHLIST_AI_INIT_KEY, '1');
                        set({ watchlist: aiWatchlist });
                        console.log(`[AI-Memory] 自选池已从 AI-Memory 初始化，共 ${aiWatchlist.length} 只标的`);
                    }
                } catch (e) {
                    console.warn('[AI-Memory] 自选池初始化失败，将保持空列表：', e);
                }
            }

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
