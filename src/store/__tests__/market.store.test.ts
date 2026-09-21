import { describe, it, expect, beforeEach } from 'vitest';
import { useMarketStore } from '../market.store';

describe('Market Zustand Store', () => {
    beforeEach(() => {
        localStorage.clear();
        useMarketStore.setState({
            activeView: 'overview',
            colorScheme: 'cn',
            autoRefreshInterval: 15,
            watchlist: [
                { code: 'NVDA', rawCode: 'usNVDA', name: '英伟达', market: 'US', addedAt: 1000 },
            ],
            watchlistMetrics: [],
        });
    });

    it('should initialize with default state', () => {
        const state = useMarketStore.getState();
        expect(state.activeView).toBe('overview');
        expect(state.colorScheme).toBe('cn');
        expect(state.autoRefreshInterval).toBe(15);
        expect(state.watchlist.length).toBe(1);
    });

    it('should switch active view', () => {
        const { setActiveView } = useMarketStore.getState();
        setActiveView('a_share');
        expect(useMarketStore.getState().activeView).toBe('a_share');

        setActiveView('us_stock');
        expect(useMarketStore.getState().activeView).toBe('us_stock');

        setActiveView('valuation');
        expect(useMarketStore.getState().activeView).toBe('valuation');

        setActiveView('watchlist');
        expect(useMarketStore.getState().activeView).toBe('watchlist');
    });

    it('should toggle and persist color scheme', () => {
        const { setColorScheme } = useMarketStore.getState();
        setColorScheme('us');
        expect(useMarketStore.getState().colorScheme).toBe('us');
        expect(localStorage.getItem('MARKET_COLOR_SCHEME')).toBe('us');

        setColorScheme('cn');
        expect(useMarketStore.getState().colorScheme).toBe('cn');
        expect(localStorage.getItem('MARKET_COLOR_SCHEME')).toBe('cn');
    });

    it('should update auto refresh interval', () => {
        const { setAutoRefreshInterval } = useMarketStore.getState();
        setAutoRefreshInterval(30);
        expect(useMarketStore.getState().autoRefreshInterval).toBe(30);

        setAutoRefreshInterval(0); // 暂停
        expect(useMarketStore.getState().autoRefreshInterval).toBe(0);
    });

    it('should add new stock to watchlist and persist to localStorage', () => {
        const { addToWatchlist } = useMarketStore.getState();
        addToWatchlist({
            code: '600519',
            rawCode: 'sh600519',
            name: '贵州茅台',
            market: 'A',
            addedAt: 2000,
        });

        const updated = useMarketStore.getState().watchlist;
        expect(updated.length).toBe(2);
        expect(updated[0].code).toBe('600519');

        const stored = JSON.parse(localStorage.getItem('MARKET_WATCHLIST_ITEMS') || '[]');
        expect(stored.length).toBe(2);
        expect(stored[0].code).toBe('600519');
    });

    it('should ignore duplicate stock when adding to watchlist', () => {
        const { addToWatchlist } = useMarketStore.getState();
        addToWatchlist({
            code: 'NVDA',
            rawCode: 'usNVDA',
            name: '英伟达',
            market: 'US',
            addedAt: 3000,
        });

        expect(useMarketStore.getState().watchlist.length).toBe(1);
    });

    it('should remove stock from watchlist and persist to localStorage', () => {
        const { removeFromWatchlist } = useMarketStore.getState();
        removeFromWatchlist('NVDA');

        expect(useMarketStore.getState().watchlist.length).toBe(0);
        const stored = JSON.parse(localStorage.getItem('MARKET_WATCHLIST_ITEMS') || '[]');
        expect(stored.length).toBe(0);
    });
});
