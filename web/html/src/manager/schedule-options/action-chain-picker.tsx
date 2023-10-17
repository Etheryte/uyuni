import { useEffect, useState } from "react";

import { Combobox } from "components/combobox";
import { Form } from "components/input";

import Network from "utils/network";

type ActionChain = {
  id: string;
  label: string;
  entrycount: number;
};

type Props = {
  startsChecked: boolean;
};

export const ActionChainPicker = (props: Props) => {
  const newActionChain: ActionChain = { label: t("new action chain"), id: "new action chain", entrycount: 0 };
  const [selectedId, setSelectedId] = useState(newActionChain.id);
  const [actionChains, setActionChains] = useState<ActionChain[]>([newActionChain]);

  useEffect(() => {
    Network.apiGet<ActionChain[]>("actionchain/listChains").then((items) => {
      console.log(items);
      setActionChains([newActionChain, ...items]);
    });
  }, []);

  const comboboxItems = actionChains.map((item) => ({
    id: item.label,
    text: item.label,
  }));

  return (
    <div className="form-group">
      <div className="col-sm-3 control-label">
        <input
          type="radio"
          name="schedule_type"
          value="action_chain"
          id="schedule-by-action-chain"
          defaultChecked={props.startsChecked}
        />
        <label htmlFor="schedule-by-action-chain">{t("Add to:")}</label>
      </div>
      <div className="col-sm-6">
        {/* TODO: Remove this <Form> wrapper once https://github.com/SUSE/spacewalk/issues/14250 is implemented */}
        <Form>
          <Combobox
            id="action-chain"
            name="action_chain"
            options={comboboxItems}
            selectedId={selectedId}
            getNewOptionData={(input, label) => {
              const sanitized = input.replace(/[',]/g, "");
              const maxLength = 256;
              const cut = sanitized.substring(0, maxLength);
              return { id: cut, value: cut, label };
            }}
            onSelect={(item) => setSelectedId(item.id)}
          />
        </Form>
      </div>
    </div>
  );
};
