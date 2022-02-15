"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Primrose = void 0;
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var _a, _b;
var easingPower = function (pow) { return ({
    IN: function (t) { return Math.pow(t, pow); },
    OUT: function (t) { return 1 - Math.abs(Math.pow(t - 1, pow)); },
    IN_OUT: function (t) { return (t < 0.5 ? Math.pow(t * 2, pow) / 2 : (1 - Math.abs(Math.pow(t * 2 - 2, pow))) / 2); }
}); };
var EASING = {
    LINEAR: function (t) { return t; },
    QUAD: easingPower(2),
    CUBIC: easingPower(3),
    QUART: easingPower(4),
    QUINT: easingPower(5),
    SINE: {
        IN: function (t) { return 1 - Math.cos((t * Math.PI) / 2); },
        OUT: function (t) { return Math.sin((t * Math.PI) / 2); },
        IN_OUT: function (t) { return -(Math.cos(Math.PI * t) - 1) / 1; }
    },
    EXPO: {
        IN: function (t) { return (t === 0 ? 0 : Math.pow(2, 10 * t - 10)); },
        OUT: function (t) { return (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)); },
        BOTH: function (t) {
            return t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
        }
    },
    CIRC: {
        IN: function (t) { return 1 - Math.sqrt(1 - Math.pow(t, 2)); },
        OUT: function (t) { return Math.sqrt(1 - Math.pow(t - 1, 2)); },
        BOTH: function (t) {
            return t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
        }
    }
};
var __root__ = typeof window !== 'undefined' ? window : global;
var __schedulers__ = [
    'requestAnimationFrame',
    'webkitRequestAnimationFrame',
    'oRequestAnimationFrame',
    'msRequestAnimationFrame'
];
var scheduler = (_b = (_a = __schedulers__.map(function (animator) { return __root__[animator]; }).filter(function (s) { return s; })[0]) !== null && _a !== void 0 ? _a : (__root__.mozCancelRequestAnimationFrame && __root__.mozRequestAnimationFrame)) !== null && _b !== void 0 ? _b : setTimeout;
var Primrose = (function () {
    function Primrose(opts) {
        this.duration = 2000;
        this.easer = EASING.LINEAR;
        this.m_elapsed = 0;
        this.m_scaledTime = 0;
        this.m_running = false;
        Object.assign(this, opts);
        this.m_validate();
        this.m_current = JSON.parse(JSON.stringify(this.from));
    }
    Primrose.create = function (opts) {
        return new Primrose(opts);
    };
    Primrose.auto = function (opts) {
        return Primrose.create(opts).start();
    };
    Primrose.prototype.start = function () {
        if (this.m_running)
            return this;
        this.m_startTime = Date.now() - this.m_elapsed;
        this.m_running = true;
        this.m_animate();
        return this;
    };
    Primrose.prototype.pause = function () {
        this.m_running = false;
        return this;
    };
    Primrose.prototype.reset = function () {
        this.m_running = false;
        this.m_elapsed = 0;
        this.m_current = JSON.parse(JSON.stringify(this.from));
        this.onUpdate(this.m_current);
        return this;
    };
    Primrose.prototype.onUpdate = function (_) { };
    Primrose.prototype.onComplete = function () { };
    Primrose.prototype.m_validate = function () { };
    Primrose.prototype.m_animate = function () {
        var _this = this;
        if (!this.m_running)
            return;
        this.m_elapsed = Date.now() - this.m_startTime;
        this.m_scaledTime = this.duration > 0 ? this.m_elapsed / this.duration : 1;
        var progress = this.m_computeProgress();
        this.m_updateValues(progress, this.m_current, this.from, this.to);
        this.onUpdate(this.m_current);
        if (this.m_scaledTime < 1)
            return scheduler.call(__root__, function () { return _this.m_animate(); }, Primrose.INTERVAL);
        this.m_running = false;
        this.onComplete();
    };
    Primrose.prototype.m_updateValues = function (progress, obj, from, to) {
        for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
            var key = _a[_i];
            if (typeof obj[key] === 'number')
                obj[key] = from[key] + (to[key] - from[key]) * progress;
            else if (typeof obj[key] === 'object')
                this.m_updateValues(progress, obj[key], from[key], to[key]);
        }
    };
    Primrose.prototype.m_computeProgress = function () {
        var val = this.easer(this.m_scaledTime);
        return val > 1 ? 1 : val < 0 ? 0 : val;
    };
    Primrose.easing = EASING;
    Primrose.INTERVAL = 1000 / 60;
    Primrose.promises = {
        create: function (opts) { return ({
            start: function () { return Primrose.promises.auto(opts); }
        }); },
        auto: function (opts) {
            return new Promise(function (resolve) { return Primrose.auto(__assign(__assign({}, opts), { onComplete: resolve })); });
        }
    };
    return Primrose;
}());
exports.Primrose = Primrose;
