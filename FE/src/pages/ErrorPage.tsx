import { Button, Flex, Typography } from "antd";
import type React from "react";
import { useNavigateHelper } from "../RoutesHelper";

export const ErrorPage = (): React.ReactElement => {
  const navigateHelper = useNavigateHelper();

  return (
    <Flex
      vertical
      align="center"
      justify="center"
      gap={16}
      style={{ height: "100%" }}
    >
      <Typography.Title level={1} style={{ marginBottom: 0 }}>
        500
      </Typography.Title>
      <Typography.Title level={2} style={{ marginTop: 0 }}>
        Internal Server Error
      </Typography.Title>
      <Button size="large" onClick={() => navigateHelper.navigateToHome()}>
        Go to Home
      </Button>
    </Flex>
  );
};
