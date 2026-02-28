/**
 * JSONP 请求工具
 * 用于绕过跨域限制获取天天基金等数据
 */
export function jsonp<T = unknown>(url: string, callbackParam = 'callback'): Promise<T> {
    return new Promise((resolve, reject) => {
        const callbackName = `jsonp_${Date.now()}_${Math.round(Math.random() * 1000)}`;
        const script = document.createElement('script');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;

        const cleanup = () => {
            delete win[callbackName];
            if (script.parentNode) {
                document.body.removeChild(script);
            }
        };

        win[callbackName] = (data: T) => {
            cleanup();
            resolve(data);
        };

        script.onerror = () => {
            cleanup();
            reject(new Error(`JSONP request failed: ${url}`));
        };

        const separator = url.includes('?') ? '&' : '?';
        script.src = `${url}${separator}${callbackParam}=${callbackName}`;
        document.body.appendChild(script);

        // 10秒超时
        setTimeout(() => {
            cleanup();
            reject(new Error('JSONP request timeout'));
        }, 10000);
    });
}

/**
 * 解析 JS 文件中的变量赋值 (如天天基金的 pingzhongdata)
 * 形如: var varName=JSON;
 */
export function fetchJsVar(url: string, varName: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;

        // 设置全局变量 (pingzhongdata 直接赋值给 window)
        const originalValue = win[varName];

        Object.defineProperty(window, varName, {
            configurable: true,
            set(value: unknown) {
                // Restore
                Object.defineProperty(window, varName, {
                    configurable: true,
                    writable: true,
                    value: originalValue,
                });
                resolve(value);
            },
            get() {
                return originalValue;
            }
        });

        script.onerror = () => {
            document.body.removeChild(script);
            reject(new Error(`Failed to load: ${url}`));
        };

        script.src = url;
        document.body.appendChild(script);

        setTimeout(() => {
            if (script.parentNode) document.body.removeChild(script);
            reject(new Error('Timeout'));
        }, 10000);
    });
}
