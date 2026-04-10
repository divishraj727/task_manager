import { Suspense, lazy } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

function RobotSkeleton({ className }) {
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-gray-950 ${className ?? ''}`}>
      {/* Animated robot silhouette */}
      <div className="flex flex-col items-center gap-2 animate-pulse">
        {/* Head */}
        <div className="w-24 h-16 rounded-xl bg-gradient-to-br from-purple-900/60 to-indigo-900/60 border border-purple-700/30" />
        {/* Neck */}
        <div className="w-5 h-6 rounded bg-gray-800/60" />
        {/* Body */}
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/30" />
      </div>

      {/* Loading text */}
      <div className="mt-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-xs text-gray-600 tracking-widest uppercase">Loading scene</p>
      </div>
    </div>
  );
}

export function InteractiveRobotSpline({ scene, className }) {
  return (
    <Suspense fallback={<RobotSkeleton className={className} />}>
      {/* Wrapper needed to position the watermark cover */}
      <div className={`relative ${className ?? ''}`}>
        <Spline scene={scene} style={{ width: '100%', height: '100%' }} />
        {/* Cover the "Built with Spline" badge (bottom-right) */}
        <div
          className="absolute bottom-0 right-0 bg-gray-950"
          style={{ width: 180, height: 48, zIndex: 10 }}
        />
      </div>
    </Suspense>
  );
}
