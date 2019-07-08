/**
 *
 * ## PackageJson
 * This is a utility class that can operate on a package.json instance
 *
 *  @module PackageJson
 * @see module:PackageJson/codecs
 * @see module:PackageJson/types
 */

// external modules
import { fold } from 'fp-ts/lib/Either';
import { pipe } from 'fp-ts/lib/pipeable';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import * as t from 'io-ts';
import { join } from 'path';
import { PackageJsonCodec } from './codecs';

// local
import {
  IndexedPackageJsonScripts,
  PackageJsonScript,
  PackageJsonScriptCheck,
  RawPackageJson,
} from './types';

// Determine the paths of the codec that are invliad
const getPaths = <A>(v: t.Validation<A>): string[] =>
  pipe(
    v,
    fold(
      (errors) =>
        errors.map((error) => error.context.map(({ key }) => key).join('.')),
      () => ['no errors'],
    ),
  );

/**
 * Configuration for package.json class
 */
export type PackageJsonInput = {
  /** Path to the folder or package.json to parser */
  path: string;
  /** By default, the package.json will be type-checked, but if this should be skipped, set this to false */
  validate?: boolean;
};

/**
 * Class definition for PackageJson
 */
export default class PackageJson {
  /**
   * Decode a package.json file and ensure it matches our expected type
   *
   * @param packageJsonTxt - The package.json text
   * @returns The correctly typed package.json object
   */
  public static decode(packageJsonTxt: string): RawPackageJson {
    const decoded = PackageJsonCodec.decode(JSON.parse(packageJsonTxt));
    // Log errors on failure
    if (decoded._tag === 'Left') {
      console.log(getPaths(decoded));
      throw new Error(
        'Failed to decode package.json, check output above for errors',
      );
    }

    // Return the decoded package.json
    return decoded.right;
  }

  /** The path to the package.json file */
  public path: string;

  /** The current/raw package.json JSON */
  public value: RawPackageJson;

  /** Lookup from script name to metadata about it */
  public scriptLookup: IndexedPackageJsonScripts;

  /**
   * Read and modify a package.json file
   */
  public constructor({ path, validate = true }: PackageJsonInput) {
    // Ensure the path ends with a package.json file
    const pathWithPackageJson = path.endsWith('package.json')
      ? path
      : join(path, 'package.json');

    // Ensure the package.json exists
    if (!existsSync(pathWithPackageJson)) {
      throw new Error(
        `Package.json path does not exist: "${pathWithPackageJson}"`,
      );
    }

    /** Save the path to the package.json repo */
    this.path = pathWithPackageJson;

    // Decode the package.json text
    const packageJsonText = readFileSync(this.path, 'utf-8');
    this.value = validate
      ? PackageJson.decode(packageJsonText)
      : JSON.parse(packageJsonText);

    // Configure a quick lookup of all scripts
    this.scriptLookup = this.indexScripts();
  }

  /**
   * List the scripts in the package.json with their section header and comment
   *
   * @returns The list of scripts nicely packaged together (comments/commands in one object)
   */
  public listScripts(): PackageJsonScript[] {
    // Get the scripts
    const { scripts } = this.value;

    // The valid scripts
    const valid: PackageJsonScript[] = [];

    // The last header
    let lastHeader = '';

    Object.keys(scripts).forEach((name) => {
      // Set the header if found
      if (name.includes('####### ')) {
        lastHeader = name.split('#######')[1].trim();
        return;
      }

      valid.push({
        header: lastHeader,
        name,
        value: scripts[name],
      });
    });
    return valid;
  }

  /**
   * Update the package.json and write the new value to file
   *
   * @param path - The embedded key to update i.e. ['scripts', 'react']
   * @param value - The value to set i.e. ^1.1.3
   * @returns The updated package.json
   */
  public updatePackageJson<T>(path: string[], value: T): RawPackageJson {
    // We iterrate into the package.json and ensure that the path exists
    let ref: any = this.value; // eslint-disable-line @typescript-eslint/no-explicit-any

    // Set the value
    path.forEach((key, ind) => {
      if (!ref[key]) {
        ref[key] = typeof key === 'number' ? [] : {};
      }
      if (ind === path.length - 1) {
        ref[key] = value;
      } else {
        ref = ref[key];
      }
    });

    // Write the package.json back to disk with the full path
    this.write();

    // Return the updated package.json
    return this.value;
  }

  /**
   * Verify that the repository has a set of scripts
   *
   * @param lst - The list of expected script configurations to exist
   * @returns True if the package.json has all of the scripts specified by lst
   */
  public hasScripts(lst: PackageJsonScriptCheck[]): boolean {
    return this.missingScripts(lst).length === 0;
  }

  /**
   * Determine which scripts are missing
   *
   * @param lst - The list of scripts to look for
   * @returns The scripts from `lst` that are not defined correctly in the package.json
   */
  public missingScripts(
    lst: PackageJsonScriptCheck[],
  ): PackageJsonScriptCheck[] {
    return lst.filter(
      ({ name, header, value, valueIncludes }) =>
        !this.scriptLookup[name] ||
        this.scriptLookup[name].header !== header ||
        ((valueIncludes || value) &&
          (valueIncludes
            ? !this.scriptLookup[name].value.includes(valueIncludes)
            : this.scriptLookup[name].value !== value)),
    );
  }

  /**
   * Set the missing script values
   *
   * @param lst - The list of scripts to set
   * @returns Sets the missing scripts
   */
  public setScripts(lst: PackageJsonScriptCheck[]): void {
    const { scripts } = this.value;

    lst.forEach(({ name, after, value }) => {
      // Override the script if it exists
      if (scripts[name] && value) {
        scripts[name] = value; // eslint-disable-line no-param-reassign
        // Insert if after is provided
      } else if (after && value) {
        // Replace the scripts
        const newScripts: { [scriptName in string]: string } = {};

        // Loop over scripts
        Object.entries(scripts).forEach(([key, oldValue]) => {
          // Set the script
          newScripts[key] = oldValue;

          // If key is after, add the new script next
          if (key === after) {
            newScripts[name] = value;
          }
        });

        // Set the new scripts
        this.value.scripts = newScripts;
      }
    });

    // Write the changes to file
    this.write();
  }

  /**
   * Write the package json to file
   */
  public write(): void {
    // Configure a quick lookup of all scripts
    this.scriptLookup = this.indexScripts();

    // Write ot file
    writeFileSync(this.path, JSON.stringify(this.value, null, 2));
  }

  /**
   * Index the package.json scripts
   *
   * @returns The index of scripts
   */
  private indexScripts(): IndexedPackageJsonScripts {
    return this.listScripts().reduce(
      (acc, script) => Object.assign(acc, { [script.name]: script }),
      {},
    );
  }
}
