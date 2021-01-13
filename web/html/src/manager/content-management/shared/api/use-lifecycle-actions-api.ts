import {useState} from "react";
import { Cancelable } from "utils/functions";
import Network from "utils/network";

type Props = {
    resource: string;
    nestedResource?: string;
};

type returnUseProjectActionsApi = {
    onAction: (arg0: any, arg1: string, arg2: string | null | undefined) => Promise<Object>;
    cancelAction: () => void;
    isLoading: boolean;
};

type NetworkMethod = typeof networkAction[keyof typeof networkAction];

const networkAction = {
    get: Network.get,
    create: Network.post,
    action: Network.post,
    update: Network.put,
    delete: Network.del,
};

const getApiUrl = (resource, nestedResource, id) => {
    if (!id) {
        return `/rhn/manager/api/contentmanagement/${resource}`;
    } else {
        if (!nestedResource) {
            return `/rhn/manager/api/contentmanagement/${resource}/${id}`;
        } else {
            return `/rhn/manager/api/contentmanagement/${resource}/${id}/${nestedResource}`;
        }
    }
};

const getErrorMessage = ({messages = [], errors}) => messages.filter(Boolean);

const useLifecycleActionsApi = (props: Props): returnUseProjectActionsApi => {
    const [isLoading, setIsLoading] = useState(false);
    const [onGoingNetworkRequest, setOnGoingNetworkRequest] = useState<Cancelable | null>(null);

    const onAction = (actionBodyRequest, action, id) => {
        if (!isLoading) {
            setIsLoading(true);

            const apiUrl = getApiUrl(props.resource, props.nestedResource, id);
            const networkMethod: NetworkMethod = networkAction[action] || networkAction["get"];
            const networkRequest = networkMethod(apiUrl, JSON.stringify(actionBodyRequest), "application/json");
            setOnGoingNetworkRequest(networkRequest);

            return networkRequest.promise
                .then(response => {
                    setIsLoading(false);

                    if (!response.success) {
                        throw getErrorMessage(response);
                    }

                    return response.data;
                })
                .catch(xhr => {
                    let errMessages;
                    if (xhr.status === 0) {
                        errMessages = t(
                            "Request interrupted or invalid response received from the server. Please try again."
                        );
                    } else if (xhr.status === 400) {
                        errMessages = getErrorMessage(xhr.responseJSON);
                    } else {
                        errMessages = Network.errorMessageByStatus(xhr.status);
                    }

                    setIsLoading(false);

                    throw errMessages;
                });
        } else {
            return new Promise(() => {});
        }
    };

    const cancelAction = () => {
        onGoingNetworkRequest?.cancel({status: 0});
    };

    return {
        onAction,
        cancelAction,
        isLoading,
    };
};

export default useLifecycleActionsApi;
