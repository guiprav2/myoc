function createCommonjsModule(fn, basedir, module) {
  return module = {
    path: basedir,
    exports: {},
    require: function(path, base) {
      return commonjsRequire(path, base === void 0 || base === null ? module.path : base);
    }
  }, fn(module, module.exports), module.exports;
}
function commonjsRequire() {
  throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs");
}
var core = createCommonjsModule(function(module, exports) {
  var boundNodes = [];
  var ieNodes = navigator.userAgent.indexOf("Trident") ? [] : null;
  var classTypeRegExp = /^class\s/;
  var ariaRegExp = /^aria-/;
  var svgNsRegExp = /\/svg$/;
  var wsRegExp = / |\r|\n/;
  var onAttachRegExp = /^on:?attach$/i;
  var onDetachRegExp = /^on:?detach$/i;
  function nullish(x) {
    return x === void 0 || x === null;
  }
  function normalizeClasses(x) {
    if (!Array.isArray(x)) {
      x = [x];
    }
    return flatMap(x, function(y) {
      return y && typeof y !== "boolean" && typeof y !== "number" && String(y).split(wsRegExp);
    }).filter(Boolean);
  }
  function appendableNode(x) {
    if (x instanceof Node) {
      return x;
    }
    if (typeof x === "boolean" || !x && typeof x !== "number") {
      return null;
    }
    return document.createTextNode(x);
  }
  function removeWithAnchoredNodes(n) {
    var i;
    if (n.anchoredNodes) {
      for (i = 0; i < n.anchoredNodes.length; i++) {
        removeWithAnchoredNodes(n.anchoredNodes[i]);
      }
    }
    n.parentNode && n.parentNode.removeChild(n);
  }
  function insertBeforeWithAnchoredNodes(parentEl, n, n2) {
    if (Array.isArray(n)) {
      n.forEach(function(n3) {
        insertBeforeWithAnchoredNodes(parentEl, n3, n2);
      });
      return;
    }
    parentEl.insertBefore(n, n2);
    if (n.anchoredNodes) {
      insertBeforeWithAnchoredNodes(parentEl, n.anchoredNodes, n2);
    }
  }
  function Binding(x) {
    if (typeof x === "object" && !Array.isArray(x)) {
      objAssign(this, x);
    } else {
      this.get = x;
    }
  }
  Binding.prototype.update = function() {
    var newValue = this.get();
    if (newValue === this.lastValue) {
      return;
    }
    var el = this.target;
    if (ariaRegExp.test(this.key) || svgNsRegExp.test(el.namespaceURI)) {
      if (!nullish(newValue)) {
        el.setAttribute(this.key, newValue);
      } else {
        el.removeAttribute(this.key);
      }
    } else {
      el[this.key] = newValue;
    }
    this.lastValue = newValue;
  };
  Binding.specialUpdateFnsByKey = {
    class: function classBindingUpdate() {
      var i, x, el = this.target, newValue = Array.isArray(this.get) ? flatMap(this.get, function(x2) {
        return x2();
      }) : this.get();
      newValue = normalizeClasses(newValue);
      this.lastValue = this.lastValue || [];
      for (i = 0; i < this.lastValue.length; i++) {
        x = this.lastValue[i];
        if (newValue.indexOf(x) === -1) {
          el.classList.remove(x);
        }
      }
      for (i = 0; i < newValue.length; i++) {
        x = newValue[i];
        if (this.lastValue.indexOf(x) === -1) {
          el.classList.add(x);
        }
      }
      this.lastValue = newValue;
    },
    style: function styleBindingUpdate() {
      var newValue = this.get();
      if (newValue === this.lastValue) {
        return;
      }
      this.target.style[this.subkey] = !nullish(newValue) ? newValue : "";
      this.lastValue = newValue;
    },
    checked: function checkedBindingUpdate() {
      var self = this, newValue;
      if (!self.setHandler) {
        self.target.addEventListener("change", self.setHandler = function(ev) {
          var x = ev.target.checked;
          self.lastValue = self.set ? self.set(x) : x;
          self.set && updateSync();
        });
      }
      if (self.get) {
        newValue = Boolean(self.get());
        if (newValue === self.lastValue) {
          return;
        }
        self.lastValue = self.target.checked = newValue;
      }
    },
    value: function valueBindingUpdate() {
      var self = this, newValue;
      if (!self.setHandler) {
        self.target.addEventListener("input", self.setHandler = function(ev) {
          var x = ev.target.value;
          self.lastValue = self.set ? self.set(x) : x;
          self.set && updateSync();
        });
      }
      if (self.get) {
        newValue = self.get();
        if (nullish(newValue) || typeof newValue === "boolean") {
          newValue = "";
        } else {
          newValue = String(newValue);
        }
        if (newValue === self.lastValue) {
          return;
        }
        self.lastValue = self.target.value = newValue;
      }
    }
  };
  function createBinding(x) {
    return new Binding(x);
  }
  function bindToNode(n, key, subkey, binding) {
    var bindingUpdateFn = Binding.specialUpdateFnsByKey[key];
    objAssign(binding, {target: n, key, subkey});
    if (bindingUpdateFn) {
      binding.update = bindingUpdateFn;
    }
    (n.bindings = n.bindings || []).push(binding);
  }
  function JsxFragment(props) {
    return props.children || [];
  }
  function createElement(type) {
    var el, evName, getters, i, k, k2, v, v2, rest = [].slice.call(arguments, 1);
    var props = nullish(rest[0]) || rest[0] && rest[0].constructor === Object ? rest.shift() : null;
    props = props || {};
    if (props.children && rest.length) {
      throw new Error("Ambiguous children parameters");
    }
    var children = flat(props.children ? arrayify(props.children) : rest, 10);
    if (typeof type === "function") {
      props = objAssign({}, props);
      props.children = children;
      for (k in props) {
        v = props[k];
        if (!(v instanceof Binding)) {
          continue;
        }
        (function(k3, v3) {
          Object.defineProperty(props, k3, {
            enumerable: true,
            get: v3.get,
            set: v3.set || function() {
              throw new TypeError("Missing setter for " + k3 + " binding");
            }
          });
        })(k, v);
      }
      if (type.prototype && (typeof type.prototype.render === "function" || classTypeRegExp.test(type.toString()))) {
        return new type(props).render();
      }
      return type(props);
    }
    if (type instanceof Node) {
      el = type;
    } else {
      el = type.indexOf("svg:") !== 0 ? document.createElement(type) : document.createElementNS("http://www.w3.org/2000/svg", type.split(":")[1]);
    }
    for (k in props) {
      if (!props.hasOwnProperty(k) || k === "children") {
        continue;
      }
      v = props[k];
      if (k.indexOf("on") === 0 && v) {
        evName = k.replace(/^on:?/, "").toLowerCase();
        if (v instanceof Binding) {
          v = v.get();
        }
        if (evName === "attach" || evName === "detach") {
          bindToNode(el, k, null, createBinding({update: null, handler: v}));
          continue;
        }
        el.addEventListener(evName, function(v3, ev) {
          var ret = v3(ev);
          updateSync();
          if (ret && typeof ret.then === "function") {
            ret.then(function() {
              updateSync();
            });
          }
        }.bind(null, v));
        continue;
      }
      if (v instanceof Function) {
        v = new Binding(v);
      }
      if (v instanceof Binding) {
        bindToNode(el, k, null, v);
        continue;
      }
      if (k === "class") {
        if (Array.isArray(v)) {
          getters = [];
          for (i = 0; i < v.length; i++) {
            v2 = v[i];
            if (typeof v2 === "function") {
              getters.push(v2);
              continue;
            }
            if (v2 instanceof Binding) {
              bindToNode(el, k, null, v2);
              continue;
            }
            normalizeClasses(v2).forEach(function(x) {
              el.classList.add(x);
            });
          }
          if (getters.length) {
            bindToNode(el, k, null, new Binding(getters));
          }
          continue;
        }
        normalizeClasses(v).forEach(function(x) {
          el.classList.add(x);
        });
        continue;
      }
      if (k === "style") {
        if (typeof v === "object") {
          for (k2 in v) {
            if (!v.hasOwnProperty(k2)) {
              continue;
            }
            v2 = v[k2];
            if (v2 instanceof Function) {
              v2 = new Binding(v2);
            }
            if (v2 instanceof Binding) {
              bindToNode(el, "style", k2, v2);
              continue;
            }
            el.style[k2] = v2;
          }
          continue;
        }
        el.style = v;
        continue;
      }
      if (ariaRegExp.test(k) || svgNsRegExp.test(el.namespaceURI)) {
        if (!nullish(v)) {
          el.setAttribute(k, v);
        } else {
          el.removeAttribute(k);
        }
      }
      el[k] = v;
    }
    for (i = 0; i < children.length; i++) {
      v = appendableNode(children[i]);
      v && el.appendChild(v);
    }
    return el;
  }
  function createComment(text) {
    return document.createComment(!nullish(text) ? " " + text + " " : " ");
  }
  function createBoundComment(text, bindingProps) {
    var c = createComment(text);
    c.bindings = [new Binding(objAssign(bindingProps, {target: c}))];
    ieNodes && ieNodes.push(c);
    return c;
  }
  function createIfAnchor(predFn, thenNodes, elseNodes) {
    return createBoundComment("if anchor", {
      get: predFn,
      thenNodes,
      elseNodes,
      update: ifAnchorBindingUpdate
    });
  }
  function ifAnchorBindingUpdate() {
    var i, n;
    var nAnchor = this.target, parentEl = nAnchor.parentNode;
    var newValue = Boolean(this.get()), nNew, nTail;
    if (newValue === this.lastValue) {
      if (nAnchor.anchoredNodes && nAnchor.anchoredNodes.length && nAnchor.anchoredNodes[0].parentNode !== parentEl) {
        insertBeforeWithAnchoredNodes(parentEl, nAnchor.anchoredNodes, nAnchor.nextSibling);
      }
      return;
    }
    if (nAnchor.anchoredNodes && nAnchor.anchoredNodes.length) {
      for (i = 0; i < nAnchor.anchoredNodes.length; i++) {
        removeWithAnchoredNodes(nAnchor.anchoredNodes[i]);
      }
    }
    if (!nAnchor.anchoredNodes || nAnchor.anchoredNodes.length) {
      nAnchor.anchoredNodes = [];
    }
    nNew = newValue ? this.thenNodes : this.elseNodes;
    if (nNew) {
      nTail = nAnchor.nextSibling;
      nNew = Array.isArray(nNew) ? nNew : [nNew];
      for (i = 0; i < nNew.length; i++) {
        n = appendableNode(nNew[i]);
        if (!n) {
          continue;
        }
        insertBeforeWithAnchoredNodes(parentEl, n, nTail);
        nAnchor.anchoredNodes.push(n);
      }
    }
    this.lastValue = newValue;
  }
  function createMapAnchor(getFn) {
    var sep = arguments.length === 3 && arguments[1];
    var mapFn = arguments.length === 2 ? arguments[1] : arguments[2];
    return createBoundComment("map anchor", {
      get: getFn,
      map: mapFn,
      nSep: sep && appendableNode(sep),
      nSepPool: [],
      update: mapAnchorBindingUpdate
    });
  }
  function Cursor() {
  }
  Cursor.prototype.toString = function() {
    return String(this.index);
  };
  Cursor.prototype.valueOf = function() {
    return this.index;
  };
  function mapAnchorBindingUpdate() {
    var self = this, i, j, n, meta, nFirst, nSep;
    var nAnchor = self.target, nTail, parentEl = nAnchor.parentNode, updatedNodes;
    var newArray = [].slice.call(self.get() || []), dirty = false;
    self.lastArray = self.lastArray || [];
    self.lastNodes = self.lastNodes || [];
    self.valueMap = self.valueMap || new Map();
    if (nAnchor.anchoredNodes && nAnchor.anchoredNodes.length && nAnchor.anchoredNodes[0].parentNode !== parentEl) {
      insertBeforeWithAnchoredNodes(parentEl, nAnchor.anchoredNodes, nAnchor.nextSibling);
    }
    for (i = 0; i < Math.max(self.lastArray.length, newArray.length); i++) {
      if (self.lastArray[i] !== newArray[i]) {
        dirty = true;
        break;
      }
    }
    if (!dirty) {
      return;
    }
    (nAnchor.anchoredNodes || []).forEach(function(n2) {
      removeWithAnchoredNodes(n2);
    });
    nTail = nAnchor.nextSibling;
    self.valueMap = new Map();
    updatedNodes = newArray.map(function(x, i2) {
      meta = self.valueMap.get(x) || {};
      objAssign(meta.cursor = meta.cursor || new Cursor(), {index: i2});
      n = meta.n;
      if (!n) {
        n = meta.n = self.map(x, meta.cursor);
        n = meta.n = !Array.isArray(n) ? appendableNode(n) : n.map(appendableNode).filter(Boolean);
      }
      insertBeforeWithAnchoredNodes(parentEl, n, nTail);
      self.valueMap.set(x, meta);
      return n;
    });
    self.lastArray = newArray;
    self.lastNodes = updatedNodes;
    nAnchor.anchoredNodes = [].slice.call(updatedNodes);
    if (self.nSep) {
      for (i = 1, j = 0; i < updatedNodes.length; i++) {
        nSep = self.nSepPool[i - 1];
        if (!nSep) {
          nSep = self.nSep.cloneNode(true);
          self.nSepPool.push(nSep);
        }
        n = updatedNodes[i];
        nFirst = Array.isArray(n) ? n[0] : n;
        if (nFirst && nSep.nextSibling !== nFirst) {
          parentEl.insertBefore(nSep, nFirst);
          nAnchor.anchoredNodes.splice(i + j++, 0, nSep);
        }
      }
      for (; i < self.nSepPool.length; i++) {
        nSep = self.nSepPool[i];
        parentEl.removeChild(nSep);
      }
      self.nSepPool.length = Math.max(0, updatedNodes.length - 1);
    }
    nAnchor.anchoredNodes = flat(nAnchor.anchoredNodes, 10);
  }
  function createTextNode(getFn) {
    var n = document.createTextNode("");
    n.bindings = [new Binding({
      get: getFn,
      update: textNodeBindingUpdate,
      target: n
    })];
    ieNodes && ieNodes.push(n);
    return n;
  }
  function textNodeBindingUpdate() {
    var newValue = this.get();
    if (nullish(newValue) || typeof newValue === "boolean") {
      newValue = "";
    } else {
      newValue = String(newValue);
    }
    if (newValue === this.lastValue) {
      return;
    }
    this.lastValue = this.target.textContent = newValue;
  }
  function createPortalNode(getFn) {
    return createBoundComment("portal anchor", {
      get: getFn,
      update: portalAnchorBindingUpdate
    });
  }
  function portalAnchorBindingUpdate() {
    var newValue = this.get();
    if (newValue === this.lastValue) {
      return;
    }
    this.lastValue && removeWithAnchoredNodes(this.lastValue);
    newValue && this.target.parentNode.insertBefore(newValue, this.target.nextSibling);
    this.lastValue = newValue;
  }
  function fromContext(n, k) {
    while (n) {
      if (n.context && n.context[k]) {
        return n.context[k];
      }
      n = n.parentNode;
    }
  }
  function forEachNodeWithBindings(ns, cb) {
    var queue = [].slice.call(ns), n;
    while (queue.length) {
      n = queue.shift();
      n.bindings && cb(n);
      if (n.childNodes) {
        [].unshift.apply(queue, n.childNodes);
      }
    }
  }
  function processMutations(muts, observer2, di) {
    di = di || {};
    di.boundNodes = di.boundNodes || boundNodes;
    di.updateSync = di.updateSync || updateSync;
    di.console = di.console || console;
    var i, j, mut, n, b;
    var newNodes = [], orphanedNodes = [];
    for (i = 0; i < muts.length; i++) {
      mut = muts[i];
      for (j = 0; j < mut.addedNodes.length; j++) {
        newNodes.push(mut.addedNodes[j]);
      }
    }
    for (i = 0; i < muts.length; i++) {
      mut = muts[i];
      for (j = 0; j < mut.removedNodes.length; j++) {
        n = mut.removedNodes[j];
        if (newNodes.indexOf(n) === -1) {
          orphanedNodes.push(n);
        }
      }
    }
    forEachNodeWithBindings(orphanedNodes, function(n2) {
      i = di.boundNodes.indexOf(n2);
      if (i === -1) {
        return;
      }
      di.boundNodes.splice(i, 1);
      for (i = 0; i < n2.bindings.length; i++) {
        b = n2.bindings[i];
        if (onDetachRegExp.test(b.key)) {
          try {
            b.handler(n2);
          } catch (e) {
            di.console.error(e);
          }
          break;
        }
      }
    });
    forEachNodeWithBindings(newNodes, function(n2) {
      if (di.boundNodes.indexOf(n2) !== -1) {
        return;
      }
      di.boundNodes.push(n2);
      for (i = 0; i < n2.bindings.length; i++) {
        b = n2.bindings[i];
        if (onAttachRegExp.test(b.key)) {
          try {
            b.handler(n2);
          } catch (e) {
            di.console.error(e);
          }
          break;
        }
      }
    });
    di.updateSync();
  }
  var observer = typeof MutationObserver !== "undefined" && new MutationObserver(processMutations);
  observer && observer.observe(document, {childList: true, subtree: true});
  function childMacro(fn) {
    try {
      var ret = fn();
      if (nullish(ret) || ret instanceof Node || Array.isArray(ret)) {
        return ret;
      }
    } catch (err) {
    }
    return createTextNode(fn);
  }
  function resolve(x) {
    return typeof x === "function" ? x() : x;
  }
  function update() {
    var p = window.Promise && new Promise(function(cb) {
      update.promiseCallbacks.push(cb);
    });
    if (update.frame) {
      return p;
    }
    update.frame = requestAnimationFrame(function() {
      var i;
      updateSync();
      update.frame = null;
      for (i = 0; i < update.promiseCallbacks.length; i++) {
        try {
          update.promiseCallbacks[i]();
        } catch (e) {
          console.error(e);
        }
      }
      update.promiseCallbacks.length = 0;
    });
    return p;
  }
  update.promiseCallbacks = [];
  function updateSync(di) {
    di = di || {};
    di.boundNodes = di.boundNodes || boundNodes;
    di.updateNode = di.updateNode || updateNode;
    di.evListeners = di.evListeners || evListeners;
    di.console = di.console || console;
    var i;
    for (i = 0; i < di.evListeners.beforeUpdate.length; i++) {
      try {
        di.evListeners.beforeUpdate[i]();
      } catch (e) {
        di.console.error(e);
      }
    }
    for (i = 0; i < di.boundNodes.length; i++) {
      di.updateNode(di.boundNodes[i], di);
    }
    for (i = 0; i < di.evListeners.update.length; i++) {
      try {
        di.evListeners.update[i]();
      } catch (e) {
        di.console.error(e);
      }
    }
  }
  function updateNode(n, di) {
    di = di || {};
    var i, b;
    if (!document.body || !document.body.contains(n.parentNode)) {
      return;
    }
    for (i = 0; i < n.bindings.length; i++) {
      b = n.bindings[i];
      try {
        b.update && b.update();
        if (b.error) {
          if (--b.error.count <= 0) {
            clearError(b.error);
          }
          b.error = null;
        }
      } catch (e) {
        handleBindingError(e, b, di);
      }
    }
  }
  var errors = {};
  function handleBindingError(e, binding, di) {
    di.console = di.console || console;
    var eDesc = e.toString();
    var eEntry = errors[eDesc] = errors[eDesc] || {
      firstInstance: e,
      count: 0,
      bindings: []
    };
    if (eEntry.bindings.indexOf(binding) === -1) {
      eEntry.bindings.push(binding);
    }
    binding.error = eEntry;
    if (++eEntry.count === 1) {
      di.console.error(e);
      di.console.error("in", binding);
    }
  }
  function clearError(e) {
    delete errors[e.toString()];
  }
  var evListeners = {beforeUpdate: [], update: []};
  function addEventListener(evName, fn) {
    evListeners[evName].push(fn);
  }
  function removeEventListener(evName, fn) {
    var i = evListeners[evName].indexOf(fn);
    if (i !== -1) {
      evListeners[evName].splice(i, 1);
    }
  }
  objAssign(exports, {
    Binding,
    binding: createBinding,
    JsxFragment,
    el: createElement,
    comment: createComment,
    child: childMacro,
    if: createIfAnchor,
    map: createMapAnchor,
    text: createTextNode,
    portal: createPortalNode,
    fromContext,
    processMutations,
    boundNodes,
    ieNodes,
    on: addEventListener,
    off: removeEventListener,
    evListeners,
    resolve,
    update,
    updateSync,
    updateNode,
    errors,
    handleBindingError,
    clearError
  });
  function arrayify(x) {
    return Array.isArray(x) ? x : [x];
  }
  function objAssign(a, b) {
    var k;
    for (k in b) {
      if (!b.hasOwnProperty(k)) {
        continue;
      }
      a[k] = b[k];
    }
    return a;
  }
  function flat(xs, d) {
    if (d === void 0) {
      d = 1;
    }
    if (xs.flat) {
      return xs.flat(d);
    }
    return xs.reduce(function(acc, x) {
      return acc.concat(Array.isArray(x) ? d > 0 ? flat(x, d - 1) : x : x);
    }, []);
  }
  function flatMap(xs, fn) {
    return xs.flatMap ? xs.flatMap(fn) : flat(xs.map(fn));
  }
});
export default core;
