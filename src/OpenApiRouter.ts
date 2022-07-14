import _ from "lodash";
import orderBy from "lodash/orderBy";
import { OpenAPIV3 } from "openapi-types";

interface PathDefinition {
  path: string;
  pathRegex: RegExp;
  operations: {
    [method: string]: OpenAPIV3.OperationObject;
  };
}

export interface Route {
  route: string;
  operation: OpenAPIV3.OperationObject;
  pathParameters: Record<string, string>;
}

export class OpenApiRouter {
  private paths: PathDefinition[];

  constructor(spec: OpenAPIV3.Document) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.paths = Object.entries(spec.paths).map(([path, value]) => {
      const pathRegex = new RegExp(
        `^${path.replace(/{(.+?)}/g, "(?<$1>.+)")}$`
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const pathObj: OpenAPIV3.PathItemObject = value;
      const operations = Object.fromEntries(
        Object.entries(pathObj)
          .filter(([key]) =>
            [
              "get",
              "post",
              "options",
              "patch",
              "put",
              "delete",
              "trace",
            ].includes(key)
          )
          .map(([key, op]) => [key.toUpperCase(), op])
      );

      return { path, pathRegex, operations };
    });
  }

  match(path: string, method: string): Route | null {
    for (const pathDef of orderBy(
      this.paths,
      (def) => def.path.length,
      "desc"
    )) {
      const match = path.match(pathDef.pathRegex);

      if (match) {
        const operation = pathDef.operations[method];

        if (!operation) {
          return null;
        }

        const route: Route = {
          route: pathDef.path,
          operation,
          pathParameters: (match.groups ?? {}) as Record<string, string>,
        };

        return route;
      }
    }

    return null;
  }

  matchByOperationId(operationId: string): Route | null {
    let results = this.paths.map((p) => {
      const op = Object.entries(p.operations).find(
        ([_, value]) => value.operationId === operationId
      ) as OpenAPIV3.OperationObject | undefined;

      return op
        ? {
            route: p.path,
            operation: op,
            pathParameters: {},
          }
        : null;
    });

    // strip falsy values
    results = _.compact(results);

    if (!results || results.length === 0) {
      return null;
    }

    return results[0];
  }
}
