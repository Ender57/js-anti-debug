function runAntiDebugSuite() {
    // A faithful, explicit reconstruction of the many scattered anti-debug/env checks
    // from the original, expressed clearly but without removing any categories of checks.
    // If ANY check fires, `flags.tripped` becomes true. We also expose fine‑grained bits.
    const flags = {
        tripped: false,
        timingPause: false,
        devtoolsGetter: false,
        devtoolsDimension: false,
        debuggerKeyword: false,
        nativeToStringMismatch: false,
        consoleFormattingTouch: false,
        perfNowJump: false,
        intervalSkew: false,
        functionCtorBlocked: false,
        userAgentProbe: false,
        webdriver: false,
        headless: false,
        languagesMissing: false,
        pluginsEmpty: false,
        webglUnmasked: false,
        permissionsError: false,
        breakpointsDetected: false,
        sourceProxyTouched: false,
    };

    const mark = (k) => { flags[k] = true; flags.tripped = true; };

    // 1) TIMING TRAPS (Date & performance)
    let lastDateNow = Date.now();
    let lastPerfNow = (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0;
    const timingTick = () => {
        const n1 = Date.now();
        if (n1 - lastDateNow > 1500) mark('timingPause');
        lastDateNow = n1;

        if (typeof performance !== 'undefined' && performance.now) {
            const n2 = performance.now();
            if (n2 - lastPerfNow > 1500) mark('perfNowJump');
            lastPerfNow = n2;
        }
    };
    timingTick();

    // 2) setInterval skew detector (like the obfuscated repeated loops)
    try {
        const t0 = Date.now();
        const id = setInterval(() => {
            const dt = Date.now() - t0;
            if (dt > 3000) mark('intervalSkew');
            clearInterval(id);
        }, 1000);
    } catch { }

    // 3) DEVTOOLS via getter side‑effect (console formatting path)
    try {
        const re = /./;
        Object.defineProperty(re, 'toString', {
            get() {
                // When the console tries to format the RegExp, this getter is touched
                mark('devtoolsGetter');
                return () => '/./';
            },
            configurable: true
        });
        // Nudge stringification path
        void re + '';
    } catch { }

    // 4) DEVTOOLS via window dimensions (common heuristic)
    try {
        // Heuristic: if devtools docks reduce viewport height significantly
        if (typeof window !== 'undefined') {
            const th = window.outerHeight - window.innerHeight;
            if (th > 160) mark('devtoolsDimension');
        }
    } catch { }

    // 5) BREAKPOINT detection by evaluating `debugger` in a measured region
    try {
        const start = Date.now();
        // eslint-disable-next-line no-debugger
        debugger;
        const dt = Date.now() - start;
        if (dt > 200) mark('breakpointsDetected');
    } catch { }

    // 6) NATIVE CODE STRING CHECKS (similar to original toString/k4n checks)
    const looksNative = (fn) => /\[native code\]/.test(Function.prototype.toString.call(fn));
    try {
        const probes = [Array.prototype.push, Array.prototype.sort, String.prototype.split, RegExp.prototype.test, Date, Math.random];
        for (const p of probes) {
            if (typeof p === 'function' && !looksNative(p)) {
                mark('nativeToStringMismatch');
                break;
            }
        }
    } catch { }

    // 7) Function constructor trap (blocked by some CSP/VMs)
    try {
        // eslint-disable-next-line no-new-func
        const fn = new Function('return 42');
        if (fn() !== 42) mark('functionCtorBlocked');
    } catch { mark('functionCtorBlocked'); }

    // 8) User‑agent / webdriver / headless fingerprints
    try {
        if (typeof navigator !== 'undefined') {
            const ua = navigator.userAgent || '';
            if (/HeadlessChrome|PhantomJS|Electron/i.test(ua)) mark('headless');
            if ('webdriver' in navigator && navigator.webdriver) mark('webdriver');
            if (!navigator.languages || navigator.languages.length === 0) mark('languagesMissing');
            if (navigator.plugins && navigator.plugins.length === 0) mark('pluginsEmpty');
        } else {
            mark('userAgentProbe');
        }
    } catch { mark('userAgentProbe'); }

    // 9) WebGL unmasked renderer/vendor (anti‑VM hints)
    try {
        const canvas = document && document.createElement && document.createElement('canvas');
        const gl = canvas && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        if (gl) {
            const dbg = gl.getExtension('WEBGL_debug_renderer_info');
            if (dbg) {
                const vendor = gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) || '';
                const renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '';
                if (/SwiftShader|VirtualBox|VMware|llvmpipe/i.test(vendor + ' ' + renderer)) mark('webglUnmasked');
            }
        }
    } catch { }

    // 10) Permissions API access (can throw in hardened contexts)
    try {
        if (navigator && navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'notifications' }).catch(() => mark('permissionsError'));
        }
    } catch { mark('permissionsError'); }

    // 11) Source proxy touch (akin to defineProperty trick the original used)
    try {
        const sentinel = {};
        Object.defineProperty(sentinel, 'x', {
            get() { mark('sourceProxyTouched'); return 1; }
        });
        // Some consoles/devtools touch getters when logging objects
        // eslint-disable-next-line no-console
        console.log('%c', sentinel);
    } catch { }

    // Run a couple of timing ticks immediately to simulate the original repeated loops
    timingTick();
    timingTick();

    return flags;
}

window.addEventListener("DOMContentLoaded", () => {
  console.log(runAntiDebugSuite());
  console.log(Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState').get.call(document));
const data = Array.from({ length: 50 },() => Object.fromEntries(Array.from({ length: 500 }, (_, i) => [String(i), String(i)])));
const now = Date.now();
console.table(data);
console.log(Date.now() - now);
});
