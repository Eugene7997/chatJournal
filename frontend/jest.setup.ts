import '@testing-library/jest-dom'

// Provide dummy env vars so API route modules load without errors in tests.
// Use ??= so real values passed via the environment (e.g. for LLM integration
// tests) are not clobbered.
process.env.OPENROUTER_API_KEY ??= 'test-openrouter-key'
process.env.AUTH0_M2M_CLIENT_ID ??= 'test-m2m-client-id'
process.env.AUTH0_M2M_CLIENT_SECRET ??= 'test-m2m-secret'
process.env.AUTH0_M2M_DOMAIN ??= 'test.auth0.com'
process.env.AUTH0_DOMAIN ??= 'test.auth0.com'
process.env.DB_URL ??= 'postgresql://test'
