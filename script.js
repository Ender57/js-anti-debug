const safeFnToString = Function.prototype.toString;
const safeObjToString = Object.prototype.toString;
const hasOwn = Object.prototype.hasOwnProperty;

const target = console && console.table;

if (!target) {
    alert('[console.table] is missing entirely!');
    return;
}

if (typeof target !== 'function') {
    alert('console.table is not a function');
    return;
}

if (hasOwn.call(target, 'toString')) {
    alert('Own toString present (spoofing attempt)');
    return;
}

let realSource = '';

try {
    realSource = safeFnToString.call(target);

    if (!/\{\s*\[native code\]\s*\}/.test(realSource)) {
        alert('Real source does not look native');
        return;
    }
} catch {
    alert('Failed to get real source via Function.prototype.toString');
    return;
}

const tag = safeObjToString.call(target);

if (tag !== '[object Function]') {
    alert('Unexpected object tag: ' + tag);
    return;
}

const name = target.name;
const length = target.length;

if (!name || name.toLowerCase() !== 'table') {
    alert('Unexpected name: ' + JSON.stringify(name));
    return;
}

if (length === 0) {
    alert('Suspicious length: 0');
    return;
}

try {
    const desc = Object.getOwnPropertyDescriptor(console, 'table');

    if (!desc || typeof desc.value !== 'function') {
        alert('Descriptor missing or not a function');
        return;
    }

    if (desc.enumerable) {
        alert('Enumerable=true (unexpected)');
        return;
    }

    if (desc.writable && desc.configurable) {
        alert('Writable & configurable (common in replacements)');
        return;
    }
} catch {
    alert('Failed to inspect property descriptor');
    return;
}

try {
    const refSrc = safeFnToString.call(console.log);
    const refLooksNative = /\{\s*\[native code\]\s*\}/.test(refSrc);
    const tgtLooksNative = /\{\s*\[native code\]\s*\}/.test(realSource);
    if (refLooksNative && !tgtLooksNative) {
        alert('console.log looks native, console.table does not');
        return;
    }
} catch {
    alert('Comparison with console.log failed');
    return;
}

try {
    if (Object.getPrototypeOf(target) !== Function.prototype) {
        alert('Prototype is not Function.prototype');
        return;
    }
} catch {
    alert('Failed to verify prototype');
    return;
}

const data = Array.from({ length: 50 }, () => Object.fromEntries(Array.from({ length: 500 }, (_, i) => [String(i), String(i)])));
const now = Date.now();
console.table(data);
alert(Date.now() - now);
