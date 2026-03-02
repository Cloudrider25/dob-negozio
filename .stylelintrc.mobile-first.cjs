module.exports = {
  extends: ['./.stylelintrc.cjs'],
  rules: {
    // Mobile-first guardrail: disallow desktop-first breakpoints.
    'media-feature-name-disallowed-list': ['max-width', 'max-height'],
  },
}
