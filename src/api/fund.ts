import axios from 'axios';
import type { FundEstimate, FundDetail, HoldingStock, BondHolding } from '../types/fund.types';

/**
 * 搜索基金（天天基金搜索接口 - JSONP）
 */
export interface FundSearchResult {
    code: string;
    name: string;
    type: string;
    pinyin: string;
}

export async function searchFund(keyword: string): Promise<FundSearchResult[]> {
    try {
        const url = `https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx?m=1&key=${encodeURIComponent(keyword)}`;
        const res = await axios.get(url, { timeout: 8000 });
        const data = res.data;
        if (data && data.Datas) {
            return data.Datas.map((item: string[]) => ({
                code: item[0] || '',
                name: item[1] || '',
                type: item[3] || '',
                pinyin: item[2] || '',
            }));
        }
        return [];
    } catch {
        return [];
    }
}

/**
 * 获取基金最新确定的实际净值 (替代原本已失效的盘中实时估值接口)
 * API: https://fund.eastmoney.com/pingzhongdata/{code}.js
 */
export async function getFundEstimate(code: string): Promise<FundEstimate | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;

    return new Promise((resolve) => {
        const script = document.createElement('script');
        let resolved = false;

        const doResolve = (value: FundEstimate | null) => {
            if (!resolved) {
                resolved = true;
                resolve(value);
            }
        };

        script.onload = () => {
            try {
                const fundName: string = win.fS_name || '';
                const netWorthTrend = win.Data_netWorthTrend;

                if (Array.isArray(netWorthTrend) && netWorthTrend.length > 0) {
                    // 取最后一天（最新公布）的净值数据
                    const latest = netWorthTrend[netWorthTrend.length - 1];
                    const timestamp = latest.x;
                    const nav = latest.y || 0;
                    const changePct = latest.equityReturn || 0;

                    const dateObj = new Date(timestamp);
                    const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

                    // 为了兼容原有 UI，我们将 "真实净值" 映射给 gsz（估值字段）和 gszzl（涨跌幅字段）
                    doResolve({
                        code,
                        name: fundName,
                        gsz: String(nav),
                        gszzl: String(changePct),
                        gztime: `${dateStr} (准确净值)`, // 提示这是准确净值
                        dwjz: '', // 不再需要单独提供昨日净值
                    });
                } else {
                    doResolve(null);
                }
            } catch (e) {
                console.error('Failed to parse actual net worth:', e);
                doResolve(null);
            } finally {
                if (script.parentNode) document.body.removeChild(script);
            }
        };

        script.onerror = () => {
            if (script.parentNode) document.body.removeChild(script);
            doResolve(null);
        };

        script.src = `https://fund.eastmoney.com/pingzhongdata/${code}.js?v=${Date.now()}`;
        document.body.appendChild(script);

        // 超时保护
        setTimeout(() => {
            if (!resolved) {
                if (script.parentNode) document.body.removeChild(script);
                doResolve(null);
            }
        }, 8000);
    });
}

/**
 * 获取基金持仓详情
 * API 1: https://fund.eastmoney.com/pingzhongdata/{code}.js (用于基本信息与最新净值)
 * API 2: (Mobile JSON API) 获取所有股票、债券和子基金持仓
 */
