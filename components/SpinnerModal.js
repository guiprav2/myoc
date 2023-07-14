import d from '../dominant.js';
import jsx from '../jsx.js';

let SpinnerModal = () => jsx`
  <dialog escape="no">
    <img style="height: 72px" src="/img/spinner.svg">
  </dialog>
`[0];

export default SpinnerModal;
