import * as React from "react";

import useMandatoryChannelsApi, {UseMandatoryChannelsApiReturnType} from "./use-mandatory-channels-api";

type Props = {
    children: (context: UseMandatoryChannelsApiReturnType) => React.ReactNode;
};

// Just a wrapper to use the react-hook useMandatoryChannelsApi in old Code using classes as render-props.
function MandatoryChannelsApi({children}: Props) {
    const apiHookReturn = useMandatoryChannelsApi();
    return children(apiHookReturn);
}

export default MandatoryChannelsApi;
