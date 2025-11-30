import React from 'react';
import { ViewState } from '../types';
import { HomeIcon, PlaylistIcon, HeartIcon, RadioIcon, LibraryIcon } from './Icons';

interface BottomNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const getItemClass = (view: ViewState) => `flex flex-col items-center justify-center space-y-1 w-full h-full ${currentView === view ? 'bg-lebedev-white text-lebedev-black' : 'text-lebedev-white hover:bg-lebedev-white hover:text-lebedev-black'} transition-colors border-r border-lebedev-white last:border-r-0`;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-lebedev-black border-t-2 border-lebedev-white flex justify-between items-stretch z-40 pb-safe">
      <button className={getItemClass(ViewState.HOME)} onClick={() => onNavigate(ViewState.HOME)}>
        <HomeIcon className="w-6 h-6" />
        <span className="text-[9px] font-black uppercase tracking-wider">Главная</span>
      </button>
      <button className={getItemClass(ViewState.PLAYLISTS)} onClick={() => onNavigate(ViewState.PLAYLISTS)}>
        <PlaylistIcon className="w-6 h-6" />
        <span className="text-[9px] font-black uppercase tracking-wider">Плейлисты</span>
      </button>
      <button className={getItemClass(ViewState.FAVORITES)} onClick={() => onNavigate(ViewState.FAVORITES)}>
        <HeartIcon className="w-6 h-6" />
        <span className="text-[9px] font-black uppercase tracking-wider">Избранное</span>
      </button>
      <button className={getItemClass(ViewState.RADIO)} onClick={() => onNavigate(ViewState.RADIO)}>
        <RadioIcon className="w-6 h-6" />
        <span className="text-[9px] font-black uppercase tracking-wider">Радио</span>
      </button>
      <button className={getItemClass(ViewState.LIBRARY)} onClick={() => onNavigate(ViewState.LIBRARY)}>
        <LibraryIcon className="w-6 h-6" />
        <span className="text-[9px] font-black uppercase tracking-wider">Медиатека</span>
      </button>
    </div>
  );
};

export default BottomNav;