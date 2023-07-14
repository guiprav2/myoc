import SpinnerModal from '../components/SpinnerModal.js';
import d from '../dominant.js';
import jsx from '../jsx.js';
import { navigate } from '../util/url.js';
import { protohub } from '../util/request.js';
import { showModal } from '../util/modal.js';

class SignInPage {
  welcome = true;

  login = () => {
    this.welcome = false;
    d.update();
  };

  changed = ev => {
    let t = ev.target;
    this[t.name] = t.value;
  };

  signIn = async ev => {
    ev.preventDefault();
    let [p, close] = showModal(d.el(SpinnerModal));
    try {
      this.error = null;
      d.update();
      let { email, pwd } = this;
      let res = await protohub.get('/myoc/users', { q: { email, pwd } });
      if (!res || !res.length) {
        this.error = 'Wrong e-mail or password';
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
    ${d.if(() => this.welcome, jsx`
      <div class="ComponentBox p-0 sans bg-[#2D2829] flex h-screen flex-col justify-center">
        <div class="my-20 items-center flex flex-col gap-12">
          <span class="text-6xl text-white">My OC</span>
          <button class="bg-[#FA3973] text-white w-72 py-3" ${{ onClick: this.login }}>
            Login
          </button>
          <a class="text-[#CBCBCB]" href="signup">Create account</a>
        </div>
      </div>
    `, jsx`
      <div class="ComponentBox p-0 sans bg-[#F1F1F1] flex flex-col justify-center h-screen">
        <form
          class="my-20 items-center flex flex-col gap-12"
          ${{ onChange: this.changed, onSubmit: this.signIn }}
        >
          <span class="text-6xl">My OC</span>
          <div class="flex flex-col gap-1">
            <input class="w-72 py-3 px-5" name="email" placeholder="E-mail">
            <input class="w-72 py-3 px-5" name="pwd" type="password" placeholder="Password">
            ${d.if(() => this.error, jsx`
              <span class="text-neutral-800 mt-1 text-sm italic text-red-700 text-center">
                ${d.text(() => this.error)}
              </span>
            `)}
          </div>
          <button class="bg-[#FA3973] text-white w-72 py-3 rounded-full">
            Login
          </button>
          <a class="text-neutral-800" href="signup">Create account</a>
        </form>
      </div>
    `)}
  `[0];
}

export default SignInPage;
