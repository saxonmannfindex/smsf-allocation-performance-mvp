/**
 * SMSF Intelligence Platform - Main Application
 * 
 * This is the main application component that orchestrates:
 * 1. PDF upload wizard (two-step flow)
 * 2. Fund analysis and display
 * 3. Classification and benchmark comparison
 * 
 * UI FLOW CHOICE: Option A (Two-Step Upload)
 * Reasoning:
 * - Clearer user experience - users know exactly what to upload at each step
 * - Better error handling - can validate each report type independently
 * - Partial results visible after first upload
 * - Simpler implementation with explicit type expectations per step
 * - No risk of auto-detection misidentifying report types
 */



import FinancialDashboard from './components/Dashboard.jsx';

import React, { useState, useCallback } from 'react';
import { FileText, RefreshCw, Download, ChevronDown, ChevronUp } from 'lucide-react';

import UploadWizard from './components/UploadWizard.jsx';
import FundSummary from './components/FundSummary.jsx';
import PerformanceAnalysis from './components/PerformanceAnalysis.jsx';
import Insights, { PerformanceScoreCard } from './components/Insights.jsx';

import { createFundModel, generateFundId, validateFundModel } from './engines/fundModel.js';
import { getClassificationStyle } from './engines/performanceEngine.js';
import { classifyGrowthDefensive } from './engines/classificationEngine.js';

export default function App() {
  // ✅ ALL hooks go here
  const [fund, setFund] = useState(null);
  const [validation, setValidation] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);


  // Handle complete data from upload wizard
 
  const handleUploadComplete = useCallback((parsedData) => {
    const fundId = generateFundId(parsedData);

    const fundModel = createFundModel(fundId, {
      assetAllocation: parsedData.asset_allocation,
      performance: parsedData.performance,
    });

    if (fundModel.assetAllocation?.assetClasses?.length) {
      fundModel.classification = classifyGrowthDefensive(
        fundModel.assetAllocation.assetClasses
      );
    }

    const validationResult = validateFundModel(fundModel);

    setFund(fundModel);
    setValidation(validationResult);

    if (validationResult.isComplete) {
      setIsCollapsed(true);
      setPresentationMode(true); // ✅ just set state
    }
  }, []);


  // Handle partial data (after first report upload)
  const handlePartialData = useCallback((reportType, data) => {
    console.log(`[App] Partial data received: ${reportType}`);
    
    // Create partial model for preview
    const fundId = generateFundId({ [reportType]: data });
    const partialModel = createFundModel(fundId, {
      assetAllocation: reportType === 'asset_allocation' ? data : null,
      performance: reportType === 'performance' ? data : null,
    });
    
    const validationResult = validateFundModel(partialModel);
    
    setFund(partialModel);
    setValidation(validationResult);
  }, []);

  // Reset application state
  const handleReset = useCallback(() => {
    setFund(null);
    setValidation(null);
    setIsCollapsed(false);
    setShowJson(false);
  }, []);

  // Export JSON data
  const handleExportJson = useCallback(() => {

    if (!fund) return;
    
    const dataStr = JSON.stringify(fund, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `fund-analysis-${fund.fundId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [fund]);

  const classStyle = fund ? getClassificationStyle(fund.classification?.classification) : null;

  // ✅ STEP 4: Full-screen presentation mode
  if (presentationMode && fund && validation?.isComplete) {
    return (
      <FinancialDashboard
        fund={fund}
        onReset={() => {
          setPresentationMode(false);
          setFund(null);
          setValidation(null);
          setIsCollapsed(false);
          setShowJson(false);
        }}
      />
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SMSF Intelligence Platform</h1>
                <p className="text-sm text-gray-500">PDF Report Analysis</p>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              {fund && (
                <>
                  <button
                    onClick={() => setShowJson(!showJson)}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {showJson ? 'Hide JSON' : 'View JSON'}
                  </button>
                  <button
                    onClick={handleExportJson}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </>
              )}
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                New Analysis
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Upload Section */}
        <section className={`mb-8 transition-all duration-300 ${isCollapsed ? '' : ''}`}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Section Header (clickable when collapsed) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">Upload Reports</h2>
                {validation?.isComplete && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    Complete
                  </span>
                )}
              </div>
              {isCollapsed ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              )}
            </button>
            
            {/* Upload Wizard (collapsible) */}
            {!isCollapsed && (
              <div className="p-6">
                <UploadWizard
                  onComplete={handleUploadComplete}
                  onPartialData={handlePartialData}
                />
              </div>
            )}
          </div>
        </section>


       
        {/* Empty State */}
        {!fund && (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Upload your SMSF reports to begin analysis</p>
            <p className="text-sm mt-2">
              Start with the Asset Allocation report, then upload the Performance report
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">
            SMSF Intelligence Platform • Local PDF Processing • No Cloud Services
          </p>
        </div>
      </footer>
    </div>
  );
}