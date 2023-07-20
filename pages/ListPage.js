import SpinnerModal from '../components/SpinnerModal.js';
import d from '../dominant.js';
import jsx from '../jsx.js';
import qs from 'https://cdn.skypack.dev/qs';
import { navigate } from '../util/url.js';
import { protohub } from '../util/request.js';
import { showModal } from '../util/modal.js';

class ListPage {
  constructor(props) {
    this.props = props;
    let q = qs.parse(location.search.slice(1));
    this.id = q?.id;
    (async () => {
      await this.loadOcs();
      await this.loadWorks();
    })();
  }

  loadOcs = async () => {
    if (!this.id) { return }
    let [p, close] = showModal(d.el(SpinnerModal));
    try {
      let res = await protohub.get('/myoc/oc', { q: { pid: this.id } });
      if (!res) { alert('error') }
      this.ocs = res;
      d.update();
    } finally {
      close();
    }
  };

  loadWorks = async () => {
    if (!this.id) { return }
    let [p, close] = showModal(d.el(SpinnerModal));
    try {
      let res = await protohub.get('/myoc/works', {
        q: { ocid: { $in: this.ocs.map(x => x._id) } },
      });
      if (!res) { alert('error') }
      this.works = res;
      d.update();
    } finally {
      close();
    }
  };

  works = [];
  worksFor = id => this.works.filter(x => x.ocid === id);

  slideWorks = (x, i) => {
    let works = this.worksFor(x._id);
    x.i ??= 0; x.i += i;
    if (x.i < 0) { x.i = works.length - 1 }
    if (x.i >= works.length) { x.i = 0 }
    console.log(x.i);
    d.update();
  };

  render = () => jsx`
    <div class="max-w-5xl mx-auto sans bg-[#F1F1F1] flex flex-col pb-10">
      <div class="bg-[#2D2829]">
        <div class="flex justify-between text-[#FA3973] p-2">
          <button class="nf nf-fa-bars w-10 aspect-square"></button>
          <div class="flex">
            <button class="nf nf-fa-home w-10 aspect-square"></button>
            <button class="nf nf-md-magnify w-10 aspect-square"></button>
          </div>
        </div>
      </div>
      <div class="bg-white flex justify-around py-2 text-xs items-center">
        <div class="px-3 py-1 rounded-full">Recommended</div>
        <div class="px-3 rounded-full py-1">Collection</div>
        <div class="px-3 rounded-full bg-[#FFA1C3] text-white py-1">My OC</div>
        <div class="px-3 py-1 rounded-full">Gallery</div>
      </div>
      ${d.map(() => this.ocs, x => jsx`
        <div class="flex justify-center pt-10">
          <a ${{ href: () => `/create?id=${x._id}` }}>
            <div class="w-32 mx-auto aspect-square rounded-full bg-neutral-300 flex justify-center items-center text-5xl text-white overflow-hidden" src="http://filet.guiprav.com/webfoundry/e9432a30-a664-4d70-947a-224184159c64/avatar_WhatsApp Image 2023-07-02 at 17.39.58(2).jpeg">
              <img ${{ src: () => x.avatar }}>
            </div>
            <div class="my-5 flex gap-3 items-center grid grid-cols-3 px-4">
              <div class="col-start-2 justify-self-center text-[#FA3973] font-semibold text-xl bg-transparent outline-none text-center">
                ${d.text(() => x.name)}
              </div>
            </div>
          </a>
        </div>
        <div class="w-96 mx-auto aspect-square bg-neutral-300 flex items-center relative text-xl">
          <button
            class="nf nf-fa-chevron_left absolute left-4 text-[#FFA1C3] sm:-left-8"
            ${{ onClick: () => this.slideWorks(x, -1) }}
          ></button>
          <button
            class="nf nf-fa-chevron_right absolute right-4 text-[#FFA1C3] sm:-right-8"
            ${{ onClick: () => this.slideWorks(x, 1) }}
          ></button>
          <img ${{ src: () => this.worksFor(x._id)[x.i || 0]?.url }}>
        </div>
        <div class="w-96 mx-auto flex text-sm justify-between py-2 border-b border-[#E3D9D9BD]">
          <div class="flex gap-5">
            <div class="flex items-center gap-2 text-[#A7A7A7]">
              <i class="nf nf-fa-eye text-lg text-[#FFA1C3]"></i>
              <span class="">0</span>
            </div>
            <div class="flex items-center gap-2 text-[#A7A7A7]">
              <i class="nf nf-fa-heart text-lg text-[#FFA1C3]"></i>
              <span class="">0</span>
            </div>
            <div class="flex items-center gap-2 text-[#A7A7A7]">
              <i class="nf nf-fa-comment text-lg text-[#FFA1C3]"></i>
              <span class="">0</span>
            </div>
          </div>
          <button class="nf nf-md-dots_vertical text-[#A7A7A7] w-5 aspect-square flex justify-center items-center"></button>
        </div>
      `)}
    </div>
  `[0];
}

export default ListPage;
