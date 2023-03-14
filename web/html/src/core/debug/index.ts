import { showErrorToastr, showSuccessToastr, showWarningToastr } from "components/toastr";

type Theme = "susemanager-light" | "susemanager-dark" | "uyuni";

const debug = {
  toggleTheme(toTheme?: Theme) {
    const lightTheme = document.querySelector('link[href^="/css/susemanager-light"]');
    if (lightTheme) {
      lightTheme.setAttribute(
        "href",
        toTheme || lightTheme.getAttribute("href")!.replace("susemanager-light", "uyuni")
      );
      return;
    }

    const darkTheme = document.querySelector('link[href^="/css/susemanager-dark"]');
    if (darkTheme) {
      darkTheme.setAttribute("href", toTheme || darkTheme.getAttribute("href")!.replace("susemanager-dark", "uyuni"));
      return;
    }

    const uyuniTheme = document.querySelector('link[href^="/css/uyuni"]');
    if (uyuniTheme) {
      uyuniTheme.setAttribute(
        "href",
        toTheme || uyuniTheme.getAttribute("href")!.replace("uyuni", "susemanager-light")
      );
      return;
    }
  },
  toggleUpdatedTheme() {
    const regularTheme = document.getElementById("web-theme");
    if (regularTheme?.getAttribute("disabled")) {
      regularTheme.removeAttribute("disabled");
    } else {
      regularTheme?.setAttribute("disabled", "disabled");
    }
    const updatedTheme = document.getElementById("updated-web-theme");
    if (updatedTheme?.getAttribute("disabled")) {
      updatedTheme.removeAttribute("disabled");
    } else {
      updatedTheme?.setAttribute("disabled", "disabled");
    }
  },
  showSuccessToastr,
  showWarningToastr,
  showErrorToastr,
};

declare global {
  interface Window {
    debug?: typeof debug;
  }
}

const bindDebugHelpers = () => {
  window.debug = debug;
};

if (window.location.host.startsWith("localhost")) {
  bindDebugHelpers();
}

export default {};
