# route-descriptor

[![Build](https://github.com/Tyrrrz/route-descriptor/workflows/CI/badge.svg?branch=master)](https://github.com/Tyrrrz/route-descriptor/actions)
[![Coverage](https://codecov.io/gh/Tyrrrz/route-descriptor/branch/master/graph/badge.svg)](https://codecov.io/gh/Tyrrrz/route-descriptor)
[![Version](https://img.shields.io/npm/v/route-descriptor.svg)](http://npmjs.com/package/route-descriptor)
[![Downloads](https://img.shields.io/npm/dm/route-descriptor.svg)](http://npmjs.com/package/route-descriptor)
[![Donate](https://img.shields.io/badge/donate-$$$-purple.svg)](https://tyrrrz.me/donate)

This package provides an interface to statically represent routing configuration in your application. It lets you establish a single source of truth for generating links, which avoids code duplication and makes refactoring easier. **Works best with TypeScript.**

## Download

- [npm](http://npmjs.com/package/route-descriptor): `npm i route-descriptor`

## Features

- Supports static and dynamic routes
- Supports positional and query parameters
- Parameter validation via TypeScript
- Works in browser and NodeJS

## Usage

### Routes with parameters

The following example creates a dynamic route called `product` with expected parameters declared in `ProductParams`. The route itself is a function that can be invoked to resolve the actual URL:

```ts
import { route } from 'route-descriptor';

interface ProductParams {
  id: number;
}

const product = route<ProductParams>('/products/:id');

const href = product({ id: 3 }); // '/products/3'
```

### Routes with query parameters

Any parameters that don't match with keys in the route path are automatically mapped as query parameters:

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

### Routes without parameters

You can also create a static route, i.e. such that doesn't expect any parameters. Invoking it simply returns the path without any replacements:

```ts
import { route } from 'route-descriptor';

const home = route('/home');

const href = home(); // '/home'
```

### Routes with optional positional parameters

Some routes may have positional parameters which are optional. They need to be marked with the `?` modifier in the path template:

```ts
import { route } from 'route-descriptor';

interface ProfileParams {
  id: number;
  name?: string;
}

const profile = route<ProfileParams>('/profile/:id/:name?');

const href = profile({
  id: 13
}); // '/profile/13'
```

### Retrieving the path

Once the route is created, you can get the original path back too. This may be convenient when plugging `route-descriptor` into a routing library of your choice:

```ts
import { route } from 'route-descriptor';

const profile = route<ProfileParams>('/profile/:id/:name?');

const path = profile.path; // '/profile/:id/:name?'
```

### Combining with `react-router`

It's possible to use `route-descriptor` with pretty much any client-side routing library. For example, here is how to integrate it with [`react-router`](https://github.com/ReactTraining/react-router):

- `./src/routes.ts`:

```ts
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

As you can see, the routes are defined in a single place (the `routes.ts` module) from which they referenced throughout the application. This makes changing the paths and route parameters easy in the future, as you don't have to worry about updating URLs in every anchor tag.

### TypeScript integration

This package is most useful when paired with TypeScript, as it provides static validation for parameters. For example, all of the following incorrect usages produce errors during compilation:

```ts
import { route } from 'route-descriptor';

const home = route('/home');
home({ id: 5 }); // <- error (static route can't accept parameters)

const product = route<ProductParams>('/products/:id');
product(); // <- error (dynamic route requires parameters)
product({ showComments: true }); // <- error (missing 'id')
product({ id: 3, name: 'apple' }); // <- error (unexpected 'name')
```

If you want, it's also possible to use `route-descriptor` with plain JavaScript, which is still useful for establishing a single source of truth, but doesn't help with parameter validation:

```js
import { route } from 'route-descriptor';

// Works in plain JS
const product = route('/products/:id');
const href = product({ id: 3 });
```
