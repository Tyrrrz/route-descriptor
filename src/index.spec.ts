import { route } from './index';

interface ProductListParams {
  page?: number;
  itemsPerPage?: number;
  filter?: string;
}

interface ProductPageParams {
  id: number;
  category: string;
  viewFullDetails?: boolean;
}

interface ProfilePageParams {
  id: number;
  name?: string;
}

describe('route()', () => {
  it('can generate a URL without parameters if the route is static', () => {
    // Arrange
    const home = route('/home');

    // Act
    const url = home();

    // Assert
    expect(url).toBe('/home');
  });

  it('can generate a URL with default parameters if the route has no required parameters', () => {
    // Arrange
    const products = route<ProductListParams>('/products');

    // Act
    const url = products({});

    // Assert
    expect(url).toBe('/products');
  });

  it('can generate a URL with positional parameters', () => {
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

  it('can generate a URL with query parameters', () => {
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

  it('can generate a URL with both positional and query parameters', () => {
    // Arrange
    const product = route<ProductPageParams>('/products/:category/:id');

    // Act
    const url = product({
      id: 3,
      category: 'boxes',
      viewFullDetails: true
    });

    // Assert
    expect(url).toBe('/products/boxes/3?viewFullDetails=true');
  });

  it('can generate a URL without some of the optional positional parameters', () => {
    // Arrange
    const profile = route<ProfilePageParams>('/profiles/:id/:name?');

    // Act
    const url = profile({
      id: 3
    });

    // Assert
    expect(url).toBe('/profiles/3');
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
