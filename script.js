const slides = Array.from(document.querySelectorAll('.slide'));
let activeSlideIndex = 0;
const initialSlideId = slides[activeSlideIndex] ? slides[activeSlideIndex].id : '';

document.body.classList.toggle('music-player-page', initialSlideId === 'slide3');
document.body.classList.toggle(
  'birthday-theme',
  initialSlideId === 'slide1' || initialSlideId === 'slide2',
);

const showSlide = (index) => {
  const boundedIndex = Math.max(0, Math.min(index, slides.length - 1));
  const activeSlide = slides[boundedIndex];

  if (!activeSlide) {
    return;
  }

  activeSlide.inert = false;
  activeSlide.setAttribute('aria-hidden', 'false');
  activeSlide.classList.add('is-active');
  document.body.classList.toggle('music-player-page', activeSlide.id === 'slide3');
  document.body.classList.toggle('birthday-theme', activeSlide.id === 'slide1' || activeSlide.id === 'slide2');

  slides.forEach((slide, slideIndex) => {
    if (slideIndex !== boundedIndex) {
      slide.inert = true;
      slide.setAttribute('aria-hidden', 'true');
      slide.classList.remove('is-active');
    }
  });

  activeSlideIndex = boundedIndex;
  activeSlide.querySelector('h1, h2').focus({ preventScroll: true });

  window.requestAnimationFrame(() => {
    const scrollTarget = activeSlide.id === 'slide3'
      ? activeSlide.querySelector('.music-player-card')
      : activeSlide.id === 'slide2' && !birthdayEnvelope.hidden
        ? birthdayEnvelope
        : activeSlide;
    const targetBounds = scrollTarget.getBoundingClientRect();
    const centeredTop = window.scrollY + targetBounds.top - (window.innerHeight - targetBounds.height) / 2;
    window.scrollTo({
      top: Math.max(0, centeredTop),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  });
};

document.querySelectorAll('.slide-navigation button, .music-player-navigation button').forEach((button) => {
  button.addEventListener('click', () => {
    showSlide(activeSlideIndex + Number(button.dataset.direction));
  });
});

document.querySelectorAll('.memory-photo-trigger').forEach((button) => {
  button.addEventListener('click', () => {
    const isRevealed = button.classList.toggle('is-revealed');
    button.setAttribute('aria-pressed', String(isRevealed));
    button.setAttribute('aria-label', `${isRevealed ? 'Hide' : 'Reveal'} ${button.querySelector('img').alt.toLowerCase()}`);
  });
});

const birthdayEnvelope = document.querySelector('.birthday-envelope');
const birthdayEnvelopeStage = document.querySelector('.birthday-envelope-stage');
const birthdayLetter = document.querySelector('#birthday-letter');

birthdayEnvelope.addEventListener('click', () => {
  if (birthdayEnvelope.disabled) {
    return;
  }

  birthdayEnvelope.disabled = true;
  birthdayEnvelopeStage.classList.add('is-opening');
  birthdayEnvelope.classList.add('is-opening');
  birthdayEnvelope.setAttribute('aria-expanded', 'true');

  window.setTimeout(() => {
    birthdayEnvelope.hidden = true;
    birthdayLetter.hidden = false;
    birthdayLetter.inert = false;
    birthdayLetter.setAttribute('aria-hidden', 'false');
    birthdayLetter.scrollTop = 0;
    window.requestAnimationFrame(() => {
      birthdayLetter.classList.add('is-visible');
      const slide = document.querySelector('#slide2');
      const bounds = slide.getBoundingClientRect();
      window.scrollTo({
        top: Math.max(0, window.scrollY + bounds.top - (window.innerHeight - bounds.height) / 2),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    });
  }, 700);
});

const playerStatus = document.querySelector('.player-status');
const playerControls = document.querySelectorAll('[data-player-action]');
const playButton = document.querySelector('.play-button');
const videoFrame = document.querySelector('#music-video');
let youtubePlayer;

const videoUrl = new URL(videoFrame.src);
videoUrl.searchParams.set('enablejsapi', '1');
if (window.location.origin !== 'null') {
  videoUrl.searchParams.set('origin', window.location.origin);
}
videoUrl.searchParams.set('controls', '0');
videoUrl.searchParams.set('rel', '0');
videoUrl.searchParams.set('playsinline', '1');
videoFrame.src = videoUrl.toString();

const setPlayerStatus = (message) => {
  if (playerStatus) {
    playerStatus.textContent = message;
  }
};

const initializeYouTubePlayer = () => {
  if (!window.YT || !window.YT.Player || youtubePlayer) {
    return;
  }

  youtubePlayer = new window.YT.Player('music-video', {
    events: {
      onReady: () => {
        playerControls.forEach((button) => {
          button.disabled = false;
        });
        setPlayerStatus('YouTube player ready.');
      },
      onStateChange: (event) => {
        const isPlaying = event.data === window.YT.PlayerState.PLAYING;
        playButton.dataset.playing = String(isPlaying);
        playButton.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
      },
      onError: (event) => {
        playerControls.forEach((button) => {
          button.disabled = true;
        });
        setPlayerStatus(`YouTube could not play this video (error ${event.data}). Open the link below to watch it.`);
      },
    },
  });
};

window.onYouTubeIframeAPIReady = initializeYouTubePlayer;
document.addEventListener('error', (event) => {
  if (event.target && event.target.id === 'youtube-player-api') {
    setPlayerStatus('YouTube controls could not load. Open the link below to watch the video.');
  }
}, true);

if (window.YT && window.YT.Player) {
  initializeYouTubePlayer();
}

document.querySelector('.favorite-button').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const isFavorite = button.getAttribute('aria-pressed') !== 'true';
  button.setAttribute('aria-pressed', String(isFavorite));
  button.setAttribute('aria-label', isFavorite ? 'Remove from favorites' : 'Add to favorites');
});

playerControls.forEach((button) => {
  button.addEventListener('click', () => {
    if (!youtubePlayer) {
      return;
    }

    switch (button.dataset.playerAction) {
      case 'toggle':
        if (youtubePlayer.getPlayerState() === window.YT.PlayerState.PLAYING) {
          youtubePlayer.pauseVideo();
        } else {
          youtubePlayer.playVideo();
        }
        break;
      case 'rewind':
        youtubePlayer.seekTo(Math.max(0, youtubePlayer.getCurrentTime() - 10), true);
        break;
      case 'forward':
        youtubePlayer.seekTo(
          Math.min(youtubePlayer.getDuration(), youtubePlayer.getCurrentTime() + 10),
          true,
        );
        break;
      case 'volume':
        youtubePlayer.setVolume(Math.min(100, youtubePlayer.getVolume() + 10));
        break;
    }
  });
});
