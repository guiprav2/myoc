import SpinnerModal from '../components/SpinnerModal.js';
import d from '../dominant.js';
import jsx from '../jsx.js';
import qs from 'https://cdn.skypack.dev/querystring';
import { protohub } from '../util/request.js';
import { showModal } from '../util/modal.js';
import { uploadFile } from '../util/file.js';

class ProfilePage {
  ocs = [];

  constructor(props) {
    this.props = props;
    this.pid = qs.decode(location.search.slice(1))?.id;
    this.editing = !this.pid;
    (async () => {
      await this.loadProfile();
      await this.loadOcs();
    })();
  }

  loadProfile = async () => {
    if (!this.pid) { return }
    let [p, close] = showModal(d.el(SpinnerModal));
    try {
      let res = await protohub.get('/myoc/profile', { q: { _id: this.pid } });
      if (!res || !res.length) { alert('error') }
      this.data = res[0];
      d.update();
    } finally {
      close();
    }
  };

  loadOcs = async () => {
    this.ocs = [];
    if (!this.pid) { return }
    let [p, close] = showModal(d.el(SpinnerModal));
    try {
      let res = await protohub.get('/myoc/oc', { q: { pid: this.pid } });
      if (!res || !res.length) { alert('error') }
      this.ocs = res;
      d.update();
    } finally {
      close();
    }
  };

  edit = () => { this.menuOpen = false; this.editing = true; d.update() };

  uploadAvatar = async () => {
    console.log(123);
    let [x1, x2] = await uploadFile();
    if (x1 !== 'ok') { return }
    this.data.avatar = x2;
    d.update();
  };

  data = {};
  changed = ev => { let t = ev.target; this.data[t.name] = t.value };

  save = async () => {
    this.menuOpen = false;
    d.update();
    let [p, close] = showModal(d.el(SpinnerModal));
    try {
      let res = await protohub.post('/myoc/profile', {
        method: this.pid ? 'PATCH' : 'POST',
        q: this.pid ? { _id: this.pid } : {},
        body: this.data,
      });
      !this.pid && history.pushState({}, null, `/profile?id=${res._id}`);
      this.pid = res._id;
      this.editing = false;
      d.update();
    } finally {
      close();
    }
  };

  render = () => jsx`
    <form
      class="max-w-5xl min-h-screen mx-auto sans bg-[#F1F1F1] flex flex-col pb-10 shadow-lg"
      ${{ model: this, onChange: this.changed }}
    >
      <div class="h-28 bg-[#2D2829]">
        <div class="flex justify-between text-[#FA3973] p-2">
          <button class="nf nf-fa-bars w-10 aspect-square"></button>
          <div class="flex">
            <button class="nf nf-fa-home w-10 aspect-square"></button>
            <button class="nf nf-md-magnify w-10 aspect-square"></button>
          </div>
        </div>
      </div>
      <button
        class="relative w-32 aspect-square overflow-hidden mx-auto -mt-16 rounded-full text-white bg-neutral-300"
        ${{ type: 'button', onClick: this.uploadAvatar, disabled: () => !this.editing }}
      >
        ${d.if(
          () => this.data.avatar,
          jsx`
            <img ${{ src: () => this.data.avatar }}>
            <div ${{ class: [
              'absolute left-0 right-0 top-0 bottom-0 flex justify-center items-center rounded-full text-xs bg-neutral-700/70 opacity-0 hover:opacity-100 shadow-inset',
              () => !this.editing && 'hidden',
            ]}}>
              change
            </div>
          `,
          d.if(() => this.editing, jsx`<div class="font-3xl">+</div>`),
        )}
      </button>
      <div class="mt-5 mb-3 flex gap-3 items-center grid grid-cols-3 px-4">
        <input
          class="col-start-2 justify-self-center text-[#FA3973] font-semibold text-xl bg-transparent outline-none text-center"
          ${{ name: 'name', value: () => this.data.name, placeholder: 'Your Name', disabled: () => !this.editing }}
        >
        <div class="relative -top-16 justify-self-end flex justify-center aspect-square">
          <button type="button" class="text-neutral-500 group" ${{ onClick: () => this.menuOpen = !this.menuOpen }}>
            <i class="nf nf-md-dots_vertical w-8 aspect-square"></i>
          </button>
          <div ${{ class: [
            'absolute right-0 top-[calc(100%_+_1em)] flex flex-col text-sm text-[#555555] text-center bg-white shadow cursor-default select-none',
            () => !this.menuOpen && 'hidden',
          ]}}>
            <a
              class="px-8 whitespace-nowrap py-2 hover:text-[#333333] hover:bg-neutral-100"
              ${{ href: '#', onClick: () => !this.editing ? this.edit() : this.save() }}
            >
              ${d.text(() => !this.editing ? 'Edit Profile' : 'Save Profile')}
            </a>
          </div>
        </div>
      </div>
      <input
        class="mx-auto mt-5 text-neutral-700 text-center w-96 bg-transparent outline-none"
        ${{ name: 'tagline', value: () => this.data.tagline, placeholder: 'Tagline', disabled: () => !this.editing }}
      >
      <div class="mx-auto w-32 border-b mt-2 mb-1 border-neutral-300"></div>
      <div class="flex text-sm gap-3 border-b border-neutral-300 pb-1 w-72 mx-auto">
        <span class="ml-auto text-neutral-700">0 followers</span>
        <span class="text-neutral-700 mr-auto">0 following</span>
      </div>
      <div class="mt-10 mx-8 flex flex-col gap-5">
        <div class="flex flex-col gap-2">
          <div class="text-xl text-[#FA3973] flex items-center gap-4 group">
            OC Profiles
            ${d.if(() => this.ocs.length, jsx`
              <a
                class="w-8 aspect-square flex justify-center bg-neutral-300 rounded-full text-neutral-500"
                ${{ href: () => `/create?pid=${this.pid}` }}
              >+</a>
            `)}
          </div>
          ${d.if(() => !this.ocs.length, jsx`
            <a
              class="text-sm text-neutral-500 italic hover:underline"
              ${{ href: () => `/create?pid=${this.pid}` }}
            >
              ${d.text(() => !this.editing ? '+ Add your first' : 'Save your profile first')}
            </a>
          `, jsx`
            <div class="flex gap-5 flex-wrap text-[#FA3973]">
              ${d.map(() => this.ocs, x => jsx`
                <a
                  class="p-4 flex flex-col items-center gap-3"
                  ${{ href: () => `/create?id=${x._id}` }}
                >
                  <span class="w-24 aspect-square rounded-full flex justify-center items-center overflow-hidden bg-neutral-300">
                    <img ${{ src: () => x.avatar }}>
                  </span>
                  <span>${d.text(() => x.name)}</span>
                </a>
              `)}
            </div>
          `)}
        </div>
        <div class="flex flex-col gap-2">
          <div class="text-xl text-[#FA3973]">Gallery</div>
          <a class="text-sm text-neutral-500 italic hover:underline">
            ${d.text(() => !this.editing ? '+ Add your first' : 'Save your profile first')}
          </a>
        </div>
        <div class="flex flex-col gap-2">
          <div class="text-xl text-[#FA3973]">Collection</div>
          <a class="text-sm text-neutral-500 italic hover:underline">
            ${d.text(() => !this.editing ? 'Like something to add it to your collection' : 'Save your profile first')}
          </a>
        </div>
      </div>
    </form>
  `[0];
}

export default ProfilePage;
