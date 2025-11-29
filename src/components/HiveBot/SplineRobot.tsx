'use client';

import Spline from '@splinetool/react-spline';
import { useState, useEffect } from 'react';

/**
 * SplineRobot Component
 *
 * Displays a 3D animated robot character using Spline.
 *
 * To customize with your own Wall-E inspired robot:
 * 1. Go to https://spline.design and create your 3D robot character
 * 2. Design it to look like a modern Wall-E robot with:
 *    - Cubic/boxy body with rounded edges
 *    - Large expressive eyes (cameras)
 *    - Track wheels or treads
 *    - Articulated arms
 *    - Antenna or sensor details
 * 3. Add animations like idle movements, eye blinks, head tilts
 * 4. Export your scene and copy the Spline scene URL
 * 5. Replace the splineSceneUrl below with your custom URL
 *
 * Example Spline features to add:
 * - Idle animation (subtle body movements)
 * - Eye tracking or blinking
 * - Hover interactions
 * - Material variations (metallic, worn textures)
 */

interface SplineRobotProps {
  className?: string;
  sceneUrl?: string;
  timeout?: number; // Timeout in milliseconds (default: 15000ms / 15s)
}

export default function SplineRobot({
  className = '',
  sceneUrl = 'https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode',
  timeout = 15000
}: SplineRobotProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Handle timeout for loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn('Spline character loading timed out after', timeout, 'ms');
        setIsLoading(false);
        setHasError(true);
        setErrorMessage('Character loading timed out');
      }
    }, timeout);

    return () => clearTimeout(timeoutId);
  }, [isLoading, timeout]);

  const handleLoad = () => {
    console.log('Spline character loaded successfully');
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = (error: any) => {
    console.error('Spline character loading failed:', error);
    setIsLoading(false);
    setHasError(true);
    setErrorMessage(error?.message || 'Failed to load character');
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Loading spinner */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Error fallback UI */}
      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-white/5 backdrop-blur-sm rounded-full">
          <div className="text-4xl mb-2">🤖</div>
          <div className="text-xs text-white/60 text-center px-2">
            {errorMessage || 'Character unavailable'}
          </div>
        </div>
      )}

      {/* Spline component - only render if no error */}
      {!hasError && (
        <div className="absolute inset-0 w-full h-full">
          <Spline
            scene={sceneUrl}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
            }}
          />
        </div>
      )}
    </div>
  );
}
