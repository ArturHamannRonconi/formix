describe('EnvironmentConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should validate required MONGODB_URI', () => {
    delete process.env.MONGODB_URI;
    expect(() => {
      const { validateConfig } = require('./environment.config');
      validateConfig({ PORT: '3001', NODE_ENV: 'test' });
    }).toThrow();
  });

  it('should pass validation with all required vars', () => {
    expect(() => {
      const { validateConfig } = require('./environment.config');
      validateConfig({
        MONGODB_URI: 'mongodb://localhost:27017/test',
        PORT: '3001',
        NODE_ENV: 'test',
        JWT_ACCESS_SECRET: 'test-secret',
      });
    }).not.toThrow();
  });

  it('should validate required JWT_ACCESS_SECRET', () => {
    expect(() => {
      const { validateConfig } = require('./environment.config');
      validateConfig({ MONGODB_URI: 'mongodb://localhost:27017/test', NODE_ENV: 'test' });
    }).toThrow();
  });

  it('should use default PORT when not provided', () => {
    const { validateConfig } = require('./environment.config');
    const result = validateConfig({
      MONGODB_URI: 'mongodb://localhost:27017/test',
      NODE_ENV: 'test',
      JWT_ACCESS_SECRET: 'test-secret',
    });
    expect(result.PORT).toBeDefined();
  });
});
