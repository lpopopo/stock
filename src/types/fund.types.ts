// 基金基本信息
export interface FundBasic {
  code: string;        // 基金代码
  name: string;        // 基金名称
  type?: string;       // 基金类型
  manager?: string;    // 基金经理
}

// 我的持有基金（本地存储）
export interface MyFund extends FundBasic {
  addedAt: number;     // 添加时间戳
  shares?: number;     // 持有份额（可选）
  cost?: number;       // 持仓成本（可选）
}

// 实时估值数据
export interface FundEstimate {
  code: string;
  name: string;
  gsz: string;         // 估算净值
  gszzl: string;       // 估算涨跌幅
  gztime: string;      // 估算时间
  dwjz: string;        // 昨日净值
}

// 持仓股票
export interface HoldingStock {
  stockCode: string;   // 股票代码
  stockName: string;   // 股票名称
  ratio: string;       // 持仓比例 %
  shares?: string;     // 持仓股数
  marketValue?: string; // 持仓市值
}

// 基金持仓详情
export interface FundDetail extends FundBasic {
  updateDate?: string;   // 数据更新日期
  holdings: HoldingStock[]; // 持仓股票列表
  totalAssets?: string;  // 总资产
  bondHoldings?: BondHolding[]; // 债券持仓
}

// 债券持仓
export interface BondHolding {
  bondCode: string;
  bondName: string;
  ratio: string;
}

// 跳转平台类型
export type JumpPlatform = 'tonghuashun' | 'xueqiu' | 'eastmoney';

// 股票市场类型（用于识别跳转链接前缀）
export type StockMarket = 'SH' | 'SZ' | 'HK' | 'unknown';
