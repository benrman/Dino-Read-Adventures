import { useEffect, useMemo, useState } from 'react'

const TIPS = [
  'Tiny wins stack: 2–3 short bursts beat one long slog.',
  'Mix eyes + ears + mouth: multisensory practice sticks faster.',
  'Let them pick the next mission — autonomy boosts dopamine.',
  'Celebrate effort before accuracy: brave tries grow readers.',
  'Rhyme games train ears to hear inside words — superpower for spelling.',
  'Switch activities before boredom shows — variety is a feature.',
  'Five big reading skills: sound awareness, letter–sound links, smooth reading, word meanings, and understanding stories — your missions touch all of them.',
  'Ages 5–7: extra practice hearing sounds and blending short words pays off the most.',
  'Ages 9–12: keep decoding sharp, then lean into vocabulary and “what happened / why” questions.',
]

function hashDay(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return h
}

export default function TipsCarousel({ profileId }: { profileId: string }) {
  const day = new Date().toISOString().slice(0, 10)
  const quest = useMemo(() => {
    const h = hashDay(`${profileId}:${day}`)
    const missions = [
      'Do 1 microphone mission (Echo or Roar).',
      'Finish 2 fast rounds in Fossil Rush.',
      'Hatch progress: earn 3 correct answers in any mix.',
      'Read a passage out loud with silly voices.',
      'Teach a stuffed animal one new word.',
    ]
    return missions[h % missions.length]
  }, [profileId, day])

  const [i, setI] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setI((x) => (x + 1) % TIPS.length), 7000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div
      style={{
        marginTop: 0,
        padding: 14,
        borderRadius: 16,
        border: '1px solid var(--stroke)',
        background: 'rgba(15, 23, 42, 0.35)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ margin: '0 0 8px' }}>Quest of the day</h3>
          <p className="lead" style={{ margin: 0 }}>
            {quest}
          </p>
        </div>
        <div className="pill" style={{ alignSelf: 'flex-start' }}>
          {day}
        </div>
      </div>
      <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--stroke)' }}>
        <div style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 6 }}>Science-of-reading snack</div>
        <p style={{ margin: 0, lineHeight: 1.55 }}>{TIPS[i]}</p>
      </div>
    </div>
  )
}