export async function getFundDetail(code: string): Promise<FundDetail | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;

    return new Promise((resolve) => {
        const script1 = document.createElement('script');
        let resolved = false;

        const doResolve = (value: FundDetail | null) => {
            if (!resolved) {
                resolved = true;
                resolve(value);
            }
        };

        // 1. 先加载基本信息 JS
        script1.onload = async () => {
            try {
                const fundName: string = win.fS_name || '';
                const fundType: string = win.fS_type || '';
                let fundManager = '';

                const managers = win.Data_currentcurrentFundManager || win.Data_currentFundManager;
                if (Array.isArray(managers) && managers.length > 0) {
                    fundManager = managers
                        .map((m: Record<string, string>) => m.name || '')
                        .filter(Boolean)
                        .join('、');
                }

                if (script1.parentNode) document.body.removeChild(script1);

                // 2. Fetch clean JSON data from EastMoney Mobile API
                const holdingsApiUrl = `https://fundmobapi.eastmoney.com/FundMNewApi/FundMNInverstPosition?FCODE=${code}&deviceid=Wap&plat=Wap&product=EFund&version=2.0`;
                let stockHoldings: HoldingStock[] = [];
                let bondHoldings: BondHolding[] = [];
                let updateDate = '';

                try {
                    const holdingsPromise = axios.get(holdingsApiUrl, { timeout: 8000 });
                    const allocationApiUrl = `https://fundmobapi.eastmoney.com/FundMNewApi/FundMNAssetAllocation?FCODE=${code}&deviceid=Wap&plat=Wap&product=EFund&version=2.0`;
                    const allocationPromise = axios.get(allocationApiUrl, { timeout: 8000 }).catch(() => null);

                    const [res, allocationRes] = await Promise.all([holdingsPromise, allocationPromise]);
                    const data = res.data;

                    if (data && data.Datas) {
                        updateDate = data.Expansion || '';

                        // 解析股票
                        if (Array.isArray(data.Datas.fundStocks)) {
                            stockHoldings = data.Datas.fundStocks.map((s: any) => ({
                                stockCode: s.GPDM,
                                stockName: s.GPJC,
                                ratio: s.JZBL
                            }));
                        }

                        // 解析债券
                        if (Array.isArray(data.Datas.fundboods)) {
                            bondHoldings = data.Datas.fundboods.map((b: any) => ({
                                bondCode: b.ZQDM,
                                bondName: b.ZQMC,
                                ratio: b.ZJZBL
                            }));
                        }

                        // 解析 FOF 子基金 (将其视为股票统一渲染和计算估值)
                        if (Array.isArray(data.Datas.fundfofs) && data.Datas.fundfofs.length > 0) {
                            const fofHoldings = data.Datas.fundfofs.map((f: any) => ({
                                stockCode: f.TZJJDM,
                                stockName: f.TZJJMC,
                                ratio: f.ZJZBL
                            }));
                            stockHoldings = [...stockHoldings, ...fofHoldings];
                        }

                        // 解析 ETF Feeder (联接基金的母基金) 及真实 ETF 占比
                        if (data.Datas.ETFCODE && data.Datas.ETFSHORTNAME) {
                            let preciseEtfRatio = 0;

                            // 优先从刚才并发请求的资产配置接口中获取最精确的 "JJ" (基金资产占比)
                            if (allocationRes && allocationRes.data && Array.isArray(allocationRes.data.Datas) && allocationRes.data.Datas.length > 0) {
                                const latestAllocation = allocationRes.data.Datas[0];
                                if (latestAllocation.JJ && latestAllocation.JJ !== '--') {
                                    preciseEtfRatio = parseFloat(latestAllocation.JJ);
                                }
                            }

                            // 如果依然取不到(或者返回异常数据)，回退到原始兜底逻辑: (100 - 已穿透出来的持仓权重 - 最新现金权重)
                            if (preciseEtfRatio <= 0 || preciseEtfRatio > 100) {
                                let estimatedEtfRatio = 0;
                                if (win.Data_assetAllocation && Array.isArray(win.Data_assetAllocation.categories) && Array.isArray(win.Data_assetAllocation.series)) {
                                    const series = win.Data_assetAllocation.series;
                                    const cashSeries = series.find((s: any) => s.name?.includes('现金'));

                                    if (cashSeries && Array.isArray(cashSeries.data) && cashSeries.data.length > 0) {
                                        const latestCashRatio = parseFloat(cashSeries.data[cashSeries.data.length - 1] || '5');
                                        let currentTotal = 0;
                                        stockHoldings.forEach(s => currentTotal += parseFloat(s.ratio || '0'));
                                        bondHoldings.forEach(b => currentTotal += parseFloat(b.ratio || '0'));
                                        estimatedEtfRatio = 100 - latestCashRatio - currentTotal;
                                    }
                                }

                                if (estimatedEtfRatio <= 0 || estimatedEtfRatio > 100) {
                                    let currentTotal = 0;
                                    stockHoldings.forEach(s => currentTotal += parseFloat(s.ratio || '0'));
                                    bondHoldings.forEach(b => currentTotal += parseFloat(b.ratio || '0'));
                                    estimatedEtfRatio = 95.00 - currentTotal;
                                }
                                preciseEtfRatio = estimatedEtfRatio;
                            }

                            if (preciseEtfRatio < 0) preciseEtfRatio = 0;

                            if (preciseEtfRatio > 0) {
                                stockHoldings.push({
                                    stockCode: data.Datas.ETFCODE,
                                    stockName: `${data.Datas.ETFSHORTNAME} (主要联接标的)`,
                                    ratio: preciseEtfRatio.toFixed(2) // 这里填充的即是类似 57.42% 或 63.11% 这样的精准占比
                                });
                            }
                        }
                    }

                    // 按照权重(ratio)降序排序
                    stockHoldings.sort((a, b) => parseFloat(b.ratio || '0') - parseFloat(a.ratio || '0'));
                    bondHoldings.sort((a, b) => parseFloat(b.ratio || '0') - parseFloat(a.ratio || '0'));

                } catch (e) {
                    console.error('Failed to fetch JSON holdings detail', e);
                }

                doResolve({
                    code,
                    name: fundName,
                    type: fundType,
                    manager: fundManager,
                    updateDate,
                    holdings: stockHoldings,
                    bondHoldings,
                });

            } catch (err) {
                console.error('Failed to parse fund metadata:', err);
                if (script1.parentNode) document.body.removeChild(script1);
                doResolve(null);
            }
        };

        script1.onerror = () => {
            if (script1.parentNode) document.body.removeChild(script1);
            doResolve(null);
        };

        script1.src = `https://fund.eastmoney.com/pingzhongdata/${code}.js?v=${Date.now()}`;
        document.body.appendChild(script1);

        // 10秒超时保护
        setTimeout(() => {
            if (!resolved) {
                doResolve(null);
            }
        }, 10000);
    });
}

