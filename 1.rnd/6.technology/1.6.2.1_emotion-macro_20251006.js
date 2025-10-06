import { transformExpressionWithStyles, createTransformerMacro } from './utils'

const isAlreadyTranspiled = path => {
  if (!path.isCallExpression()) {
    return false
  }

  const firstArgPath = path.get('arguments.0')

  if (!firstArgPath) {
    return false
  }

  if (!firstArgPath.isConditionalExpression()) {
    return false
  }

  const alternatePath = firstArgPath.get('alternate')

  if (!alternatePath.isObjectExpression()) {
    return false
  }

  const properties = new Set(
    alternatePath.get('properties').map(p => p.node.key.name)
  )

  return ['name', 'styles'].every(p => properties.has(p))
}

const createEmotionTransformer =
  (isPure /*: boolean */) =>
  (
    { state, babel, importSource, reference, importSpecifierName } /*: Object */
  ) => {
    const path = reference.parentPath

    if (isAlreadyTranspiled(path)) {
      return
    }

    if (isPure) {
      path.addComment('leading', '#__PURE__')
    }

    const node = transformExpressionWithStyles({
      babel,
      state,
      path,
      shouldLabel: true
    })
    if (node) {
      path.node.arguments[0] = node
    }
  }

export const transformers = {
  css: createEmotionTransformer(true),
  injectGlobal: createEmotionTransformer(false),
  keyframes: createEmotionTransformer(true)
}

export const createEmotionMacro = (importSource /*: string */) =>
  createTransformerMacro(transformers, { importSource })
