import * as React from "react";

import { useInputValue } from "components/hooks/forms/useInputValue";
import { Messages } from "components/messages";

import { ThemeProps } from "../login";
import { getGlobalMessages } from "../messages";
import useLoginApi from "../use-login-api";
import styles from "./login.css";
import logo from "./logo.svg";

const SusemanagerThemeLogin = (props: ThemeProps) => {
  const loginInput = useInputValue("");
  const passwordInput = useInputValue("");
  const { onLogin, success, messages } = useLoginApi();

  const { product } = props;
  return (
    <div className={`spacewalk-main-column-layout ${styles.wrapper}`}>
      <section id="spacewalk-content">
        <div className={styles.box}>
          <div className={styles.brand}>
            <img src={logo} alt="SUSE logo" width="150" height="27" />
          </div>
          <div>
            <Messages
              items={getGlobalMessages(props.validationErrors, props.schemaUpgradeRequired, props.diskspaceSeverity)}
            />
            Foobar
          </div>
        </div>
      </section>
    </div>
  );
};

export default SusemanagerThemeLogin;
