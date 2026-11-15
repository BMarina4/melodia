<template>
  <main>
    <section class="hero">
      <div class="page-wrap hero-inner">
        <div class="hero-copy">
          <h1>¿Cuánto sabes de <span>música?</span></h1>
          <p>
            Escucha, adivina y demuestra que tienes buen oído. Completa el reto y escala posiciones
            en el ranking.
          </p>
          <div class="hero-actions">
            <RouterLink class="button button-orange" to="/jugar">
              <span aria-hidden="true">▶</span> Jugar ahora
            </RouterLink>
            <a class="button button-outline" href="#reglas-del-juego">
              <span aria-hidden="true">ⓘ</span> Cómo funciona
            </a>
          </div>
          <div class="hero-stats" aria-label="Datos del concurso">
            <div class="stat-pill">
              <strong>15 preguntas</strong>
              <span>Un reto completo</span>
            </div>
            <div class="stat-pill">
              <strong>15 segundos</strong>
              <span>Para cada respuesta</span>
            </div>
            <div class="stat-pill">
              <strong>Top 10</strong>
              <span>Mejores puntuaciones</span>
            </div>
          </div>
        </div>

        <div class="preview-card" aria-label="Vista previa de una pregunta del concurso">
          <div class="preview-head">
            <span>● Pregunta 04 / 15</span>
            <span>◷ 00:12</span>
          </div>
          <div class="preview-progress"><span></span></div>
          <div class="preview-track">
            <div class="preview-disc" aria-hidden="true">♫</div>
            <div class="preview-wave">
              <span>Reproduciendo audio</span>
              <div class="waveform" aria-hidden="true">
                <i v-for="bar in 18" :key="bar"></i>
              </div>
            </div>
          </div>
          <div class="preview-label">
            ¿Qué género musical tiene esta canción?
            <span>Elige una respuesta</span>
          </div>
          <div
            v-for="(answer, index) in previewAnswers"
            :key="answer"
            class="preview-choice"
            :class="{ 'is-selected': index === 1 }"
          >
            <b>{{ String.fromCharCode(65 + index) }}</b>
            {{ answer }}
            <span v-if="index === 1" aria-hidden="true">✓</span>
          </div>
          <div class="preview-score">
            <span>✦ +10 puntos</span>
            <span>Por acierto</span>
          </div>
        </div>
      </div>
    </section>

    <section class="section section-soft">
      <div class="page-wrap">
        <div class="section-heading">
          <h2>¿Cómo funciona?</h2>
          <p>Tres pasos para poner a prueba tu oído y subir en la clasificación.</p>
        </div>
        <div class="step-grid">
          <article class="info-card">
            <div class="info-icon">♫</div>
            <h3>Escucha con atención</h3>
            <p>Cinco preguntas incluyen audio; las demás preguntan sobre Queen y Freddie Mercury.</p>
          </article>
          <article class="info-card">
            <div class="info-icon orange">◷</div>
            <h3>Elige tu respuesta</h3>
            <p>Tienes 15 segundos para elegir la respuesta entre cuatro opciones.</p>
          </article>
          <article class="info-card">
            <div class="info-icon">♛</div>
            <h3>Sube en el ranking</h3>
            <p>Suma puntos, revisa tu precisión y trata de entrar en las diez mejores marcas.</p>
          </article>
        </div>
      </div>
    </section>

    <section id="reglas-del-juego" class="section">
      <div class="page-wrap">
        <div class="rules-panel">
          <div class="section-heading">
            <h2>Reglas del juego</h2>
            <p>Prepara tus oídos. Estas son las normas del concurso.</p>
          </div>
          <div class="rule-grid">
            <article class="rule-card">
              <strong>15 preguntas por partida</strong>
              <p>Responde cinco preguntas con audio y diez sobre Queen y Freddie Mercury.</p>
            </article>
            <article class="rule-card">
              <strong>15 segundos por pregunta</strong>
              <p>Puedes volver a escuchar el audio mientras el tiempo de la ronda siga activo.</p>
            </article>
            <article class="rule-card">
              <strong>10 puntos por acierto</strong>
              <p>Cada respuesta correcta suma diez puntos, hasta un máximo de 150.</p>
            </article>
            <article class="rule-card">
              <strong>El tiempo desempata</strong>
              <p>Si dos jugadores empatan en puntos, queda por delante quien complete la partida antes.</p>
            </article>
            <article class="rule-card">
              <strong>Ranking de diez puestos</strong>
              <p>Las mejores puntuaciones se guardan en este navegador para futuras partidas.</p>
            </article>
            <article class="rule-card">
              <strong>Tu nombre te representa</strong>
              <p>Elige un nombre para mostrarlo durante el concurso y en la clasificación.</p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="bottom-cta">
      <div class="page-wrap">
        <div class="cta-panel">
          <div>
            <h2>¿Listo para demostrar tu talento auditivo?</h2>
            <p>Elige un nombre, escucha el primer fragmento y empieza a sumar.</p>
          </div>
          <RouterLink class="button button-orange" to="/jugar">
            Empezar concurso <span aria-hidden="true">→</span>
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

const previewAnswers = [
  'Prisma — Luces de neón',
  'Los Faroles — Vuelve a bailar',
  'Luna Eléctrica — Pasos de verano',
  'Cometa Club — En órbita',
]
</script>
