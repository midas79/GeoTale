export default class HomePage {
  async render() {
    return `


      <section class="hero container">
        <div class="hero-content">
          <h1 class="hero-title">
            Your Stories, Your Voice
          </h1>
          <p class="hero-description">
            Capture meaningful moments, share experiences, and inspire the world—one story at a time.
          </p>
          <div class="hero-cta">
            <a href="#/stories" class="btn btn-primary">
              <i class="fas fa-book-reader"></i> Browse Stories
            </a>
            <a href="#/stories/add" class="btn btn-outline">
              <i class="fas fa-pen-nib"></i> Start Writing
            </a>
          </div>
        </div>
        <div class="hero-image">
          <img src="images/logo.png" alt="Storytelling Illustration" />
        </div>
      </section>

      <section class="features container">
        <h2 class="section-title">Why Tell Your Story Here?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <i class="fas fa-globe-asia feature-icon"></i>
            <h3>Reach Globally</h3>
            <p>Share your story with a worldwide community of readers and writers.</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-map-marked-alt feature-icon"></i>
            <h3>Map Your Moments</h3>
            <p>Pin your stories to real locations and let readers follow your journey.</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-camera-retro feature-icon"></i>
            <h3>Visual Storytelling</h3>
            <p>Enhance your narrative with photos captured on the spot or uploaded from your gallery.</p>
          </div>
        </div>
      </section>

      <section class="call-to-action container">
        <h2>Ready to share your voice?</h2>
        <p>Every story matters. Yours could be the one that inspires someone today.</p>
        <a href="#/stories/add" class="btn btn-large btn-highlight">
          <i class="fas fa-plus-circle"></i> Tell My Story
        </a>
      </section>
    `;
  }

  async afterRender() {}
}