export function getStockMarket(code: string): 'SH' | 'SZ' | 'HK' | 'unknown' {
    if (!code) return 'unknown';
    // 港股特点：都是 5 位数字（如腾讯控股 00700，美团 03690）
    if (code.length === 5) return 'HK';

    // 沪市：6开头的股票，5开头的基金（ETF/LOF，含51、52等跨市场/跨境ETF）
    if (code.startsWith('6') || code.startsWith('5')) return 'SH';
    // 深市：0、3开头的股票，15、16开头的基金，2、4、8开头的其他证券
    if (code.startsWith('0') || code.startsWith('3') || code.startsWith('15') || code.startsWith('16') || code.startsWith('2') || code.startsWith('8') || code.startsWith('4')) return 'SZ';

    return 'unknown';
}

export interface StockQuote {
    code: string;
    price: string;
    changeRaw: string;      // 例如 "-11.19"
    changePct: string;      // 例如 "-0.76" 作为百分比
}

/**
 * 批量获取股票实时行情 (腾讯接口)
 */
export async function getStockQuotes(codes: string[]): Promise<Record<string, StockQuote>> {
    if (!codes || codes.length === 0) return {};

    // 将普通纯数字代码转为带前缀格式: sh600519
    const query = codes.map(c => {
        const m = getStockMarket(c);
        return m === 'SH' ? `sh${c}` : m === 'SZ' ? `sz${c}` : m === 'HK' ? `hk${c}` : '';
    }).filter(Boolean).join(',');

    if (!query) return {};

    try {
        const res = await fetch(`https://qt.gtimg.cn/q=${query}`);
        const buffer = await res.arrayBuffer();
        const decoder = new TextDecoder('gbk');
        const text = decoder.decode(buffer);

        const quotes: Record<string, StockQuote> = {};
        const lines = text.split(';');

        lines.forEach(line => {
            if (!line.trim()) return;
            const match = line.match(/v_(.+?)="(.+)"/);
            if (match) {
                const codeWithPrefix = match[1]; // e.g. sh600519
                const pureCode = codeWithPrefix.replace(/^(sh|sz|hk)/i, '');
                const parts = match[2].split('~');
                // 腾讯接口格式中，下标 3 是当前价，31是涨跌额，32 是涨跌幅
                if (parts.length > 32) {
                    quotes[pureCode] = {
                        code: pureCode,
                        price: parts[3],
                        changeRaw: parts[31],
                        changePct: parts[32],
                    };
                }
            }
        });
        return quotes;
    } catch (err) {
        console.error('Failed to fetch stock quotes', err);
        return {};
    }
}

