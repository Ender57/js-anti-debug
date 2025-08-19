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

        if (toString.call({}) !== '[object Object]') {
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
        const obj = { o5wsdsn9rq: 1 };

        if (!hasOwnProperty.call(obj, 'o5wsdsn9rq') || hasOwnProperty.call(obj, 'lai4yygjxq')) {
            return null;
        }

        return hasOwnProperty.call(target, propertyKey);
    } catch {
        return null;
    }
}

const tamperCheck = () => {
    const maxTouchPoints = navigator.maxTouchPoints;

    if (typeof maxTouchPoints === 'number' && maxTouchPoints > 1) {
        return false;
    }

    const userAgent = navigator.userAgent;
    const platform = navigator.platform;

    if (platform && typeof platform === 'string') {
        if ((!/(mac|win)/i.test(platform) && /(android|iphone|ipad|ipod|arch)/i.test(platform)) ||
            /(iphone|ipad|ipod|ios|android)/i.test(userAgent)) {
            return false;
        }

        if (/Windows NT/i.test(userAgent) && /Linux/i.test(platform)) {
            return true;
        }
    }

    const target = console && console.table;

    if (!target) {
        return true;
    }

    if (typeof target !== 'function') {
        return true;
    }

    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const obj = {
        o5wsdsn9rq: 1
    };

    if (safeHasOwnProperty(target, 'toString')) {
        return true;
    }

    if (!/\[native code\]/.test(safeFunctionToString(target))) {
        return true;
    }

    if (safeObjectToString(target) !== '[object Function]') {
        return true;
    }

    if (target.name !== 'table') {
        return true;
    }

    if (Object.getPrototypeOf(target) !== Function.prototype) {
        return true;
    }

    return false;
}

alert(tamperCheck());
