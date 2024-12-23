import { Fields } from "@remoteoss/json-schema-form";

export class JsfUtils {
  static getJsfFieldByName(
    fields: Fields,
    name: string
  ): Record<string, unknown> | null {
    for (const field of fields) {
      if (typeof field["name"] === "string" && field["name"] === name) {
        return field;
      }
    }
    return null;
  }
}
