/* ══════════════════════════════════════════════════════
   BODA DANITZA & WILMAR — music.js
   YouTube IFrame Player API — música de fondo
══════════════════════════════════════════════════════ */

'use strict';

var YT_VIDEO_ID  = 'jb0K64SGsfc';
var ytPlayer     = null;
var ytReady      = false;
var musicPlaying = false;
var _autoplayPending = false;

var musicBtn  = document.getElementById('musicToggle');
var musicIcon = musicBtn ? musicBtn.querySelector('.music-icon') : null;

/* ── Fade de volumen suave ── */
function fadeVolume(from, to, durationMs) {
  var steps    = 30;
  var stepTime = durationMs / steps;
  var stepSize = (to - from) / steps;
  var current  = from;
  var iv = setInterval(function () {
    current += stepSize;
    if (stepSize > 0 ? current >= to : current <= to) {
      current = to;
      clearInterval(iv);
    }
    if (ytPlayer && ytReady) ytPlayer.setVolume(Math.round(current));
  }, stepTime);
}

/* ── Reproduce y actualiza el botón ── */
function playMusic() {
  if (!ytReady || !ytPlayer || musicPlaying) return;
  ytPlayer.playVideo();
  fadeVolume(0, 42, 1200);
  musicPlaying = true;
  if (musicIcon) musicIcon.textContent = '♫';
  if (musicBtn)  { musicBtn.classList.add('playing'); musicBtn.title = 'Pausar música'; }
}

/* ── Pausa y actualiza el botón ── */
function pauseMusic() {
  if (!ytReady || !ytPlayer || !musicPlaying) return;
  fadeVolume(42, 0, 500);
  setTimeout(function () { if (ytPlayer) ytPlayer.pauseVideo(); }, 520);
  musicPlaying = false;
  if (musicIcon) musicIcon.textContent = '♪';
  if (musicBtn)  { musicBtn.classList.remove('playing'); musicBtn.title = 'Reproducir música'; }
}

/* ── Callback global que YouTube llama cuando la API está lista ── */
window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player('yt-player', {
    videoId: YT_VIDEO_ID,
    playerVars: {
      autoplay:       0,
      controls:       0,
      disablekb:      1,
      fs:             0,
      iv_load_policy: 3,
      modestbranding: 1,
      rel:            0,
      loop:           1,
      playlist:       YT_VIDEO_ID
    },
    events: {
      onReady: function (e) {
        ytReady = true;
        e.target.setVolume(0);
        /* Si el usuario ya hizo clic en el sobre antes de que el player estuviese listo */
        if (_autoplayPending) playMusic();
      },
      onStateChange: function (e) {
        if (e.data === YT.PlayerState.ENDED) ytPlayer.playVideo();
      }
    }
  });
};

/* ── API pública: se llama desde main.js cuando el usuario abre el sobre ── */
window.startMusic = function () {
  if (ytReady) {
    playMusic();
  } else {
    /* Todavía cargando — marcar para reproducir en cuanto esté listo */
    _autoplayPending = true;
  }
};

/* ── Botón de música (play/pause manual) ── */
if (musicBtn) {
  musicBtn.addEventListener('click', function () {
    if (musicPlaying) { pauseMusic(); } else { playMusic(); }
  });
}
