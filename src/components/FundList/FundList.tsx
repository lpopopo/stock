import React, { useEffect } from 'react';
import { useFundStore } from '../../store/fund.store';
import { getFundEstimate } from '../../api/fund';
import './FundList.css';

interface FundListProps {
    onAdd: () => void;
}

const FundList: React.FC<FundListProps> = ({ onAdd }) => {
    const { funds, selectedCode, estimates, loadingEstimate, selectFund, removeFund, setEstimate, setLoadingEstimate } =
        useFundStore();

    // 批量加载实时估值
    useEffect(() => {
        funds.forEach((fund) => {
            if (!estimates[fund.code] && !loadingEstimate[fund.code]) {
                setLoadingEstimate(fund.code, true);
                getFundEstimate(fund.code).then((est) => {
                    setLoadingEstimate(fund.code, false);
                    if (est) setEstimate(fund.code, est);
                });
            }
        });
    }, [funds]);

    // 每次组件挂载时刷新一次，不再需要定时轮询估值了，因为准确净值一天只更新一次
    useEffect(() => {
        funds.forEach((fund) => {
            getFundEstimate(fund.code).then((est) => {
                if (est) setEstimate(fund.code, est);
            });
        });
    }, [funds]);

    const formatChangeRate = (rate: string) => {
        const num = parseFloat(rate);
        if (isNaN(num)) return { text: '--', cls: '' };
        return {
            text: `${num > 0 ? '+' : ''}${num.toFixed(2)}%`,
            cls: num > 0 ? 'up' : num < 0 ? 'down' : 'flat',
        };
    };

    return (
        <div className="fund-list">
            <div className="fund-list-header">
                <span className="fund-list-title">我的基金</span>
                <button className="add-btn" onClick={onAdd}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    添加
                </button>
            </div>

            <div className="fund-list-body">
                {funds.length === 0 && (
                    <div className="fund-empty">
                        <div className="fund-empty-icon">📊</div>
                        <div>暂无基金</div>
                        <div className="fund-empty-hint">点击「添加」按钮，输入基金代码开始追踪</div>
                    </div>
                )}

                {funds.map((fund) => {
                    const est = estimates[fund.code];
                    const isLoading = loadingEstimate[fund.code];
                    const change = est ? formatChangeRate(est.gszzl) : null;
                    const isSelected = selectedCode === fund.code;

                    return (
                        <div
                            key={fund.code}
                            className={`fund-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => selectFund(fund.code)}
                        >
                            <div className="fund-card-left">
                                <div className="fund-name">{fund.name || est?.name || fund.code}</div>
                                <div className="fund-code">{fund.code}</div>
                                {est && (
                                    <div className="fund-nav">
                                        公布净值 {parseFloat(est.dwjz || est.gsz || '0').toFixed(4)}
                                    </div>
                                )}
                            </div>
                            <div className="fund-card-right">
                                {isLoading ? (
                                    <div className="loading-dot">···</div>
                                ) : change ? (
                                    <>
                                        <div className={`fund-change ${change.cls}`}>{change.text}</div>
                                        <div className="fund-est-nav">{parseFloat(est?.gsz || est?.dwjz || '0').toFixed(4)}</div>
                                        <div className="fund-time">{est?.gztime?.split(' ')[1] || est?.gztime || ''}</div>
                                    </>
                                ) : (
                                    <div className="fund-no-data">--</div>
                                )}
                                <button
                                    className="remove-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFund(fund.code);
                                    }}
                                    title="移除"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="fund-list-footer">
                共 {funds.length} 只基金 · 数据来源天天基金
            </div>
        </div>
    );
};

export default FundList;
