import fs from 'node:fs';
import path from 'node:path';

const patchFile = (target, transform, label) => {
  if (!fs.existsSync(target)) {
    console.warn(`[patch-keystatic-ui] File not found: ${target}`);
    return;
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
patchFile(
  astroUiTarget,
  (source) => {
    const originalEnvLine = "  value: import.meta.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG";
    const patchedEnvLine =
      "  value: typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG : undefined";
    return source.includes(originalEnvLine) ? source.replace(originalEnvLine, patchedEnvLine) : source;
  },
  'Astro 6 env guard in keystatic-astro-ui.js'
);
