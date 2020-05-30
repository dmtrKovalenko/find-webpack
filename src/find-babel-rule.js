// @ts-check
const debug = require('debug')('find-webpack')
const path = require('path')
/**
 * Returns true if the provided loader path includes "babel-loader".
 * Uses current OS path separator to split the loader path correctly.
 */
const isBabelLoader = (loaderPath) => {
  if (!loaderPath) {
    return false
  }
  const loaderPathParts = loaderPath.split(path.sep)
  return loaderPathParts.some((pathPart) => pathPart === 'babel-loader')
}

const findBabelRule = (webpackOptions) => {
  if (!webpackOptions) {
    return
  }
  if (!webpackOptions.module) {
    return
  }
  debug('webpackOptions.module %o', webpackOptions.module)
  if (!Array.isArray(webpackOptions.module.rules)) {
    return
  }
  const oneOfRule = webpackOptions.module.rules.find((rule) =>
    Array.isArray(rule.oneOf),
  )
  if (!oneOfRule) {
    debug('could not find oneOfRule')
    return
  }
  debug('looking through oneOf rules')
  debug('oneOfRule.oneOf %o', oneOfRule.oneOf)
  oneOfRule.oneOf.forEach((rule) => debug('rule %o', rule))

  const babelRule = oneOfRule.oneOf.find(
    (rule) => rule.loader && isBabelLoader(rule.loader),
  )
  return babelRule
}

// see https://github.com/bahmutov/find-webpack/issues/7
const findBabelLoaderRule = (webpackOptions) => {
  debug('looking for babel-loader rule')
  if (!webpackOptions) {
    return
  }
  if (!webpackOptions.module) {
    return
  }
  debug('webpackOptions.module %o', webpackOptions.module)
  if (!Array.isArray(webpackOptions.module.rules)) {
    return
  }

  debug('webpack module rules')
  webpackOptions.module.rules.forEach((rule) => {
    debug('rule %o', rule)
  })
  const babelRule = webpackOptions.module.rules.find(
    (rule) => rule.loader === 'babel-loader',
  )
  if (!babelRule) {
    debug('could not find babel rule')
    return
  }

  debug('found Babel rule that applies to %s', babelRule.test.toString())
  return babelRule
}

const findBabelRuleWrap = (webpackOptions) => {
  let babelRule = findBabelRule(webpackOptions)
  if (!babelRule) {
    debug('could not find Babel rule using oneOf')
    babelRule = findBabelLoaderRule(webpackOptions)
  }

  if (!babelRule) {
    debug('could not find Babel rule')
    return
  }
  return babelRule
}

/**
 * Searches through the given Webpack config file to find Babel
 * loader and its options, then returns the plugins array reference.
 * If not found, returns undefined.
 * @returns {Array|undefined}
 */
const findBabelPlugins = (webpackOptions) => {
  const babelRule = findBabelRuleWrap(webpackOptions)

  if (!babelRule) {
    debug('could not find Babel rule')
    return
  }

  debug('babel rule %o', babelRule)
  if (!babelRule.options) {
    return
  }
  if (!Array.isArray(babelRule.options.plugins)) {
    return
  }

  return babelRule.options.plugins
}

module.exports = { findBabelRuleWrap, findBabelPlugins }
