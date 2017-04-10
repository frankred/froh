// eventemitter
(function () {
    "use strict";
    function t() {
    }

    function i(t, n) {
        for (var e = t.length; e--;)if (t[e].listener === n)return e;
        return -1
    }

    function n(e) {
        return function () {
            return this[e].apply(this, arguments)
        }
    }

    var e = t.prototype, r = this, s = r.EventEmitter;
    e.getListeners = function (n) {
        var r, e, t = this._getEvents();
        if (n instanceof RegExp) {
            r = {};
            for (e in t)t.hasOwnProperty(e) && n.test(e) && (r[e] = t[e])
        } else r = t[n] || (t[n] = []);
        return r
    }, e.flattenListeners = function (t) {
        var e, n = [];
        for (e = 0; e < t.length; e += 1)n.push(t[e].listener);
        return n
    }, e.getListenersAsObject = function (n) {
        var e, t = this.getListeners(n);
        return t instanceof Array && (e = {}, e[n] = t), e || t
    }, e.addListener = function (r, e) {
        var t, n = this.getListenersAsObject(r), s = "object" == typeof e;
        for (t in n)n.hasOwnProperty(t) && -1 === i(n[t], e) && n[t].push(s ? e : {listener: e, once: !1});
        return this
    }, e.on = n("addListener"), e.addOnceListener = function (e, t) {
        return this.addListener(e, {listener: t, once: !0})
    }, e.once = n("addOnceListener"), e.defineEvent = function (e) {
        return this.getListeners(e), this
    }, e.defineEvents = function (t) {
        for (var e = 0; e < t.length; e += 1)this.defineEvent(t[e]);
        return this
    }, e.removeListener = function (r, s) {
        var n, e, t = this.getListenersAsObject(r);
        for (e in t)t.hasOwnProperty(e) && (n = i(t[e], s), -1 !== n && t[e].splice(n, 1));
        return this
    }, e.off = n("removeListener"), e.addListeners = function (e, t) {
        return this.manipulateListeners(!1, e, t)
    }, e.removeListeners = function (e, t) {
        return this.manipulateListeners(!0, e, t)
    }, e.manipulateListeners = function (r, t, i) {
        var e, n, s = r ? this.removeListener : this.addListener, o = r ? this.removeListeners : this.addListeners;
        if ("object" != typeof t || t instanceof RegExp)for (e = i.length; e--;)s.call(this, t, i[e]); else for (e in t)t.hasOwnProperty(e) && (n = t[e]) && ("function" == typeof n ? s.call(this, e, n) : o.call(this, e, n));
        return this
    }, e.removeEvent = function (e) {
        var t, r = typeof e, n = this._getEvents();
        if ("string" === r)delete n[e]; else if (e instanceof RegExp)for (t in n)n.hasOwnProperty(t) && e.test(t) && delete n[t]; else delete this._events;
        return this
    }, e.removeAllListeners = n("removeEvent"), e.emitEvent = function (n, u) {
        var r, e, t, i, o, s = this.getListenersAsObject(n);
        for (i in s)if (s.hasOwnProperty(i))for (r = s[i].slice(0), t = 0; t < r.length; t++)e = r[t], e.once === !0 && this.removeListener(n, e.listener), o = e.listener.apply(this, u || []), o === this._getOnceReturnValue() && this.removeListener(n, e.listener);
        return this
    }, e.trigger = n("emitEvent"), e.emit = function (e) {
        var t = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(e, t)
    }, e.setOnceReturnValue = function (e) {
        return this._onceReturnValue = e, this
    }, e._getOnceReturnValue = function () {
        return this.hasOwnProperty("_onceReturnValue") ? this._onceReturnValue : !0
    }, e._getEvents = function () {
        return this._events || (this._events = {})
    }, t.noConflict = function () {
        return r.EventEmitter = s, t
    }, "function" == typeof define && define.amd ? define(function () {
        return t
    }) : "object" == typeof module && module.exports ? module.exports = t : r.EventEmitter = t
}).call(this);


