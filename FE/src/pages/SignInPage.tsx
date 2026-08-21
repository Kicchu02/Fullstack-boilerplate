import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Button,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigateHelper } from "../RoutesHelper";
import {
  selectIsAPIErrored,
  selectIsButtonDisabled,
  useSignInPageStore,
} from "../stores/SignInPageStore";
import { showPopup } from "../stores/UiStore";

export const SignInPage = (): React.ReactElement => {
  const navigateHelper = useNavigateHelper();
  const [showPassword, setShowPassword] = useState(false);

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
    <Stack sx={{ height: "100%", alignItems: "center", justifyContent: "center" }}>
      <Stack sx={{ gap: 4, width: "400px", alignItems: "center" }}>
        <Typography variant="h4">Sign In</Typography>
        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={isEmailInvalid}
          helperText={
            isEmailInvalid ? "Invalid email" : undefined
          }
          disabled={isLoading}
        />
        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={isPasswordInvalid}
          helperText={
            isPasswordInvalid ? "Invalid password" : undefined
          }
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          disabled={isLoading}
        />
        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={isButtonDisabled}
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
          loading={isLoading}
        >
          Sign In
        </Button>
        <Typography variant="body2">
          Don't have an account?{" "}
          <Link
            onClick={() => {
              if (isLoading) {
                return;
              }
              reset();
              navigateHelper.navigateToSignUp();
            }}
            style={{ cursor: "pointer" }}
          >
            Sign Up
          </Link>
        </Typography>
      </Stack>
    </Stack>
  );
};
