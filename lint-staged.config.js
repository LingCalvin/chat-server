module.exports = {
  '**/*.ts': [
    (filenames) => `eslint ${filenames.join(' ')} --max-warnings 0`,
    (filenames) =>
      filenames.map((filename) => `prettier --write '${filename}'`),
  ],
};
