import { Route } from "OpenApiRouter";
import { handleHello } from ".";

describe("hello operation", () => {
  it("should return a 200 response", async () => {
    // GIVEN
    const route: Route = {
      route: "/hello",
      operation: {
        operationId: "hello",
        responses: {},
      },
      pathParameters: {},
    };

    // WHEN
    const response = handleHello(route);

    // THEN
    expect(response).toMatchSnapshot();
  });
});
