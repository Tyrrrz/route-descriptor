import { Key, parse, tokensToFunction } from 'path-to-regexp';

type ParamsBase = object;

/**
 * Describes a route.
 */
export type RouteDescriptor = {
  /**
   * Path of the route.
   */
  readonly path: string;
};

/**
 * Describes a route that does not accept parameters.
 */
export type StaticRouteDescriptor = RouteDescriptor & {
  /**
   * Resolves the URL of the route.
   * For a static route, this simply returns the path.
   */
  (): string;
};

/**
 * Describes a route that accepts parameters.
 */
export type DynamicRouteDescriptor<T extends ParamsBase> = RouteDescriptor & {
  /**
   * Resolves the URL of the route based on the provided parameters.
   * Parameters that match with template keys in the route path are
   * injected directly, while others are appended as query parameters.
   */
  (params: T): string;
};

/**
 * Creates a static route.
 *
 * @param path - route path (e.g. `/home`).
 */
export function route(path: string): StaticRouteDescriptor;

/**
 * Creates a dynamic a route.
 *
 * @template T - type of the object that represents route parameters.
 * @param path - route path (e.g. `/products/:id`).
 */
export function route<T extends ParamsBase>(path: string): DynamicRouteDescriptor<T>;

export function route<T extends ParamsBase>(
  path: string
): StaticRouteDescriptor | DynamicRouteDescriptor<T> {
  // Parse the path and extract keys
  const pathTokens = parse(path);

  const pathKeys = pathTokens
    .map((token) => {
      // Poor man's pattern matching
      const key = token as Key;
      if (key.name && typeof key.name === 'string') {
        return key.name;
      } else {
        return null;
      }
    })
    .filter((key) => !!key);

  const pathResolve = tokensToFunction(pathTokens, {
    encode: (value) => encodeURIComponent(value)
  });

  // Create the descriptor function
  const descriptor = (params?: T) => {
    // Static route overload
    if (!params) {
      return path;
    }
    // Dynamic route overload
    else {
      // Get the URL with route parameters resolved
      const baseUrl = pathResolve(params);

      // Get the rest of parameters and add them as query
      const query = Object.entries(params)
        .filter(
          ([key, value]) =>
            !pathKeys.includes(key) && typeof value !== 'undefined' && value !== null
        )
        .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value))
        .join('&');

      return query ? baseUrl + '?' + query : baseUrl;
    }
  };

  // Preserve the original path string
  descriptor.path = path;

  return descriptor;
}
