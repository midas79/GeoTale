export function setupSkipToContent() {
  const skipLink = document.querySelector('.skip-to-main');
  if (!skipLink) return;

  skipLink.addEventListener('click', function (event) {
    event.preventDefault();

    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    if (!mainContent.hasAttribute('tabindex')) {
      mainContent.setAttribute('tabindex', '-1');
    }

    mainContent.focus({ preventScroll: false });
    mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
