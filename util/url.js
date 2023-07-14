function navigate(url) {
  if (/^https?:/.test(url)) { location = url; return }
  history.pushState({}, null, url);
  dispatchEvent(new Event('popstate'));
}

export { navigate };
