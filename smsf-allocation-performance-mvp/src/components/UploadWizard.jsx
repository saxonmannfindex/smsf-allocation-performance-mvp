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
    setUploadStatus(prev => ({ ...prev, [stepKey]: 'idle' }));
    setErrors(prev => ({ ...prev, [stepKey]: null }));
  }, []);

  const isComplete = parsedData.asset_allocation && parsedData.performance;

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-4">
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
                <div className={`w-16 h-0.5 rounded-full transition-colors duration-500 ${
                  uploadStatus[STEPS[index].key] === 'success' 
                    ? 'bg-emerald-400' 
                    : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="grid md:grid-cols-2 gap-6">
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
        <div className="text-center p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/60">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-emerald-900 font-semibold text-lg">Both reports uploaded successfully!</p>
          <p className="text-emerald-600 text-sm mt-1">Analysis is ready below.</p>
        </div>
      )}
    </div>
  );
}

/**
 * Step indicator in the progress bar
 */
function StepIndicator({ step, isActive, isComplete, hasError, onClick }) {
  let containerClasses = 'bg-gray-100 text-gray-400 border-gray-200';
  let ringClasses = '';

  if (isComplete) {
    containerClasses = 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200/50';
  } else if (hasError) {
    containerClasses = 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-200/50';
  } else if (isActive) {
    containerClasses = 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-200/50';
    ringClasses = 'ring-4 ring-blue-100';
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        className={`
          flex items-center justify-center w-12 h-12 rounded-xl border-2
          ${containerClasses} ${ringClasses}
          font-semibold text-sm transition-all duration-200 cursor-pointer
          hover:scale-105 active:scale-95
        `}
      >
        {isComplete ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          step.id
        )}
      </button>
      <span className={`text-xs font-medium transition-colors ${
        isActive || isComplete ? 'text-gray-700' : 'text-gray-400'
      }`}>
        {step.title.split(' ')[0]}
      </span>
    </div>
  );
}

/**
 * Individual step card with upload zone
 */
function StepCard({ step, status, error, isActive, parsedData, onFileUpload, onReset }) {
  const isComplete = status === 'success';
  
  return (
    <div className={`
      rounded-2xl border-2 transition-all duration-300 overflow-hidden
      ${isActive && !isComplete ? 'border-blue-200 shadow-lg shadow-blue-50/50' : ''}
      ${isComplete ? 'border-emerald-200 shadow-lg shadow-emerald-50/50' : ''}
      ${!isActive && !isComplete ? 'border-gray-200/60' : ''}
    `}>
      {/* Card Header */}
      <div className={`
        px-5 py-4 border-b flex items-center justify-between transition-colors
        ${isComplete ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100' : 'bg-gradient-to-r from-slate-50 to-white border-gray-100'}
      `}>
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            ${isComplete ? 'bg-emerald-100' : 'bg-gray-100'}
          `}>
            <svg className={`w-5 h-5 ${isComplete ? 'text-emerald-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{step.title}</h3>
            <p className="text-xs text-gray-500">{step.description}</p>
          </div>
        </div>
        {isComplete && (
          <button
            onClick={onReset}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors"
            title="Upload different file"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Upload Zone */}
      <div className="p-5 bg-white">
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
      <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-100">
        <div className="flex items-center gap-2 text-emerald-600 mb-3">
          <div className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="font-medium text-sm">Extracted Data</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
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
      <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-100">
        <div className="flex items-center gap-2 text-emerald-600 mb-3">
          <div className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="font-medium text-sm">Extracted Data</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
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
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm font-semibold tabular-nums ${highlight ? 'text-emerald-700' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  );
}