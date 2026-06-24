// Âm "beep" tạo bằng Web Audio API — KHÔNG dùng file mp3.
// Dùng một AudioContext singleton để khỏi tạo mới mỗi lần kêu.

let ctx = null

function getCtx() {
  try {
    if (typeof window === 'undefined') return null
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    if (!ctx) ctx = new AC()
    return ctx
  } catch {
    return null // AudioContext không khả dụng → bỏ qua, không crash
  }
}

// Resume AudioContext trong sự kiện click đầu tiên để vượt chính sách autoplay.
export function unlockAudio() {
  try {
    const c = getCtx()
    if (c && c.state === 'suspended') c.resume()
  } catch {
    /* ignore */
  }
}

// Beep ngắn ~0.15s, sine 880Hz, gain fade nhanh cho êm tai (không "pop", không chói).
export function playBeep() {
  try {
    const c = getCtx()
    if (!c) return
    if (c.state === 'suspended') c.resume()

    const now = c.currentTime
    const osc = c.createOscillator()
    const gain = c.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, now)

    // Bắt đầu gần như im, ramp lên nhanh rồi tắt mượt để tránh tiếng tách.
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15)

    osc.connect(gain)
    gain.connect(c.destination)

    osc.start(now)
    osc.stop(now + 0.16)
  } catch {
    /* ignore */
  }
}
