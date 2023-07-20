import d from './dominant.js';

class Router {
  constructor(props) {
    window.router = this;
    this.props = props;
    addEventListener('click', this.onClick);
    addEventListener('popstate', () => this.update());
    this.update();
  }

  // routes getter from component props
  get routes() { return this.props.routes }

  // use history.pushState for local links
  onClick = (ev) => {
    let href = ev.target.closest('a')?.getAttribute?.('href');
    if (!href || /^https?:/.test(href)) { return }
    ev.preventDefault();
    if (href !== '#') { history.pushState({}, '', href); this.update() }
  };

  // updates router based on current URL
  update() {
    let p = location.pathname;

    // finds page matching current URL in this.routes
    for (let [k, v] of Object.entries(this.routes)) {
      if (k !== p) { continue }
      this.page = d.el(v);
      d.update();
      return;
    }

    // no matching page found
    this.page = null; // TODO: 404
    d.update();
  }

  // router is just a portal to the current page
  render = () => d.portal(() => this.page);
}

export default Router;
