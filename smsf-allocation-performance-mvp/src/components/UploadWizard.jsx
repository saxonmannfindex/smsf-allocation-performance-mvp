/**
 * UploadWizard Component
 * 
 * Two-step upload flow for PDF reports:
 * 1. Upload Asset Allocation report
 * 2. Upload Performance (TWR) report
 * 
 * Presentation-grade styling with clear progress indication.
 */

import React, { useState, useCallback } from 'react';
import DropZone from './DropZone.jsx';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { parseReport, identifyReportType } from '../parsers/reportRegistry.js';

// Step definitions
const STEPS = [
  {
    id: 1,
    key: 'asset_allocation',
    title: 'Asset Allocation Report',
    description: 'Upload the Investment Allocation PDF',
    expectedType: 'asset_allocation',
  },
  {
    id: 2,
    key: 'performance',
    title: 'Performance Report',
    description: 'Upload the Investment Movement and Returns PDF',
    expectedType: 'performance',
  },
];

/* ============================================================================
   UI-ONLY ADDITION: Hero / Empty State Section Component
   Provides context and professional entry point before uploads begin
   ============================================================================ */
function HeroSection({ hasAnyUpload }) {
  if (hasAnyUpload) return null;

  return (
    <div className="mb-8">
      {/* Main Hero Card */}
      <div className="relative overflow-hidden rounded-xl bg-[#1a1f2e] border border-slate-700/50 p-8 md:p-10">
        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
          }}
        />
        
        <div className="relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="text-[10px] font-semibold text-slate-400 tracking-[0.2em] uppercase">
              Document Upload
            </span>
          </div>
          
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2 tracking-tight">
            Portfolio Report Intake
          </h1>
          
          {/* Subtitle */}
          <p className="text-slate-400 text-sm md:text-base max-w-xl leading-relaxed mb-8">
            Upload your portfolio documents to generate consolidated analysis and performance metrics.
          </p>
          
          {/* Document Requirements */}
          <div className="grid md:grid-cols-2 gap-4">
            <DocumentRequirementCard
              number="1"
              title="Asset Allocation"
              description="Current holdings breakdown by asset class"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              }
            />
            <DocumentRequirementCard
              number="2"
              title="Performance Report"
              description="Time-weighted returns and movement history"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />
          </div>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="mt-4 flex items-start gap-2 px-1">
        <svg className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m2-10V5m0 0V3m0 2h2m-2 0H10" />
        </svg>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Documents are processed locally and not stored externally.
        </p>
      </div>
    </div>
  );
}

/* ============================================================================
   UI-ONLY ADDITION: Document Requirement Card
   Shows what documents user needs to upload
   ============================================================================ */
function DocumentRequirementCard({ number, title, description, icon }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-slate-700/50 flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[9px] font-semibold text-emerald-400/80 uppercase tracking-wider">
            Step {number}
          </span>
        </div>
        <h3 className="font-medium text-white text-sm mb-0.5">{title}</h3>
        <p className="text-[11px] text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* ============================================================================
   UI-ONLY ADDITION: Compact Header for post-upload state
   Minimal header once uploads have started
   ============================================================================ */
function CompactHeader({ hasAnyUpload }) {
  if (!hasAnyUpload) return null;

  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h2 className="font-medium text-white text-base">Portfolio Report Intake</h2>
          <p className="text-[11px] text-slate-500">Upload both reports to generate analysis</p>
        </div>
      </div>
    </div>
  );
}

