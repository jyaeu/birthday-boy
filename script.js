const passwordForm = document.getElementById('passwordForm');
const passwordInput = document.getElementById('passwordInput');
const message = document.getElementById('message');
const hintText = document.getElementById('hintText');
const hero = document.querySelector('.hero');
const contentStage = document.getElementById('contentStage');
const envelopeSection = document.getElementById('envelopeSection');
const essaySection = document.getElementById('essaySection');
const quizSection = document.getElementById('quizSection');
const envelope = document.getElementById('envelope');
const quizFeedback = document.getElementById('quizFeedback');

passwordForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = passwordInput.value.trim().toLowerCase();

  if (input === 'mommy') {
    message.textContent = 'You unlocked it 💖';
    message.style.color = '#ff6f91';
    hintText.textContent = 'Welcome back';

    hero.classList.add('is-hidden');

    setTimeout(() => {
      contentStage.classList.add('is-visible');
      envelopeSection.classList.remove('hidden');
      essaySection.classList.remove('hidden');
      quizSection.classList.remove('hidden');
    }, 500);
  } else {
    message.textContent = 'bad boy hmm';
    message.style.color = '#b33f63';
  }
});

envelope.addEventListener('click', () => {
  envelope.classList.toggle('open');
});

envelope.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    envelope.classList.toggle('open');
  }
});

document.querySelectorAll('.quiz-option').forEach((button) => {
  button.addEventListener('click', () => {
    const selected = button.dataset.choice;
    const answer = document.querySelector('.quiz-question').dataset.answer;

    if (selected === answer) {
      quizFeedback.textContent = 'Exactly — that is the sweetest answer.';
    } else {
      quizFeedback.textContent = 'Aww, that is still cute. The best answer is the one about feeling at home with you.';
    }
  });
});
