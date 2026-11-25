import React, { useCallback, useEffect, useRef, useState } from 'react';
import Cover from './components/Cover.jsx';
import VideoStage from './components/VideoStage.jsx';
import Hero from './components/Hero.jsx';
import CoupleFamilies from './components/CoupleFamilies.jsx';
import Details from './components/Details.jsx';
import Countdown from './components/Countdown.jsx';
import Gallery from './components/Gallery.jsx';
import Rsvp from './components/Rsvp.jsx';
import PhotoUpload from './components/PhotoUpload.jsx';
import Contacts from './components/Contacts.jsx';
import Footer from './components/Footer.jsx';
import { guestNameFromUrl, loadGuest, saveGuest } from './utils.js';

// phase: cover -> video -> main
export default function App() {
  const [phase, setPhase] = useState('cover');
  const [stageGone, setStageGone] = useState(false);
  const [coverGone, setCoverGone] = useState(false);
  const [guest, setGuestState] = useState(() => loadGuest());
  const urlName = useRef(guestNameFromUrl()).current;
  const videoRef = useRef(null);

  // Name shown in greetings: saved RSVP name wins, otherwise ?to=Name from the link.
  const guestName = guest?.name || urlName || '';

  const setGuest = useCallback((g) => {
    saveGuest(g);
    setGuestState(g);
  }, []);

  // Lock scrolling until the invitation is revealed.
  useEffect(() => {
    document.body.classList.toggle('locked', phase !== 'main');
    if (phase === 'main') window.scrollTo(0, 0);
  }, [phase]);

  const handleOpen = () => {
    // Called inside the user's tap: "unlock" audio playback now, start for real once the doors open.
    const v = videoRef.current;
    if (v) {
      v.muted = false;
      const p = v.play();
      if (p && p.then) {
        p.then(() => {
          v.pause();
          v.currentTime = 0;
        }).catch(() => {});
      }
    }
  };

  const startVideo = () => {
    setPhase('video');
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.muted = false;
    v.play().catch(() => {
      v.muted = true; // browser refused sound — play silently rather than not at all
      v.play().catch(() => {});
    });
  };

  const showMain = () => {
    setPhase('main');
    setTimeout(() => setStageGone(true), 1200);
  };

  return (
    <>
      <main className={`page ${phase === 'main' ? 'page--live' : ''}`}>
        <Hero guestName={guestName} guest={guest} live={phase === 'main'} />
        <CoupleFamilies />
        <Details />
        <Countdown />
        <Gallery />
        <Rsvp guest={guest} setGuest={setGuest} urlName={urlName} />
        <PhotoUpload guestName={guestName} />
        <Contacts />
        <Footer />
      </main>

      {!stageGone && (
        <VideoStage
          videoRef={videoRef}
          phase={phase}
          guestName={guestName}
          onContinue={showMain}
        />
      )}

      {!coverGone && (
        <Cover
          guestName={guestName}
          onTap={handleOpen}
          onOpened={startVideo}
          onGone={() => setCoverGone(true)}
        />
      )}
    </>
  );
}
