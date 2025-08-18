const isAutomated = () => {
    const safeFnToString = Function.prototype.toString;
    const safeObjToString = Object.prototype.toString;
    const hasOwn = Object.prototype.hasOwnProperty;

    const target = console && console.table;

    if (!target) {
        alert('[console.table] is missing entirely!');
        return true;
    }

    if (typeof target !== 'function') {
        alert('console.table is not a function');
        return true;
    }

    if (hasOwn.call(target, 'toString')) {
        alert('Own toString present (spoofing attempt)');
        return true;
    }

    let realSource = '';

    try {
        realSource = safeFnToString.call(target);

        if (!/\{\s*\[native code\]\s*\}/.test(realSource)) {
            alert('Real source does not look native');
            return true;
        }
    } catch {
        alert('Failed to get real source via Function.prototype.toString');
        return true;
    }

    const tag = safeObjToString.call(target);

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
        const refSrc = safeFnToString.call(console.log);
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
    alert(Date.now() - now);
    return false;
}

alert(isAutomated());
