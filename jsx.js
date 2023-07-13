import d from '../dominant.js';

let arrayify = x => Array.isArray(x) ? x : [x];

let jsx = (xs, ...ys) => {
  let o = '', as = {}, ns = {}, c = 1;

  for (let [i, x] of xs.entries()) {
    let y = ys[i];
    o += x;
    if (!y) { continue }

    let id = c++;

    if (y.constructor === Object) {
      as[id] = y;
      o += ` data-jsx-${id}`;
    }
    else {
      ns[id] = y;
      o += `<i data-jsx-${id}></i>`;
    }
  }

  let o2 = document.createElement('div');
  o2.innerHTML = o.trim();

  for (let [k, v] of Object.entries(as)) {
    let a = `data-jsx-${k}`;
    let n = o2.querySelector(`[${a}]`);
    n.removeAttribute(a);
    d.el(n, v);
  }

  for (let [k, v] of Object.entries(ns)) {
    let a = `data-jsx-${k}`;
    let n = o2.querySelector(`[${a}]`);
    n.replaceWith(...arrayify(v).map(
      x => x.tagName === 'TEMPLATE' ? x.content : x));
  }

  return [...o2.childNodes];
};

export default jsx;
