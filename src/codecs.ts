/**
 *
 * ## PackageJson Codecs
 * Runtime boundary parser for validating a package.json
 *
 * @module PackageJson/codecs
 * @see module:PackageJson
 * @see https://gist.github.com/iainreid820/5c1cc527fe6b5b7dba41fec7fe54bf6e
 */

// external modules
import * as t from 'io-ts';

/**
 * The types that are required in a transcend package.json
 */
export const RequiredPackageJsonCodec = t.type({
  /** The name of the repository */
  name: t.string,
  /** The version of the repository */
  version: t.string,
  /** The package's description */
  description: t.string,
  /** The homepage of the package */
  homepage: t.string,
  /** The package's bug reporting URL */
  bugs: t.string,
  /** The package's license */
  license: t.string,
  /** The package's author */
  author: t.string,
  /** The repository configuration */
  repository: t.type({
    /** Type of repository (usually git) */
    type: t.string,
    /** URL of the repository */
    url: t.string,
  }),
  /** The entry path for the repository */
  main: t.string,
  /** Indicates if the repository is private */
  private: t.boolean,
  /** The engines that are required to run the package */
  engines: t.record(t.string, t.string),
  /** The module system in use */
  moduleSystem: t.keyof({
    es6: null,
    commonJs: null,
    typescript: null,
  }),
  /** The scripts available in the repo */
  scripts: t.record(t.string, t.string),
  /** The required dependencies */
  dependencies: t.record(t.string, t.string),
  /** The required dev dependencies */
  devDependencies: t.record(t.string, t.string),
});

/**
 * The types that are optional in a transcend package.json
 */
export const OptionalPackageJsonCodec = t.partial({
  /** Keywords to search on in npm */
  keywords: t.array(t.string),
  /** The local port that the server runs on */
  port: t.number,
  /** Additional contributors */
  contributors: t.array(t.string),
  /** Files to include when publishing the package */
  files: t.array(t.string),
  /** Commands to be installed in the node_modules bin */
  bin: t.record(t.string, t.string),
  /** Man URL */
  man: t.string,
  /** Optional dependencies */
  optionalDependencies: t.record(t.string, t.string),
  /** Peer dependencies */
  peerDependencies: t.record(t.string, t.string),
  /** TODO stricter type - The optional checks that the repository should run */
  optionalChecks: t.array(t.string),
});

/**
 * The full package.json codec used to validate package.json configurations
 */
export const PackageJsonCodec = t.intersection([
  RequiredPackageJsonCodec,
  OptionalPackageJsonCodec,
]);
