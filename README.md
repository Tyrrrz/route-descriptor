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

- Supports both static and dynamic routes
- Supports both positional and query parameters
- Parameter validation via TypeScript
- Works in browser and NodeJS

## Usage

### Routes with parameters

The following example creates a route called `product` with expected parameters declared in `ProductParams`. The route itself is a function that can be invoked to resolve the actual URL.

```ts
import { route } from 'route-descriptor';

interface ProductParams {
  id: number;
}

const product = route<ProductParams>('/products/:id');

const href = product({ id: 3 }); // '/products/3'
```

### Routes with query parameters

Any parameter that doesn't match with a key in the route template is automatically mapped as a query parameter:

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

A route can also be defined without parameters:

```ts
import { route } from 'route-descriptor';

const home = route('/home');

const href = home(); // '/home'
```

### Routes with optional positional parameters

Some routes may have optional positional parameters. They need to be marked with the `?` modifier in the template:

```ts
import { route } from 'route-descriptor';

interface ProfileParams {
  id: number;
  name?: string;
}

const profile = route('/profile/:id/:name?');

const href = home({
  id: 13
}); // '/profile/13'
```

### Retrieving template

You can get the original template back as well, which may be necessary when plugging `route-descriptor` into a routing library:

```ts
import { route } from 'route-descriptor';

const profile = route('/profile/:id/:name?');

const template = profile.template; // '/profile/:id/:name?'
```

### Combining with `react-router`

It's possible to use `route-descriptor` with pretty much any routing library. For example, here is how to integrate it with [`react-router`](https://github.com/ReactTraining/react-router):

```ts
// ./src/routes.ts
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

```tsx
// ./src/App.tsx
import { Route, Switch, BrowserRouter, Link } from 'react-router-dom';
import routes from './routes';

function Home() {
  return (
    <div>
      <Link to={routes.home()}>Home</Link>
      <Link to={routes.profile({ id: 1, name: 'JohnDoe' })}>My Profile</Link>
      <Link to={routes.product({ id: 3 })}>Random Product</Link>
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
        <Route path={routes.profile.template} component={Profile} />
        <Route path={routes.product.template} component={Product} />
        <Route path={routes.home.template} component={Home} />
      </Switch>
    </BrowserRouter>
  );
}
```

### TypeScript integration

This package is most useful when paired with TypeScript, as it provides static validation for parameters. For example, all of the following incorrect usages produce errors during compilation:

```ts
import { route } from 'route-descriptor';

// Static route cannot accept parameters
const home = route('/home');
home({ id: 5 }); // <- error

// Dynamic route must be provided with parameters
const product = route<ProductParams>('/products/:id');
product(); // <- error

// Parameters must match the interface type
product({ showComments: true }); // <- error (missing 'id')
product({ id: 3, name: 'apple' }); // <- error (unexpected 'name')
```

If you want, it's also possible to use `route-descriptor` with plain JavaScript, which is still useful for establishing a single source of truth, but doesn't help with parameter validation:

```js
import { route } from 'route-descriptor';

const product = route('/products/:id');
const href = product({ id: 3 });
```
