import d from '../dominant.js';
import jsx from '../jsx.js';

class SignInPage {
  render = () => jsx`
    <div class="ComponentBox p-0 sans bg-[#F1F1F1] flex flex-col justify-center h-screen">
      <div class="my-20 items-center flex flex-col gap-12"><span class="text-6xl">My OC</span>
        <div class="flex flex-col gap-1"><input class="w-72 py-3 px-5 outline-none" placeholder="Name"><input class="w-72 py-3 px-5 outline-none" placeholder="E-mail"><input class="w-72 py-3 px-5 outline-none" placeholder="Password"></div><button class="bg-[#FA3973] text-white w-72 py-3 rounded-full">Login</button><a class="text-neutral-800" href="/">Go back</a>
      </div>
    </div>
  `[0];
}

export default SignInPage;
