import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { playBeep, unlockAudio } from '../lib/sound'

// Default an toàn: nếu component nằm ngoài provider (vd trong test) thì play() là no-op,
// không ném lỗi.
const SoundContext = createContext({
  soundOn: true,
  toggle: () => {},
  play: () => {},
})

export function SoundProvider({ children }) {
  // Mặc định bật; lưu lựa chọn vào localStorage key 'soundOn'.
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem('soundOn') !== 'false')

  // Mở khoá audio ở lần tương tác đầu tiên bất kỳ (đề phòng user chưa bấm nút chuông).
  useEffect(() => {
    const onFirst = () => {
      unlockAudio()
      window.removeEventListener('pointerdown', onFirst)
      window.removeEventListener('keydown', onFirst)
    }
    window.addEventListener('pointerdown', onFirst)
    window.addEventListener('keydown', onFirst)
    return () => {
      window.removeEventListener('pointerdown', onFirst)
      window.removeEventListener('keydown', onFirst)
    }
  }, [])

  const toggle = useCallback(() => {
    unlockAudio() // cú click này là gesture "mở khoá" audio cho trình duyệt
    setSoundOn((prev) => {
      const next = !prev
      localStorage.setItem('soundOn', String(next))
      if (next) playBeep() // beep phản hồi ngay khi bật
      return next
    })
  }, [])

  // Chỉ kêu khi đang bật.
  const play = useCallback(() => {
    if (soundOn) playBeep()
  }, [soundOn])

  return (
    <SoundContext.Provider value={{ soundOn, toggle, play }}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSound() {
  return useContext(SoundContext)
}
