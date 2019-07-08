/**
 *
 * ## PackageJson Type Definitions
 * Type definitions for the PackageJson class.
 *
 * * TODO https://gist.github.com/iainreid820/5c1cc527fe6b5b7dba41fec7fe54bf6e
 *
 * @module PackageJson/types
 * @see module:PackageJson
 */

// external modules
import * as t from 'io-ts';

// local
import { PackageJsonCodec } from './codecs';

/**
 * Make selected object keys defined by K optional in type T
 */
type Optionalize<T, K extends keyof T> = Omit<T, K> & Partial<T>;

/**
 * All information about a specific package.json script, bundled together into an object
 */
export type PackageJsonScript = {
  /** The name of the script (the command that is run) */
  name: string;
  /** The section that the script belongs to */
  header: string;
  /** The command that is run */
  value: string;
};

/**
 * Lookup scripts by name
 */
export type IndexedPackageJsonScripts = {
  [scriptName in string]: PackageJsonScript;
};

/**
 * A check that a package.json script is fully configured
 */
export type PackageJsonScriptCheck = Optionalize<PackageJsonScript, 'value'> & {
  /** The command must container this string */
  valueIncludes?: string;
  /** The script is expected after some other script */
  after?: string;
};

/**
 * The raw configuration or a package.json file. This is a more strictly typed to be the formats that Transcend expects for its repositories.
 */
export type RawPackageJson = t.TypeOf<typeof PackageJsonCodec>;