/**
 * 生成股票跳转链接
 */
export function getStockJumpUrl(
    stockCode: string,
    platform: 'tonghuashun' | 'xueqiu' | 'eastmoney' = 'xueqiu'
): string {
    const market = getStockMarket(stockCode);
    const prefix = market === 'SH' ? 'SH' : market === 'SZ' ? 'SZ' : market === 'HK' ? 'HK' : '';

    switch (platform) {
        case 'tonghuashun':
            // 港股在同花顺的 URL 结构也是类似的，例如 https://stockpage.10jqka.com.cn/HK0700/ 或直接用代码
            if (market === 'HK') {
                return `https://stockpage.10jqka.com.cn/HK${stockCode.replace(/^0+/, '')}/`;
            }
            return `https://stockpage.10jqka.com.cn/${stockCode}/`;
        case 'xueqiu':
            // 雪球港股必须加 0 打头，或者 HK00700，实际上访问 HK00700 是有效的，加了HK前缀
            if (market === 'HK' && prefix === 'HK' && !stockCode.toUpperCase().startsWith('HK')) {
                return `https://xueqiu.com/S/HK${stockCode}`;
            }
            return `https://xueqiu.com/S/${prefix}${stockCode}`;
        case 'eastmoney':
            if (market === 'HK') {
                return `https://quote.eastmoney.com/hk/${stockCode}.html`;
            }
            return market === 'SH'
                ? `https://quote.eastmoney.com/sh${stockCode}.html`
                : `https://quote.eastmoney.com/sz${stockCode}.html`;
        default:
            return `https://xueqiu.com/S/${prefix}${stockCode}`;
    }
}

/**
 * 请求 AI 进行基金诊断及总结 (流式输出)
 * 依赖于 vite.config.ts 中的 /api/ai 代理配置，以此绕过浏览器 CORS
 */
