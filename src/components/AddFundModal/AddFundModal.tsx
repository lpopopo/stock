import React, { useState } from 'react';
import { useFundStore } from '../../store/fund.store';
import { getFundEstimate } from '../../api/fund';
import './AddFundModal.css';

interface AddFundModalProps {
    visible: boolean;
    onClose: () => void;
}

interface SearchResult {
    code: string;
    name: string;
    loading: boolean;
}

const AddFundModal: React.FC<AddFundModalProps> = ({ visible, onClose }) => {
    const [inputCode, setInputCode] = useState('');
    const [searching, setSearching] = useState(false);
    const [result, setResult] = useState<SearchResult | null>(null);
    const [error, setError] = useState('');
    const { addFund, funds } = useFundStore();

    const handleSearch = async () => {
        const code = inputCode.trim();
        if (!code) {
            setError('请输入基金代码');
            return;
        }
        if (!/^\d{6}$/.test(code)) {
            setError('请输入6位数字基金代码');
            return;
        }
        if (funds.find((f) => f.code === code)) {
            setError('该基金已在列表中');
            return;
        }

        setError('');
        setSearching(true);
        setResult(null);

        try {
            const est = await getFundEstimate(code);
            if (est && est.name) {
                setResult({ code: est.code, name: est.name, loading: false });
            } else {
                setError('未找到该基金，请检查代码');
            }
        } catch {
            setError('查询失败，请稍后重试');
        } finally {
            setSearching(false);
        }
    };

    const handleAdd = () => {
        if (!result) return;
        addFund({ code: result.code, name: result.name });
        setInputCode('');
        setResult(null);
        setError('');
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
        if (e.key === 'Escape') onClose();
    };

    if (!visible) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>添加基金</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="input-group">
                        <input
                            type="text"
                            className="fund-input"
                            placeholder="输入基金代码，如 161725"
                            value={inputCode}
                            onChange={(e) => {
                                setInputCode(e.target.value);
                                setError('');
                                setResult(null);
                            }}
                            onKeyDown={handleKeyDown}
                            maxLength={6}
                            autoFocus
                        />
                        <button
                            className="search-btn"
                            onClick={handleSearch}
                            disabled={searching}
                        >
                            {searching ? (
                                <span className="btn-spinner" />
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            )}
                            查询
                        </button>
                    </div>

                    {error && (
                        <div className="error-msg">
                            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                                <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575ZM8 5a.75.75 0 0 0-.75.75v2.5a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="result-card">
                            <div className="result-info">
                                <div className="result-name">{result.name}</div>
                                <div className="result-code">{result.code}</div>
                            </div>
                            <button className="confirm-btn" onClick={handleAdd}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                加入自选
                            </button>
                        </div>
                    )}

                    <div className="modal-tips">
                        <div className="tips-title">热门基金</div>
                        <div className="tips-list">
                            {[
                                { code: '161725', name: '招商中证白酒' },
                                { code: '110011', name: '易方达中小盘' },
                                { code: '003834', name: '华夏能源革新' },
                                { code: '005827', name: '易方达蓝筹精选' },
                                { code: '012414', name: '景顺长城竞争优势' },
                            ].map((f) => (
                                <div
                                    key={f.code}
                                    className={`tip-item ${funds.find((x) => x.code === f.code) ? 'added' : ''}`}
                                    onClick={() => {
                                        if (!funds.find((x) => x.code === f.code)) {
                                            setInputCode(f.code);
                                            setResult(null);
                                            setError('');
                                        }
                                    }}
                                >
                                    <span className="tip-code">{f.code}</span>
                                    <span className="tip-name">{f.name}</span>
                                    {funds.find((x) => x.code === f.code) && (
                                        <span className="tip-added">已添加</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddFundModal;
