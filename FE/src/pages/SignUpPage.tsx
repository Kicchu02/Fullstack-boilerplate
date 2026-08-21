import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Alert,
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
  useSignUpPageStore,
} from "../stores/SignUpPageStore";
import { showPopup } from "../stores/UiStore";

export const SignUpPage = (): React.ReactElement => {
  const navigateHelper = useNavigateHelper();
  const [showPassword, setShowPassword] = useState(false);

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
    <Stack sx={{ height: "100%", alignItems: "center", justifyContent: "center" }}>
      <Stack sx={{ gap: 4, width: "400px", alignItems: "center" }}>
        <Typography variant="h4">Sign Up</Typography>
        {isEmailAlreadyExists && (
          <Stack sx={{ width: "100%" }}>
            <Alert severity="error">This email is already in use</Alert>
          </Stack>
        )}
        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={
            isEmailInvalid || isEmailAlreadyExists
          }
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
            isPasswordInvalid ? "Password is insecure" : undefined
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
            await signUp();
            if (selectIsAPIErrored(useSignUpPageStore.getState())) {
              return;
            }
            showPopup("Sign up successful", "success");
            reset();
            navigateHelper.navigateToSignIn();
          }}
          loading={isLoading}
        >
          Sign Up
        </Button>
        <Typography variant="body2">
          Already have an account?{" "}
          <Link
            onClick={() => {
              if (isLoading) {
                return;
              }
              reset();
              navigateHelper.navigateToSignIn();
            }}
            style={{ cursor: "pointer" }}
          >
            Sign In
          </Link>
        </Typography>
      </Stack>
    </Stack>
  );
};
