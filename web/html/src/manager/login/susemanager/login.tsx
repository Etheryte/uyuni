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
    <div className={styles.background}>
      <section className={styles.wrapper}>
        <div className={styles.brand}>
          <img src={logo} alt="SUSE logo" width="150" height="27" />
          <div>
            <h1 className={styles.title}>{product.bodyTitle}</h1>
            <p>{t("Discover a new way of managing your servers, packages, patches and more via one interface.")}</p>
          </div>
          <div>
            {t(
              <p>
                <a href={product.url} target="_blank" rel="noopener noreferrer">
                  Learn more
                </a>{" "}
                about {product.key}.
              </p>
            )}
          </div>
        </div>
        <div className={styles.loginArea}>
          <div>
            <Messages
              items={getGlobalMessages(props.validationErrors, props.schemaUpgradeRequired, props.diskspaceSeverity)}
            />
          </div>
          <form onSubmit={(event) => event.preventDefault()} className={styles.loginForm}>
            <h1 className={styles.title}>{t("Sign In")}</h1>
          </form>
          <div>Footer</div>
        </div>
      </section>
    </div>
  );
};

export default SusemanagerThemeLogin;
