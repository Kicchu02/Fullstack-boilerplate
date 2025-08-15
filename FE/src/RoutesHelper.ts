import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export const Routes = {
  SignUp: "signUp",
  SignIn: "signIn",
  Home: "home",
  PageNotFound: "404",
  ServerError: "500",
} as const;

export const SearchParams = {} as const;

export type NavigateHelper = {
  navigateToSignIn: () => void;
  navigateToSignUp: () => void;
  navigateToHome: () => void;
  navigateToPageNotFound: () => void;
  navigateTo500: () => void;
};

export const useNavigateHelper = (): NavigateHelper => {
  const navigate = useNavigate();

  const navigateToSignIn = useCallback(() => {
    navigate(`/${Routes.SignIn}`);
  }, [navigate]);

  const navigateToSignUp = useCallback(() => {
    navigate(`/${Routes.SignUp}`);
  }, [navigate]);

  const navigateToHome = useCallback(() => {
    navigate(`/${Routes.Home}`);
  }, [navigate]);

  const navigateToPageNotFound = useCallback(() => {
    navigate(`/${Routes.PageNotFound}`);
  }, [navigate]);

  const navigateTo500 = useCallback(() => {
    navigate(`/${Routes.ServerError}`);
  }, [navigate]);

  return useMemo(
    () => ({
      navigateToSignIn,
      navigateToSignUp,
      navigateToHome,
      navigateToPageNotFound,
      navigateTo500,
    }),
    [
      navigateToSignIn,
      navigateToSignUp,
      navigateToHome,
      navigateToPageNotFound,
      navigateTo500,
    ]
  );
};
