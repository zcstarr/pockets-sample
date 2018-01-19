module.exports = {
  "parser": "babel-eslint",
  "extends": [
    "standard",
    "eslint:recommended"
  ],
  "env": {
    "node": true,
    "mocha": true
  },
  "rules": {
    "key-spacing"          : 0,
    "jsx-quotes"           : [2, "prefer-single"],
    "max-len"              : [2, 120, 2],
    "no-console"           :  0,
    "object-curly-spacing" : [2, "always"]
  },
  "parserOptions": {
    "ecmaVersion": 2017,
    "sourceType": "module"
  }
};
