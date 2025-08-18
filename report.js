const safeFunctionToString = target => {
    try {
        const toString = Function.prototype.toString;

        function __probe__(a, b) { }

        const s = toString.call(__probe__);

        if (/\[native code\]/.test(s) || s.indexOf(__probe__.name) === -1) {
            return null;
        }

        return toString.call(target);
    } catch {
        return null;
    }
}

const safeObjectToString = target => {
    try {
        const toString = Object.prototype.toString;
        const tag = toString.call({});

        if (tag !== '[object Object]') {
            return null;
        }

        return toString.call(target);
    } catch {
        return null;
    }
}

const safeHasOwnProperty = (target, propertyKey) => {
    try {
        const hasOwnProperty = Object.prototype.hasOwnProperty;

        if (!hasOwnProperty.call({ x: 1 }, 'x')) {
            return null;
        }

        return hasOwnProperty.call(target, propertyKey);
    } catch {
        return null;
    }
}

const runAutomationChecks = () => {
    try {
        const results = {};

        function record(name, value) {
            results[name] = value;
            return value;
        }

        const target = console && console.table;

        record("consoleTable_present", Boolean(target));
        record("consoleTable_isFunction", typeof target === 'function');
        record("consoleTable_hasOwn_toString_prop", safeHasOwnProperty(target, 'toString'));

        let fnStr = null;

        if (typeof target === 'function') {
            fnStr = safeFunctionToString(target);
        }

        record("consoleTable_toString_safe", fnStr);
        record("consoleTable_toString_looksNative", typeof fnStr === 'string' && /\{\s*\[native code\]\s*\}/.test(fnStr));

        let objTag = null;

        if (typeof target === 'function') {
            objTag = safeObjectToString(target);
        }

        record("consoleTable_objectTag", objTag);
        record("consoleTable_objectTag_isFunction", objTag === "[object Function]");
        record("consoleTable_name_isTable", typeof target === 'function' && target.name === "table");

        let desc = null;

        try {
            desc = console && Object.getOwnPropertyDescriptor(console, "table");
        } catch { }

        record("consoleTable_descriptor_exists", Boolean(desc));
        record("consoleTable_descriptor_value_isFunction", !!(desc && typeof desc.value === "function"));
        record("consoleTable_descriptor_configurable", !!(desc && desc.configurable));
        record("consoleTable_descriptor_enumerable", !!(desc && desc.enumerable));
        record("consoleTable_descriptor_writable", !!(desc && desc.writable));

        let protoIsFnProto = null;

        try {
            protoIsFnProto = typeof target === "function" && Object.getPrototypeOf(target) === Function.prototype;
        } catch { }

        record("consoleTable_proto_isFunctionPrototype", protoIsFnProto);

        let perfMs = null;
        let perfExceeded = null;

        try {
            if (typeof target === "function") {
                const data = Array.from({ length: 50 }, () => Object.fromEntries(Array.from({ length: 500 }, (_, i) => [String(i), String(i)])));
                const now = Date.now();
                console.table(data);

                if (typeof console.clear === "function") {
                    console.clear();
                }

                perfMs = Date.now() - now;
                perfExceeded = perfMs > 10;
            }
        } catch {
            perfMs = -1;
            perfExceeded = true;
        }

        record("consoleTable_perf_ms", perfMs);
        record("consoleTable_perf_exceedsThreshold", perfExceeded);

        return {
            timestamp: new Date().toISOString(),
            environment: {
                ua: (typeof navigator !== "undefined" && navigator.userAgent) || null,
                platform: (typeof navigator !== "undefined" && navigator.platform) || null,
            },
            results
        };
    } catch (e) {
        return {
            timestamp: new Date().toISOString(),
            error: "runAutomationChecks failed",
            message: String(e?.message || e),
        };
    }
}

const r = runAutomationChecks();

console.log(r);
alert(JSON.stringify(r));
