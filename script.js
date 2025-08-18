const safeFunctionToString = target => {
    try {
        const toString = Function.prototype.toString;

        function __probe__(a, b) { }

        const s = toString.call(__probe__);

        if (/\[native code\]/.test(s) || s.indexOf('__probe__') === -1) {
            alert('Function.prototype.toString overridden');
            return null;
        }

        return toString.call(target);
    } catch {
        alert('Function.prototype.toString broken');
        return null;
    }
}

const safeObjectToString = target => {
    try {
        const toString = Object.prototype.toString;
        const tag = toString.call({});

        if (tag !== '[object Object]') {
            alert('Object.prototype.toString overridden');
            return null;
        }

        return toString.call(target);
    } catch {
        alert('Object.prototype.toString broken');
        return null;
    }
}

const safeHasOwnProperty = (target, propertyKey) => {
    try {
        const hasOwnProperty = Object.prototype.hasOwnProperty;

        if (!hasOwnProperty.call({ x: 1 }, 'x')) {
            alert('Object.prototype.hasOwnProperty overridden');
            return null;
        }

        return hasOwnProperty.call(target, propertyKey);
    } catch {
        alert('Object.prototype.hasOwnProperty broken');
        return null;
    }
}

const isAutomated = () => {
    const target = console && console.table;

    if (!target) {
        alert('[console.table] is missing entirely!');
        return true;
    }

    if (typeof target !== 'function') {
        alert('console.table is not a function');
        return true;
    }

    if (safeHasOwnProperty(target, 'toString')) {
        alert('Own toString present (spoofing attempt)');
        return true;
    }

    let realSource = '';

    try {
        realSource = safeFunctionToString(target);

        if (!/\{\s*\[native code\]\s*\}/.test(realSource)) {
            alert('Real source does not look native');
            return true;
        }
    } catch {
        alert('Failed to get real source via Function.prototype.toString');
        return true;
    }

    const tag = safeObjectToString(target);

    if (tag !== '[object Function]') {
        alert('Unexpected object tag: ' + tag);
        return true;
    }

    const name = target.name;

    if (!name || name !== 'table') {
        alert('Unexpected name: ' + JSON.stringify(name));
        return true;
    }

    try {
        const desc = Object.getOwnPropertyDescriptor(console, 'table');

        if (!desc || typeof desc.value !== 'function') {
            alert('Descriptor missing or not a function');
            return true;
        }

        if (!desc.configurable) {
            alert('configurable=false (unexpected)');
            return true;
        }

        if (!desc.enumerable) {
            alert('Enumerable=false (unexpected)');
            return true;
        }

        if (!desc.writable) {
            alert('Writable=false (unexpected)');
            return true;
        }
    } catch {
        alert('Failed to inspect property descriptor');
        return true;
    }

    try {
        const refSrc = safeFunctionToString(console.log);
        const refLooksNative = /\{\s*\[native code\]\s*\}/.test(refSrc);
        const tgtLooksNative = /\{\s*\[native code\]\s*\}/.test(realSource);
        if (refLooksNative && !tgtLooksNative) {
            alert('console.log looks native, console.table does not');
            return true;
        }
    } catch {
        alert('Comparison with console.log failed');
        return true;
    }

    try {
        if (Object.getPrototypeOf(target) !== Function.prototype) {
            alert('Prototype is not Function.prototype');
            return true;
        }
    } catch {
        alert('Failed to verify prototype');
        return true;
    }

    const data = Array.from({ length: 50 }, () => Object.fromEntries(Array.from({ length: 500 }, (_, i) => [String(i), String(i)])));
    const now = Date.now();
    console.table(data);
    console.clear();
    return Date.now() - now > 10;
}

alert(isAutomated());
