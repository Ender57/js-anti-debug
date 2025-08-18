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

const isAutomated = () => {
    try {
        const target = console && console.table;

        if (!target) {
            return true;
        }

        if (typeof target !== 'function') {
            return true;
        }

        if (safeHasOwnProperty(target, 'toString')) {
            return true;
        }

        if (!/\{\s*\[native code\]\s*\}/.test(safeFunctionToString(target))) {
            return true;
        }

        if (safeObjectToString(target) !== '[object Function]') {
            return true;
        }

        if (target.name !== 'table') {
            return true;
        }

        const desc = Object.getOwnPropertyDescriptor(console, 'table');

        if (!desc || typeof desc.value !== 'function') {
            return true;
        }

        if (!desc.configurable) {
            return true;
        }

        if (!desc.enumerable) {
            return true;
        }

        if (!desc.writable) {
            return true;
        }

        if (Object.getPrototypeOf(target) !== Function.prototype) {
            return true;
        }

        const data = Array.from({ length: 50 }, () => Object.fromEntries(Array.from({ length: 500 }, (_, i) => [String(i), String(i)])));
        const now = Date.now();
        console.table(data);
        console.clear();
        return Date.now() - now > 10;
    } catch {
        return true;
    }
}

alert(isAutomated());
