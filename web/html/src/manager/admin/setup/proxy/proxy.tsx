import { useEffect, useState } from "react";

import { Form, Password, Text } from "components/input";
import { Panel } from "components/panels/Panel";

import Network from "utils/network";

import { SetupHeader } from "../setup-header";

enum Verification {
  Unknown,
  Checking,
  Valid,
  Invalid,
}

export default () => {
  const [settings, _setSettings] = useState({
    hostname: "",
    username: "",
    password: "",
  });
  const setSettings = (newSettings: Partial<typeof settings>) => {
    _setSettings({
      // Ensure all fields are always present
      hostname: "",
      username: "",
      password: "",
      ...newSettings,
    });
  };

  const [verification, setVerification] = useState(Verification.Unknown);

  const verifySettings = (forceRefresh: boolean) => {
    Network.post("/rhn/ajax/verify-proxy-settings", {
      forceRefresh,
    })
      .then((result) => {
        const valid = JSON.parse(result);
        if (valid) {
          setVerification(Verification.Valid);
        } else {
          setVerification(Verification.Invalid);
        }
      })
      .catch((error) => {
        setVerification(Verification.Invalid);
        Loggerhead.error(error);
      });
  };

  const saveSettings = (newSettings: typeof settings) => {
    if (verification !== Verification.Unknown) {
      setVerification(Verification.Checking);
    }

    Network.post("/rhn/ajax/save-proxy-settings", newSettings).then((savedProxySettings) => {
      setSettings({ ...settings, ...savedProxySettings });
      verifySettings(true);
    });
  };

  const loadSettings = () => {
    Network.post("/rhn/ajax/retrieve-proxy-settings").then((savedProxySettings) => {
      setSettings(savedProxySettings);

      if (savedProxySettings.hostname) {
        verifySettings(false);
      }
    });
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const footer = (
    <>
      <div className="text-right">
        <button
          id="http-proxy-save"
          type="submit"
          className="btn btn-primary"
          disabled={verification === Verification.Checking}
        >
          {t("Save and Verify")}
        </button>
      </div>
    </>
  );

  return (
    <div className="responsive-wizard">
      <SetupHeader />
      <div className="row">
        <div className="col-sm-9">
          {verification === Verification.Checking ? (
            <div className="alert alert-info">{t("Verifying proxy settings")}</div>
          ) : null}
          {verification === Verification.Valid ? (
            <div className="alert alert-success">{t("Successfully verified proxy settings")}</div>
          ) : null}
          {verification === Verification.Invalid ? (
            <div className="alert alert-danger">{t("Proxy settings are not valid")}</div>
          ) : null}

          <Form model={settings} onChange={setSettings} onSubmit={saveSettings} autoComplete="off">
            <Panel footer={footer}>
              <Text
                name="hostname"
                label={t("HTTP Proxy Hostname")}
                placeholder={t("hostname:port")}
                // invalidHint={t("Can not contain the following characters: /\\")}
                labelClass="col-md-4"
                divClass="col-md-8"
              />
              <Text
                name="username"
                label={t("HTTP Proxy Username")}
                placeholder={t("Username")}
                labelClass="col-md-4"
                divClass="col-md-8"
                autoComplete="off"
              />
              <Password
                name="password"
                label={t("HTTP Proxy Password")}
                placeholder={t("Password")}
                labelClass="col-md-4"
                divClass="col-md-8"
                autoComplete="off"
              />
            </Panel>
          </Form>
        </div>
      </div>
    </div>
  );
};
