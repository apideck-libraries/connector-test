import path from "path";
import chalk from "chalk";
import express from "express";
import { OpenAPI, OpenAPIV3 } from "openapi-types";
import OpenApiParser from "@apidevtools/swagger-parser";

import { OpenApiRouter } from "./OpenApiRouter";
import { dispatch } from "./dispatch";

const PORT = 4444;

void (async () => {
  const app = express();
  const specPath = path.resolve("spec.yml");
  const maybeRouter = await getOpenApiRouter(specPath);

  if (!maybeRouter) {
    return;
  }

  const router = maybeRouter;

  app.all("*", async (req, res) => {
    // Log request
    console.log(
      chalk`{dim ${new Date()
        .toTimeString()
        .substring(0, 8)}} {magenta http} {green ${req.method}} ${req.path}`
    );

    // Set headers
    res.setHeader("Content-Type", "application/json");

    try {
      const routerResult = router.match(req.path, req.method);
      if (!routerResult) {
        res.status(404).send({ message: "not found" });
        return;
      }

      const result = dispatch(routerResult);

      if (!result) {
        res.status(501).send({ message: "not implemented" });
        return;
      }

      // Set additional headers
      if (result?.headers) {
        Object.entries(result?.headers).forEach(([headerName, headerValue]) => {
          res.setHeader(headerName, headerValue);
        });
      }

      res.status(result.status).send(result?.body);
      return;
    } catch (err) {
      console.log(
        chalk`{dim ${new Date()
          .toTimeString()
          .substring(0, 8)}} {magenta http} {red ERROR} ${err}`
      );
      res.status(500).send({ message: "something went wrong" });
    }
  });

  app.listen(PORT, () => {
    console.log(
      chalk`{dim ${new Date()
        .toTimeString()
        .substring(
          0,
          8
        )}} {magenta Unify} {green READY} http://localhost:${PORT}`
    );
  });
})();

async function getOpenApiRouter(specPath: string) {
  let spec: OpenAPI.Document<{}> | undefined = undefined;
  try {
    spec = await OpenApiParser.bundle(specPath);
  } catch (error) {
    console.log(
      chalk`{dim ${new Date()
        .toTimeString()
        .substring(0, 8)}} {magenta http} {red ERROR} Missing spec.`
    );
    return;
  }
  return new OpenApiRouter(spec as OpenAPIV3.Document);
}
