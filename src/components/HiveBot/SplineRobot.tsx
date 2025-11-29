'use client';

import Spline from '@splinetool/react-spline';
import { useState } from 'react';

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
}

export default function SplineRobot({
  className = '',
  sceneUrl = 'https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode'
}: SplineRobotProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
      <Spline
        scene={sceneUrl}
        onLoad={() => setIsLoading(false)}
        style={{
          width: '100%',
          height: '100%',
          minWidth: '100%',
          minHeight: '100%',
        }}
      />
    </div>
  );
}
