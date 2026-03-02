module.exports = {
  extends: ['stylelint-config-standard-scss'],
  rules: {
    'at-rule-no-unknown': null,
    'scss/at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'layer', 'variants', 'responsive', 'screen'],
      },
    ],
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global', 'local'],
      },
    ],
    'selector-class-pattern': null,
    'keyframes-name-pattern': null,
    'media-feature-range-notation': null,
    'color-function-alias-notation': null,
    'color-function-notation': null,
    'alpha-value-notation': null,
    'value-keyword-case': null,
    'color-hex-length': null,
    'custom-property-empty-line-before': null,
    'custom-property-pattern': null,
    'property-no-vendor-prefix': null,
    'declaration-empty-line-before': null,
    'rule-empty-line-before': null,
    'selector-not-notation': null,
    'length-zero-no-unit': null,
    'declaration-block-no-redundant-longhand-properties': null,
    'shorthand-property-no-redundant-values': null,
  },
}
