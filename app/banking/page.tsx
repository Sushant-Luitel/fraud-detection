"use client";

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function BankingPortal() {
  const [sourceAccount, setSourceAccount] = useState('NPR-1002934');
  const [destinationAccount, setDestinationAccount] = useState('9876543210');
  const [remarks, setRemarks] = useState('Family Support');
  
  // Demo Controls State
  const [accountAgeDays, setAccountAgeDays] = useState(15);
  const [recentDepositAmount, setRecentDepositAmount] = useState(50000);
  const [transferAmount, setTransferAmount] = useState(10000);
  const [isSuspiciousIP, setIsSuspiciousIP] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleScenarioA = () => {
    setAccountAgeDays(45);
    setRecentDepositAmount(50000);
    setTransferAmount(10000);
    setIsSuspiciousIP(false);
    setResult(null);
  };

  const handleScenarioB = () => {
    setAccountAgeDays(2);
    setRecentDepositAmount(120000);
    setTransferAmount(115000);
    setIsSuspiciousIP(true);
    setResult(null);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: sourceAccount,
          accountAgeDays,
          recentDepositAmount,
          transferOutAmount: transferAmount,
          isSuspiciousIP,
          destinationAccount,
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-blue-900 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center font-bold text-blue-900">N</div>
            <h1 className="text-xl font-bold tracking-tight">Nepal Digital Bank</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Welcome, Retail Customer</span>
            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-sm border border-blue-500">C</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4 md:mt-8">
        {/* Banking Form Area */}
        <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-8 py-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Quick Fund Transfer</h2>
            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">Secured by AI</span>
          </div>
          
          <div className="p-8">
            {result && result.status === 'APPROVED' && (
              <div className="mb-8 bg-green-50 border border-green-200 p-4 rounded-lg flex items-start shadow-sm">
                <CheckCircle2 className="text-green-600 mr-3 h-6 w-6 flex-shrink-0" />
                <div>
                  <h3 className="text-green-900 font-semibold">Transfer Successful</h3>
                  <p className="text-green-800 text-sm mt-1">NPR {transferAmount.toLocaleString()} has been securely transferred to {destinationAccount}.</p>
                  <p className="text-green-700 text-xs mt-2 font-mono bg-green-100 inline-block px-2 py-1 rounded">Ref: {result.id}</p>
                </div>
              </div>
            )}

            {result && result.status === 'BLOCKED' && (
              <div className="mb-8 bg-red-50 border-2 border-red-500 p-5 rounded-lg flex items-start shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
                <ShieldAlert className="text-red-600 mr-4 h-8 w-8 flex-shrink-0 animate-pulse" />
                <div>
                  <h3 className="text-red-900 font-bold text-lg leading-tight">Transaction Intercepted & Account Temporarily Restricted</h3>
                  <p className="text-red-700 font-semibold mt-1">AI Risk Engine Code: MULE-80</p>
                  <p className="text-red-800 text-sm mt-3 bg-red-100 p-2 rounded border border-red-200">
                    For your security, this transaction has been halted. Please contact customer support immediately. Your account has been frozen pending review.
                  </p>
                  <div className="mt-3 text-xs text-red-600 font-mono">Trace ID: {result.id} | Score: {result.score}</div>
                </div>
              </div>
            )}

            <form onSubmit={handleTransfer} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Source Account</label>
                  <input type="text" value={sourceAccount} onChange={(e) => setSourceAccount(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Destination Account</label>
                  <input type="text" value={destinationAccount} onChange={(e) => setDestinationAccount(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Transfer Amount (NPR)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm font-semibold">NPR</span>
                  </div>
                  <input type="number" value={transferAmount} onChange={(e) => setTransferAmount(Number(e.target.value))} className="w-full pl-12 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold text-lg text-gray-900 transition" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Remarks</label>
                <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" />
              </div>

              <div className="pt-4">
                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 rounded-lg transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center text-lg">
                  {isLoading ? 'Processing securely...' : (
                    <>Confirm Transfer <ArrowRight className="ml-2 w-5 h-5" /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="lg:col-span-5 bg-slate-900 rounded-xl shadow-xl p-6 text-white border border-slate-700 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-blue-500 opacity-10 blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center mb-6 border-b border-slate-700 pb-4 relative z-10">
            <AlertTriangle className="text-yellow-400 mr-2 h-6 w-6" />
            <h2 className="text-xl font-bold text-white tracking-tight">Demo Simulation Controls</h2>
          </div>
          
          <div className="space-y-8 relative z-10">
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={handleScenarioA} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg p-3 transition text-left group">
                <div className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">Scenario A</div>
                <div className="text-green-400 font-bold group-hover:text-green-300">Normal Customer</div>
              </button>
              <button type="button" onClick={handleScenarioB} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg p-3 transition text-left group">
                <div className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">Scenario B</div>
                <div className="text-red-400 font-bold group-hover:text-red-300">Active Mule Transfer</div>
              </button>
            </div>

            <div className="space-y-6 pt-2">
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Account Age</label>
                  <span className="text-xs font-mono bg-slate-700 px-2 py-0.5 rounded text-blue-300">{accountAgeDays} Days</span>
                </div>
                <input type="range" min="1" max="100" value={accountAgeDays} onChange={(e) => setAccountAgeDays(Number(e.target.value))} className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
              </div>

              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Recent Deposit</label>
                  <span className="text-xs font-mono bg-slate-700 px-2 py-0.5 rounded text-blue-300">NPR {recentDepositAmount.toLocaleString()}</span>
                </div>
                <input type="range" min="0" max="500000" step="5000" value={recentDepositAmount} onChange={(e) => setRecentDepositAmount(Number(e.target.value))} className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
              </div>

              <div className="flex items-center justify-between bg-slate-800 p-4 rounded-lg border border-slate-600 shadow-inner">
                <div>
                  <label className="text-sm font-semibold text-slate-200 block">Suspicious IP</label>
                  <span className="text-xs text-slate-400">Simulate unknown/flagged network</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={isSuspiciousIP} onChange={(e) => setIsSuspiciousIP(e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