export async function getFundAISummaryStream(
    prompt: string,
    apiKey: string,
    onMessage: (chunk: string) => void,
    onError: (err: string) => void,
    onFinish: () => void
) {
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        // 获取实时大盘数据，作为单只基金涨跌的参照系
        const marketContext = await fetchMarketContext();

        // 注入准确的时间锚点
        const now = new Date();
        const currentDateTime = now.toLocaleString('zh-CN', {
            year: 'numeric', month: 'long', day: 'numeric',
            weekday: 'long', hour: '2-digit', minute: '2-digit'
        });

        const marketDataBlock = marketContext
            ? `【真实实时大盘数据 (作为对比参照)】:\n${marketContext}\n`
            : '';

        const enhancedPrompt = `当前系统时间是：${currentDateTime}。\n${marketDataBlock}\n【该基金的实时盘面结构及动态数据】：\n${prompt}`;

        const response = await fetch('/api/ai/v1/chat/completions', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: 'gemini-3.1-pro-high', // Antigravity backend model
                messages: [
                    {
                        role: 'system',
                        content: `你是一位全市场视角的资深基金经理与金融数据分析专家。请根据提供的“大盘实时行情”以及“具体某只基金的数据、前十大重仓股、今日实时涨跌幅”，运用系统化的投研分析框架，对该基金进行深度、结构化的实时诊断和总结。

你的分析必须包含以下核心层次：

1. 【大盘环境与板块归属】：首先简要评估今日大盘整体情绪（根据大盘指数），然后准确判断该基金的基础持仓属于什么核心板块，并判断该板块是受大盘拖累被动杀跌，还是具备独立逆势逻辑。
2. 【持仓与突发热点结合解析】：结合当前的宏观经济、最新突发资讯（如周末刚刚发生的重大且未被充分消化的地缘黑天鹅、重要会议政策等），深度推演该基金当前持仓表现的核心驱动力，明确区分基本面因素和情绪面冲击。
3. 【后续预期走势判断】：基于以上逻辑链条与市场规律，对该基金后续可能的走势方向做出前瞻性预判。
4. 【操作策略与仓位建议】：以利益最大化为目标，结合风险收益比，明确给出当前是否需要加仓、减仓、左侧定投或持仓观望的具体结论和纪律指引。

严格要求：
- 请务必建立单只基金涨跌与同期大盘涨跌的“对比参照系”，以判断其超额收益或韧性。
- 对突发事件（黑天鹅）保持高度敏感，分析其短期情绪利空和中长期基本面逻辑的区别。
- 请用自然连贯、通俗易懂且极具同理心的专业视角进行答复。直接输出高价值结论与策略。`
                    },
                    { role: 'user', content: enhancedPrompt }
                ],
                stream: true,
            })
        });

        if (!response.ok) {
            throw new Error(`AI Request failed: HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');

        if (!reader) {
            throw new Error('No streaming response body available');
        }

        let done = false;
        let sseBuffer = ''; // 缓冲区：处理跨 chunk 的不完整 SSE 行
        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;

            if (value) {
                sseBuffer += decoder.decode(value, { stream: true });
                const lines = sseBuffer.split('\n');
                // 最后一个元素可能是不完整的行，保留到下一轮
                sseBuffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('data: ')) {
                        const dataStr = trimmed.slice(6);
                        if (dataStr === '[DONE]') {
                            done = true;
                            break;
                        }
                        try {
                            const parsed = JSON.parse(dataStr);
                            const content = parsed.choices?.[0]?.delta?.content || '';
                            if (content) {
                                onMessage(content);
                            }
                        } catch (e) {
                            // 极少数情况下仍可能出现不完整 JSON，安全忽略
                        }
                    }
                }
            }
        }
        onFinish();
    } catch (error: any) {
        console.error('AI Summary Stream Error:', error);
        onError(error.message || 'AI 请求发生错误，请检查本地服务或代理配置');
    }
}

/**
 * 获取 A 股核心指数的实时行情数据，作为 AI 推演的真实市场上下文
 * 使用腾讯行情接口 (与 getStockQuotes 同源)，已验证可靠
 * 返回格式化的市场快照文本，供注入到 AI prompt 中
 */
export async function fetchMarketContext(): Promise<string> {
    // 腾讯行情 A 股核心指数查询代码
    const indexQuery = 'sh000001,sz399001,sz399006,sh000688';
    const indexNames: Record<string, string> = {
        '000001': '上证综指',
        '399001': '深证成指',
        '399006': '创业板指',
        '000688': '科创50',
    };

    try {
        const res = await fetch(`https://qt.gtimg.cn/q=${indexQuery}`);
        const buffer = await res.arrayBuffer();
        const decoder = new TextDecoder('gbk');
        const text = decoder.decode(buffer);

        const results: string[] = [];
        const lineItems = text.split(';');

        for (const line of lineItems) {
            if (!line.trim()) continue;
            const match = line.match(/v_(.+?)="(.+)"/);
            if (match) {
                const codeWithPrefix = match[1]; // e.g. sh000001
                const pureCode = codeWithPrefix.replace(/^(sh|sz)/i, '');
                const parts = match[2].split('~');
                // 腾讯接口: parts[1]=名称, parts[3]=当前点位, parts[31]=涨跌额, parts[32]=涨跌幅
                if (parts.length > 32) {
                    const name = indexNames[pureCode] || parts[1] || pureCode;
                    const price = parts[3] || '--';
                    const changeAmt = parts[31] || '--';
                    const changePct = parts[32] || '--';
                    const sign = Number(changePct) >= 0 ? '+' : '';
                    results.push(`${name}: ${price} 点 (${sign}${changePct}%, ${sign}${changeAmt})`);
                }
            }
        }

        if (results.length > 0) {
            return `📊 **今日 A 股核心指数实时行情**:\n${results.join('\n')}`;
        }
        return '';
    } catch (e) {
        console.warn('fetchMarketContext failed, proceeding without market data:', e);
        return ''; // 获取失败时不阻塞主流程
    }
}

