import Lightbox from '../components/Lightbox.js';
import SpinnerModal from '../components/SpinnerModal.js';
import UploadDialog from '../components/UploadDialog.js';
import d from '../dominant.js';
import jsx from '../jsx.js';
import qs from 'https://cdn.skypack.dev/querystring';
import { navigate } from '../util/url.js';
import { protohub } from '../util/request.js';
import { showModal } from '../util/modal.js';
import { uploadFile } from '../util/file.js';

class EditOCPage {
  view = 'profile';

  constructor(props) {
    this.props = props;
    let q = qs.decode(location.search.slice(1));
    this.ocid = q?.id;
    this.profileData.pid = q?.pid;
    this.back = q?.back;
    this.editing = !this.ocid;
    this.profile = this.content = this.renderProfile();
    (async () => {
      await this.loadOc();
      await this.loadGallery();
    })();
  }

  get submittingWork() { return this.content !== this.profile }

  showWork = x => showModal(d.el(Lightbox, { urls: this.gallery.map(x => x.url), x }));

  uploadAvatar = async () => {
    let [x1, x2] = await uploadFile();
    if (x1 !== 'ok') { return }
    this.profileData.avatar = x2;
    console.log(this.profileData);
    d.update();
  };

  uploadWork = async () => {
    let [x2, url] = await uploadFile();
    if (x2 !== 'ok') { return }
    this.workData.url = url;
    d.update();
  };

  profileData = {};

  edit = () => { this.menuOpen = false; this.editing = true; d.update() };

  save = async () => {
    this.menuOpen = false;
    d.update();
    if (!this.profileData.pid) { alert('missing pid'); return }
    let [p, close] = showModal(d.el(SpinnerModal));
    try {
      let res = await protohub.post('/myoc/oc', {
        method: this.ocid ? 'PATCH' : 'POST',
        q: this.ocid ? { _id: this.ocid } : {},
        body: this.profileData,
      });
      !this.ocid && history.pushState({}, null, `/create?id=${res._id}`);
      this.ocid = res._id;
      if (!this.back) {
        this.editing = false;
        d.update();
      } else {
        navigate(this.back);
      }
    } finally {
      close();
    }
  };

  changed = ev => {
    let t = ev.target;
    let data = !this.submittingWork ? this.profileData : this.workData;
    data[t.name] = t.value;
    console.log(this.submittingWork, data, t.name, t.value);
  };

  data = [
    ['', ''],
  ];

  loadOc = async () => {
    if (!this.ocid) { return }
    let [p, close] = showModal(d.el(SpinnerModal));
    try {
      let res = await protohub.get('/myoc/oc', { q: { _id: this.ocid } });
      if (!res || !res.length) { alert('error') }
      this.profileData = res[0];
      d.update();
    } finally {
      close();
    }
  };

  loadGallery = async () => {
    console.log('loading gallery...');
    this.gallery = [];
    if (!this.ocid) { return }
    let [p, close] = showModal(d.el(SpinnerModal));
    try {
      let res = await protohub.get('/myoc/works', { q: { ocid: this.ocid } });
      this.gallery = res;
      d.update();
    } finally {
      close();
    }
  };

  submitWork = async ev => {
    ev && ev.preventDefault();
    if (!this.submittingWork) {
      this.workData = {};
      this.content = this.renderWorkModal();
      d.update();
      return;
    }

    if (!this.validWork) { return }
    this.submitBtn.disabled = true;
    let res = await protohub.post('/myoc/works', {
      body: { ...this.workData, ocid: this.ocid },
    });

    this.content = this.profile;
    this.loadGallery();
    d.update();
  };

  get validWork() { console.log(this.workData); return this.workData.url && this.workData.title }

  back = () => {
    this.content = this.profile;
    d.update();
  };

  render = () => jsx`<div>${d.portal(() => this.content)}</div>`[0];

