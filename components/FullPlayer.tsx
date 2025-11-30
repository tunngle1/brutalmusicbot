import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Repeat, Repeat1, Download, Share2, Shuffle, FileText, Heart } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { formatTime } from '../utils/format';
import { getLyrics, downloadToChat } from '../utils/api';
import LyricsModal from './LyricsModal';
import MarqueeText from './MarqueeText';
import ArtistSelectorModal from './ArtistSelectorModal';
import DownloadModal from './DownloadModal';
import { hapticFeedback } from '../utils/telegram';
import { getDominantColor } from '../utils/colors';


interface FullPlayerProps {
  onCollapse: () => void;
}

const FullPlayer: React.FC<FullPlayerProps> = ({ onCollapse }) => {
  const {
    currentTrack,
    currentRadio,
    isRadioMode,
    isPlaying,
    togglePlay,
    nextTrack,
    prevTrack,
    currentTime,
    duration,
    seek,
    repeatMode,
    toggleRepeat,
    isShuffle,
    toggleShuffle,
    downloadTrack,
    setSearchState,
    favorites,
    toggleFavorite,
    user
  } = usePlayer();

  // Lyrics state
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);

  // Artist selector state
  const [showArtistSelector, setShowArtistSelector] = useState(false);

  // Download modal state
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  // Gesture state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const lastTap = useRef<number>(0);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);

  // Dynamic Background State
  const [backgroundColor, setBackgroundColor] = useState<string>('#1a1a1a');

  const title = isRadioMode ? currentRadio?.name : currentTrack?.title;
  const subtitle = isRadioMode ? currentRadio?.genre : currentTrack?.artist;
  const coverUrl = isRadioMode ? currentRadio?.image : currentTrack?.coverUrl;

  // Update background color when cover changes
  useEffect(() => {
    if (coverUrl) {
      getDominantColor(coverUrl).then(color => {
        setBackgroundColor(color);
      });
    }
  }, [coverUrl]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;

    const diffX = touchStartX.current - currentX;
    const diffY = touchStartY.current - currentY;

    // Only track vertical drag down
    if (diffY < 0 && Math.abs(diffX) < 50) {
      isDragging.current = true;
      const offset = Math.abs(diffY);
      setDragOffset(offset);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (!touchStartX.current || !touchStartY.current) {
      setDragOffset(0);
      return;
    }

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchStartX.current - touchEndX;
    const diffY = touchStartY.current - touchEndY;

    // If was dragging down
    if (isDragging.current && diffY < 0) {
      const swipeDistance = Math.abs(diffY);
      const threshold = 150; // Distance to trigger close

      if (swipeDistance > threshold) {
        // Close player
        onCollapse();
      } else {
        // Snap back
        setDragOffset(0);
      }
    } else {
      // Horizontal Swipe (Next/Prev)
      const minSwipeDistance = 50;
      const maxVerticalForHorizontalSwipe = 50;

      if (Math.abs(diffX) > minSwipeDistance && Math.abs(diffY) < maxVerticalForHorizontalSwipe) {
        if (diffX > 0) {
          nextTrack();
        } else {
          prevTrack();
        }
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    isDragging.current = false;
    setDragOffset(0);
  };

  const handleDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (currentTrack) {
        toggleFavorite(currentTrack);
        setShowHeartAnimation(true);
        setTimeout(() => setShowHeartAnimation(false), 800);
      }
    }
    lastTap.current = now;
  };

  const handleShowLyrics = async () => {
    if (!currentTrack) return;

    setShowLyrics(true);
    setLyricsLoading(true);
    setLyricsError(null);

    try {
      const response = await getLyrics(currentTrack.id, currentTrack.title, currentTrack.artist);
      setLyrics(response.lyrics_text);
    } catch (error: any) {
      setLyricsError(error.message || 'Не удалось загрузить текст песни');
    } finally {
      setLyricsLoading(false);
    }
  };

  if (!currentTrack && !currentRadio) return null;

  const isFavorite = currentTrack ? favorites.some(f => f.id === currentTrack.id) : false;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };

  return (
    <div
      className="fixed top-0 left-0 w-full h-[var(--tg-viewport-height,100vh)] z-50 flex flex-col items-center pt-safe pb-safe overflow-hidden bg-lebedev-black"
      style={{
        transform: `translateY(${dragOffset}px)`,
        transition: isDragging.current
          ? 'none'
          : 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Content */}
      <div className="relative z-30 w-full h-full flex flex-col border-2 border-lebedev-white"
      >
        {/* Header */}
        <div className="w-full flex justify-between items-center px-6 py-4 border-b-2 border-lebedev-white">
          <div className="flex items-center gap-2">
            <button onClick={onCollapse} className="p-2 bg-lebedev-white text-lebedev-black hover:bg-lebedev-red hover:text-lebedev-white transition-colors border-2 border-lebedev-white">
              <ChevronDown size={24} />
            </button>
            {!isRadioMode && currentTrack && (
              <>
                <button
                  onClick={() => currentTrack && toggleFavorite(currentTrack)}
                  className={`p-2 border-2 transition-all ${isFavorite ? 'bg-lebedev-red text-lebedev-white border-lebedev-red' : 'bg-lebedev-white text-lebedev-black border-lebedev-white hover:bg-lebedev-red hover:text-lebedev-white hover:border-lebedev-red'}`}
                >
                  <Heart size={24} className={isFavorite ? 'fill-current' : ''} />
                </button>

                <button
                  onClick={handleShowLyrics}
                  className="p-2 bg-lebedev-white text-lebedev-black border-2 border-lebedev-white hover:bg-lebedev-red hover:text-lebedev-white hover:border-lebedev-red transition-colors"
                >
                  <FileText size={24} />
                </button>
              </>
            )}
          </div>
          <div className="text-[10px] font-black tracking-[0.2em] text-lebedev-white uppercase">СЕЙЧАС ИГРАЕТ</div>
          <button className="p-2 bg-lebedev-white text-lebedev-black border-2 border-lebedev-white hover:bg-lebedev-red hover:text-lebedev-white hover:border-lebedev-red transition-colors">
            <Share2 size={20} />
          </button>
        </div>

        {/* Cover Art */}
        <div className="flex-1 flex items-center justify-center w-full px-8 py-4 min-h-0">
          <div
            className="relative max-h-full max-w-full aspect-square border-4 border-lebedev-white overflow-hidden shadow-2xl active:scale-95 transition-transform duration-200"
            onClick={handleDoubleTap}
          >
            <img
              src={coverUrl}
              alt={title}
              className="w-full h-full object-cover grayscale contrast-125"
            />
            {/* Heart Animation Overlay */}
            {showHeartAnimation && (
              <div className="absolute inset-0 flex items-center justify-center bg-lebedev-black/80 animate-fade-in">
                <Heart size={80} className="text-lebedev-red fill-lebedev-red animate-bounce" />
              </div>
            )}
            {isRadioMode && (
              <div className="absolute top-0 right-0 px-3 py-1 bg-lebedev-red text-lebedev-white text-xs font-black flex items-center gap-2">
                <span className="w-2 h-2 bg-lebedev-white"></span>
                LIVE
              </div>
            )}
          </div>
        </div>

        {/* Track Info & Controls */}
        <div className="w-full px-8 pb-12 flex flex-col space-y-8">

          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <MarqueeText
                text={title || ''}
                className="text-2xl font-black text-lebedev-white leading-tight uppercase mb-1"
              />
              <div
                onClick={() => {
                  if (!isRadioMode && currentTrack) {
                    // Split artists by comma and filter
                    const artists = currentTrack.artist.split(',').map(a => a.trim()).filter(a => a);

                    if (artists.length > 1) {
                      // Multiple artists - show selector
                      setShowArtistSelector(true);
                    } else {
                      // Single artist - search directly
                      onCollapse();
                      setSearchState(prev => ({
                        ...prev,
                        query: currentTrack.artist,
                        searchMode: 'artist',
                        results: [],
                        genreId: null
                      }));
                    }
                  }
                }}
                className={!isRadioMode ? "cursor-pointer hover:text-lebedev-red transition-colors" : ""}
              >
                <MarqueeText
                  text={subtitle || ''}
                  className="text-lg text-lebedev-white/60 font-bold uppercase"
                />
              </div>
            </div>
            {!isRadioMode && currentTrack && (
              <div className="flex gap-3 flex-shrink-0">
                <button
                  onClick={() => setShowDownloadModal(true)}
                  className="p-3 bg-lebedev-white text-lebedev-black border-2 border-lebedev-white hover:bg-lebedev-red hover:text-lebedev-white hover:border-lebedev-red transition-all active:scale-95"
                  title="Скачать"
                >
                  <Download size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Progress Bar - Hidden for Radio */}
          {!isRadioMode ? (
            <div className="w-full space-y-2">
              <div className="relative h-2 w-full bg-lebedev-white/20 overflow-hidden cursor-pointer">
                <div
                  className="absolute top-0 left-0 h-full bg-lebedev-red transition-all duration-300 ease-linear"
                  style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-lebedev-white/60 uppercase font-bold">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          ) : (
            <div className="w-full py-4 flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-lebedev-red animate-bounce"></div>
              <div className="w-2 h-2 bg-lebedev-red animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-lebedev-red animate-bounce delay-200"></div>
              <span className="text-lebedev-red font-black text-sm ml-2 tracking-wide uppercase">ПРЯМОЙ ЭФИР</span>
            </div>
          )}

          {/* Controls */}
          <div className="flex justify-between items-center px-2">
            <button
              onClick={toggleRepeat}
              className={`transition-all duration-300 p-2 border-2 ${repeatMode !== 'none' ? 'bg-lebedev-red text-lebedev-white border-lebedev-red' : 'bg-lebedev-white text-lebedev-black border-lebedev-white hover:bg-lebedev-red hover:text-lebedev-white hover:border-lebedev-red'} ${isRadioMode ? 'opacity-0 pointer-events-none' : ''}`}
              disabled={isRadioMode}
            >
              {repeatMode === 'one' ? <Repeat1 size={22} /> : <Repeat size={22} />}
            </button>

            <div className="flex items-center gap-6">
              <button
                onClick={prevTrack}
                className={`p-2 bg-lebedev-white text-lebedev-black border-2 border-lebedev-white hover:bg-lebedev-red hover:text-lebedev-white hover:border-lebedev-red transition-all active:scale-90 ${isRadioMode ? 'opacity-30 pointer-events-none' : ''}`}
                disabled={isRadioMode}
              >
                <SkipBack size={32} fill="currentColor" />
              </button>

              <button
                onClick={togglePlay}
                className="w-20 h-20 bg-lebedev-white text-lebedev-black border-4 border-lebedev-white flex items-center justify-center hover:bg-lebedev-red hover:text-lebedev-white hover:border-lebedev-red transition-all active:scale-95"
              >
                {isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
              </button>

              <button
                onClick={nextTrack}
                className={`p-2 bg-lebedev-white text-lebedev-black border-2 border-lebedev-white hover:bg-lebedev-red hover:text-lebedev-white hover:border-lebedev-red transition-all active:scale-90 ${isRadioMode ? 'opacity-30 pointer-events-none' : ''}`}
                disabled={isRadioMode}
              >
                <SkipForward size={32} fill="currentColor" />
              </button>
            </div>

            <button
              onClick={toggleShuffle}
              className={`transition-all duration-300 p-2 border-2 ${isShuffle ? 'bg-lebedev-red text-lebedev-white border-lebedev-red' : 'bg-lebedev-white text-lebedev-black border-lebedev-white hover:bg-lebedev-red hover:text-lebedev-white hover:border-lebedev-red'} ${isRadioMode ? 'opacity-0 pointer-events-none' : ''}`}
              disabled={isRadioMode}
            >
              <Shuffle size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Lyrics Modal */}
      <LyricsModal
        isOpen={showLyrics}
        onClose={() => setShowLyrics(false)}
        title={currentTrack?.title || ''}
        artist={currentTrack?.artist || ''}
        lyrics={lyrics}
        isLoading={lyricsLoading}
        error={lyricsError}
      />

      {/* Artist Selector Modal */}
      <ArtistSelectorModal
        isOpen={showArtistSelector}
        onClose={() => setShowArtistSelector(false)}
        artists={currentTrack?.artist.split(',').map(a => a.trim()).filter(a => a) || []}
        onSelectArtist={(artist) => {
          onCollapse();
          setSearchState(prev => ({
            ...prev,
            query: artist,
            searchMode: 'artist',
            results: [],
            genreId: null
          }));
        }}
      />

      {/* Download Modal */}
      {currentTrack && (
        <DownloadModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          trackTitle={currentTrack.title}
          onDownloadToApp={() => downloadTrack(currentTrack)}
          onDownloadToChat={async () => {
            if (user) {
              try {
                await downloadToChat(user.id, currentTrack);
                hapticFeedback.success();
              } catch (error) {
                console.error('Download to chat error:', error);
                hapticFeedback.error();
              }
            }
          }}
        />
      )}
    </div>
  );
};

export default FullPlayer;