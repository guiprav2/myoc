import d from '../dominant.js';
import jsx from '../jsx.js';

class SignInPage {
  welcome = true;

  login = () => {
    this.welcome = false;
    d.update();
  };

  render = () => jsx`
    ${d.if(() => this.welcome, jsx`
      <div class="ComponentBox p-0 sans bg-[#2D2829] flex h-screen flex-col justify-center">
        <div class="my-20 items-center flex flex-col gap-12"><span class="text-6xl text-white">My OC</span><button class="bg-[#FA3973] text-white w-72 py-3" ${{ onClick: this.login }}>Login</button>
          <a class="text-[#CBCBCB]" href="signup">Create account</a>
        </div>
      </div>
    `, jsx`
      <div class="ComponentBox p-0 sans bg-[#F1F1F1] flex flex-col justify-center h-screen">
        <div class="my-20 items-center flex flex-col gap-12"><span class="text-6xl">My OC</span>
          <div class="flex flex-col gap-1"><input class="w-72 py-3 px-5" placeholder="E-mail"><input class="w-72 py-3 px-5" placeholder="Password"></div><button class="bg-[#FA3973] text-white w-72 py-3 rounded-full">Login</button>
          <a class="text-neutral-800" href="signup">Create account</a>
        </div>
      </div>
    `)}
  `[0];
}

export default SignInPage;
