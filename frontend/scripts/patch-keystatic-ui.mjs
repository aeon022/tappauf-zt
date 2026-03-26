import fs from 'node:fs';
import path from 'node:path';

const EXPECTED_VERSIONS = {
  '@keystatic/core': '0.5.48',
  '@keystatic/astro': '5.0.6',
};

const getPackageVersion = (pkgName) => {
  const packageJsonPath = path.resolve(`node_modules/${pkgName}/package.json`);
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`[patch-keystatic-ui] Package not found: ${pkgName}`);
  }
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return pkg.version;
};

const assertExpectedVersion = (pkgName) => {
  const actual = getPackageVersion(pkgName);
  const expected = EXPECTED_VERSIONS[pkgName];
  if (actual !== expected) {
    throw new Error(
      `[patch-keystatic-ui] Unsupported ${pkgName} version ${actual}. Expected ${expected}. Review and update the patch script before continuing.`
    );
  }
};

const patchFile = (target, transform, label) => {
  if (!fs.existsSync(target)) {
    throw new Error(`[patch-keystatic-ui] File not found: ${target}`);
  }

  const source = fs.readFileSync(target, 'utf8');
  const next = transform(source);

  if (next !== source) {
    fs.writeFileSync(target, next);
    console.log(`[patch-keystatic-ui] Patched ${label}`);
    return;
  }

  console.log(`[patch-keystatic-ui] No changes needed for ${label}`);
};

const coreUiTarget = path.resolve('node_modules/@keystatic/core/dist/keystatic-core-ui.js');
assertExpectedVersion('@keystatic/core');
patchFile(
  coreUiTarget,
  (source) => {
    const originalColumns = `      return [...(hideStatusColumn ? [] : [{
        name: 'Status',
        key: STATUS,
        minWidth: 32,
        width: 32
      }]), {
        name: 'Slug',
        key: SLUG
      }, ...collection.columns.map(column => {`;

    const patchedColumns = `      return [...(hideStatusColumn ? [] : [{
        name: 'Status',
        key: STATUS,
        minWidth: 32,
        width: 32
      }]), ...collection.columns.map(column => {`;

    const originalRowBlock = `            children: [...(hideStatusColumn ? [] : [statusCell]), nameCell, ...collection.columns.map(column_0 => {
              var _item_0$data;
              let val;
              val = (_item_0$data = item_0.data) === null || _item_0$data === void 0 ? void 0 : _item_0$data[column_0];
              if (val == null) {
                val = undefined;
              } else {
                val = val + '';
              }
              return /*#__PURE__*/jsx(Cell, {
                textValue: val,
                children: /*#__PURE__*/jsx(Text, {
                  weight: "medium",
                  children: val
                })
              }, column_0 + item_0.name);
            })]
          }, 'key:' + item_0.name);`;

    const patchedRowBlock = `            children: [...(hideStatusColumn ? [] : [statusCell]), ...collection.columns.map(column_0 => {
              var _item_0$data;
              let val;
              val = (_item_0$data = item_0.data) === null || _item_0$data === void 0 ? void 0 : _item_0$data[column_0];
              if (val == null) {
                val = undefined;
              } else {
                val = val + '';
              }
              return /*#__PURE__*/jsx(Cell, {
                textValue: val,
                children: /*#__PURE__*/jsx(Text, {
                  weight: "medium",
                  children: val
                })
              }, column_0 + item_0.name);
            }), nameCell]
          }, 'key:' + item_0.name);`;

    let next = source;
    const isColumnPatchApplied = next.includes(patchedColumns) && !next.includes(originalColumns);
    const isRowPatchApplied = next.includes(patchedRowBlock) && !next.includes(originalRowBlock);

    if (!next.includes(originalColumns) && !isColumnPatchApplied) {
      throw new Error(
        '[patch-keystatic-ui] Could not find expected Keystatic core columns block. Upstream changed; patch needs review.'
      );
    }

    if (!next.includes(originalRowBlock) && !isRowPatchApplied) {
      throw new Error(
        '[patch-keystatic-ui] Could not find expected Keystatic core row block. Upstream changed; patch needs review.'
      );
    }

    if (next.includes(originalColumns)) {
      next = next.replace(originalColumns, patchedColumns);
    }

    if (next.includes(originalRowBlock)) {
      next = next.replace(originalRowBlock, patchedRowBlock);
    }

    return next;
  },
  'column order in keystatic-core-ui.js'
);

const astroUiTarget = path.resolve('node_modules/@keystatic/astro/dist/keystatic-astro-ui.js');
assertExpectedVersion('@keystatic/astro');
patchFile(
  astroUiTarget,
  (source) => {
    const originalEnvLine = "  value: import.meta.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG";
    const patchedEnvLine =
      "  value: typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG : undefined";

    if (!source.includes(originalEnvLine) && !source.includes(patchedEnvLine)) {
      throw new Error(
        '[patch-keystatic-ui] Could not find expected Astro env line. Upstream changed; patch needs review.'
      );
    }

    return source.includes(originalEnvLine) ? source.replace(originalEnvLine, patchedEnvLine) : source;
  },
  'Astro 6 env guard in keystatic-astro-ui.js'
);

const astroPageTarget = path.resolve('node_modules/@keystatic/astro/internal/keystatic-astro-page.astro');
patchFile(
  astroPageTarget,
  (source) => {
    const originalPage = `---
import { Keystatic } from './keystatic-page.js';

export const prerender = false;
---

<Keystatic client:only="react" />
`;

    const patchedPage = `---
import { Keystatic } from './keystatic-page.js';

export const prerender = false;
---

<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Tappauf ZT CMS</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  </head>
  <body>
    <Keystatic client:only="react" />
  </body>
</html>
`;

    if (!source.includes(originalPage) && !source.includes(patchedPage)) {
      throw new Error(
        '[patch-keystatic-ui] Could not find expected Keystatic Astro page wrapper. Upstream changed; patch needs review.'
      );
    }

    return source.includes(originalPage) ? source.replace(originalPage, patchedPage) : source;
  },
  'branding in keystatic-astro-page.astro'
);
