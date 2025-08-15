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
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { showPopup } from "../helpers";
import { useNavigateHelper } from "../RoutesHelper";
import { useSignInPageStore } from "../stores/hooks";

export const SignInPage = observer((): React.ReactElement => {
  const navigateHelper = useNavigateHelper();
  const signInPageStore = useSignInPageStore();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Stack height="100%" alignItems="center" justifyContent="center">
      <Stack gap={4} width="400px" alignItems="center">
        <Typography variant="h4">Sign In</Typography>
        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          value={signInPageStore.email}
          onChange={(e) => signInPageStore.setEmail(e.target.value)}
          error={signInPageStore.isEmailInvalid}
          helperText={
            signInPageStore.isEmailInvalid ? "Invalid email" : undefined
          }
        />
        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          required
          value={signInPageStore.password}
          onChange={(e) => signInPageStore.setPassword(e.target.value)}
          error={signInPageStore.isPasswordInvalid}
          helperText={
            signInPageStore.isPasswordInvalid ? "Invalid password" : undefined
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
          disabled={signInPageStore.isButtonDisabled}
          onClick={async () => {
            await signInPageStore.signIn();
            if (signInPageStore.isAPIErrored) {
              return;
            }
            showPopup(signInPageStore, "Sign in successful", "success");
            signInPageStore.reset();
            navigateHelper.navigateToHome();
          }}
          loading={signInPageStore.isLoading}
        >
          Sign In
        </Button>
        <Typography variant="body2">
          Don't have an account?{" "}
          <Link
            onClick={() => {
              if (signInPageStore.isLoading) {
                return;
              }
              signInPageStore.reset();
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
});
