import { Button, Flex, Input, Typography } from "antd";
import type React from "react";
import { useNavigateHelper } from "../RoutesHelper";
import {
  selectIsAPIErrored,
  selectIsButtonDisabled,
  useSignInPageStore,
} from "../stores/SignInPageStore";
import { showPopup } from "../stores/UiStore";

export const SignInPage = (): React.ReactElement => {
  const navigateHelper = useNavigateHelper();

  const email = useSignInPageStore((s) => s.email);
  const password = useSignInPageStore((s) => s.password);
  const isLoading = useSignInPageStore((s) => s.isLoading);
  const isEmailInvalid = useSignInPageStore((s) => s.isEmailInvalid);
  const isPasswordInvalid = useSignInPageStore((s) => s.isPasswordInvalid);
  const isButtonDisabled = useSignInPageStore(selectIsButtonDisabled);
  const setEmail = useSignInPageStore((s) => s.setEmail);
  const setPassword = useSignInPageStore((s) => s.setPassword);
  const signIn = useSignInPageStore((s) => s.signIn);
  const reset = useSignInPageStore((s) => s.reset);

  return (
    <Flex align="center" justify="center" style={{ height: "100%" }}>
      <Flex vertical gap={24} align="center" style={{ width: 400 }}>
        <Typography.Title level={4} style={{ marginBottom: 0 }}>
          Sign In
        </Typography.Title>

        {/*
          Plain label + id rather than antd's Form/Form.Item. These inputs are controlled
          straight from the store, so antd Form's own field state would be a second source
          of truth for the same values. The explicit htmlFor/id pairing is also what keeps
          the fields reachable by label for assistive tech and for tests.
        */}
        <Flex vertical gap={4} style={{ width: "100%" }}>
          <label htmlFor="signInEmail">Email</label>
          <Input
            id="signInEmail"
            required
            aria-invalid={isEmailInvalid || undefined}
            aria-describedby={isEmailInvalid ? "signInEmailError" : undefined}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            status={isEmailInvalid ? "error" : undefined}
            disabled={isLoading}
          />
          {isEmailInvalid && (
            <Typography.Text id="signInEmailError" type="danger">
              Invalid email
            </Typography.Text>
          )}
        </Flex>

        <Flex vertical gap={4} style={{ width: "100%" }}>
          <label htmlFor="signInPassword">Password</label>
          {/* Input.Password brings its own show/hide toggle, so the IconButton +
              InputAdornment + Visibility icon trio this used to need is gone. */}
          <Input.Password
            id="signInPassword"
            required
            aria-invalid={isPasswordInvalid || undefined}
            aria-describedby={isPasswordInvalid ? "signInPasswordError" : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            status={isPasswordInvalid ? "error" : undefined}
            disabled={isLoading}
          />
          {isPasswordInvalid && (
            <Typography.Text id="signInPasswordError" type="danger">
              Invalid password
            </Typography.Text>
          )}
        </Flex>

        <Button
          type="primary"
          size="large"
          block
          disabled={isButtonDisabled}
          loading={isLoading}
          onClick={async () => {
            await signIn();
            const state = useSignInPageStore.getState();
            if (state.hasRequestFailed) {
              // Nothing on the form explains this one, so say so rather than leaving the
              // user staring at a button that stopped spinning.
              showPopup("Something went wrong. Please try again.", "error");
              return;
            }
            if (selectIsAPIErrored(state)) {
              return;
            }
            showPopup("Sign in successful", "success");
            reset();
            navigateHelper.navigateToHome();
          }}
        >
          Sign In
        </Button>

        <Typography.Text>
          Don&apos;t have an account?{" "}
          <Typography.Link
            onClick={() => {
              if (isLoading) {
                return;
              }
              reset();
              navigateHelper.navigateToSignUp();
            }}
          >
            Sign Up
          </Typography.Link>
        </Typography.Text>
      </Flex>
    </Flex>
  );
};
