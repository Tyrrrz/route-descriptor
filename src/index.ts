import { Key, parse, tokensToFunction } from 'path-to-regexp';

// eslint-disable-next-line @typescript-eslint/ban-types
type ParamsBase = object;

/**
 * Describes a route.
 */
export interface RouteDescriptor {
  /**
   * Template used to describe the route.
   */
  readonly template: string;
}

/**
 * Describes a route that does not accept parameters.
 */
export interface StaticRouteDescriptor extends RouteDescriptor {
  /**
   * Resolves the URL of the route.
   * For a static route, this simply returns the template.
   */
  (): string;
}

/**
 * Describes a route that accepts parameters.
 */
export interface DynamicRouteDescriptor<T extends ParamsBase> extends RouteDescriptor {
  /**
   * Resolves the URL of the route based on the provided parameters.
   */
  (params: T): string;
}

/**
 * Creates a static route.
 *
 * @param template - route template (e.g. `/home`).
 */
export function route(template: string): StaticRouteDescriptor;

/**
 * Creates a dynamic a route.
 *
 * @param template - route template (e.g. `/products/:id`).
 * @param T - type of the object that represents route parameters.
 */
export function route<T extends ParamsBase>(template: string): DynamicRouteDescriptor<T>;

export function route<T extends ParamsBase>(
  template: string
): StaticRouteDescriptor | DynamicRouteDescriptor<T> {
  // Parse the template and extract route parameters
  const templateTokens = parse(template);

  const templateKeys = templateTokens
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

  const templateResolve = tokensToFunction(templateTokens);

  // Create the descriptor function
  const descriptor = (params?: T) => {
    // Static route overload
    if (!params) {
      return template;
    }
    // Dynamic route overload
    else {
      // Get the URL with route parameters resolved
      const baseUrl = templateResolve(params);

      // Get the rest of parameters and add them as query
      const query = Object.entries(params)
        .filter(([key]) => !templateKeys.includes(key))
        .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(value))
        .join('&');

      return query ? baseUrl + '?' + query : baseUrl;
    }
  };

  // Preserve the original template string
  descriptor.template = template;

  return descriptor;
}
