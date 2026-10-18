"use client";

import { useActionState } from "react";
import { login } from "./actions";
import styles from "./admin.module.css";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className={styles.login}>
      <h1>Private dashboard</h1>
      <label htmlFor="admin-password">Password</label>
      <input id="admin-password" name="password" type="password" autoComplete="current-password" required autoFocus />
      {state?.error && <p className={styles.error} role="alert">{state.error}</p>}
      <button className={styles.primary} type="submit" disabled={pending}>{pending ? "Checking…" : "Log in"}</button>
    </form>
  );
}
