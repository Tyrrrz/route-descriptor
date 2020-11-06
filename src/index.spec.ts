import { route } from './index';

describe('route()', () => {
  it('static route can be resolved without passing parameters', () => {
    // Arrange
    const r = route('/page');

    // Act
    const url = r();

    // Assert
    expect(url).toBe('/page');
  });

  it('dynamic route can be resolved by passing positional parameters', () => {
    // Arrange
    const r = route<{ param1: string; param2: number }>('/page/:param1/:param2');

    // Act
    const url = r({
      param1: 'foo',
      param2: 3
    });

    // Assert
    expect(url).toBe('/page/foo/3');
  });

  it('dynamic route can be resolved by passing query parameters', () => {
    // Arrange
    const r = route<{ param1: number; param2: string }>('/page');

    // Act
    const url = r({
      param1: 14,
      param2: 'foo'
    });

    // Assert
    expect(url).toBe('/page?param1=14&param2=foo');
  });

  it('dynamic route can be resolved by passing both positional and query parameters', () => {
    // Arrange
    const r = route<{
      param1: string;
      param2: number;
      param3: string;
      param4: boolean;
    }>('/page/:param1/:param2');

    // Act
    const url = r({
      param1: 'foo',
      param2: 3,
      param3: 'bar',
      param4: true
    });

    // Assert
    expect(url).toBe('/page/foo/3?param3=bar&param4=true');
  });

  it('dynamic route can be resolved while omitting some of the optional positional parameters', () => {
    // Arrange
    const r = route<{ param1: number; param2?: string }>('/page/:param1/:param2?');

    // Act
    const url = r({
      param1: 3
    });

    // Assert
    expect(url).toBe('/page/3');
  });

  it('dynamic route can be resolved by passing an empty object if all parameters are optional', () => {
    // Arrange
    const r = route<{ param1?: number; param2?: string }>('/page/:param1?');

    // Act
    const url = r({});

    // Assert
    expect(url).toBe('/page');
  });

  it('dynamic route can be resolved by passing an object that contains undefined values for positional parameters', () => {
    // Arrange
    const r = route<{ param1?: number; param2?: string }>('/page/:param1?');

    // Act
    const url = r({ param1: undefined });

    // Assert
    expect(url).toBe('/page');
  });

  it('dynamic route can be resolved by passing an object that contains null values for positional parameters', () => {
    // Arrange
    const r = route<{ param1?: number | null; param2?: string }>('/page/:param1?');

    // Act
    const url = r({ param1: null });

    // Assert
    expect(url).toBe('/page');
  });

  it('dynamic route can be resolved by passing an object that contains undefined values for query parameters', () => {
    // Arrange
    const r = route<{ param1?: number; param2?: string }>('/page/:param1?');

    // Act
    const url = r({ param1: 13, param2: undefined });

    // Assert
    expect(url).toBe('/page/13');
  });

  it('dynamic route can be resolved by passing an object that contains null values for query parameters', () => {
    // Arrange
    const r = route<{ param1?: number; param2?: string | null }>('/page/:param1?');

    // Act
    const url = r({ param1: 13, param2: null });

    // Assert
    expect(url).toBe('/page/13');
  });

  it('dynamic route can be resolved while correctly encoding parameter values', () => {
    // Arrange
    const r = route<{ param1: string; param2: number; param3: string }>('/page/:param1/:param2');

    // Act
    const url = r({
      param1: 'dogs and cats <3',
      param2: 3,
      param3: 'black & yellow'
    });

    // Assert
    expect(url).toBe('/page/dogs%20and%20cats%20%3C3/3?param3=black%20%26%20yellow');
  });

  it('dynamic route can return its own path', () => {
    // Arrange
    const r = route<{ param1: number; param2?: string }>('/page/:param1/:param2?');

    // Act
    const path = r.path;

    // Assert
    expect(path).toBe('/page/:param1/:param2?');
  });
});
