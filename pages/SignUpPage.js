import SpinnerModal from '../components/SpinnerModal.js';
import d from '../dominant.js';
import jsx from '../jsx.js';
import { navigate } from '../util/url.js';
import { protohub } from '../util/request.js';
import { showModal } from '../util/modal.js';

class SignInPage {
  changed = ev => {
    let t = ev.target;
    this[t.name] = t.value;
  };

  signUp = async ev => {
    ev.preventDefault();
    let [p, close] = showModal(d.el(SpinnerModal));
    try {
      this.error = null;
      d.update();
      let { name, email, pwd } = this;
      let res = await protohub.get('/myoc/users', { q: { email } });
      if (res && res[0]) {
        this.error = 'E-mail already in use';
        d.update();
        return;
      }
      res = await protohub.post('/myoc/users', {
        body: { name, email, pwd },
      });
      if (!res) {
        this.error = 'Unknown error';
        d.update();
        return;
      }
      window.user = res[0];
      console.log(user);
      navigate('/home');
    } finally {
      close();
    }
  };

  render = () => jsx`
    <div class="ComponentBox p-0 sans bg-[#F1F1F1] flex flex-col justify-center h-screen">
      <form
        class="my-20 items-center flex flex-col gap-12"
        ${{ onChange: this.changed, onSubmit: this.signUp }}
      >
        <span class="text-6xl">My OC</span>
        <div class="flex flex-col gap-1">
          <input class="w-72 py-3 px-5 outline-none" name="name" placeholder="Name">
          <input class="w-72 py-3 px-5 outline-none" name="email" placeholder="E-mail">
          <input class="w-72 py-3 px-5 outline-none" name="pwd" type="password" placeholder="Password">
          ${d.if(() => this.error, jsx`
            <span class="text-neutral-800 mt-1 text-sm italic text-red-700 text-center">
              ${d.text(() => this.error)}
            </span>
          `)}
        </div>
        <button class="bg-[#FA3973] text-white w-72 py-3 rounded-full">
          Login
        </button>
        <a class="text-neutral-800" href="/">Go back</a>
      </form>
    </div>
  `[0];
}

export default SignInPage;
