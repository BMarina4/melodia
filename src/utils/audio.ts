import { Howl } from 'howler'

interface PlaybackCallbacks {
  onEnd: () => void
  onError: (message: string) => void
}

let activeSound: Howl | null = null
const generatedTracks: Record<string, number[]> = {
  neon: [60, 64, 67, 72, 69, 67],
  summer: [62, 65, 69, 67, 74, 72],
  midnight: [65, 69, 72, 70, 67, 62],
  dance: [67, 71, 74, 79, 76, 74],
  ocean: [57, 60, 64, 62, 65, 69],
}

function writeText(view: DataView, offset: number, text: string) {
  for (let index = 0; index < text.length; index += 1) {
    view.setUint8(offset + index, text.charCodeAt(index))
  }
}

function createWavDataUri(midiNotes: number[]) {
  const sampleRate = 22050
  const noteDuration = 0.34
  const gapDuration = 0.12
  const noteSamples = Math.floor(sampleRate * noteDuration)
  const gapSamples = Math.floor(sampleRate * gapDuration)
  const sampleCount = midiNotes.length * noteSamples + (midiNotes.length - 1) * gapSamples
  const buffer = new ArrayBuffer(44 + sampleCount * 2)
  const view = new DataView(buffer)

  writeText(view, 0, 'RIFF')
  view.setUint32(4, 36 + sampleCount * 2, true)
  writeText(view, 8, 'WAVE')
  writeText(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeText(view, 36, 'data')
  view.setUint32(40, sampleCount * 2, true)

  let sampleOffset = 0
  midiNotes.forEach((midiNote, noteIndex) => {
    const frequency = 440 * 2 ** ((midiNote - 69) / 12)
    for (let index = 0; index < noteSamples; index += 1) {
      const elapsed = index / sampleRate
      const fadeIn = Math.min(1, elapsed / 0.012)
      const fadeOut = Math.min(1, (noteDuration - elapsed) / 0.07)
      const envelope = Math.max(0, Math.min(fadeIn, fadeOut))
      const fundamental = Math.sin(2 * Math.PI * frequency * elapsed)
      const harmonic = Math.sin(4 * Math.PI * frequency * elapsed) * 0.19
      const sample = Math.round((fundamental + harmonic) * envelope * 8500)
      view.setInt16(44 + sampleOffset * 2, sample, true)
      sampleOffset += 1
    }
    if (noteIndex < midiNotes.length - 1) sampleOffset += gapSamples
  })

  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  }
  return `data:audio/wav;base64,${btoa(binary)}`
}

export function stopAudio() {
  if (!activeSound) return
  const sound = activeSound
  activeSound = null
  sound.stop()
  sound.unload()
}

export function pauseAudio() {
  activeSound?.pause()
}

export function resumeAudio() {
  activeSound?.play()
}

export function playAudio(source: string, callbacks: PlaybackCallbacks) {
  stopAudio()

  let audioSource = source
  let format: string[] | undefined

  if (source.startsWith('synth:')) {
    const trackName = source.slice('synth:'.length)
    const notes = generatedTracks[trackName]
    if (!notes) {
      callbacks.onError(`No se encontró la melodía "${trackName}".`)
      return
    }

    audioSource = createWavDataUri(notes)
    format = ['wav']
  }

  let finished = false
  const releaseSound = () => {
    if (finished) return
    finished = true
    if (activeSound === sound) activeSound = null
    sound.unload()
  }

  const sound = new Howl({
    src: [audioSource],
    ...(format ? { format } : {}),
    volume: 0.65,
    onend: () => {
      releaseSound()
      callbacks.onEnd()
    },
    onstop: () => {
      releaseSound()
      callbacks.onEnd()
    },
    onloaderror: () => {
      releaseSound()
      callbacks.onError('No se pudo cargar el audio. Comprueba el sonido del navegador e inténtalo de nuevo.')
    },
    onplayerror: () => {
      releaseSound()
      callbacks.onError('El navegador no pudo reproducir el audio. Vuelve a intentarlo.')
    },
  })

  activeSound = sound
  try {
    sound.play()
  } catch {
    releaseSound()
    callbacks.onError('No se pudo iniciar el audio. Vuelve a intentarlo.')
  }
}
