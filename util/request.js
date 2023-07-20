import qs from 'https://cdn.skypack.dev/qs';

class Requester {
  constructor(prefix = '') { this.prefix = prefix }

  get = async (path, opt) => {
    opt = { ...opt };
    let { q, withHeaders } = opt; delete opt.q; delete opt.withHeaders;
    q && (path += `?${qs.stringify(q)}`);
    let res = await fetch(`${this.prefix}${path}`, opt);
    if (!res.ok) { throw new Error(`cannot get: ${res.status}`) }
    if (res.headers.get('content-type')?.startsWith('application/json')) {
      return withHeaders ? [res.headers, await res.json()] : res.json();
    }
    return withHeaders ? [res.headers, await res.text()] : res.text();
  };

  post = async (path, opt) => {
    opt = { ...opt };
    let { text, q } = opt; delete opt.text; delete opt.q;
    q && (path += `?${qs.stringify(q)}`);
    let res = await fetch(`${this.prefix}${path}`, {
      method: 'POST',
      ...opt,
      headers: {
        ...opt.headers || {},
        'Content-Type': text ? 'text/plain' : 'application/json',
      },
      body: text ? opt.body : JSON.stringify(opt.body),
    });
    if (!res.ok) { throw new Error(`cannot post: ${res.status}`) }
    if (res.headers.get('content-type')?.startsWith('application/json')) {
      return res.json();
    }
    return res.text();
  };
}

let req = new Requester();

let protohub = ({
  get: (url, ...more) =>
    req.get(`https://protohub.guiprav.com${url}`, ...more),
  post: (url, ...more) =>
    req.post(`https://protohub.guiprav.com${url}`, ...more),
});

export { req, protohub };
