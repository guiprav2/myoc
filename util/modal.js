import { makePromise } from './promise.js';

addEventListener('keydown', ev => {
  if (ev.key !== 'Escape') { return }
  let di = document.querySelector('dialog[escape="no"]');
  di && ev.preventDefault();
});

function showModal(x) {
  let [p, res] = makePromise();
  document.body.append(x);
  x.returnValue = '';
  x.addEventListener('close', () => {
    x.remove();
    res([x.returnValue, x.returnValue2]);
  });
  x.showModal();
  function close() { x.remove() }
  return [p, close];
}

export { showModal };
