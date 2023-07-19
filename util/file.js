import UploadDialog from '../components/UploadDialog.js';
import d from '../dominant.js';
import { makePromise } from './promise.js';
import { showModal } from './modal.js';

// NOTE: Never resolves if cancelled by user
let selectFile = async () => {
  let [p, res] = makePromise();
  let input = d.el('input', { type: 'file', class: 'hidden' });
  input.addEventListener('change', ev => res(input.files[0]));
  top.document.body.append(input);
  input.click();
  input.remove();
  return p;
};

let uploadFile = async () => {
  let x = await selectFile();
  if (!x) { return }
  return showModal(d.el(UploadDialog, { file: x }))[0];
};

let readAsDataUrl = async f => {
  let [p, res, rej] = makePromise();
  let rd = new FileReader();
  rd.onload = () => res(rd.result);
  rd.onerror = ev => rej(ev);
  rd.readAsDataURL(await f);
  return p;
};

export { selectFile, uploadFile, readAsDataUrl };
