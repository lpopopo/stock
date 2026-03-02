import { create } from 'zustand';
import type { MyFund, FundEstimate, FundDetail } from '../types/fund.types';

const STORAGE_KEY = 'my_funds_v1';

function loadFromStorage(): MyFund[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveToStorage(funds: MyFund[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(funds));
}

async function saveToBackend(funds: MyFund[]) {
    try {
        await fetch('/api/funds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(funds)
        });
    } catch (err) {
        console.error('Failed to save funds to backend', err);
    }
}

interface FundStore {
    // 基金列表
    funds: MyFund[];
    // 当前选中基金代码
    selectedCode: string | null;
    // 实时估值缓存 { code -> estimate }
    estimates: Record<string, FundEstimate>;
    // 基金详情缓存 { code -> detail }
    details: Record<string, FundDetail>;
    // 加载状态
    loadingEstimate: Record<string, boolean>;
    loadingDetail: Record<string, boolean>;

    // Actions
    initFunds: () => Promise<void>;
    addFund: (fund: Omit<MyFund, 'addedAt'>) => void;
    removeFund: (code: string) => void;
    selectFund: (code: string) => void;
    setEstimate: (code: string, estimate: FundEstimate) => void;
    setDetail: (code: string, detail: FundDetail) => void;
    setLoadingEstimate: (code: string, loading: boolean) => void;
    setLoadingDetail: (code: string, loading: boolean) => void;
}

export const useFundStore = create<FundStore>((set) => ({
    funds: loadFromStorage(),
    selectedCode: null,
    estimates: {},
    details: {},
    loadingEstimate: {},
    loadingDetail: {},

    initFunds: async () => {
        try {
            const res = await fetch('/api/funds');
            if (res.ok) {
                const data: MyFund[] = await res.json();
                if (data && data.length > 0) {
                    set({ funds: data });
                } else {
                    const localData = loadFromStorage();
                    if (localData && localData.length > 0) {
                        await saveToBackend(localData);
                        set({ funds: localData });
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch funds.json', error);
        }
    },

    addFund: (fund) =>
        set((state) => {
            if (state.funds.find((f) => f.code === fund.code)) return state;
            const newFund: MyFund = { ...fund, addedAt: Date.now() };
            const newFunds = [...state.funds, newFund];
            saveToStorage(newFunds);
            saveToBackend(newFunds);
            return { funds: newFunds };
        }),

    removeFund: (code) =>
        set((state) => {
            const newFunds = state.funds.filter((f) => f.code !== code);
            saveToStorage(newFunds);
            saveToBackend(newFunds);
            return {
                funds: newFunds,
                selectedCode: state.selectedCode === code ? null : state.selectedCode,
            };
        }),

    selectFund: (code) => set({ selectedCode: code }),

    setEstimate: (code, estimate) =>
        set((state) => ({ estimates: { ...state.estimates, [code]: estimate } })),

    setDetail: (code, detail) =>
        set((state) => ({ details: { ...state.details, [code]: detail } })),

    setLoadingEstimate: (code, loading) =>
        set((state) => ({
            loadingEstimate: { ...state.loadingEstimate, [code]: loading },
        })),

    setLoadingDetail: (code, loading) =>
        set((state) => ({
            loadingDetail: { ...state.loadingDetail, [code]: loading },
        })),
}));
