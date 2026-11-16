# Melodía

Concurso musical de una sola página, desarrollado con Vue 3, JavaScript, Vue Router y Pinia.

## Cómo se juega

- Escribe un nombre antes de empezar.
- Responde 15 preguntas de cuatro opciones: cinco preguntan el género de una canción y diez tratan sobre Queen y Freddie Mercury.
- Cada acierto suma 10 puntos y cada pregunta tiene 15 segundos.
- La puntuación máxima es de 150 puntos.
- Al terminar verás los puntos, el porcentaje de aciertos, el tiempo y tu posición.
- El ranking conserva las 10 mejores puntuaciones en `localStorage`; los empates se resuelven por tiempo.

## Añadir preguntas y canciones

Las preguntas están en `src/data/questions.js`. Cada pregunta guarda juntas sus opciones,
la respuesta correcta y el campo `audio`. Deja `audio: ''` para una pregunta sin música; el
reproductor no se mostrará.

Para usar un MP3, crea `public/audio/` y copia allí tu archivo. En la pregunta escribe su ruta
desde `public`, por ejemplo `audio: '/audio/cancion.mp3'`. Las preguntas sin audio usan `audio: ''`.

Durante una pregunta con audio puedes pausar, reanudar o parar la reproducción.

## Desarrollo

```sh
npm install
npm run dev
```

## Verificación

```sh
npm run build
```
