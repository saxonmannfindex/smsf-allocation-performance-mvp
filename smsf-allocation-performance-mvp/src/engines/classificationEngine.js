/**
 * Classification Engine
 * 
 * DEPRECATED: This file now delegates to performanceEngine.classifyFund()
 * to maintain a single source of truth for classification.
 * 
 * Keep this file for backwards compatibility but all logic lives in performanceEngine.
 */

import { classifyFund } from './performanceEngine.js';

/**
 * Classify a fund's growth/defensive split
 * 
 * @deprecated Use classifyFund from performanceEngine.js directly
 * @param {Array} assetClasses - Array of asset class objects with name and value
 * @returns {{classification: string, growthPercent: number, defensivePercent: number}}
 */
export function classifyGrowthDefensive(assetClasses = []) {
  // Delegate to the single source of truth
  return classifyFund(assetClasses);
}

// Re-export for convenience
export { classifyFund };