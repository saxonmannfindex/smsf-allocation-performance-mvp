import React from "react";

/**
 * DropZone Component
 * 
 * Refined file upload zone with presentation-grade styling
 * Supports drag-and-drop and click-to-upload
 */
export default function DropZone({
  onFileSelect,
  status = "idle",
  label,
  description,
  errorMessage,
  acceptedFileName
}) {
  const handleChange = (e) => {
    const file = e.target.files?.[0];
    console.log("[DropZone] File selected:", file?.name);

    if (!file) {
      onFileSelect(null, "No file selected");
      return;
    }

    onFileSelect(file, null);
  };

  // Status-based styling
  const getContainerStyle = () => {
    switch (status) {
      case 'processing':
        return 'border-blue-300 bg-blue-50/50 ring-4 ring-blue-100/50';
      case 'success':
        return 'border-emerald-300 bg-emerald-50/50';
      case 'error':
        return 'border-red-300 bg-red-50/50';
      default:
        return 'border-gray-200 bg-gray-50/30 hover:border-blue-300 hover:bg-blue-50/30 hover:ring-4 hover:ring-blue-100/30';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div className={`
        relative rounded-xl border-2 border-dashed transition-all duration-300
        ${getContainerStyle()}
      `}>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={status === 'processing'}
        />
        
        <div className="flex flex-col items-center justify-center py-8 px-4">
          {/* Icon */}
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300
            ${status === 'processing' ? 'bg-blue-100' : ''}
            ${status === 'success' ? 'bg-emerald-100' : ''}
            ${status === 'error' ? 'bg-red-100' : ''}
            ${status === 'idle' ? 'bg-gray-100' : ''}
          `}>
            {status === 'processing' && (
              <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {status === 'success' && (
              <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === 'error' && (
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {status === 'idle' && (
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            )}
          </div>

          {/* Text */}
          <div className="text-center">
            {status === 'processing' && (
              <p className="text-sm font-medium text-blue-700">Processing PDF…</p>
            )}
            {status === 'success' && (
              <p className="text-sm font-medium text-emerald-700">
                {acceptedFileName || "File uploaded successfully"}
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm font-medium text-red-700">
                {errorMessage || "Upload failed"}
              </p>
            )}
            {status === 'idle' && (
              <>
                <p className="text-sm font-medium text-gray-700">
                  Drop PDF here or <span className="text-blue-600 font-semibold">browse</span>
                </p>
                {description && (
                  <p className="text-xs text-gray-500 mt-1">{description}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* File type hint */}
      {status === 'idle' && (
        <p className="text-xs text-gray-400 text-center">
          Accepts PDF files only
        </p>
      )}
    </div>
  );
}