  renderProfile = () => jsx`
    <form
      class="max-w-5xl min-h-screen mx-auto p-0 sans bg-[#F1F1F1] flex flex-col pb-10 shadow-lg"
      ${{ model: this, onChange: this.changed }}
    >
      <div class="relative">
        <div class="sticky left-0 right-0 top-0 bg-[#2D2829] z-10">
          <div class="flex justify-between text-[#FA3973] p-2">
            <button class="nf nf-fa-bars w-10 aspect-square"></button>
            <div class="flex">
              <button class="nf nf-fa-home w-10 aspect-square"></button>
              <button class="nf nf-md-magnify w-10 aspect-square"></button>
            </div>
          </div>
      </div>
      <div class="mt-8 mb-5 flex gap-3 items-center grid grid-cols-3 px-4">
        <input
          class="col-start-2 justify-self-center text-[#FA3973] font-semibold text-xl bg-transparent outline-none text-center"
          ${{ name: 'name', placeholder: 'OC Name', value: () => this.profileData.name, disabled: () => !this.editing }}
        >
        <div class="relative -top-4 justify-self-end flex justify-center aspect-square">
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
              ${d.text(() => !this.editing ? 'Edit OC' : 'Save OC')}
            </a>
            <a class="px-8 whitespace-nowrap py-2 hover:text-[#333333] hover:bg-neutral-100">Delete OC</a>
          </div>
        </div>
      </div>
      <button
        class="relative w-32 aspect-square overflow-hidden mx-auto rounded-full bg-neutral-300 flex justify-center items-center text-5xl text-white"
        ${{ type: 'button', onClick: this.uploadAvatar, disabled: () => !this.editing }}
      >
        ${d.if(
          () => this.profileData.avatar,
          jsx`
            <img ${{ src: () => this.profileData.avatar }}>
            <div ${{ class: [
              'absolute left-0 right-0 top-0 bottom-0 flex justify-center items-center rounded-full text-xs bg-neutral-700/70 opacity-0 hover:opacity-100 shadow-inset',
              () => !this.editing && 'hidden',
            ]}}>
              change
            </div>
          `,
          jsx`<div ${{ class: () => !this.editing && 'hidden' }}>+</div>`,
        )}
      </button>
      <div class="flex flex-col gap-5 mx-8 my-10">
        <input
          class="text-lg pb-1 border-b border-neutral-300 text-[#2D2829] px-3 w-full bg-transparent outline-none"
          ${{ placeholder: 'Title', name: 'title', value: () => this.profileData.title, disabled: () => !this.editing }}
        >
        <textarea
          class="text-[#454545] px-3 w-full bg-transparent outline-none border-b border-neutral-300 min-h-16" style="height: 18px;"
          ${{ placeholder: 'Text...', name: 'description', value: () => this.profileData.description, disabled: () => !this.editing }}
        ></textarea>
      </div>
      <div class="">
        <div class="bg-[#FFA1C3] text-[#EAEAEA] px-5 py-1 font-semibold">OC Data</div>
        <div class="flex flex-col gap-2 max-w-xl mx-8 my-8 text-sm text-neutral-800">
          ${d.map(() => this.data, x => jsx`
            <div class="flex gap-3 items-center">
              <input class="bg-[#E3D9D9BD] px-3 py-1 outline-none flex-1 w-full" ${{ value: x[0] }}>
              <span class="text-[#454545]">-</span>
              <input class="bg-[#E3D9D9BD] px-3 py-1 outline-none flex-1 w-full" ${{ value: x[1] }}>
            </div>
          `)}
        </div>
        <div class="bg-[#FFA1C3] text-[#EAEAEA] px-5 py-1 font-semibold">Gallery</div>
        <div class="sm:mx-8 my-8 flex flex-wrap justify-center gap-8">
          ${d.map(() => this.gallery, x => jsx`
            <a ${{ href: '#', onClick: () => this.showWork(x.url) }}>
              <img class="h-48" ${{ src: x.url }}>
            </a>
          `)}
        </div>
        <div class="text-center" ${{ hidden: () => !this.ocid || this.editing }}>
          <button
            class="nf nf-fa-plus w-7 aspect-square rounded-full bg-neutral-400 text-white text-xs"
            ${{ onClick: this.submitWork }}
          ></button>
        </div>
      </div>
    </form>
  `[0];

  renderWorkModal = () => jsx`
    <form
      class="max-w-5xl min-h-screen mx-auto sans bg-[#F1F1F1] flex flex-col"
      ${{ model: this, onChange: this.changed, onSubmit: this.submitWork }}
    >
      <div class="relative">
        <div class="sticky left-0 right-0 top-0 bg-[#2D2829] z-10">
          <div class="flex justify-between text-[#FA3973] p-2">
            <button
              class="nf nf-fa-arrow_left w-10 aspect-square"
              ${{ type: 'button', onClick: this.back }}
            ></button>
          </div>
        </div>
        <button
          class="w-64 mx-auto aspect-square bg-neutral-300 flex justify-center items-center text-5xl text-white mt-16"
          ${{ type: 'button', onClick: this.uploadWork }}
        >
          ${d.if(() => !this.workData.url, jsx`<div>+</div>`, jsx`
            <img ${{ class: 'h-full object-contain', src: () => this.workData.url }}>
          `)}
        </button>
        <div class="w-64 mx-auto mt-12 text-sm font-[#FA3973] flex flex-col gap-10">
          <div class="border-b border-[#A7A7A7]">
            <div>Title</div>
            <input class="w-full bg-transparent outline-none text-[#333333]" name="title">
          </div>
          <div class="border-b border-[#A7A7A7]">
            <div>Description</div>
            <input class="w-full bg-transparent outline-none text-[#333333]" name="description">
          </div>
          <div class="border-b border-[#A7A7A7]">
            <div>Tags</div>
            <input class="w-full bg-transparent outline-none text-[#333333]" name="tags">
          </div>
          ${this.submitBtn = d.el('button', {
            class: ['h-10 mb-16 text-white bg-[#FA3973]', () => !this.validWork && 'bg-[#FFA1C4]'],
            disabled: () => !this.validWork,
          }, 'Submit')}
        </div>
      </div>
    </form>
  `[0];
}

export default EditOCPage;
