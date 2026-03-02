import { useState, useEffect } from 'react';
import { useFundStore } from './store/fund.store';
import FundList from './components/FundList/FundList';
import FundDetail from './components/FundDetail/FundDetail';
import AddFundModal from './components/AddFundModal/AddFundModal';
import TrendAnalysis from './components/TrendAnalysis/TrendAnalysis';
import './App.css';

function App() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeView, setActiveView] = useState<'detail' | 'trend'>('detail');
  const initFunds = useFundStore((state) => state.initFunds);

  useEffect(() => {
    initFunds();
  }, [initFunds]);

  return (
    <div className="app">
      {/* 顶部导航栏 */}
      <header className="app-header">
        <div className="app-logo">
          <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
            <path d="M3 17L9 11L13 15L21 7" stroke="url(#grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="grad" x1="3" y1="7" x2="21" y2="17">
                <stop offset="0%" stopColor="#58a6ff" />
                <stop offset="100%" stopColor="#3fb950" />
              </linearGradient>
            </defs>
          </svg>
          <span>FundTracker</span>
        </div>
        <div className="app-header-nav">
          <button
            className={`nav-btn ${activeView === 'detail' ? 'active' : ''}`}
            onClick={() => setActiveView('detail')}
          >
            📊 基金诊断
          </button>
          <button
            className={`nav-btn ${activeView === 'trend' ? 'active' : ''}`}
            onClick={() => setActiveView('trend')}
          >
            🔮 市场推演
          </button>
        </div>
        <div className="app-header-right">
          <span className="header-badge">最新净值</span>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="app-main">
        {activeView === 'detail' ? (
          <>
            <aside className="app-sidebar">
              <FundList onAdd={() => setShowAddModal(true)} />
            </aside>
            <section className="app-content">
              <FundDetail />
            </section>
          </>
        ) : (
          <section className="app-content">
            <TrendAnalysis />
          </section>
        )}
      </main>

      {/* 添加基金弹窗 */}
      <AddFundModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}

export default App;
