import '@testing-library/jest-dom';

// Mock the fetch function
global.fetch = jest.fn(() =>
   Promise.resolve({
      json: () => Promise.resolve({}),
   })
);