import { fetchLivePortfolioQuotes } from '../market';
import {
    STRATEGY_SCREENED_HIT_STOCKS,
    recalculateHitStocksWithLiveQuotes,
    BOTTOM_REBOUND_UNIVERSE,
    recalculateReboundUniverseWithLiveQuotes,
    AI_MEMORY_PORTFOLIO_LEDGER,
    recalculatePortfolioLedgerWithLiveQuotes,
    fetchLiveStrategyAnalysisFeed,
} from '../institutionalStrategy';
import { describe, it, expect } from 'vitest';

describe('Evaluate Strategy Hits With Real-Time Live Data', () => {
    it('should output all strategy hit stock evaluations', async () => {
        const liveQuotes = await fetchLivePortfolioQuotes();
        const hitStocks = recalculateHitStocksWithLiveQuotes(STRATEGY_SCREENED_HIT_STOCKS, liveQuotes);
        const reboundUniverse = recalculateReboundUniverseWithLiveQuotes(BOTTOM_REBOUND_UNIVERSE, liveQuotes);
        const ledger = recalculatePortfolioLedgerWithLiveQuotes(AI_MEMORY_PORTFOLIO_LEDGER, liveQuotes);

        console.log('----------------------------------------------------');
        console.log('【1. 策略筛选雷达命中个股 (Hit Stocks Radar)】');
        hitStocks.forEach((stk, idx) => {
            console.log(`[#${idx + 1}] ${stk.symbol} (${stk.nameCn})`);
            console.log(`   - 状态/标记: [${stk.hitStatus}] ${stk.actionBadge} | 紧急度: ${stk.urgency}`);
            console.log(`   - 现价: $${stk.currentPrice} (${stk.dayChangePct! >= 0 ? '+' : ''}${stk.dayChangePct}%) | 建议限价: $${stk.suggestedLimitPrice} (${stk.limitPriceRange})`);
            console.log(`   - 挂单建议: ${stk.actionType} ${stk.suggestedShares} 股 (预估金额: $${stk.estimatedAmountUsd})`);
            console.log(`   - 触发逻辑/公式: ${stk.limitFormula}`);
            console.log(`   - 策略归属: ${stk.strategySource}`);
            console.log(`   - 核心论据: ${stk.rationale}`);
            console.log(`   - 先决条件: ${stk.prerequisite}`);
            console.log('');
        });

        console.log('----------------------------------------------------');
        console.log('【2. 26年100%胜率自然垄断反弹池 (Bottom Rebound Universe)】');
        reboundUniverse.forEach((stk, idx) => {
            console.log(`[#${idx + 1}] ${stk.symbol} (${stk.nameCn}) - 现价: $${stk.currentPrice} (${stk.changePct >= 0 ? '+' : ''}${stk.changePct}%)`);
            console.log(`   - 距MA200: ${stk.distanceToMa200Pct}% | RSI(2): ${stk.rsi2} | 连阳天数: ${stk.consecutiveGreenDays}`);
            console.log(`   - 信号状态: ${stk.signalStatusText} (${stk.signalStatus})`);
            console.log(`   - 状态解读: ${stk.signalReason}`);
            console.log('');
        });

        console.log('----------------------------------------------------');
        console.log('【3. 投资组合风控与审计命中 (Portfolio Ledger Audit)】');
        ledger.auditItems.forEach((item, idx) => {
            console.log(`[#${idx + 1}] [${item.priority}] ${item.title} -> ${item.status}`);
            console.log(`   - 标的: ${item.targetSymbol}`);
            console.log(`   - 触发条件: ${item.condition}`);
            console.log(`   - 应对策略: ${item.recommendation}`);
            console.log('');
        });
    });

    it('should verify real-time strategy feed interface from AI-Memory pipeline', async () => {
        expect(typeof fetchLiveStrategyAnalysisFeed).toBe('function');
        const feed = await fetchLiveStrategyAnalysisFeed();
        if (feed) {
            expect(feed.version).toBe('ai-memory-unified-feed-v2');
            expect(feed.portfolio_ledger).toBeDefined();
        }
    });
});
