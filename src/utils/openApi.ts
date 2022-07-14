import chalk from "chalk";
import { OpenAPI, OpenAPIV3 } from "openapi-types";
import OpenApiParser from "@apidevtools/swagger-parser";
import { OpenApiRouter } from "OpenApiRouter";

export const getOpenApiSpec = async (specPath: string) => {
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
  return spec as OpenAPIV3.Document;
};

export const getOpenApiRouter = async (specPath: string) => {
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
};

export const getBasePathByOpenApiSpec = (spec: OpenAPIV3.Document): string => {
  if (!spec?.servers?.[0]) {
    throw new Error("Spec not valid, missing server url");
  }

  return spec.servers[0].url;
};
