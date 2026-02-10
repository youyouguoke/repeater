import React from 'react';
import { FolderOpen } from 'lucide-react';

const TopBar = ({ onOpenClick }) => {
  return (
    <div className="flex justify-between items-center p-4 bg-background/90 backdrop-blur-sm fixed top-0 left-0 right-0 z-10 border-b border-gray-800">
      <div className="text-xl font-bold tracking-wider text-white">
        <span>Online </span>
        <span className="text-accent">Repeater</span>
      </div>
      
      <button 
        onClick={onOpenClick}
        className="p-2 rounded-full hover:bg-gray-800 transition-colors"
        aria-label="Upload File"
      >
        <FolderOpen className="w-6 h-6 text-accent" />
      </button>
    </div>
  );
};

export default TopBar;
