import d from '../dominant.js';
import jsx from '../jsx.js';
import { readAsDataUrl } from '../util/file.js';

let { bem } = windy;

class UploadDialog {
  constructor(props) { this.props = props }
  get file() { return d.resolve(this.props.file) }

  onAttach = () => {
    let xhr = this.xhr = new XMLHttpRequest(), data = new FormData();

    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) { return }
      data = JSON.parse(xhr.responseText);
      this.root.returnValue2 = data.url;
      this.done = true;
      d.update();
    };

    xhr.onprogress = ev => {
      if (!ev.lengthComputable) { return }
      let bar = this.progress.firstElementChild;
      this.progressValue = (ev.loaded / ev.total) * 100;
      bar.style.width = `${this.progressValue}%`;
    };

    data.append('file', this.file);
    xhr.open('POST', 'https://filet.guiprav.com/webfoundry/upload');
    xhr.send(data);

    if (this.file.type.startsWith('image/')) {
      readAsDataUrl(this.file).then(x => { this.dataUrl = x; d.update() });
    }
  };

  onDetach = () => !this.done && this.xhr.abort();

  css = bem('UploadDialog', {
    root: `min-w-1/3 max-h-[70vh] overflow-hidden flex flex-col p-0 rounded-lg text-neutral-100 bg-neutral-800 shadow-xl sans`,
    form: `flex flex-col overflow-hidden`,
    title: `flex shrink-0 justify-between items-center h-10 border-b border-[#1f2124] px-3 font-sm font-semibold text-white`,
    img: `w-full h-96 object-contain`,
    placeholder: `w-full h-52 my-12 object-contain`,
    btns: `flex gap-2 flex justify-end text-white px-3 py-2`,
    cancelBtn: `px-6 h-12 bg-[#2b2d31] text-white rounded-md lg:h-8`,
    okBtn: `px-6 h-12 bg-indigo-600 text-white rounded-md lg:h-8`,
    mDisabledBtn: `text-neutral-400 bg-gray-700`,
  });

  render = () => (this.root = jsx`
    <dialog ${{
      model: this,
      class: this.css.root,
      onAttach: this.onAttach,
      onDetach: this.onDetach,
    }}>
      <form ${{ method: 'dialog', class: this.css.form }}>
        <div ${{ class: this.css.title }}>
          <span>Upload (${d.text(() => Math.round(this.progressValue || 0))}%)</span>
        </div>
        <div class="flex-1 overflow-auto">
          ${d.if(
            () => this.dataUrl,
            d.el('img', { class: this.css.img, src: () => this.dataUrl }),
            d.el('img', { class: this.css.placeholder, src: 'upload.png' }),
          )}
        </div>
        ${this.progress = jsx`
          <div ${{ class: `flex h-1 bg-[#2b2d31]` }}>
            <div ${{ class: `h-1 bg-blue-500` }}></div>
          </div>
        `[0]}
        <div ${{ class: this.css.btns }}>
          <button ${{
            class: this.css.cancelBtn,
            value: 'cancel',
          }}>Cancel</button>
          <button ${{
            class: [this.css.okBtn, () => !this.done && this.css.mDisabledBtn],
            disabled: () => !this.done,
            value: 'ok',
          }}>OK</button>
        </div>
      </form>
    </dialog>
  `[0]);
}

export default UploadDialog;
