import * as React from "react";

import { RolesProvider } from "core/auth/roles-context";
import SpaRenderer from "core/spa/spa-renderer";

import { ServerMessageType } from "components/messages";
import { MessagesContainer } from "components/toastr/toastr";

import { CreateCustomKey } from "./create-custom-key";

type RendererProps = {
  flashMessage?: ServerMessageType;
};

export const renderer = (id: string, { flashMessage }: RendererProps = {}) => {
  SpaRenderer.renderNavigationReact(
    <RolesProvider>
      <MessagesContainer />
      {/* TODO: Implement */}
    </RolesProvider>,
    document.getElementById(id)
  );
};
