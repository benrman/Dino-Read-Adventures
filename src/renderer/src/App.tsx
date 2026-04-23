import { useLayoutEffect, type CSSProperties } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Profiles from './pages/Profiles'
import Hub from './pages/Hub'
import Placement from './pages/Placement'
import Adventure from './pages/Adventure'
import Stickers from './pages/Stickers'
import Parent from './pages/Parent'
import LetterSafari from './games/LetterSafari'
import SoundCave from './games/SoundCave'
import WordNest from './games/WordNest'
import FossilRush from './games/FossilRush'
import EchoTrail from './games/EchoTrail'
import RoarLab from './games/RoarLab'
import StoryFossil from './games/StoryFossil'
import RhymeRapids from './games/RhymeRapids'
import bgPanorama from './assets/jurassic/jurassic-bg-panorama.png'
import bgFerns from './assets/jurassic/jurassic-bg-ferns.png'

export default function App() {
  useLayoutEffect(() => {
    document.documentElement.style.setProperty('--card-texture', `url(${bgFerns})`)
  }, [])

  const shellStyle: CSSProperties = {
    minHeight: '100%',
    position: 'relative',
    backgroundImage: `linear-gradient(180deg, rgba(6, 10, 18, 0.88) 0%, rgba(10, 18, 32, 0.55) 38%, rgba(8, 12, 22, 0.92) 100%), url(${bgPanorama})`,
    backgroundSize: 'cover, cover',
    backgroundPosition: 'center top, center center',
    backgroundAttachment: 'fixed, fixed',
    backgroundRepeat: 'no-repeat, no-repeat',
  }

  return (
    <div className="app-root app-root--jurassic" style={shellStyle}>
      <Routes>
        <Route path="/" element={<Profiles />} />
        <Route path="/profile/:id/hub" element={<Hub />} />
        <Route path="/profile/:id/placement" element={<Placement />} />
        <Route path="/profile/:id/adventure" element={<Adventure />} />
        <Route path="/profile/:id/stickers" element={<Stickers />} />
        <Route path="/parent" element={<Parent />} />
        <Route path="/profile/:id/game/letter-safari" element={<LetterSafari />} />
        <Route path="/profile/:id/game/sound-cave" element={<SoundCave />} />
        <Route path="/profile/:id/game/word-nest" element={<WordNest />} />
        <Route path="/profile/:id/game/fossil-rush" element={<FossilRush />} />
        <Route path="/profile/:id/game/echo-trail" element={<EchoTrail />} />
        <Route path="/profile/:id/game/roar-lab" element={<RoarLab />} />
        <Route path="/profile/:id/game/story-fossil" element={<StoryFossil />} />
        <Route path="/profile/:id/game/rhyme-rapids" element={<RhymeRapids />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
