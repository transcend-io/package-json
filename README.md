# package-json

[![Build Status](https://travis-ci.com/transcend-io/package-json.svg?token=dSiqFoEr9c1WZuWwxbXE&branch=master)](https://travis-ci.com/transcend-io/package-json)

Simple class for manipulating a package.json

```ts
const packageJson = new PackageJson({ path: '/path/to/dir/package.json' });
console.log(packageJson.value)
```