export default function UploadWizard({ onComplete, onPartialData }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadStatus, setUploadStatus] = useState({
    asset_allocation: 'idle',
    performance: 'idle',
  });
  const [parsedData, setParsedData] = useState({
    asset_allocation: null,
    performance: null,
  });
  const [errors, setErrors] = useState({
    asset_allocation: null,
    performance: null,
  });

  // Handle file upload for a specific step
  const handleFileUpload = useCallback(async (file, error, stepKey) => {
    if (error) {
      setErrors(prev => ({ ...prev, [stepKey]: error }));
      setUploadStatus(prev => ({ ...prev, [stepKey]: 'error' }));
      return;
    }

    if (!file) return;

    setUploadStatus(prev => ({ ...prev, [stepKey]: 'processing' }));
    setErrors(prev => ({ ...prev, [stepKey]: null }));

    try {
      console.log(`[UploadWizard] Extracting text from ${file.name}...`);
      const extractedPdf = await extractTextFromPDF(file);
      
      if (!extractedPdf.fullText || extractedPdf.fullText.length < 100) {
        throw new Error('Could not extract text from PDF. The file may be image-based or corrupted.');
      }

      const identification = identifyReportType(extractedPdf.fullText);
      console.log(`[UploadWizard] Identified as: ${identification?.type || 'unknown'}`);

      const step = STEPS.find(s => s.key === stepKey);
      if (identification?.type !== step.expectedType) {
        const expectedName = step.title;
        const actualName = identification?.name || 'Unknown report type';
        throw new Error(
          `This appears to be a ${actualName}. Please upload a ${expectedName} for this step.`
        );
      }

      const parsed = await parseReport(extractedPdf);
      console.log(`[UploadWizard] Parsed ${stepKey}:`, parsed);

      const newParsedData = { ...parsedData, [stepKey]: parsed.data };
      setParsedData(newParsedData);
      setUploadStatus(prev => ({ ...prev, [stepKey]: 'success' }));

      if (onPartialData) {
        onPartialData(stepKey, parsed.data);
      }

      if (currentStep < STEPS.length) {
        setTimeout(() => setCurrentStep(currentStep + 1), 500);
      }

      if (stepKey === 'performance' && newParsedData.asset_allocation) {
        if (onComplete) {
          onComplete(newParsedData);
        }
      } else if (stepKey === 'asset_allocation' && newParsedData.performance) {
        if (onComplete) {
          onComplete(newParsedData);
        }
      }

    } catch (err) {
      console.error(`[UploadWizard] Error processing ${stepKey}:`, err);
      setErrors(prev => ({ ...prev, [stepKey]: err.message }));
      setUploadStatus(prev => ({ ...prev, [stepKey]: 'error' }));
    }
  }, [currentStep, parsedData, onComplete, onPartialData]);

  const handleReset = useCallback((stepKey) => {
    setParsedData(prev => ({ ...prev, [stepKey]: null }));
    setUploadStatus(prev => ({ ...prev, [stepKey]: null }));
    setErrors(prev => ({ ...prev, [stepKey]: null }));
  }, []);

  const isComplete = parsedData.asset_allocation && parsedData.performance;

  const hasAnyUpload = uploadStatus.asset_allocation !== 'idle' || uploadStatus.performance !== 'idle';

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero section for empty state */}
      <HeroSection hasAnyUpload={hasAnyUpload} />
      
      {/* Compact header after uploads begin */}
      <CompactHeader hasAnyUpload={hasAnyUpload} />

      <div className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center py-2">
          <div className="flex items-center gap-3">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <StepIndicator
                  step={step}
                  isActive={currentStep === step.id}
                  isComplete={uploadStatus[step.key] === 'success'}
                  hasError={uploadStatus[step.key] === 'error'}
                  onClick={() => setCurrentStep(step.id)}
                />
                {index < STEPS.length - 1 && (
                  <div className={`w-12 md:w-20 h-[2px] rounded-full transition-all duration-500 ${
                    uploadStatus[STEPS[index].key] === 'success' 
                      ? 'bg-emerald-500' 
                      : 'bg-slate-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="grid md:grid-cols-2 gap-4">
          {STEPS.map((step) => (
            <StepCard
              key={step.key}
              step={step}
              status={uploadStatus[step.key]}
              error={errors[step.key]}
              isActive={currentStep === step.id}
              parsedData={parsedData[step.key]}
              onFileUpload={(file, error) => handleFileUpload(file, error, step.key)}
              onReset={() => handleReset(step.key)}
            />
          ))}
        </div>

        {/* Completion Message */}
        {isComplete && (
          <div className="text-center p-6 bg-[#1a1f2e] rounded-xl border border-emerald-500/20">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-medium text-sm">Reports Uploaded Successfully</p>
            <p className="text-slate-400 text-xs mt-1">Analysis is ready below</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Step indicator in the progress bar
 */
function StepIndicator({ step, isActive, isComplete, hasError, onClick }) {
  let containerClasses = 'bg-slate-800 text-slate-500 border-slate-700';

  if (isComplete) {
    containerClasses = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
  } else if (hasError) {
    containerClasses = 'bg-red-500/20 text-red-400 border-red-500/50';
  } else if (isActive) {
    containerClasses = 'bg-slate-700 text-white border-slate-500';
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        className={`
          flex items-center justify-center w-10 h-10 rounded-lg border
          ${containerClasses}
          font-medium text-sm transition-all duration-200 cursor-pointer
          hover:scale-105 active:scale-95
        `}
      >
        {isComplete ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          step.id
        )}
      </button>
      <span className={`text-[10px] font-medium tracking-wide transition-colors ${
        isActive || isComplete ? 'text-slate-300' : 'text-slate-600'
      }`}>
        {step.key === 'asset_allocation' ? 'Allocation' : 'Performance'}
      </span>
    </div>
  );
}

/**
 * Individual step card with upload zone
 */
function StepCard({ step, status, error, isActive, parsedData, onFileUpload, onReset }) {
  const isComplete = status === 'success';
  const isProcessing = status === 'processing';
  const hasError = status === 'error';
  
  return (
    <div className={`
      rounded-xl border transition-all duration-300 overflow-hidden
      ${isActive && !isComplete ? 'border-slate-600 bg-[#1a1f2e]' : ''}
      ${isComplete ? 'border-emerald-500/30 bg-[#1a1f2e]' : ''}
      ${hasError ? 'border-red-500/30 bg-[#1a1f2e]' : ''}
      ${!isActive && !isComplete && !hasError ? 'border-slate-700/50 bg-[#141820]' : ''}
    `}>
      {/* Card Header */}
      <div className={`
        px-4 py-3 border-b flex items-center justify-between transition-colors
        ${isComplete ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-800/30 border-slate-700/50'}
      `}>
        <div className="flex items-center gap-3">
          <div className={`
            w-8 h-8 rounded-md flex items-center justify-center
            ${isComplete ? 'bg-emerald-500/20' : 'bg-slate-700/50'}
          `}>
            {step.key === 'asset_allocation' ? (
              <svg className={`w-4 h-4 ${isComplete ? 'text-emerald-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            ) : (
              <svg className={`w-4 h-4 ${isComplete ? 'text-emerald-400' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-medium text-white text-sm">{step.title}</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{step.description}</p>
          </div>
        </div>
        {isComplete && (
          <button
            onClick={onReset}
            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700/50 rounded-md transition-colors"
            title="Upload different file"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Upload Zone */}
      <div className="p-4">
        <DropZone
          onFileSelect={onFileUpload}
          status={status}
          label={null}
          description="PDF files only"
          errorMessage={error}
          acceptedFileName={isComplete ? `${step.title} loaded` : null}
        />
        
        {/* Parsed Data Preview */}
        {isComplete && parsedData && (
          <ParsedDataPreview type={step.key} data={parsedData} />
        )}
      </div>
    </div>
  );
}

/**
 * Preview of parsed data
 */
function ParsedDataPreview({ type, data }) {
  const formatCurrency = (value) => {
    if (value == null) return '—';
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (type === 'asset_allocation' && data) {
    return (
      <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
        <div className="flex items-center gap-2 text-emerald-400 mb-3">
          <div className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="font-medium text-xs">Extracted Data</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DataItem label="Asset Classes" value={data.assetClasses?.length || 0} />
          <DataItem label="Holdings" value={data.holdings?.length || 0} />
          <DataItem label="Total Value" value={formatCurrency(data.totalValue)} highlight />
          <DataItem label="As At Date" value={data.asAtDate || 'N/A'} />
        </div>
      </div>
    );
  }
  
  if (type === 'performance' && data) {
    return (
      <div className="mt-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
        <div className="flex items-center gap-2 text-emerald-400 mb-3">
          <div className="w-4 h-4 rounded bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="font-medium text-xs">Extracted Data</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DataItem 
            label="Period" 
            value={`${data.period?.from || 'N/A'} — ${data.period?.to || 'N/A'}`} 
            fullWidth 
          />
          <DataItem 
            label="1Y TWR" 
            value={data.twr?.oneYear != null ? `${data.twr.oneYear}%` : 'N/A'} 
            highlight 
          />
          <DataItem 
            label="Ending Value" 
            value={formatCurrency(data.endingMarketValue)}
          />
          <DataItem 
            label="Net Return" 
            value={formatCurrency(data.dollarReturnAfterExpenses)}
            fullWidth
          />
        </div>
      </div>
    );
  }
  
  return null;
}

/**
 * Individual data item in preview
 */
function DataItem({ label, value, highlight, fullWidth }) {
  return (
    <div className={fullWidth ? 'col-span-2' : ''}>
      <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={`text-xs font-medium tabular-nums ${highlight ? 'text-emerald-400' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}