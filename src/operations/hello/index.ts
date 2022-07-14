import { Result } from "dispatch";
import { Route } from "OpenApiRouter";

export const handleHello = (_route: Route): Result | null => {
  return {
    status: 200,
    body: {
      message: "Hello, world!",
    },
  };
};
