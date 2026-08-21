import { Alert, Button, Flex, Input, Typography } from "antd";
import type React from "react";
import { useNavigateHelper } from "../RoutesHelper";
import {
  selectIsAPIErrored,
  selectIsButtonDisabled,
  useSignUpPageStore,
} from "../stores/SignUpPageStore";
import { showPopup } from "../stores/UiStore";

export const SignUpPage = (): React.ReactElement => {
  const navigateHelper = useNavigateHelper();

  const email = useSignUpPageStore((s) => s.email);
  const password = useSignUpPageStore((s) => s.password);
  const isLoading = useSignUpPageStore((s) => s.isLoading);
  const isEmailAlreadyExists = useSignUpPageStore((s) => s.isEmailAlreadyExists);
  const isEmailInvalid = useSignUpPageStore((s) => s.isEmailInvalid);
  const isPasswordInvalid = useSignUpPageStore((s) => s.isPasswordInvalid);
  const isButtonDisabled = useSignUpPageStore(selectIsButtonDisabled);
  const setEmail = useSignUpPageStore((s) => s.setEmail);
  const setPassword = useSignUpPageStore((s) => s.setPassword);
  const signUp = useSignUpPageStore((s) => s.signUp);
  const reset = useSignUpPageStore((s) => s.reset);

  return (
    <Flex align="center" justify="center" style={{ height: "100%" }}>
      <Flex vertical gap={24} align="center" style={{ width: 400 }}>
        <Typography.Title level={4} style={{ marginBottom: 0 }}>
          Sign Up
        </Typography.Title>

        {isEmailAlreadyExists && (
          <Alert
            style={{ width: "100%" }}
            type="error"
            message="This email is already in use"
            showIcon
          />
        )}

        <Flex vertical gap={4} style={{ width: "100%" }}>
          <label htmlFor="signUpEmail">Email</label>
          <Input
            id="signUpEmail"
            required
            aria-invalid={isEmailInvalid || undefined}
            aria-describedby={isEmailInvalid ? "signUpEmailError" : undefined}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            status={isEmailInvalid || isEmailAlreadyExists ? "error" : undefined}
            disabled={isLoading}
          />
          {isEmailInvalid && (
            <Typography.Text id="signUpEmailError" type="danger">
              Invalid email
            </Typography.Text>
          )}
        </Flex>

        <Flex vertical gap={4} style={{ width: "100%" }}>
          <label htmlFor="signUpPassword">Password</label>
          <Input.Password
            id="signUpPassword"
            required
            aria-invalid={isPasswordInvalid || undefined}
            aria-describedby={isPasswordInvalid ? "signUpPasswordError" : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            status={isPasswordInvalid ? "error" : undefined}
            disabled={isLoading}
          />
          {isPasswordInvalid && (
            <Typography.Text id="signUpPasswordError" type="danger">
              Password is insecure
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
            await signUp();
            const state = useSignUpPageStore.getState();
            if (state.hasRequestFailed) {
              showPopup("Something went wrong. Please try again.", "error");
              return;
            }
            if (selectIsAPIErrored(state)) {
              return;
            }
            showPopup("Sign up successful", "success");
            reset();
            navigateHelper.navigateToSignIn();
          }}
        >
          Sign Up
        </Button>

        <Typography.Text>
          Already have an account?{" "}
          <Typography.Link
            onClick={() => {
              if (isLoading) {
                return;
              }
              reset();
              navigateHelper.navigateToSignIn();
            }}
          >
            Sign In
          </Typography.Link>
        </Typography.Text>
      </Flex>
    </Flex>
  );
};
