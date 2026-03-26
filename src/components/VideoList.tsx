import type { Video } from '../models/types';

interface VideoListProps {
  videos: Video[];
  currentVideoId: string;
  onVideoSelect: (videoId: string) => void;
}

export default function VideoList({ videos, currentVideoId, onVideoSelect }: VideoListProps) {
  return (
    <div className="space-y-2">
      {videos.map((video) => (
        <button
          key={video.id}
          onClick={() => !video.locked && onVideoSelect(video.id)}
          disabled={video.locked}
          className={`w-full text-left p-4 rounded-lg transition-all ${
            video.id === currentVideoId
              ? 'bg-slate-700 border-2 border-cyan-400'
              : video.locked
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-slate-700/50'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              video.completed
                ? 'bg-green-500'
                : video.locked
                ? 'bg-slate-600'
                : video.id === currentVideoId
                ? 'bg-cyan-500'
                : 'bg-slate-700 border-2 border-slate-600'
            }`}>
              {video.completed ? (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : video.locked ? (
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              ) : video.id === currentVideoId ? (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : null}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium mb-1 ${
                video.id === currentVideoId ? 'text-white' : 'text-slate-300'
              }`}>
                {video.title}
              </p>
              <p className="text-xs text-slate-500">{video.duration}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
