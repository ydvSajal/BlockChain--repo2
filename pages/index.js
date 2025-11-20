import React, { useState } from 'react';
import Header from '../components/Header';
import GameBoard from '../components/GameBoard';
import ContractStats from '../components/ContractStats';
import GameHistory from '../components/GameHistory';
import StatsPanel from '../components/StatsPanel';

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'history'

  // Trigger refresh after game completion
  const handleGameComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Header />
      
      {/* Center container with max-width */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <main className="space-y-6">
          <ContractStats />
          
          {/* Grid layout: Main game area (left) + Sidebar (right) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
            {/* Main game area */}
            <div>
              <GameBoard onGameComplete={handleGameComplete} />
            </div>
            
            {/* Sidebar - Stats & History */}
            <div className="space-y-6">
              {/* Tab Switcher */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-2 flex gap-2">
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                    activeTab === 'stats'
                      ? 'bg-purple-600 text-white'
                      : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  📊 Stats
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
                    activeTab === 'history'
                      ? 'bg-purple-600 text-white'
                      : 'bg-transparent text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  📜 History
                </button>
              </div>

              {/* Content */}
              {activeTab === 'stats' ? (
                <StatsPanel refreshTrigger={refreshTrigger} />
              ) : (
                <GameHistory key={refreshTrigger} />
              )}
            </div>
          </div>

          {/* Full Width History Section for Mobile/Tablet */}
          <div className="lg:hidden">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 mb-4">
              <h3 className="text-xl font-bold text-white mb-3">📜 Complete History</h3>
            </div>
            <GameHistory key={`mobile-${refreshTrigger}`} />
          </div>
        </main>
      </div>
    </div>
  );
}