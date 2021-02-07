# route-descriptor

[![Build](https://github.com/Tyrrrz/route-descriptor/workflows/CI/badge.svg?branch=master)](https://github.com/Tyrrrz/route-descriptor/actions)
[![Coverage](https://codecov.io/gh/Tyrrrz/route-descriptor/branch/master/graph/badge.svg)](https://codecov.io/gh/Tyrrrz/route-descriptor)
[![Version](https://img.shields.io/npm/v/route-descriptor.svg)](http://npmjs.com/package/route-descriptor)
[![Downloads](https://img.shields.io/npm/dm/route-descriptor.svg)](http://npmjs.com/package/route-descriptor)
[![Donate](https://img.shields.io/badge/donate-$$$-purple.svg)](https://tyrrrz.me/donate)

This package provides the means to statically represent routes, helping you establish a single source of truth for generating links inside your application.

**Works best with TypeScript.**

## Download

- [npm](http://npmjs.com/package/route-descriptor): `npm i route-descriptor`

## Usage

The package's main entry point is the `route(...)` function exported from `route-descriptor` module.
You can use it to create a route descriptor by specifying the route's path and the type that encapsulates its parameters.
The resulting route descriptor is itself another function that accepts the route's parameters and uses them to resolve the matching URL.

### Static route (no parameters)

A static route is a route that has no parameters and, as a result, always has the same URL.
To create a descriptor for a static route, call `route(...)` with a plain path and without specifying any generic arguments:

```ts
import { route } from 'route-descriptor';

const home = route('/home');

const href = home(); // '/home'
```

A descriptor for a static route is effectively a glorified constant and is only useful in combination with dynamic routes.

### Dynamic route (with parameters)

A dynamic route can have different URLs depending on the input parameters.
In order to create a descriptor for a dynamic route, call `route(...)` with a path template and specify the type that encapsulates the parameters it accepts:

```ts
import { route } from 'route-descriptor';

interface ProductParams {
  id: number;
}

const product = route<ProductParams>('/products/:id');

const href = product({ id: 3 }); // '/products/3'
```

Note that a dynamic route descriptor always expects an object with parameters, so calling it without passing one will result in a compilation error.
Similarly, passing an object that doesn't match the type specified as the generic argument will also produce an error.

When resolving the URL, the route descriptor will try to match the parameter names with template placeholders in the path.
If a parameter doesn't match with any of the placeholders, it will be added as a _query parameter_ instead:

```ts
import { route } from 'route-descriptor';

interface ProductParams {
  id: number;
  showComments?: boolean;
}

const product = route<ProductParams>('/products/:id');

const href = product({
  id: 3,
  showComments: true
}); // '/products/3?showComments=true'
```

### Getting the original path

Once the descriptor is created, it may be useful to retrieve the path template once again, for example to feed it into a router library.
You can do that by accessing the `path` field on the descriptor:

```ts
import { route } from 'route-descriptor';

const profile = route<ProfileParams>('/profile/:id/:name?');

const path = profile.path; // '/profile/:id/:name?'
```

### Combining with React Router

It's possible to use `route-descriptor` with virtually any client-side routing library.
For example, here is how to integrate it with [React Router](https://github.com/ReactTraining/react-router):

- `./src/routes.ts`:

```ts
// This module serves as a single source of truth
// for routes in our application.

import { route } from 'route-descriptor';

interface ProductParams {
  id: number;
  showComments?: boolean;
}

interface ProfileParams {
  id: number;
  name?: string;
}

export default {
  home: route('/home'),
  product: route<ProductParams>('/products/:id'),
  profile: route<ProfileParams>('/profile/:id/:name?')
};
```

- `./src/App.tsx`:

```tsx
import { Route, Switch, BrowserRouter, Link } from 'react-router-dom';
import routes from './routes';

function Home() {
  // To resolve a link for a route, we need to pass
  // the parameters that the route expects.
  
  return (
    <div>
      <Link to={routes.home()}>Home</Link>
      <Link to={routes.profile({ id: 1, name: 'JohnDoe' })}>My Profile</Link>
      <Link to={routes.product({ id: 3, showComments: true })}>Random Product</Link>
    </div>
  );
}

function Product() {
  /* ... */
}

function Profile() {
  /* ... */
}

export default function App() {
  // We can use the `path` field to retrieve the original
  // path template and feed it to react-router.

  return (
    <BrowserRouter>
      <Switch>
        <Route path={routes.profile.path} component={Profile} />
        <Route path={routes.product.path} component={Product} />
        <Route path={routes.home.path} component={Home} />
      </Switch>
    </BrowserRouter>
  );
}
```

### TypeScript integration

This package is most useful when paired with TypeScript, as it provides static validation for parameters.
For example, all of the following incorrect usages produce errors during compilation:

```ts
import { route } from 'route-descriptor';

const home = route('/home');
home({ id: 5 }); // <- error (static route can't accept parameters)

const product = route<ProductParams>('/products/:id');
product(); // <- error (dynamic route requires parameters)
product({ showComments: true }); // <- error (missing 'id')
product({ id: 3, name: 'apple' }); // <- error (unexpected 'name')
```

If you want, it's also possible to use `route-descriptor` with plain JavaScript, which is still useful to achieve a single source of truth, but doesn't help with parameter validation:

```js
import { route } from 'route-descriptor';

// Works in plain JS
const product = route('/products/:id');
const href = product({ id: 3 });
```