class FrohComponent {

    constructor(selectorAttribute) {
        if (typeof selectorAttribute !== "string" || selectorAttribute.charAt(0) !== '<' || selectorAttribute.charAt(selectorAttribute.length - 1) !== '>') {
            throw new Error("Invalid html tag selector. Correct would be e.g.: '<myelement>'");
        }
        this.selectorAttribute = selectorAttribute.replace(/</g, '').replace(/>/g, '').replace(/\//g, '');
        this.renderCounter = 0;
    }

    render() {
        var nodes = document.querySelectorAll(this.selectorAttribute);
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].innerHTML = this.html();
        }
        this.renderCounter++;
    }
}

class Storage {
    constructor() {
        this._storage = Object.create(null);
        this._eventemitter = new EventEmitter();
    }

    get(key) {
        return this._storage[key];
    }

    exists(keyWithOrWithoutChilds) {
        var paths = keyWithOrWithoutChilds.split('.');

        if (this._storage[paths[0]] === undefined || this._storage[paths[0]] === null) {
            return false;
        }

        var currentObj = this._storage[paths[0]];

        for (let i = 1; i < paths.length; ++i) {
            if (currentObj[paths[i]] === undefined || currentObj[paths[i]] === null) {
                return false;
            }

            currentObj = currentObj[paths[i]];
        }

        return true;
    }

    set(key, obj) {
        var self = this;

        if (key === undefined || key === null || key === "") return;

        if (typeof obj === 'string' || typeof obj === 'number') {
            this._storage[key] = obj;
            this._eventemitter.emitEvent(key);
            return;
        }

        if (typeof obj !== 'object') {
            throw new Error("Invalid object type passed. Only string, number and object is allowed!");
        }

        var proxyObj = new Proxy(obj, {
            set(target, attr, value){
                target[attr] = value;
                self._eventemitter.emitEvent(key);
                return true;
            }
        });

        this.iterateObj(key, obj);

        this._storage[key] = proxyObj;
        this._eventemitter.emitEvent(key);
    }

    iterateObj(parentKey, obj) {
        var self = this;

        Object.keys(obj).map((key) => {
            if (typeof obj[key] === 'object') {

                var proxObj = new Proxy(obj[key], {
                    set(target, attr, value){
                        target[attr] = value;
                        self._eventemitter.emitEvent(parentKey);
                        return true;
                    }
                });
                obj[key] = proxObj;

                this.iterateObj(parentKey, obj[key]);
            }
        })
    }

    del(key) {
        delete this._storage[key];
        this._eventemitter.emitEvent(key);
        this._eventemitter.removeListener(key);
    }

    on(keyStringOrRegexp, cb) {
        this._eventemitter.on(keyStringOrRegexp, cb);
        cb();
    }
}

class FrohClass {
    constructor(name) {
        this.storage = new Storage();
        this.http = function (method, header, body, url, cb) {

            var http = new XMLHttpRequest();
            http.open(method.toUpperCase(), url, true);

            if (header) {
                Object.keys(header).map(function (name) {
                    http.setRequestHeader(name, header[name]);
                });
            }

            http.addEventListener('load', function (evt) {
                if (http.readyState === 4) {
                    cb(null, http.status, http.responseText);
                }
            });

            http.addEventListener('error', function (evt) {
                cb(new Error('HttpRequestError'));
            });

            if (body && typeof body === "string") {
                http.send(body);
                return;
            }

            if (body && typeof body === "object") {
                http.send(JSON.stringify(body));
            }

            http.send(null);
        };
    }

    ready(cb) {
        document.addEventListener('DOMContentLoaded', cb);
    }

    get(key) {
        return this.storage.get(key);
    }

    set(key, obj) {
        this.storage.set(key, obj);
    }

    on(keyStringOrRegexp, cb) {
        this.storage.on(keyStringOrRegexp, cb);
    }

    is(keyWithOrWithoutChilds) {
        return this.storage.exists(keyWithOrWithoutChilds);
    }
}

var Froh = new FrohClass();