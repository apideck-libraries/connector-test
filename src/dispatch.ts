import { Route } from "OpenApiRouter";
import { handleHello } from "operations/hello";

export interface Result {
  body?: any;
  status: number;
  headers?: Record<string, string>;
}

export const dispatch = (route: Route): Result | null => {
  switch (route.operation.operationId) {
    case "hello":
      return handleHello(route);
    default:
      return null;
  }
};
