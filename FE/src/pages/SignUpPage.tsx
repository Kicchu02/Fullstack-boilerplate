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
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { showPopup } from "../helpers";
import { useNavigateHelper } from "../RoutesHelper";
import { useSignUpPageStore } from "../stores/hooks";

export const SignUpPage = observer((): React.ReactElement => {
  const navigateHelper = useNavigateHelper();
  const signUpPageStore = useSignUpPageStore();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Stack height="100%" alignItems="center" justifyContent="center">
      <Stack gap={4} width="400px" alignItems="center">
        <Typography variant="h4">Sign Up</Typography>
        {signUpPageStore.isEmailAlreadyExists && (
          <Stack width="100%">
            <Alert severity="error">This email is already in use</Alert>
          </Stack>
        )}
        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          value={signUpPageStore.email}
          onChange={(e) => signUpPageStore.setEmail(e.target.value)}
          error={
            signUpPageStore.isEmailInvalid ||
            signUpPageStore.isEmailAlreadyExists
          }
          helperText={
            signUpPageStore.isEmailInvalid ? "Invalid email" : undefined
          }
        />
        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          required
          value={signUpPageStore.password}
          onChange={(e) => signUpPageStore.setPassword(e.target.value)}
          error={signUpPageStore.isPasswordInvalid}
          helperText={
            signUpPageStore.isPasswordInvalid
              ? "Password is insecure"
              : undefined
          }
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          variant="contained"
          fullWidth
          size="large"
          disabled={signUpPageStore.isButtonDisabled}
          onClick={async () => {
            await signUpPageStore.signUp();
            if (signUpPageStore.isAPIErrored) {
              return;
            }
            showPopup(signUpPageStore, "Sign up successful", "success");
            signUpPageStore.reset();
            navigateHelper.navigateToSignIn();
          }}
          loading={signUpPageStore.isLoading}
        >
          Sign Up
        </Button>
        <Typography variant="body2">
          Already have an account?{" "}
          <Link
            onClick={() => {
              if (signUpPageStore.isLoading) {
                return;
              }
              signUpPageStore.reset();
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
});
