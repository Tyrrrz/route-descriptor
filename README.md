# route-descriptor

[![Made in Ukraine](https://img.shields.io/badge/made_in-ukraine-ffd700.svg?labelColor=0057b7)](https://vshymanskyy.github.io/StandWithUkraine)
[![Build](https://img.shields.io/github/workflow/status/Tyrrrz/route-descriptor/CI/master)](https://github.com/Tyrrrz/route-descriptor/actions)
[![Coverage](https://img.shields.io/codecov/c/github/Tyrrrz/route-descriptor/master)](https://codecov.io/gh/Tyrrrz/route-descriptor)
[![Version](https://img.shields.io/npm/v/route-descriptor.svg)](http://npmjs.com/package/route-descriptor)
[![Downloads](https://img.shields.io/npm/dm/route-descriptor.svg)](http://npmjs.com/package/route-descriptor)
[![Discord](https://img.shields.io/discord/869237470565392384?label=discord)](https://discord.gg/2SUWKFnHSm)
[![Donate](https://img.shields.io/badge/donate-$$$-8a2be2.svg)](https://tyrrrz.me/donate)
[![Fuck Russia](https://img.shields.io/badge/fuck-russia-e4181c.svg?labelColor=000000)](https://twitter.com/tyrrrz/status/1495972128977571848)

> 🟢 **Project status**: active<sup>[[?]](https://github.com/Tyrrrz/.github/blob/master/docs/project-status.md)</sup>

This package provides the means to statically represent routes, which helps establish a single source of truth for generating links inside an application.

> 💡 This library works best with TypeScript.

## Install

- 📦 [npm](http://npmjs.com/package/route-descriptor): `npm i route-descriptor`

## Usage

Routes are created by calling the `route(...)` function with the route's path and a type that encapsulates its parameters.
This returns another function which can be further evaluated against a specific set of route parameters to resolve the matching URL.

### Describing a static route

Static routes are routes that have no parameters and, as a result, always resolve to the same URL.
To create a descriptor for a static route, call `route(...)` with just the route's path:

```ts
import { route } from 'route-descriptor';

const home = route('/home');

const href = home(); // '/home'
```

### Describing a dynamic route

Dynamic routes can resolve to different URLs depending on the specified parameters.
In order to create a descriptor for a dynamic route, call `route(...)` with a path template and a generic argument that defines the parameters it can accept:

```ts
import { route } from 'route-descriptor';

interface ProductParams {
  id: number;
}

const product = route<ProductParams>('/products/:id');

const href = product({ id: 3 }); // '/products/3'
```

To resolve the URL, the descriptor will try to match the parameter names with placeholders in the path template.
If some of the parameters don't match with any of the placeholders, they will be added as _query parameters_ instead:

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

### Retrieving the original path

Once descriptor is created, it's possible to retrieve its path template by accessing the `path` field:

```ts
import { route } from 'route-descriptor';

const profile = route<ProfileParams>('/profile/:id/:name?');

const path = profile.path; // '/profile/:id/:name?'
```

### Combining with routing libraries

This package can be used in combination with practically any client-side routing library.
For example, here is how to integrate it with [React Router](https://github.com/ReactTraining/react-router):

- `./src/routes.ts`:

```ts
// This module serves as a single source of truth for routing

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
  // To resolve route link, pass the parameters that the route expects
  
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

### Static validation via TypeScript

This package is most useful when paired with TypeScript, as it provides static validation for parameters.
For example, all of the following incorrect usages produce errors during compilation:

```ts
import { route } from 'route-descriptor';

const home = route('/home');

home({ id: 5 }); // <- error (static route can't accept parameters)

// ----

interface ProductParams {
  id: number;
  showComments?: boolean;
}

const product = route<ProductParams>('/products/:id');

product(); // <- error (dynamic route requires parameters)
product({ showComments: true }); // <- error (missing 'id')
product({ id: 3, name: 'apple' }); // <- error (unexpected 'name')
```
