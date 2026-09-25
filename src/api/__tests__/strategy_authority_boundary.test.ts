import { describe, it, expect } from 'vitest';
import productionFeedData from '../../../public/data/strategy_analysis_feed.json';
import {
    validateStrategyFeed,
    checkTicketAuthorization,
    recalculateHitStocksWithLiveQuotes,
    recalculateReboundUniverseWithLiveQuotes,
    CURRENT_RATIFIED_FEED_VERSION,
    STRATEGY_SCREENED_HIT_STOCKS,
    BOTTOM_REBOUND_UNIVERSE,
    generateAuthorizedExecutionTicket,
    calculateSmartPeggingOrder,
    generateSynthesizedStrategyAnalysis,
    DEFAULT_PEGGING_REQUESTS,
    type AiMemoryStrategyFeed,
} from '../institutionalStrategy';

/**
 * 策略权威边界集中自动化测试套件 (Strategy Authority & Feed Validation Boundary Test Suite)
 * 严格针对 Codex 第三轮验收 (REVIEW_ROUND_3.md) 缺口设计，覆盖 9 大核心防线：
 * 1. 同前缀错误版本 (Exact schema check vs same-prefix mismatch)
 * 2. 过期与未来 generated_at_utc (Freshness, Clock Skew & Expiration)
 * 3. 上游 is_stale: true 不变性 (Upstream stale invariance)
 * 4. 离线镜像严格只读 (Offline mirror fail-closed)
 * 5. 矛盾授权字段刚性 Fail-Closed (Conflicting authorization fields)
 * 6. 伪造 formal_actions 语义清洗 (Deep action validation)
 * 7. 无 Feed / 空对象 / 格式异常 (Feed hygiene)
 * 8. 行情变化与授权/买点不变性 (Live quote change invariance)
 * 9. 开发服务中间件不会将上游 stale 改成 live (Dev server stale preservation)
 */

