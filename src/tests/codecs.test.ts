/**
 *
 * ## Test codecs
 * Test the codecs for the package.json type-guard
 *
 * @memberof tests/codecs
 */

// external modules
import { expect } from 'chai';
import { readFileSync } from 'fs';
import { join } from 'path';

// local
import PackageJson from '../index';

describe('codecs.PackageJsonCodec', () => {
  it('should validate the package.json in this repository', () => {
    const packageJsonTxt = readFileSync(
      join(__dirname, '..', '..', 'package.json'),
      'utf-8',
    );
    const decoded = PackageJson.decode(packageJsonTxt);
    expect(decoded.name).equals('@transcend-io/package-json');
  });
});
