import SpaRenderer from "core/spa/spa-renderer";

import { ActionChainPicker } from "./action-chain-picker";

type Props = {
  // TODO: See if we can make this a value directly
  startsChecked: string;
};

export const renderer = (id: string, props: Props) => {
  let startsChecked = false;
  try {
    startsChecked = JSON.parse(props.startsChecked || "");
  } catch (error) {
    Loggerhead.error(error);
  }

  SpaRenderer.renderNavigationReact(<ActionChainPicker startsChecked={startsChecked} />, document.getElementById(id));
};
