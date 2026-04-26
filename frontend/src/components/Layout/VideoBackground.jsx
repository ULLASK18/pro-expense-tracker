import React from 'react';

const VideoBackground = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover"
      >
        <source src="/bg_video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* Overlay to ensure readability and consistent aesthetic */}
      <div className="absolute top-0 left-0 w-full h-full bg-slate-950/40 backdrop-blur-[2px]"></div>
    </div>
  );
};

export default VideoBackground;
