function makePromise() {
  let res, rej, p = new Promise((res_, rej_) => {
    res = res_; rej = rej_;
  });
  return [p, res, rej];
}

export { makePromise };
