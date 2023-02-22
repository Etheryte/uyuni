import * as React from "react";

import SpaRenderer from "core/spa/spa-renderer";

import { MessagesContainer } from "components/toastr";

import { PackageList } from "./list";

export const renderer = (id: string, docsLocale: string) =>
  SpaRenderer.renderNavigationReact(
    <>
      <MessagesContainer />
      <PackageList docsLocale={docsLocale} />
    </>,
    document.getElementById(id)
  );

