import d from '../dominant.js';
import jsx from '../jsx.js';

class Lightbox {
  constructor(props) {
    this.props = props;
    this.x = props.x;
    this.i = props.urls.indexOf(this.x);
  }

  get urls() { return d.resolve(this.props.urls) }

  slide(ev, i) {
    ev && ev.preventDefault();
    this.i += i;
    if (this.i < 0) { this.i = this.urls.length - 1 }
    if (this.i >= this.urls.length) { this.i = 0 }
    this.x = this.urls[this.i];
    d.update();
  }

  render = () => jsx`
    <dialog class="flex flex-col justify-center items-center max-w-5xl h-screen p-0 pb-8 bg-transparent">
      <form method="dialog" class="flex flex-col justify-center items-center">
        <button
          class="absolute left-3 nf nf-fa-chevron_left font-3xl text-white" style="text-shadow: 1px 1px 1px #333;"
          ${{ onClick: ev => this.slide(ev, -1) }}
        ></button>
        <button
          class="absolute right-3 nf nf-fa-chevron_right font-3xl text-white" style="text-shadow: 1px 1px 1px #333;"
          ${{ onClick: ev => this.slide(ev, 1) }}
        ></button>
        <img class="max-h-[65vh] shadow-lg" ${{ src: () => this.x }}>
        <button class="nf nf-oct-x font-4xl text-white -mb-12 mt-12 rounded-full bg-neutral-600/70 p-2" style="text-shadow: 1px 1px 1px #333;" value="close"></button>
      </form>
    </dialog>
  `[0];
}

export default Lightbox;
