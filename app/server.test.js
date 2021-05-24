const path = require('path');

test('main index.html file exists', () => {
  expect(path.join(__dirname, "index.html")).toBeTruthy();
});