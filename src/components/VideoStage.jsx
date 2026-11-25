import React, { useEffect, useState } from 'react';
import { asset } from '../utils.js';

export default function VideoStage({ videoRef, phase, guestName, onContinue }) {
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const done = () => setEnded(true);
    v.addEventListener('ended', done);
    v.addEventListener('error', done);
    return () => {
      v.removeEventListener('ended', done);
      v.removeEventListener('error', done);
    };
  }, [videoRef]);

  const skip = () => {
    videoRef.current?.pause();
    setEnded(true);
  };

  return (
    <div className={`stage ${phase === 'main' ? 'stage--out' : ''}`}>
      <div className="stage-frame">
        <video
          ref={videoRef}
          className={`stage-video ${ended ? 'is-blur' : ''}`}
          src={asset('intro.mp4')}
          poster={asset('poster.jpg')}
          playsInline
          preload="auto"
        />
        <div className="stage-shade" />

        {phase === 'video' && !ended && (
          <button className="stage-skip" onClick={skip}>
            Skip
          </button>
        )}

        <div className={`stage-invited ${ended ? 'is-in' : ''}`}>
          {guestName && <p className="si-dear">Dear {guestName}</p>}
          <h2 className="si-title">We are invited</h2>
          <span className="si-line" />
          <button className="btn btn--light" onClick={onContinue}>
            Open invitation
          </button>
        </div>
      </div>
    </div>
  );
}
