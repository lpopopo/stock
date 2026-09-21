/**
 * 回测策略快照预设工具库
 * 提供内置三套预设 + 用户自定义预设的 localStorage 持久化管理
 */

import type { BacktestSandboxParams } from '../api/backtest';

export interface BacktestPreset {
    id: string;
    name: string;
    icon: string;
    description: string;
    style: 'aggressive' | 'balanced' | 'defensive' | 'custom';
    params: BacktestSandboxParams;
    isBuiltIn: boolean;
    createdAt?: number;
}

const PRESET_STORAGE_KEY = 'BACKTEST_CUSTOM_PRESETS';

// ── 内置三套预设（不可删除）─────────────────────────────────────────────────

export const BUILT_IN_PRESETS_A: BacktestPreset[] = [
    {
        id: 'builtin_aggressive_a',
        name: '激进动量',
        icon: '⚡',
        description: '短窗口高频捕捉主升浪，适合明确单边牛市',
        style: 'aggressive',
        params: {
            market: 'A',
            lookbackDays: 30,
            crowdednessThreshold: 14,
            portfolioSize: 1,
            macroFilterEnabled: false,
            rebalanceFreq: 'biweekly',
        },
        isBuiltIn: true,
    },
    {
        id: 'builtin_balanced_a',
        name: '稳健趋势',
        icon: '⚖️',
        description: '60日黄金窗口 + 拥挤度保护，攻守兼备（基准最优）',
        style: 'balanced',
        params: {
            market: 'A',
            lookbackDays: 60,
            crowdednessThreshold: 12,
            portfolioSize: 2,
            macroFilterEnabled: true,
            rebalanceFreq: 'monthly',
        },
        isBuiltIn: true,
    },
    {
        id: 'builtin_defensive_a',
        name: '防御均衡',
        icon: '🛡️',
        description: '宽窗口分散持仓，熊市控回撤优先，牺牲部分弹性',
        style: 'defensive',
        params: {
            market: 'A',
            lookbackDays: 90,
            crowdednessThreshold: 10,
            portfolioSize: 3,
            macroFilterEnabled: true,
            rebalanceFreq: 'quarterly',
        },
        isBuiltIn: true,
    },
];

export const BUILT_IN_PRESETS_US: BacktestPreset[] = [
    {
        id: 'builtin_aggressive_us',
        name: '激进动量',
        icon: '⚡',
        description: '短窗口高频轮动 GICS，适合美联储宽松+科技大周期',
        style: 'aggressive',
        params: {
            market: 'US',
            lookbackDays: 30,
            crowdednessThreshold: 88,
            portfolioSize: 1,
            macroFilterEnabled: false,
            rebalanceFreq: 'biweekly',
        },
        isBuiltIn: true,
    },
    {
        id: 'builtin_balanced_us',
        name: '稳健趋势',
        icon: '⚖️',
        description: '美联储时钟主导 + 市场宽度过热保护，黄金参数',
        style: 'balanced',
        params: {
            market: 'US',
            lookbackDays: 60,
            crowdednessThreshold: 80,
            portfolioSize: 2,
            macroFilterEnabled: true,
            rebalanceFreq: 'monthly',
        },
        isBuiltIn: true,
    },
    {
        id: 'builtin_defensive_us',
        name: '防御均衡',
        icon: '🛡️',
        description: '季度调仓 + 分散持仓，衰退期优先控回撤',
        style: 'defensive',
        params: {
            market: 'US',
            lookbackDays: 90,
            crowdednessThreshold: 72,
            portfolioSize: 3,
            macroFilterEnabled: true,
            rebalanceFreq: 'quarterly',
        },
        isBuiltIn: true,
    },
];

// ── localStorage 自定义预设管理 ───────────────────────────────────────────

export function loadCustomPresets(): BacktestPreset[] {
    try {
        const raw = localStorage.getItem(PRESET_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as BacktestPreset[];
    } catch {
        // ignore parse error
    }
    return [];
}

export function saveCustomPreset(preset: BacktestPreset): void {
    const existing = loadCustomPresets();
    const idx = existing.findIndex(p => p.id === preset.id);
    if (idx >= 0) {
        existing[idx] = preset;
    } else {
        existing.push(preset);
    }
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(existing));
}

export function deleteCustomPreset(id: string): void {
    const existing = loadCustomPresets().filter(p => p.id !== id);
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(existing));
}

/** 获取当前市场的全部可用预设（内置 + 自定义） */
export function getAllPresets(market: 'A' | 'US'): BacktestPreset[] {
    const builtIn = market === 'A' ? BUILT_IN_PRESETS_A : BUILT_IN_PRESETS_US;
    const custom = loadCustomPresets().filter(p => p.params.market === market);
    return [...builtIn, ...custom];
}

/** 生成自定义预设 ID */
export function generatePresetId(): string {
    return `custom_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/** 根据参数猜测风格标签 */
export function guessPresetStyle(params: BacktestSandboxParams): BacktestPreset['style'] {
    if (params.lookbackDays <= 30 && params.portfolioSize === 1) return 'aggressive';
    if (params.lookbackDays >= 90 && params.portfolioSize >= 3 && params.macroFilterEnabled) return 'defensive';
    return 'balanced';
}

/** 格式化参数摘要（单行文本描述） */
export function formatParamSummary(params: BacktestSandboxParams): string {
    const mkt = params.market === 'A' ? 'A股' : '美股';
    const freq = params.rebalanceFreq === 'biweekly' ? '双周' : params.rebalanceFreq === 'monthly' ? '月度' : '季度';
    const hedge = params.macroFilterEnabled ? '开启对冲' : '纯动量';
    return `${mkt} · ${params.lookbackDays}日窗口 · 持仓${params.portfolioSize}板块 · ${freq}调仓 · ${hedge}`;
}