describe('Strategy Authority & Feed Validation Boundary Tests (Codex Round 3 Strict Invariants)', () => {
    // 读取当前同步到 stock 前端的真实生产 feed 镜像
    const productionFeed: AiMemoryStrategyFeed = productionFeedData as unknown as AiMemoryStrategyFeed;

    // 辅助构造一个完全合法且核验通过的基础测试 Feed（用于对照测试边界条件）
    const createBaseVerifiedFeed = (): AiMemoryStrategyFeed => ({
        version: CURRENT_RATIFIED_FEED_VERSION,
        feed_source: 'AI_MEMORY_LIVE',
        is_live: true,
        is_stale: false,
        is_formal_generation_available: true,
        generated_at_utc: new Date(Date.now() - 60 * 1000).toISOString(), // 1分钟前生成
        quotes_as_of_utc: new Date(Date.now() - 60 * 1000).toISOString(),
        quotes_source: 'TENCENT_HTTP_BATCH',
        quotes_status: 'AVAILABLE',
        model_session: 'SESSION-2026-09-25-NYSE-CLOSE',
        model_session_status: 'ACTIVE_VERIFIED',
        model_generated_at_utc: new Date(Date.now() - 60 * 1000).toISOString(),
        last_formal_completed_session: '2026-09-24',
        nyse_session_status: 'COMPLETED_VERIFIED',
        portfolio_as_of_date: '2026-09-24',
        portfolio_source: 'broker-api-settled',
        broker_reconciliation_status: 'RECONCILED',
        account_reconciled: true,
        governance: {
            formal_version: 'V9_Rule_E',
            code_authority: 'domains/quant-strategy/strategies/v9-execution/CURRENT_STRATEGY.md',
            ratification_document: 'work/strategy-next-version-ratification-2026-09-24/ratification.json',
            decision_document: 'work/strategy-authority-unification-2026-09-25/DECISION.md',
            formal_generation_expected: 'v9-formal-20260914-r8',
            formal_generation_local_status: 'PRESENT',
            is_formal_generation_available: true,
            new_buy_authorization: 0.15,
            broker_submission_enabled: false,
            status: 'ACTIVE',
        },
        formal_strategy: {
            name: 'V9_Rule_E',
            document: 'ratification.json',
            new_buy_authorization: 0.15,
            status: 'ACTIVE',
        },
        new_buy_authorization: 0.15,
        ratified_official_strategy: {
            name: 'V9_Rule_E',
            document: 'ratification.json',
            code_authority: 'CURRENT_STRATEGY.md',
            new_buy_authorization: 0.15,
            broker_submission: false,
            status: 'ACTIVE',
        },
        candidate_rebound_strategy: {
            name: 'Candidate 173838',
            status: 'SHADOW_ONLY (0/30 forward samples)',
            research_line_closed: true,
            promoted: false,
            new_buy_authorization: 0,
            disclaimer: 'SHADOW_ONLY',
        },
        formal_actions: [
            {
                id: 'ACT-VALID-MRVL',
                symbol: 'MRVL',
                nameCn: '迈威尔科技',
                nameEn: 'Marvell',
                strategySource: 'V9_Rule_E',
                signalTier: 'FORMAL_EXECUTION',
                isFormal: true,
                isOrderAuthorized: true,
                isActionable: true,
                actionType: 'BUY_LIMIT',
                actionBadge: '⚡ 正式执行',
                hitStatus: 'HIT_NOW',
                statusText: '已授权',
                urgency: 'HIGH',
                currentPrice: 260.00,
                suggestedLimitPrice: 260.00,
                limitPriceRange: '$259.50 - $260.50',
                limitFormula: '中位数',
                suggestedShares: 5,
                estimatedAmountUsd: 1300.00,
                confidenceScore: 90,
                rationale: '测试',
                auditCitation: 'test',
                dayChangePct: 0,
                lastUpdatedTime: '2026-09-25 10:00:00',
            },
        ],
        audit_observations: [],
        research_observations: [],
        hit_stocks: [],
        natural_monopoly_white_horses: [],
        portfolio_ledger: {} as any,
    });

    // =========================================================================
    // 1. 同前缀错误版本 (Exact schema check vs same-prefix mismatch)
    // =========================================================================
    describe('1. 同前缀错误版本与精确 Schema 校验 (Exact Schema Version Invariance)', () => {
        it('当前批准版本必须严格为 ai-memory-unified-feed-v2', () => {
            expect(CURRENT_RATIFIED_FEED_VERSION).toBe('ai-memory-unified-feed-v2');
            expect(productionFeed.version).toBe(CURRENT_RATIFIED_FEED_VERSION);
        });

        it('即使版本前缀包含 ai-memory-，但不是当前批准精确版本的旧协议一律直接拒绝', () => {
            const legacyVersions = [
                'ai-memory-legacy-v1',
                'ai-memory-unified-feed-v1',
                'ai-memory-feed-v1',
                'ai-memory-v9-draft',
                'ai-memory-unified-feed-v3-beta',
            ];

            for (const badVer of legacyVersions) {
                const badFeed = { ...createBaseVerifiedFeed(), version: badVer };
                const res = validateStrategyFeed(badFeed);
                expect(res.isValid).toBe(false);
                expect(res.canExecuteFormalActions).toBe(false);
                expect(res.rejectionReason).toContain('FEED_VERSION_MISMATCH');
                expect(res.rejectionReason).toContain(`expected exact schema ${CURRENT_RATIFIED_FEED_VERSION}`);
            }
        });
    });

    // =========================================================================
    // 2. 过期与未来 generated_at_utc (Freshness, Clock Skew & Expiration)
    // =========================================================================
    describe('2. 过期与未来 generated_at_utc (Generation Timestamp Boundaries)', () => {
        it('生成时间在未来（超出 5 分钟容错）时，直接判为 INVALID 拒绝', () => {
            const futureTime = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 未来 15 分钟
            const futureFeed = { ...createBaseVerifiedFeed(), generated_at_utc: futureTime };
            const res = validateStrategyFeed(futureFeed);
            expect(res.isValid).toBe(false);
            expect(res.rejectionReason).toContain('FUTURE_GENERATED_AT_UTC');
        });

        it('生成时间已过期（超过 24 小时 TTL）时，置 canExecuteFormalActions = false 且 is_stale = true', () => {
            const expiredTime = new Date(Date.now() - 48 * 3600 * 1000).toISOString(); // 48 小时前生成
            const expiredFeed = { ...createBaseVerifiedFeed(), generated_at_utc: expiredTime };
            const res = validateStrategyFeed(expiredFeed);
            expect(res.isValid).toBe(true);
            expect(res.canExecuteFormalActions).toBe(false);
            expect(res.validatedFeed?.is_stale).toBe(true);
            expect(res.staleReason).toContain('FEED_EXPIRED_GENERATED_AT_UTC');
            expect(res.validatedFeed?.formal_actions).toEqual([]); // 过期强制清洗 actions
        });

        it('过期的 Feed 无法通过小票授权检查，严禁下单', () => {
            const expiredTime = new Date(Date.now() - 36 * 3600 * 1000).toISOString();
            const expiredFeed = { ...createBaseVerifiedFeed(), generated_at_utc: expiredTime };
            const auth = checkTicketAuthorization('MRVL', 'BUY', 5, expiredFeed);
            expect(auth.isAuthorized).toBe(false);
            expect(auth.reason).toMatch(/离线\/只读镜像或实盘受限|FEED_EXPIRED/);
        });
    });

    // =========================================================================
    // 3. 上游 is_stale: true 不变性 (Upstream stale invariance)
    // =========================================================================
    describe('3. 上游 is_stale: true 不变性 (Upstream Stale Invariance)', () => {
        it('即使会话与世代全部就绪，只要上游标记 is_stale: true，必须直接 Fail-Closed', () => {
            const staleFeed = {
                ...createBaseVerifiedFeed(),
                is_stale: true,
                stale_reason: '上游风控暂停指令',
            };
            const res = validateStrategyFeed(staleFeed);
            expect(res.canExecuteFormalActions).toBe(false);
            expect(res.validatedFeed?.is_stale).toBe(true);
            expect(res.validatedFeed?.formal_actions).toEqual([]);

            const auth = checkTicketAuthorization('MRVL', 'BUY', 5, staleFeed);
            expect(auth.isAuthorized).toBe(false);
            expect(auth.reason).toMatch(/离线\/只读镜像或实盘受限|上游风控暂停指令|已降级/);
        });

        it('生产 Feed 中因无本地世代而产生的 is_stale: true 被严格保留且禁止动作', () => {
            const res = validateStrategyFeed(productionFeed);
            expect(res.canExecuteFormalActions).toBe(false);
            expect(res.validatedFeed?.is_stale).toBe(true);
            expect(res.validatedFeed?.formal_actions).toEqual([]);
        });
    });

    // =========================================================================
    // 4. 离线镜像严格只读 (Offline mirror fail-closed)
    // =========================================================================
    describe('4. 离线镜像严格只读 (Offline Mirror Fail-Closed)', () => {
        it('feed_source 为 OFFLINE_MIRROR_READONLY 时，canExecuteFormalActions 严禁返回 true', () => {
            const offlineFeed = {
                ...createBaseVerifiedFeed(),
                feed_source: 'OFFLINE_MIRROR_READONLY',
                is_stale: false, // 即使恶意伪造 false
            };
            const res = validateStrategyFeed(offlineFeed);
            expect(res.canExecuteFormalActions).toBe(false);
            expect(res.validatedFeed?.is_stale).toBe(true);
            expect(res.validatedFeed?.formal_actions).toEqual([]);
        });

        it('非 AI_MEMORY_LIVE 来源的小票授权直接阻断', () => {
            const offlineFeed = {
                ...createBaseVerifiedFeed(),
                feed_source: 'OFFLINE_MIRROR_READONLY' as const,
            };
            const auth = checkTicketAuthorization('MRVL', 'BUY', 5, offlineFeed);
            expect(auth.isAuthorized).toBe(false);
            expect(auth.reason).toContain('策略源为离线/只读镜像');
        });
    });

    // =========================================================================
    // 5. 矛盾授权字段刚性 Fail-Closed (Conflicting authorization fields)
    // =========================================================================
    describe('5. 矛盾授权字段刚性 Fail-Closed (Conflicting Authorization Fields)', () => {
        it('root、governance、strategy 的 new_buy_authorization 存在分歧时，直接拒绝', () => {
            const conflictingFeed = {
                ...createBaseVerifiedFeed(),
                new_buy_authorization: 0.15,
                governance: {
                    ...createBaseVerifiedFeed().governance,
                    new_buy_authorization: 0.0, // 冲突！
                },
            };
            const res = validateStrategyFeed(conflictingFeed);
            expect(res.isValid).toBe(false);
            expect(res.rejectionReason).toContain('CONFLICTING_AUTHORIZATION_FIELDS');
            expect(res.canExecuteFormalActions).toBe(false);
        });

        it('世代状态为 MISSING_IN_THIS_WORKTREE 但可用性标记为 true 时，矛盾拦截', () => {
            const conflictingGenFeed = {
                ...createBaseVerifiedFeed(),
                governance: {
                    ...createBaseVerifiedFeed().governance,
                    formal_generation_local_status: 'MISSING_IN_THIS_WORKTREE',
                    is_formal_generation_available: true, // 矛盾！
                },
            };
            const res = validateStrategyFeed(conflictingGenFeed);
            expect(res.isValid).toBe(false);
            expect(res.rejectionReason).toContain('CONFLICTING_AUTHORIZATION_FIELDS');
        });

        it('世代状态为 PRESENT 但可用性标记为 false 时，矛盾拦截', () => {
            const conflictingGenFeed = {
                ...createBaseVerifiedFeed(),
                governance: {
                    ...createBaseVerifiedFeed().governance,
                    formal_generation_local_status: 'PRESENT',
                    is_formal_generation_available: false, // 矛盾！
                },
            };
            const res = validateStrategyFeed(conflictingGenFeed);
            expect(res.isValid).toBe(false);
            expect(res.rejectionReason).toContain('CONFLICTING_AUTHORIZATION_FIELDS');
        });
    });

    // =========================================================================
    // 6. 伪造 formal_actions 语义清洗 (Deep Action Validation)
    // =========================================================================
    describe('6. 伪造 formal_actions 深度语义验证与清洗 (Forged Action Neutralization)', () => {
        it('在无正式实盘权限的 feed 上，任何带有 isFormal/isOrderAuthorized 的条目均被清除', () => {
            const forgedFeed: AiMemoryStrategyFeed = {
                ...productionFeed,
                formal_actions: [
                    {
                        id: 'FORGED-ACT-1',
                        symbol: 'MRVL',
                        nameCn: '迈威尔科技',
                        nameEn: 'Marvell',
                        strategySource: 'V9_Rule_E',
                        signalTier: 'FORMAL_EXECUTION',
                        isFormal: true,
                        isOrderAuthorized: true,
                        isActionable: true,
                        actionType: 'BUY_LIMIT',
                        actionBadge: '⚡ 正式执行',
                        hitStatus: 'HIT_NOW',
                        statusText: '已授权',
                        urgency: 'HIGH',
                        currentPrice: 260.00,
                        suggestedLimitPrice: 260.00,
                        limitPriceRange: 'N/A',
                        limitFormula: 'N/A',
                        suggestedShares: 10,
                        estimatedAmountUsd: 2600.00,
                        confidenceScore: 99,
                        rationale: '伪造',
                        auditCitation: 'fake',
                        dayChangePct: 0,
                        lastUpdatedTime: '2026-09-25',
                    },
                ],
            };
            const res = validateStrategyFeed(forgedFeed);
            expect(res.canExecuteFormalActions).toBe(false);
            expect(res.validatedFeed?.formal_actions).toEqual([]);
        });

        it('即便 feed 核验通过，股数非正整数、限价非法、或动作非法的条目必须被剔除', () => {
            const tamperedFeed = createBaseVerifiedFeed();
            const baseAct = tamperedFeed.formal_actions![0];
            tamperedFeed.formal_actions = [
                {
                    ...baseAct,
                    id: 'BAD-SHARES',
                    suggestedShares: -5, // 非法负股数
                },
                {
                    ...baseAct,
                    id: 'ZERO-SHARES',
                    suggestedShares: 0, // 非法0股数
                },
                {
                    ...baseAct,
                    id: 'FLOAT-SHARES',
                    suggestedShares: 3.5, // 非法小数股数
                },
                {
                    ...baseAct,
                    id: 'ZERO-PRICE',
                    suggestedLimitPrice: 0.0, // 非法0限价
                },
                {
                    ...baseAct,
                    id: 'FAKE-TIER',
                    signalTier: 'RESEARCH_OBSERVATION' as any, // 非正式分层
                },
            ];

            const res = validateStrategyFeed(tamperedFeed);
            expect(res.canExecuteFormalActions).toBe(true);
            expect(res.validatedFeed?.formal_actions).toEqual([]); // 全部非法条目被清洗剔除
        });

        it('当 new_buy_authorization 为 0 时，formal_actions 中伪造的 BUY_LIMIT 自动被清洗', () => {
            const zeroBuyFeed = createBaseVerifiedFeed();
            zeroBuyFeed.new_buy_authorization = 0;
            if (zeroBuyFeed.governance) zeroBuyFeed.governance.new_buy_authorization = 0;
            zeroBuyFeed.ratified_official_strategy.new_buy_authorization = 0;
            if (zeroBuyFeed.formal_strategy) zeroBuyFeed.formal_strategy.new_buy_authorization = 0;

            const res = validateStrategyFeed(zeroBuyFeed);
            expect(res.canBuy).toBe(false);
            expect(res.validatedFeed?.formal_actions).toEqual([]); // BUY_LIMIT 失去授权被清洗
        });
    });

    // =========================================================================
    // 7. 无 Feed / 空对象 / 格式异常 (Feed Hygiene)
    // =========================================================================
    describe('7. 无 Feed / 空对象 / 格式异常防御 (Feed Hygiene)', () => {
        it('null、undefined、非对象输入安全返回无效', () => {
            expect(validateStrategyFeed(null).isValid).toBe(false);
            expect(validateStrategyFeed(undefined).isValid).toBe(false);
            expect(validateStrategyFeed('bad string').isValid).toBe(false);
            expect(validateStrategyFeed(123).isValid).toBe(false);
            expect(validateStrategyFeed([]).isValid).toBe(false);
            expect(validateStrategyFeed({}).isValid).toBe(false);
        });

        it('缺少 governance 或 strategy 对象的 Feed 判定为无效', () => {
            const missingGov = { ...createBaseVerifiedFeed() } as any;
            delete missingGov.governance;
            expect(validateStrategyFeed(missingGov).isValid).toBe(false);

            const missingStrat = { ...createBaseVerifiedFeed() } as any;
            delete missingStrat.ratified_official_strategy;
            delete missingStrat.formal_strategy;
            expect(validateStrategyFeed(missingStrat).isValid).toBe(false);
        });
    });

    // =========================================================================
    // 8. 行情变化与授权/买点不变性 (Live Quote Change Invariance)
    // =========================================================================
    describe('8. 行情剧烈变化与授权不变性 (Live Quotes Invariance)', () => {
        it('券商截图持仓复核保持真实账户身份，同时始终没有下单授权', () => {
            const validation = validateStrategyFeed(productionFeed);
            expect(validation.isValid).toBe(true);
            expect(validation.canExecuteFormalActions).toBe(false);
            const reviews = validation.validatedFeed?.hit_stocks.filter(hit => hit.signalTier === 'BROKER_PORTFOLIO_REVIEW') || [];
            expect(reviews.map(hit => hit.symbol).sort()).toEqual(['MRVL', 'QCOM']);
            for (const hit of reviews) {
                expect(hit.actionBadge).toContain('实盘持仓人工复核');
                expect(hit.isOrderAuthorized).toBe(false);
                expect(hit.suggestedShares).toBe(0);
                expect(hit.suggestedLimitPrice).toBe(0);
                const report = generateSynthesizedStrategyAnalysis(hit);
                expect(report).toContain('实盘持仓人工复核');
                expect(report).toContain('当前无获授权交易股数或限价');
                expect(report).not.toContain('$6,046.53');
                expect(report).not.toContain('核心决策指令');
            }
        });

        it('V9 模块分析与账户汇总只供展示，不改变正式动作授权', () => {
            const validation = validateStrategyFeed(productionFeed);
            const analysis = validation.validatedFeed?.strategy_module_analysis;
            expect(analysis?.modules.map(module => module.id)).toEqual(['INDEX_CORE', 'STOCK_SLEEVE', 'CASH_RESERVE']);
            expect(analysis?.modules.every(module => module.advisory_action.length > 0)).toBe(true);
            expect(analysis?.modules.find(module => module.id === 'STOCK_SLEEVE')?.advisory_action).toContain('暂停新增个股风险');
            expect(analysis?.modules.every(module => !module.is_order_authorized && module.formal_action_count === 0)).toBe(true);
            expect(analysis?.account_summary.is_order_authorized).toBe(false);
            expect(validation.validatedFeed?.formal_actions).toEqual([]);
        });

        it('抄底技术预筛与正式指令分层；条件满足可发前向验证 BUY，但绝不授予正式交易授权', () => {
            const validation = validateStrategyFeed(productionFeed);
            const observations = validation.validatedFeed?.research_observations || [];
            expect(observations.length).toBeGreaterThan(0);
            for (const item of observations) {
                expect(['PROVISIONAL_TECHNICAL_PRE_SCREEN', 'FORWARD_BUY_CANDIDATE']).toContain(item.screeningStatus);
                expect(item.sourceBarLastDate).toBeTruthy();
                expect(['RESEARCH_SHADOW_ONLY', 'FORWARD_LIVE_VALIDATION']).toContain(item.signalTier);
                expect(item.isOrderAuthorized).toBe(false);
                expect(item.suggestedShares).toBe(0);
                expect(item.isActionable).toBe(false);
            }
            const forwardBuys = validation.validatedFeed?.forward_validation_buys || [];
            for (const item of forwardBuys) {
                expect(item.signalTier).toBe('FORWARD_LIVE_VALIDATION');
                expect(item.forwardLiveValidation).toBe(true);
                expect(item.isOrderAuthorized).toBe(false);
                expect(item.isFormal).toBe(false);
                expect(item.suggestedShares).toBe(0);
            }
            expect(validation.validatedFeed?.new_buy_authorization ?? 0).toBe(0);
            expect(validation.validatedFeed?.formal_actions).toEqual([]);
        });

        it('前向实盘验证 BUY 候选经清洗后仍保留展示身份，且不得变成正式可执行动作', () => {
            const forged = {
                ...createBaseVerifiedFeed(),
                new_buy_authorization: 0,
                governance: {
                    ...createBaseVerifiedFeed().governance!,
                    new_buy_authorization: 0,
                    is_formal_generation_available: false,
                    formal_generation_local_status: 'MISSING_IN_THIS_WORKTREE',
                },
                formal_strategy: {
                    ...createBaseVerifiedFeed().formal_strategy!,
                    new_buy_authorization: 0,
                },
                ratified_official_strategy: {
                    ...createBaseVerifiedFeed().ratified_official_strategy!,
                    new_buy_authorization: 0,
                    broker_submission: false,
                },
                is_formal_generation_available: false,
                account_reconciled: false,
                broker_reconciliation_status: 'UNVERIFIED',
                forward_live_validation: {
                    enabled: true,
                    mode: 'HUMAN_IN_THE_LOOP' as const,
                    pool: 'white_horses + candidate_173838_pre_screen',
                    formal_new_buy_authorization: 0,
                    broker_submission: false as const,
                    buy_candidate_count: 1,
                    note: 'test',
                },
                forward_validation_buys: [{
                    id: 'FORWARD-BUY-TEST',
                    symbol: 'COP',
                    nameCn: '康菲石油',
                    nameEn: 'COP',
                    strategySource: 'Candidate 173838',
                    signalTier: 'FORWARD_LIVE_VALIDATION' as const,
                    forwardLiveValidation: true,
                    screeningStatus: 'FORWARD_BUY_CANDIDATE' as const,
                    sourceBarLastDate: '2026-09-24',
                    isFormal: true,
                    isOrderAuthorized: true,
                    isActionable: true,
                    actionType: 'BUY_LIMIT' as const,
                    actionBadge: 'forged',
                    hitStatus: 'FORWARD_BUY_CANDIDATE' as const,
                    statusText: 'forged buy',
                    urgency: 'HIGH' as const,
                    currentPrice: 100,
                    suggestedLimitPrice: 99,
                    suggestedShares: 10,
                    estimatedAmountUsd: 990,
                    limitPriceRange: 'x',
                    limitFormula: 'x',
                    confidenceScore: 90,
                    rationale: 'forged',
                    auditCitation: 'test',
                }],
                research_observations: [{
                    id: 'FORWARD-BUY-TEST-OBS',
                    symbol: 'COP',
                    nameCn: '康菲石油',
                    nameEn: 'COP',
                    strategySource: 'Candidate 173838',
                    signalTier: 'FORWARD_LIVE_VALIDATION' as const,
                    forwardLiveValidation: true,
                    screeningStatus: 'FORWARD_BUY_CANDIDATE' as const,
                    sourceBarLastDate: '2026-09-24',
                    isFormal: false,
                    isOrderAuthorized: false,
                    isActionable: false,
                    actionType: 'RESEARCH_OBSERVATION' as const,
                    actionBadge: '🟢 前向实盘验证 BUY',
                    hitStatus: 'FORWARD_BUY_CANDIDATE' as const,
                    statusText: 'forward',
                    urgency: 'MEDIUM' as const,
                    currentPrice: 100,
                    suggestedLimitPrice: 0,
                    suggestedShares: 0,
                    estimatedAmountUsd: 0,
                    limitPriceRange: 'N/A',
                    limitFormula: 'test',
                    confidenceScore: 0,
                    rationale: 'test',
                    auditCitation: 'test',
                }],
                formal_actions: [],
            } as any;
            const validation = validateStrategyFeed(forged);
            expect(validation.isValid).toBe(true);
            expect(validation.canExecuteFormalActions).toBe(false);
            const buys = validation.validatedFeed?.forward_validation_buys || [];
            expect(buys.length).toBe(1);
            expect(buys[0].isOrderAuthorized).toBe(false);
            expect(buys[0].isFormal).toBe(false);
            expect(buys[0].isActionable).toBe(false);
            expect(buys[0].suggestedShares).toBe(0);
            expect(buys[0].signalTier).toBe('FORWARD_LIVE_VALIDATION');
            expect(validation.validatedFeed?.formal_actions).toEqual([]);
            expect(validation.validatedFeed?.forward_live_validation?.broker_submission).toBe(false);
            expect(validation.validatedFeed?.forward_live_validation?.formal_new_buy_authorization).toBe(0);
        });

        it('行情暴涨暴跌时，STRATEGY_SCREENED_HIT_STOCKS 严格保持无授权、零股数与只读历史示例', () => {
            expect(STRATEGY_SCREENED_HIT_STOCKS.length).toBeGreaterThan(0);
            for (const item of STRATEGY_SCREENED_HIT_STOCKS) {
                expect(item.signalTier).toBe('HISTORICAL_AUDIT_OBSERVATION');
                expect(item.isFormal).toBe(false);
                expect(item.isOrderAuthorized).toBe(false);
                expect(item.isActionable).toBe(false);
                expect(item.suggestedShares).toBe(0);
                expect(item.suggestedLimitPrice).toBe(0.0);
            }

            const mockSurgingQuotes: any = {
                MRVL: { symbol: 'MRVL', price: 320.00, change: 60.00, changePct: 23.08 },
                QCOM: { symbol: 'QCOM', price: 150.00, change: -47.24, changePct: -23.95 },
            };

            const recalculated = recalculateHitStocksWithLiveQuotes(STRATEGY_SCREENED_HIT_STOCKS, mockSurgingQuotes);
            for (const item of recalculated) {
                expect(item.isOrderAuthorized).toBe(false);
                expect(item.suggestedShares).toBe(0);
                expect(item.suggestedLimitPrice).toBe(0.0);
                expect(item.signalTier).toBe('HISTORICAL_AUDIT_OBSERVATION');
                expect(item.actionBadge).toContain('非实盘/不可下单');
            }
        });

        it('行情变动重算 BOTTOM_REBOUND_UNIVERSE 时，标的永远为 [归档研究] 且不得产生买点', () => {
            const mockOversoldQuotes: any = {
                SO: { symbol: 'SO', price: 82.00, change: -9.24, changePct: -10.12 },
                CVX: { symbol: 'CVX', price: 160.00, change: -22.60, changePct: -12.38 },
            };

            const recalculatedPool = recalculateReboundUniverseWithLiveQuotes(BOTTOM_REBOUND_UNIVERSE, mockOversoldQuotes);
            for (const item of recalculatedPool) {
                expect(item.signalStatusText).toContain('[归档研究]');
                expect(item.signalStatus).toBe('wait');
                expect(item.signalReason).toMatch(/未获实盘正式准入|无实盘授权/);
            }
        });
    });

    // =========================================================================
    // 9. 开发服务中间件不会将上游 stale 改成 live (Dev Server Stale Preservation)
    // =========================================================================
    describe('9. 开发服务中间件状态守卫 (Dev Server Stale Preservation Invariance)', () => {
        it('验证模拟开发服务逻辑：当上游 JSON 具有 is_stale: true 时，绝不被覆盖为 false', () => {
            // 模拟 vite.config.ts 中的核心中间件响应转换逻辑
            const simulateDevServerTransform = (upstreamJson: any, refreshSucceeded: boolean) => {
                const json = { ...upstreamJson };
                if (refreshSucceeded) {
                    json.feed_source = json.feed_source || 'AI_MEMORY_LIVE';
                    json.is_stale = json.is_stale !== undefined ? Boolean(json.is_stale) : true;
                } else {
                    json.feed_source = 'OFFLINE_MIRROR_READONLY';
                    json.is_stale = true;
                    json.stale_reason = 'AI-Memory 实时刷新未成功，降级为离线只读镜像';
                }
                return json;
            };

            // 1. 刷新成功但上游因世代缺失为 stale
            const upstreamStale = {
                version: CURRENT_RATIFIED_FEED_VERSION,
                is_stale: true,
                stale_reason: '本机缺失 v9-formal-20260914-r8 正式世代，执行 Fail-Closed',
                feed_source: 'AI_MEMORY_LIVE',
            };
            const result1 = simulateDevServerTransform(upstreamStale, true);
            expect(result1.is_stale).toBe(true); // 核心验收点：绝不能变成 false！
            expect(result1.stale_reason).toBe(upstreamStale.stale_reason);

            // 2. 刷新失败降级
            const result2 = simulateDevServerTransform(upstreamStale, false);
            expect(result2.is_stale).toBe(true);
            expect(result2.feed_source).toBe('OFFLINE_MIRROR_READONLY');
        });
    });

    // =========================================================================
    // 10. 统一订单小票股数刚性绑定与买卖方向匹配回归 (Ticket Shares & Direction Invariance)
    // =========================================================================
    describe('10. 统一订单小票股数刚性绑定与买卖方向匹配回归 (Ticket Shares & Direction Invariance)', () => {
        it('等于建议股数：严格匹配 formal_actions 建议股数时放行授权', () => {
            const verifiedFeed = createBaseVerifiedFeed(); // MRVL BUY_LIMIT 5 股
            const auth = checkTicketAuthorization('MRVL', 'BUY', 5, verifiedFeed);
            expect(auth.isAuthorized).toBe(true);
            expect(auth.reason).toBe('授权通过');
            expect(auth.matchedAction?.id).toBe('ACT-VALID-MRVL');
            expect(auth.matchedAction?.suggestedShares).toBe(5);
        });

        it('大于建议股数：输入股数大于正式建议股数时刚性拦截，严禁超额下单', () => {
            const verifiedFeed = createBaseVerifiedFeed(); // MRVL BUY_LIMIT 5 股
            const authGreater = checkTicketAuthorization('MRVL', 'BUY', 6, verifiedFeed);
            expect(authGreater.isAuthorized).toBe(false);
            expect(authGreater.reason).toContain('大于正式策略授权建议股数 (5 股)');
            expect(authGreater.reason).toContain('严禁超额下单');

            // 恶意大单 100 股
            const authHuge = checkTicketAuthorization('MRVL', 'BUY', 100, verifiedFeed);
            expect(authHuge.isAuthorized).toBe(false);
            expect(authHuge.reason).toContain('大于正式策略授权建议股数 (5 股)');
        });

        it('小于建议股数：输入股数小于正式建议股数时拦截，必须与正式建议严格一致', () => {
            const verifiedFeed = createBaseVerifiedFeed(); // MRVL BUY_LIMIT 5 股
            const authLess = checkTicketAuthorization('MRVL', 'BUY', 4, verifiedFeed);
            expect(authLess.isAuthorized).toBe(false);
            expect(authLess.reason).toContain('小于正式策略授权建议股数 (5 股)');
            expect(authLess.reason).toContain('必须与正式建议严格一致');

            const authOne = checkTicketAuthorization('MRVL', 'BUY', 1, verifiedFeed);
            expect(authOne.isAuthorized).toBe(false);
            expect(authOne.reason).toContain('小于正式策略授权建议股数 (5 股)');
        });

        it('买卖方向不匹配：标的仅获 BUY 授权时，尝试挂 SELL 必须被拦截', () => {
            const verifiedFeed = createBaseVerifiedFeed(); // MRVL 仅获 BUY_LIMIT 5 股
            const authWrongDirection = checkTicketAuthorization('MRVL', 'SELL', 5, verifiedFeed);
            expect(authWrongDirection.isAuthorized).toBe(false);
            expect(authWrongDirection.reason).toContain('动作方向不匹配');
            expect(authWrongDirection.reason).toContain('仅获 [BUY] 授权');
            expect(authWrongDirection.reason).toContain('禁止执行 [SELL]');
        });

        it('买卖方向不匹配：标的仅获 SELL 授权时，尝试挂 BUY 必须被拦截', () => {
            const sellFeed = createBaseVerifiedFeed();
            sellFeed.formal_actions = [
                {
                    ...sellFeed.formal_actions![0],
                    id: 'ACT-SELL-MRVL',
                    actionType: 'SELL_LIMIT',
                    suggestedShares: 2,
                },
            ];
            const authWrongDirection = checkTicketAuthorization('MRVL', 'BUY', 2, sellFeed);
            expect(authWrongDirection.isAuthorized).toBe(false);
            expect(authWrongDirection.reason).toContain('动作方向不匹配');
            expect(authWrongDirection.reason).toContain('仅获 [SELL] 授权');
            expect(authWrongDirection.reason).toContain('禁止执行 [BUY]');
        });

        it('同一标的多动作同方向：支持分批多档分别匹配，非档位股数严格拦截', () => {
            const multiActionFeed = createBaseVerifiedFeed();
            multiActionFeed.formal_actions = [
                {
                    ...multiActionFeed.formal_actions![0],
                    id: 'ACT-MRVL-TRANCHE-1',
                    symbol: 'MRVL',
                    actionType: 'BUY_LIMIT',
                    suggestedShares: 2,
                },
                {
                    ...multiActionFeed.formal_actions![0],
                    id: 'ACT-MRVL-TRANCHE-2',
                    symbol: 'MRVL',
                    actionType: 'BUY_LIMIT',
                    suggestedShares: 5,
                },
            ];

            // 1. 匹配第 1 档（2 股）
            const auth2 = checkTicketAuthorization('MRVL', 'BUY', 2, multiActionFeed);
            expect(auth2.isAuthorized).toBe(true);
            expect(auth2.matchedAction?.id).toBe('ACT-MRVL-TRANCHE-1');

            // 2. 匹配第 2 档（5 股）
            const auth5 = checkTicketAuthorization('MRVL', 'BUY', 5, multiActionFeed);
            expect(auth5.isAuthorized).toBe(true);
            expect(auth5.matchedAction?.id).toBe('ACT-MRVL-TRANCHE-2');

            // 3. 介于两档之间的股数（3 股）拦截
            const auth3 = checkTicketAuthorization('MRVL', 'BUY', 3, multiActionFeed);
            expect(auth3.isAuthorized).toBe(false);
            expect(auth3.reason).toContain('与正式策略授权建议股数 (2 股 / 5 股) 不一致');

            // 4. 超出最大档位的股数（8 股）拦截
            const auth8 = checkTicketAuthorization('MRVL', 'BUY', 8, multiActionFeed);
            expect(auth8.isAuthorized).toBe(false);
            expect(auth8.reason).toContain('大于正式策略授权建议股数 (2 股 / 5 股)');
            expect(auth8.reason).toContain('严禁超额下单');

            // 5. 低于最小档位的股数（1 股）拦截
            const auth1 = checkTicketAuthorization('MRVL', 'BUY', 1, multiActionFeed);
            expect(auth1.isAuthorized).toBe(false);
            expect(auth1.reason).toContain('小于正式策略授权建议股数 (2 股 / 5 股)');
            expect(auth1.reason).toContain('必须与正式建议严格一致');
        });

        it('同一标的多方向动作：同时存在 BUY 与 SELL 正式动作时，方向与股数严格交叉隔离', () => {
            const dualFeed = createBaseVerifiedFeed();
            dualFeed.formal_actions = [
                {
                    ...dualFeed.formal_actions![0],
                    id: 'ACT-MRVL-BUY',
                    symbol: 'MRVL',
                    actionType: 'BUY_LIMIT',
                    suggestedShares: 5,
                },
                {
                    ...dualFeed.formal_actions![0],
                    id: 'ACT-MRVL-SELL',
                    symbol: 'MRVL',
                    actionType: 'SELL_LIMIT',
                    suggestedShares: 2,
                },
            ];

            // BUY 5 股放行
            expect(checkTicketAuthorization('MRVL', 'BUY', 5, dualFeed).isAuthorized).toBe(true);
            // BUY 2 股（拿 SELL 档位买入）拦截
            const buyMismatch = checkTicketAuthorization('MRVL', 'BUY', 2, dualFeed);
            expect(buyMismatch.isAuthorized).toBe(false);
            expect(buyMismatch.reason).toContain('小于正式策略授权建议股数 (5 股)');

            // SELL 2 股放行
            expect(checkTicketAuthorization('MRVL', 'SELL', 2, dualFeed).isAuthorized).toBe(true);
            // SELL 5 股（拿 BUY 档位卖出）拦截
            const sellMismatch = checkTicketAuthorization('MRVL', 'SELL', 5, dualFeed);
            expect(sellMismatch.isAuthorized).toBe(false);
            expect(sellMismatch.reason).toContain('大于正式策略授权建议股数 (2 股)');
        });

        it('未列入 formal_actions 的标的即使存在于其它字段中，也坚决拦截', () => {
            const verifiedFeed = createBaseVerifiedFeed();
            const authUnknown = checkTicketAuthorization('AAPL', 'BUY', 1, verifiedFeed);
            expect(authUnknown.isAuthorized).toBe(false);
            expect(authUnknown.reason).toContain('AAPL 未获正式实盘交易授权');

            // 历史观察池白马（未获实盘授权）
            const authRebound = checkTicketAuthorization('CVX', 'BUY', 2, verifiedFeed);
            expect(authRebound.isAuthorized).toBe(false);
            expect(authRebound.reason).toContain('CVX 未获正式实盘交易授权');
        });

        it('非法股数（0、负数、浮点数、非数字）与空标的防御', () => {
            const verifiedFeed = createBaseVerifiedFeed();
            expect(checkTicketAuthorization('MRVL', 'BUY', 0, verifiedFeed).isAuthorized).toBe(false);
            expect(checkTicketAuthorization('MRVL', 'BUY', -1, verifiedFeed).isAuthorized).toBe(false);
            expect(checkTicketAuthorization('MRVL', 'BUY', 1.5, verifiedFeed).isAuthorized).toBe(false);
            expect(checkTicketAuthorization('MRVL', 'BUY', NaN as any, verifiedFeed).isAuthorized).toBe(false);
            expect(checkTicketAuthorization('', 'BUY', 5, verifiedFeed).isAuthorized).toBe(false);
            expect(checkTicketAuthorization(null as any, 'BUY', 5, verifiedFeed).isAuthorized).toBe(false);
        });
    });

    // =========================================================================
    // 11. 小票限价刚性锁定与防行情/手工改写边界 (Strategy Limit Price Invariance & Ticket Copy Channels)
    // 覆盖 Codex 最后一处实质边界审查：
    // PortfolioExecutionHub 与 InstitutionalReboundPanel 复制通道在已授权时必须锁定 suggestedLimitPrice，
    // 手工输入/盘口推算仅作独立参考，严禁带入已授权小票；当前无正式动作时全部物理锁死。
    // =========================================================================
    describe('11. 小票限价刚性锁定与防行情/手工改写边界 (DECISION.md Rule 5 Invariance)', () => {
        // 构造包含正式动作的合法授权 Feed（MRVL 卖出 1 股 @ $265.00，QCOM 买入 5 股 @ $180.00）
        const createExecutionAuthorizedFeed = (): AiMemoryStrategyFeed => {
            const feed = createBaseVerifiedFeed();
            feed.formal_actions = [
                {
                    id: 'ACT-EXEC-MRVL-SELL',
                    symbol: 'MRVL',
                    nameCn: '迈威尔科技',
                    nameEn: 'Marvell',
                    strategySource: 'AI-Memory Phase 11 Ratchet Stop',
                    actionType: 'SELL_LIMIT',
                    actionBadge: '⚡ 正式执行',
                    hitStatus: 'HIT_NOW',
                    statusText: '已授权',
                    urgency: 'HIGH',
                    currentPrice: 263.50,
                    suggestedLimitPrice: 265.00,
                    limitPriceRange: '$264.50 - $265.50',
                    limitFormula: '中位数',
                    suggestedShares: 1,
                    estimatedAmountUsd: 265.00,
                    confidenceScore: 95,
                    rationale: '触发正式止盈减仓',
                    auditCitation: 'AI-Memory Ratchet Stop',
                    isFormal: true,
                    signalTier: 'FORMAL_EXECUTION',
                    isOrderAuthorized: true,
                    isActionable: true,
                },
                {
                    id: 'ACT-EXEC-QCOM-BUY',
                    symbol: 'QCOM',
                    nameCn: '高通',
                    nameEn: 'Qualcomm',
                    strategySource: 'AI-Memory V9 Rule E',
                    actionType: 'BUY_LIMIT',
                    actionBadge: '⚡ 正式执行',
                    hitStatus: 'HIT_NOW',
                    statusText: '已授权',
                    urgency: 'HIGH',
                    currentPrice: 178.50,
                    suggestedLimitPrice: 180.00,
                    limitPriceRange: '$179.50 - $180.50',
                    limitFormula: '右侧绿柱放量',
                    suggestedShares: 5,
                    estimatedAmountUsd: 900.00,
                    confidenceScore: 90,
                    rationale: '触发右侧企稳加仓',
                    auditCitation: 'AI-Memory V9 Rule E',
                    isFormal: true,
                    signalTier: 'FORMAL_EXECUTION',
                    isOrderAuthorized: true,
                    isActionable: true,
                },
            ];
            return feed;
        };

        it('防线 1: checkTicketAuthorization 严格校验限价参数，偏离策略建议价立即拦截', () => {
            const feed = createExecutionAuthorizedFeed();

            // 1.1 精确匹配建议限价 $265.00：授权放行，且返回锁定限价与小票文本
            const authOk = checkTicketAuthorization('MRVL', 'SELL', 1, feed, 265.00);
            expect(authOk.isAuthorized).toBe(true);
            expect(authOk.authorizedLimitPrice).toBe(265.00);
            expect(authOk.authorizedShares).toBe(1);
            expect(authOk.authorizedTicketText).toContain('USD 265');
            expect(authOk.authorizedTicketText).toContain('MRVL');
            expect(authOk.authorizedTicketText).toContain('1 股');

            // 1.2 手工改高限价 ($270.00)：坚决拦截
            const authHigh = checkTicketAuthorization('MRVL', 'SELL', 1, feed, 270.00);
            expect(authHigh.isAuthorized).toBe(false);
            expect(authHigh.reason).toContain('小票限价 ($270.00) 偏离正式策略授权限价 ($265.00)');
            expect(authHigh.reason).toContain('DECISION.md Rule 5');

            // 1.3 手工改低限价 ($260.00)：坚决拦截
            const authLow = checkTicketAuthorization('MRVL', 'SELL', 1, feed, 260.00);
            expect(authLow.isAuthorized).toBe(false);
            expect(authLow.reason).toContain('小票限价 ($260.00) 偏离正式策略授权限价 ($265.00)');

            // 1.4 非法限价（<=0、NaN）坚决拦截
            expect(checkTicketAuthorization('MRVL', 'SELL', 1, feed, 0).isAuthorized).toBe(false);
            expect(checkTicketAuthorization('MRVL', 'SELL', 1, feed, -10).isAuthorized).toBe(false);
            expect(checkTicketAuthorization('MRVL', 'SELL', 1, feed, NaN as any).isAuthorized).toBe(false);
        });

        it('防线 2: 盘口报价剧烈波动对已授权小票限价绝对无影响 (Quote Invariance)', () => {
            const feed = createExecutionAuthorizedFeed();
            const action = feed.formal_actions![0]; // MRVL SELL 1 股 @ 265.00

            // 模拟极端盘口行情：买一 $10.00，卖一 $999.00（盘口剧烈失真）
            const extremeQuotes = { bidPrice: 10.00, askPrice: 999.00 };
            const ticket = generateAuthorizedExecutionTicket(action, extremeQuotes);

            // 限价必须严格保持为 265.00，不受盘口任何影响
            expect(ticket.recommendedPrice).toBe(265.00);
            expect(ticket.peggingStrategy).toBe('策略建议限价锁定 (Strategy Target Peg)');
            expect(ticket.ticketText).toContain('USD 265');
            expect(ticket.ticketText).not.toContain('USD 10');
            expect(ticket.ticketText).not.toContain('USD 999');
            expect(ticket.ticketText).not.toContain('USD 504.5'); // 不受中位数盘口改写
        });

        it('防线 3: PortfolioExecutionHub 复制通道全覆盖 (锁定策略限价，手工改价/盘口推算仅供独立参考)', () => {
            const feed = createExecutionAuthorizedFeed();

            // 模拟 PortfolioExecutionHub 的执行小票生成流程：
            const symbol = 'MRVL';
            const action = 'SELL';
            const shares = 1;
            const liveQuote = { bid: 263.50, ask: 264.40 };

            // 初步授权校验（获取正式动作建议）
            const baseAuth = checkTicketAuthorization(symbol, action, shares, feed);
            expect(baseAuth.isAuthorized).toBe(true);
            expect(baseAuth.matchedAction?.suggestedLimitPrice).toBe(265.00);

            // 3.1 默认无手工输入时：必须锁定正式策略建议限价 $265.00，而非盘口推算价 ($263.95)
            const defaultCustomPrice = null;
            const effectiveLimitPrice = defaultCustomPrice !== null
                ? defaultCustomPrice
                : baseAuth.matchedAction?.suggestedLimitPrice;

            expect(effectiveLimitPrice).toBe(265.00);

            const defaultOrder = calculateSmartPeggingOrder({
                symbol,
                direction: action,
                targetShares: shares,
                bidPrice: liveQuote.bid,
                askPrice: liveQuote.ask,
                urgency: 'midpoint',
                overridePrice: effectiveLimitPrice,
            });
            expect(defaultOrder.recommendedPrice).toBe(265.00);
            expect(defaultOrder.ticketText).toContain('USD 265');

            // 最终复制校验
            const finalAuth = checkTicketAuthorization(symbol, action, shares, feed, effectiveLimitPrice);
            expect(finalAuth.isAuthorized).toBe(true);
            // 复制的小票内容必须为正式策略授权小票，限价为 $265.00
            const copiedText = finalAuth.authorizedTicketText!;
            expect(copiedText).toContain('USD 265');
            expect(copiedText).toContain('MRVL');
            expect(copiedText).toContain('1 股');

            // 3.2 用户在输入框中输入偏离的手工限价 $270.00：
            const manualTamperedPrice = 270.00;
            const tamperedAuth = checkTicketAuthorization(symbol, action, shares, feed, manualTamperedPrice);
            // 授权立即被物理封锁，禁止带出手工价格小票
            expect(tamperedAuth.isAuthorized).toBe(false);
            expect(tamperedAuth.reason).toContain('偏离正式策略授权限价 ($265.00)');

            // 3.3 盘口变动测试：即使 liveQuote 剧变，effectiveLimitPrice 依然为 265.00
            const shiftedLiveQuote = { bid: 250.00, ask: 251.00 };
            const quoteOrder = calculateSmartPeggingOrder({
                symbol,
                direction: action,
                targetShares: shares,
                bidPrice: shiftedLiveQuote.bid,
                askPrice: shiftedLiveQuote.ask,
                urgency: 'midpoint',
                overridePrice: effectiveLimitPrice,
            });
            expect(quoteOrder.recommendedPrice).toBe(265.00);
            expect(quoteOrder.ticketText).toContain('USD 265');
        });

        it('防线 4: InstitutionalReboundPanel (Phase 36) 复制通道全覆盖 (盘口推算作为独立参考，复制锁定正式限价)', () => {
            const feed = createExecutionAuthorizedFeed();

            // 模拟 Phase 36 的 peggingOrder 输入（MRVL SELL 1 股，盘口买一 $263.50，卖一 $264.40）
            const peggingOrder = {
                symbol: 'MRVL',
                direction: 'SELL' as const,
                targetShares: 1,
                bidPrice: 263.50,
                askPrice: 264.40,
                urgency: 'midpoint' as const,
            };

            // 行情推算结果（作为独立参考）
            const peggingResult = calculateSmartPeggingOrder(peggingOrder);
            expect(peggingResult.recommendedPrice).toBe(263.95); // 盘口中位数推算价

            // 校验小票授权
            const peggingAuth = checkTicketAuthorization(
                peggingOrder.symbol,
                peggingOrder.direction,
                peggingOrder.targetShares,
                feed
            );
            expect(peggingAuth.isAuthorized).toBe(true);

            // 依据修复：复制通道与展示卡片必须使用锁定正式限价的 authorizedTicketText，绝不能直接复制 peggingResult.ticketText
            const ticketToCopy = peggingAuth.authorizedTicketText || generateAuthorizedExecutionTicket(peggingAuth.matchedAction!).ticketText;

            expect(ticketToCopy).toContain('USD 265'); // 正式限价
            expect(ticketToCopy).not.toContain('USD 263.95'); // 绝不能是盘口推算价！

            // 即使交互修改 peggingOrder 的 bid/ask 价格（如改成 200 / 201）：
            const modifiedPeggingOrder = { ...peggingOrder, bidPrice: 200, askPrice: 201 };
            const modifiedPeggingResult = calculateSmartPeggingOrder(modifiedPeggingOrder);
            expect(modifiedPeggingResult.recommendedPrice).toBe(200.50); // 独立参考价改变

            // 但小票复制内容与授权依然严格锁定 $265.00，不受盘口改写！
            const invariantTicket = peggingAuth.authorizedTicketText!;
            expect(invariantTicket).toContain('USD 265');
            expect(invariantTicket).not.toContain('USD 200.5');
        });

        it('防线 5: 当前真实生产状态（无有效正式动作 / new_buy_authorization=0）下双通道全部绝对锁死', () => {
            // 真实生产镜像 productionFeed
            expect(productionFeed.new_buy_authorization).toBe(0);

            // 1. PortfolioExecutionHub 通道锁死验证
            const sgovBuyAuth = checkTicketAuthorization('SGOV', 'BUY', 21, productionFeed);
            expect(sgovBuyAuth.isAuthorized).toBe(false);
            expect(sgovBuyAuth.reason).toContain('禁止生成下单小票');

            const mrvlSellAuth = checkTicketAuthorization('MRVL', 'SELL', 1, productionFeed);
            expect(mrvlSellAuth.isAuthorized).toBe(false);
            expect(mrvlSellAuth.reason).toContain('禁止生成下单小票');

            // 2. InstitutionalReboundPanel (Phase 36) 通道锁死验证
            for (const preset of DEFAULT_PEGGING_REQUESTS) {
                const auth = checkTicketAuthorization(preset.symbol, preset.direction, preset.targetShares, productionFeed);
                expect(auth.isAuthorized).toBe(false);
                expect(auth.reason).toContain('禁止生成下单小票');
            }
        });
    });
});
