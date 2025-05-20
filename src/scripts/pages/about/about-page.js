export default class AboutPage {
  async render() {
    return `
<section class="about-container">
  <div class="about-header">
    <h1>About This Application</h1>
    <p>This application is designed to make it easier for users to share their stories visually through an interactive map. The goal is to connect experiences and places in one intuitive platform.</p>
  </div>

  <h2 class="section-title">Key Features</h2>
  <div class="card-list">
    <div class="card">
      <i class="fas fa-map-marked-alt"></i>
      <h3>Story Mapping</h3>
      <p>Every story you share is directly linked to a location on the map, making it more vivid and contextual.</p>
    </div>
    <div class="card">
      <i class="fas fa-user-shield"></i>
      <h3>Privacy Ensured</h3>
      <p>You have full control over who can view your stories. We take personal data seriously.</p>
    </div>
    <div class="card">
      <i class="fas fa-mobile-alt"></i>
      <h3>Responsive & Lightweight</h3>
      <p>Designed to work seamlessly across various devices, from mobile to desktop, without compromising performance.</p>
    </div>
    <div class="card">
      <i class="fas fa-bell"></i>
      <h3>Push Notifications</h3>
      <p>Get real-time updates and notifications about new stories and activities.</p>
    </div>
    <div class="card">
      <i class="fas fa-download"></i>
      <h3>PWA Support</h3>
      <p>Install this app on your device and use it offline like a native application.</p>
    </div>
  </div>

  <h2 class="section-title">Technologies Used</h2>
  <div class="card-list">
    <div class="card">
      <i class="fab fa-js-square"></i>
      <h3>JavaScript</h3>
      <p>Used as the main language to build interactivity in this application.</p>
    </div>
    <div class="card">
      <i class="fab fa-openlayers"></i>
      <h3>OpenLayers</h3>
      <p>An open-source mapping framework that enables dynamic and accurate location visualization.</p>
    </div>
    <div class="card">
      <i class="fas fa-bell"></i>
      <h3>Push API</h3>
      <p>Enables push notifications to keep users updated in real-time.</p>
    </div>
    <div class="card">
      <i class="fas fa-download"></i>
      <h3>Progressive Web App (PWA)</h3>
      <p>Allows the app to be installed and used offline, providing a native-like experience.</p>
    </div>
  </div>

  <div class="about-footer">
    <p>Developed by Dionysus. Contact me if you have suggestions or questions.</p>
  </div>
</section>
    `;
  }

  async afterRender() {}
}
