import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve('node_modules/@keystatic/core/dist/keystatic-core-ui.js');

if (!fs.existsSync(target)) {
  console.warn(`[patch-keystatic-ui] File not found: ${target}`);
  process.exit(0);
}

let source = fs.readFileSync(target, 'utf8');

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

if (source.includes(originalColumns)) {
  source = source.replace(originalColumns, patchedColumns);
}

if (source.includes(originalRowBlock)) {
  source = source.replace(originalRowBlock, patchedRowBlock);
}

fs.writeFileSync(target, source);
console.log('[patch-keystatic-ui] Patched column order in keystatic-core-ui.js');
