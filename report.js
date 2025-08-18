const runAutomationChecks = () => {
    try {
        const results = {};

        function record(name, value) {
            results[name] = value;
            return value;
        }

        const target = console && console.table;

        record('present', Boolean(target));
        record('isFunction', typeof target === 'function');

        try {

        } catch (e) {
            record('hasOwnProperty_error', String(e?.message || e));
        }

        try {
            record('hasOwnProperty', [
                Object.prototype.hasOwnProperty({ x: 1 }, 'x'),
                Object.prototype.hasOwnProperty(target, 'toString')
            ]);
        } catch (e) {
            record('hasOwnProperty_error', String(e?.message || e));
        }

        try {
            function __probe__(a, b) { }

            record('functionToString', [
                Function.prototype.toString(__probe__),
                Function.prototype.toString(target)
            ]);
        } catch (e) {
            record('functionToString_error', String(e?.message || e));
        }

        try {
            function __probe__(a, b) { }

            record('objectToString', [
                Object.prototype.toString({}),
                Object.prototype.toString(target)
            ]);
        } catch (e) {
            record('objectToString_error', String(e?.message || e));
        }

        record('name', typeof target === 'function' && target.name === 'table');

        let desc = null;

        try {
            desc = console && Object.getOwnPropertyDescriptor(console, 'table');

            record('descriptor_exists', Boolean(desc));
            record('descriptor_value_isFunction', !!(desc && typeof desc.value === 'function'));
            record('descriptor_configurable', !!(desc && desc.configurable));
            record('descriptor_enumerable', !!(desc && desc.enumerable));
            record('descriptor_writable', !!(desc && desc.writable));
        } catch (e) {
            record('descriptor_error', String(e?.message || e));
        }

        try {
            record('prototype_isFunctionPrototype', typeof target === 'function' && Object.getPrototypeOf(target) === Function.prototype);
        } catch (e) {
            record('prototype_isFunctionPrototype_error', String(e?.message || e));
        }

        let perfMs = null;
        let perfExceeded = null;

        try {
            if (typeof target === 'function') {
                const data = Array.from({ length: 50 }, () => Object.fromEntries(Array.from({ length: 500 }, (_, i) => [String(i), String(i)])));
                const now = Date.now();
                console.table(data);

                if (typeof console.clear === 'function') {
                    console.clear();
                }

                perfMs = Date.now() - now;
                perfExceeded = perfMs > 10;
            }
        } catch (e) {
            record('table_error', String(e?.message || e));

            perfMs = -1;
            perfExceeded = true;
        }

        record('performanceMilliseconds', perfMs);
        record('performanceExceedsThreshold', perfExceeded);

        return {
            timestamp: new Date().toISOString(),
            environment: {
                ua: (typeof navigator !== 'undefined' && navigator.userAgent) || null,
                platform: (typeof navigator !== 'undefined' && navigator.platform) || null,
            },
            results
        };
    } catch (e) {
        return {
            timestamp: new Date().toISOString(),
            error: 'runAutomationChecks failed',
            message: String(e?.message || e),
        };
    }
}

const r = runAutomationChecks();

console.log(r);
alert(JSON.stringify(r));
