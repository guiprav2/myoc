import EditOCPage from './pages/EditOCPage.js';
import ProfilePage from './pages/ProfilePage.js';
import Router from './Router.js';
import SignInPage from './pages/SignInPage.js';
import SignUpPage from './pages/SignUpPage.js';
import d from './dominant.js';
import jsx from './jsx.js';

// executes function after document.body exists
addEventListener('DOMContentLoaded', () => {
  // adds page router to body
  document.body.append(d.el(Router, {
    // page routes:
    routes: {
      '/': SignInPage,
      '/signup': SignUpPage,
      '/profile': ProfilePage,
      '/create': EditOCPage,
    },
  }));
});

window.d = d;