/**
 * 请求 AI 进行宏观大盘、未来趋势及建仓时机分析 (流式输出)
 * @param signal 可选的 AbortSignal，用于中途取消请求
 */
export async function getMarketTrendAnalysisStream(
    prompt: string,
    apiKey: string,
    onMessage: (chunk: string) => void,
    onError: (err: string) => void,
    onFinish: () => void,
    signal?: AbortSignal
) {
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const systemPrompt = `你是一位顶级的宏观经济学家与资深量化/基本面基金经理。你的任务是基于当前的全球宏观经济环境、地缘政治冲突、不同国家的宏观政策导向（如货币环境、产业扶持），以及前沿科技的发展演进路径（例如AI产业爆发导致的CPO、存储芯片、高算力需求及激增的电力需求），进行全方位的深度投研分析。

请按照以下结构输出你的预测研报：
0. **【当前时间节点与前沿热点洞察】**：首先明确感知当前距离你知识库最近的时间节点，或者通过常识预判当前大环境下（比如2024-2026年周期内）最具统领性的全球核心矛盾与科技热点资讯。**即使我不提供任何关键词，你也必须从你的知识库中自主发掘当前最可能引爆市场的几个默认宏观大逻辑板块。**
1. **【宏观与地缘基本面分析】**：深刻剖析当前全球与国内的核心宏观进程、政策环境及地缘冲突带来的实质性经济逻辑与产业影响。
2. **【未来核心演进链路与热门板块预测】**：依据你在第0步洞察出的热点，洞察下一个可能迎来爆发的细分板块，必须基于扎实的产业逻辑演进（例如技术突破引发的配套上下游紧缺）。
3. **【细分标的与基本面定性评估】**：在锁定的热点板块中，**你必须根据你的知识库推荐几只非常优质且具体的个股（请给出股票名称及代码）或者相关的主题基金**。依据逻辑与产业位置阐述由于预期差带来的配置价值。
4. **【建仓策略与风险揭示】**：结合市场情绪与流动性变动，提供定性的资产配置策略。**请特别指出该推荐在相应周期内的核心催化剂与面临的主要下行风险点。**

**核心纪律与要求**：
- **严防金融数据幻觉**：严禁虚构均线、MACD、RSI、PE(市盈率)、预估财报增速等绝对定量数据！所有推演必须是确凿的宏观定性分析或产业事实。
- **杜绝数字迎合**：严禁给个股或板块提供类似 +15% 或 +30% 的具体预估收益率，这在合规中是绝对禁止的。
- **驳斥伪逻辑**：如果用户输入的关注热点存在伪科学假定、虚假违背常识的传闻或不合逻辑的推断（如炒作不存在的技术），你必须首先客观驳斥该伪逻辑，拒绝顺从，再提供你认为合理的真实方向。
- 使用极具金融专业度与逻辑穿透力的语言。使用清晰的 Markdown 格式排版提供极佳的阅读质感。直接产出高能量密度的投研结果，无须过度免责废话。
- **重要：下方用户消息中会附带今日 A 股核心指数的实时行情数据，这是真实的市场数据，请务必以此作为你此次推演的客观起点，而非凭空臆测市场当前状态。**`;

        // 注入更精确的时间锚点（包含具体时刻，盘前/盘中/盘后）
        const now = new Date();
        const currentDateTime = now.toLocaleString('zh-CN', {
            year: 'numeric', month: 'long', day: 'numeric',
            weekday: 'long', hour: '2-digit', minute: '2-digit'
        });
        const hour = now.getHours();
        const tradingPhase = hour < 9 ? '盘前' :
            (hour < 11 || (hour === 11 && now.getMinutes() <= 30)) ? 'A 股上午盘交易时段' :
                (hour < 13) ? 'A 股午间休市' :
                    (hour < 15) ? 'A 股下午盘交易时段' : '盘后（收盘后）';

        // 并发获取实时市场数据
        const marketContext = await fetchMarketContext();

        const marketDataBlock = marketContext
            ? `\n\n---\n以下是系统自动获取的【真实实时市场数据】，请以此为推演起点：\n${marketContext}\n---\n`
            : '\n（注意：系统未能获取到实时市场行情数据，请你基于知识库进行定性推演）\n';

        const userContent = prompt.trim()
            ? `当前系统时间是：${currentDateTime}，目前处于 ${tradingPhase}。${marketDataBlock}用户的特别关注点/自定义热点聚焦于:【${prompt}】。请结合上方真实市场数据、上述关注点以及你自身发掘的时下最前沿硬核资讯，展开全局宏观推演。`
            : `当前系统时间是：${currentDateTime}，目前处于 ${tradingPhase}。${marketDataBlock}用户未指定具体热点。请你直接履行职责，先基于上方真实市场数据判断今日市场整体氛围，再自主检索和判断当前时间节点下，国内外的重大热点资讯与产业进程，自动寻找并锁定几个最核心的默认板块，然后给出精准的建仓策略分析。`;

        const response = await fetch('/api/ai/v1/chat/completions', {
            method: 'POST',
            headers,
            signal, // 支持外部 AbortController 中断请求
            body: JSON.stringify({
                model: 'gemini-3.1-pro-high',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userContent }
                ],
                stream: true,
            })
        });

        if (!response.ok) {
            throw new Error("AI Request failed: HTTP " + response.status);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');

        if (!reader) {
            throw new Error('No streaming response body available');
        }

        let done = false;
        let sseBuffer = ''; // 缓冲区：处理跨 chunk 的不完整 SSE 行
        while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;

            if (value) {
                sseBuffer += decoder.decode(value, { stream: true });
                const lines = sseBuffer.split('\n');
                // 最后一个元素可能是不完整的行，保留到下一轮
                sseBuffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('data: ')) {
                        const dataStr = trimmed.slice(6);
                        if (dataStr === '[DONE]') {
                            done = true;
                            break;
                        }
                        try {
                            const parsed = JSON.parse(dataStr);
                            const content = parsed.choices?.[0]?.delta?.content || '';
                            if (content) {
                                onMessage(content);
                            }
                        } catch (e) {
                            // 极少数情况下仍可能出现不完整 JSON，安全忽略
                        }
                    }
                }
            }
        }
        onFinish();
    } catch (error: any) {
        // AbortController 触发的中断不算错误
        if (error.name === 'AbortError') {
            onFinish();
            return;
        }
        console.error('Market Trend Stream Error:', error);
        onError(error.message || '趋势分析请求发生错误，请检查网络或代理配置');
    }
}

/**
 * 把预测结果保存到本地文件系统（通过 Vite dev server 中间件实现）
 * @param content 要保存的 Markdown 内容
 * @param title 可选，文件的自定义前缀名，默认为'市场推演'
 */
export async function savePredictionLocally(content: string, title?: string): Promise<boolean> {
    try {
        const response = await fetch('/api/save-prediction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title || '',
                content: content,
            }),
        });

        const data = await response.json();
        return !!data.success;
    } catch (error) {
        console.error('Failed to save prediction locally:', error);
        return false;
    }
}

