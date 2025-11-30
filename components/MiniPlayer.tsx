import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import MarqueeText from './MarqueeText';
import ArtistSelectorModal from './ArtistSelectorModal';
import { PlayIcon, PauseIcon } from './Icons';
import { Visualizer } from './Visualizer';

interface MiniPlayerProps {
  onExpand: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ onExpand }) => {
  const { currentTrack, currentRadio, isRadioMode, isPlaying, togglePlay, duration, currentTime, setSearchState } = usePlayer();
  const [showArtistSelector, setShowArtistSelector] = useState(false);

  if (!currentTrack && !currentRadio) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="fixed bottom-20 left-4 right-4 bg-lebedev-black border-2 border-lebedev-white p-3 flex items-center z-30 cursor-pointer hover:bg-lebedev-white hover:text-lebedev-black active:scale-[0.98] transition-all duration-200 animate-slide-up"
      style={{ position: 'fixed', bottom: '5rem' }}
      onClick={onExpand}
    >
      {/* Progress bar */}
      {!isRadioMode && (
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-lebedev-white/20 overflow-hidden">
          <div
            className="h-full bg-lebedev-red transition-all duration-300 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="relative">
        <img
          src={isRadioMode ? currentRadio?.image : currentTrack?.coverUrl}
          alt="Cover"
          className="w-12 h-12 object-cover mr-4 border-2 border-lebedev-white grayscale contrast-125"
        />
        {isRadioMode && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-lebedev-red border-2 border-lebedev-black animate-pulse" />
        )}
      </div>

      <div className="flex-1 min-w-0 pr-4 group-hover:text-lebedev-black" onClick={onExpand}>
        <MarqueeText
          text={isRadioMode ? currentRadio?.name || '' : currentTrack?.title || ''}
          className="text-sm font-black uppercase truncate"
        />
        <MarqueeText
          text={isRadioMode ? currentRadio?.genre || '' : currentTrack?.artist || ''}
          className="text-xs font-bold uppercase truncate opacity-60"
        />
      </div>

      {/* Visualizer for playing track */}
      {isPlaying && !isRadioMode && (
        <div className="mr-3">
          <Visualizer isPlaying={isPlaying} />
        </div>
      )}

      <button
        className="w-10 h-10 flex items-center justify-center bg-lebedev-white text-lebedev-black hover:bg-lebedev-red hover:text-lebedev-white transition-all active:scale-90 border-2 border-lebedev-white"
        onClick={(e) => {
          e.stopPropagation();
          togglePlay();
        }}
      >
        {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5 ml-0.5" />}
      </button>

      {/* Artist Selector Modal */}
      <ArtistSelectorModal
        isOpen={showArtistSelector}
        onClose={() => setShowArtistSelector(false)}
        artists={currentTrack?.artist.split(',').map(a => a.trim()).filter(a => a) || []}
        onSelectArtist={(artist) => {
          onExpand();
          setSearchState(prev => ({
            ...prev,
            query: artist,
            isArtistSearch: true,
            results: [],
            genreId: null
          }));
        }}
      />
    </div>
  );
};

export default MiniPlayer;