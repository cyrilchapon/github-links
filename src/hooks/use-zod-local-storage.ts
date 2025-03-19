import { useCallback } from "react";
import { useLocalStorage, useSessionStorage } from "usehooks-ts";
import { ZodSchema, ZodTypeDef } from "zod";
import { fromError } from "zod-validation-error";

type UseLocalStorageOptions<T> = NonNullable<
  Parameters<typeof useLocalStorage<T>>[2]
>;

export type UseZodLocalStorageOptions<T> = Omit<
  UseLocalStorageOptions<T>,
  "serializer" | "deserializer"
>;

const _createUseZodStorage = (
  rawStorageHook: typeof useLocalStorage | typeof useSessionStorage
) => {
  return <T, Def extends ZodTypeDef = ZodTypeDef, Input = T>(
      schema: ZodSchema<T, Def, Input>
    ) =>
    (
      key: string,
      initialValue: T | (() => T),
      options?: UseZodLocalStorageOptions<T>
    ) => {
      const deserializer = useCallback<(rawVal: string) => T>(
        (rawVal) => {
          const defaultValue =
            initialValue instanceof Function ? initialValue() : initialValue;

          let parsed;
          try {
            parsed = JSON.parse(rawVal) as unknown;
          } catch (error) {
            console.error("Error parsing JSON", error);
            return defaultValue;
          }

          let validated;
          try {
            validated = schema.parse(parsed);
          } catch (error) {
            console.error("Error parsing value", fromError(error));
            return defaultValue;
          }

          return validated;
        },
        [initialValue]
      );

      return rawStorageHook(key, initialValue, {
        ...options,
        deserializer: deserializer,
      });
    };
};

export const createUseZodLocalStorage = _createUseZodStorage(useLocalStorage);
export const createUseZodSessionStorage =
  _createUseZodStorage(useSessionStorage);
