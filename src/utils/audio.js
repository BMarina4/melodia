import { Howl } from 'howler'

let activeSound = null

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

export function playAudio(source, callbacks) {
  stopAudio()

  let finished = false
  const releaseSound = () => {
    if (finished) return
    finished = true
    if (activeSound === sound) activeSound = null
    sound.unload()
  }

  const sound = new Howl({
    src: [source],
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
