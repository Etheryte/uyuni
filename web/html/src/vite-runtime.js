// See https://vitejs.dev/guide/backend-integration.html#backend-integration
import RefreshRuntime from "https://localhost:3000/@react-refresh";

RefreshRuntime.injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
window.__vite_plugin_react_preamble_installed__ = true;
