import { route } from './index';

interface ProductListParams {
  page?: number;
  itemsPerPage?: number;
  filter?: string;
}

interface ProductPageParams {
  id: number;
  category: string;
  color?: string;
  viewFullDetails?: boolean;
}

interface ProfilePageParams {
  id: number;
  name?: string;
}

describe('route()', () => {
  it('works without parameters if the route is static', () => {
    // Arrange
    const home = route('/home');

    // Act
    const url = home();

    // Assert
    expect(url).toBe('/home');
  });

  it('works with default parameters if the route has no required parameters', () => {
    // Arrange
    const products = route<ProductListParams>('/products');

    // Act
    const url = products({});

    // Assert
    expect(url).toBe('/products');
  });

  it('works with positional parameters', () => {
    // Arrange
    const product = route<ProductPageParams>('/products/:category/:id');

    // Act
    const url = product({
      id: 3,
      category: 'boxes'
    });

    // Assert
    expect(url).toBe('/products/boxes/3');
  });

  it('works with query parameters', () => {
    // Arrange
    const product = route<ProductListParams>('/products');

    // Act
    const url = product({
      page: 14,
      filter: 'big'
    });

    // Assert
    expect(url).toBe('/products?page=14&filter=big');
  });

  it('works with both positional and query parameters', () => {
    // Arrange
    const product = route<ProductPageParams>('/products/:category/:id');

    // Act
    const url = product({
      id: 3,
      category: 'boxes',
      color: 'red',
      viewFullDetails: true
    });

    // Assert
    expect(url).toBe('/products/boxes/3?color=red&viewFullDetails=true');
  });

  it('works with some of the optional positional parameters omitted', () => {
    // Arrange
    const profile = route<ProfilePageParams>('/profiles/:id/:name?');

    // Act
    const url = profile({
      id: 3
    });

    // Assert
    expect(url).toBe('/profiles/3');
  });

  it('correctly encodes parameters', () => {
    // Arrange
    const product = route<ProductPageParams>('/products/:category/:id');

    // Act
    const url = product({
      id: 3,
      category: 'dogs and cats <3',
      color: 'black & yellow'
    });

    // Assert
    expect(url).toBe('/products/dogs%20and%20cats%20%3C3/3?color=black%20%26%20yellow');
  });

  it('can return its template', () => {
    // Arrange
    const profile = route<ProfilePageParams>('/profiles/:id/:name?');

    // Act
    const template = profile.template;

    // Assert
    expect(template).toBe('/profiles/:id/:name?');
  });
});
