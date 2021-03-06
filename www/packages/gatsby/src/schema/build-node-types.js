// @flow
const _ = require(`lodash`)
const {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLID,
  GraphQLList,
} = require(`graphql`)

const apiRunner = require(`../utils/api-runner-node`)
const { inferObjectStructureFromNodes } = require(`./infer-graphql-type`)
const {
  inferInputObjectStructureFromFields,
} = require(`./infer-graphql-input-fields-from-fields`)
const {
  inferInputObjectStructureFromNodes,
} = require(`./infer-graphql-input-fields`)
const { nodeInterface } = require(`./node-interface`)
const { getNodes, getNode, getNodeAndSavePathDependency } = require(`../redux`)
const { createPageDependency } = require(`../redux/actions/add-page-dependency`)
const { setFileNodeRootType } = require(`./types/type-file`)
const { clearTypeExampleValues } = require(`./data-tree-utils`)

import type { ProcessedNodeType } from "./infer-graphql-type"

type TypeMap = { [typeName: string]: ProcessedNodeType }

module.exports = async () => {
  const types = _.groupBy(getNodes(), node => node.internal.type)
  const processedTypes: TypeMap = {}

  clearTypeExampleValues()

  // Reset stored File type to not point to outdated type definition
  setFileNodeRootType(null)

  function createNodeFields(type: ProcessedNodeType) {
    const defaultNodeFields = {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: `The id of this node.`,
      },
      parent: {
        type: nodeInterface,
        description: `The parent of this node.`,
        resolve(node, a, context) {
          return getNodeAndSavePathDependency(node.parent, context.path)
        },
      },
      children: {
        type: new GraphQLList(nodeInterface),
        description: `The children of this node.`,
        resolve(node, a, { path }) {
          return node.children.map(id => getNodeAndSavePathDependency(id, path))
        },
      },
    }

    // Create children fields for each type of children e.g.
    // "childrenMarkdownRemark".
    const childNodesByType = _(type.nodes)
      .flatMap(({ children }) => children.map(getNode))
      .groupBy(
        node => (node.internal ? _.camelCase(node.internal.type) : undefined)
      )
      .value()

    Object.keys(childNodesByType).forEach(childNodeType => {
      // Does this child type have one child per parent or multiple?
      const maxChildCount = _.maxBy(
        _.values(_.groupBy(childNodesByType[childNodeType], c => c.parent)),
        g => g.length
      ).length

      if (maxChildCount > 1) {
        defaultNodeFields[_.camelCase(`children ${childNodeType}`)] = {
          type: new GraphQLList(processedTypes[childNodeType].nodeObjectType),
          description: `The children of this node of type ${childNodeType}`,
          resolve(node, a, { path }) {
            const filteredNodes = node.children
              .map(id => getNode(id))
              .filter(
                ({ internal }) => _.camelCase(internal.type) === childNodeType
              )

            // Add dependencies for the path
            filteredNodes.forEach(n =>
              createPageDependency({ path, nodeId: n.id })
            )
            return filteredNodes
          },
        }
      } else {
        defaultNodeFields[_.camelCase(`child ${childNodeType}`)] = {
          type: processedTypes[childNodeType].nodeObjectType,
          description: `The child of this node of type ${childNodeType}`,
          resolve(node, a, { path }) {
            const childNode = node.children
              .map(id => getNode(id))
              .find(
                ({ internal }) => _.camelCase(internal.type) === childNodeType
              )

            if (childNode) {
              // Add dependencies for the path
              createPageDependency({ path, nodeId: childNode.id })
              return childNode
            }
            return null
          },
        }
      }
    })

    const inferredFields = inferObjectStructureFromNodes({
      nodes: type.nodes,
      types: _.values(processedTypes),
      ignoreFields: Object.keys(type.fieldsFromPlugins),
    })

    return {
      ...defaultNodeFields,
      ...inferredFields,
      ...type.fieldsFromPlugins,
    }
  }

  async function createType(nodes, typeName) {
    const intermediateType = {}

    intermediateType.name = typeName
    intermediateType.nodes = nodes

    const fieldsFromPlugins = await apiRunner(`setFieldsOnGraphQLNodeType`, {
      type: intermediateType,
      allNodes: getNodes(),
      traceId: `initial-setFieldsOnGraphQLNodeType`,
    })

    const mergedFieldsFromPlugins = _.merge(...fieldsFromPlugins)

    const inferredInputFieldsFromPlugins = inferInputObjectStructureFromFields({
      fields: mergedFieldsFromPlugins,
    })

    const gqlType = new GraphQLObjectType({
      name: typeName,
      description: `Node of type ${typeName}`,
      interfaces: [nodeInterface],
      fields: () => createNodeFields(proccesedType),
      isTypeOf: value => value.internal.type === typeName,
    })

    const inferedInputFields = inferInputObjectStructureFromNodes({
      nodes,
      typeName,
    })

    const filterFields = _.merge(
      {},
      inferedInputFields.inferredFields,
      inferredInputFieldsFromPlugins.inferredFields
    )

    const proccesedType: ProcessedNodeType = {
      ...intermediateType,
      fieldsFromPlugins: mergedFieldsFromPlugins,
      nodeObjectType: gqlType,
      node: {
        name: typeName,
        type: gqlType,
        args: filterFields,
        resolve(a, args, context) {
          const runSift = require(`./run-sift`)
          const latestNodes = _.filter(
            getNodes(),
            n => n.internal.type === typeName
          )
          if (!_.isObject(args)) {
            args = {}
          }
          return runSift({
            args: { filter: { ...args } },
            nodes: latestNodes,
            path: context.path ? context.path : `LAYOUT___${context.id}`,
            type: gqlType,
          })
        },
      },
    }

    processedTypes[_.camelCase(typeName)] = proccesedType

    // Special case to construct linked file type used by type inferring
    if (typeName === `File`) {
      setFileNodeRootType(gqlType)
    }
  }

  // Create node types and node fields for nodes that have a resolve function.
  await Promise.all(_.map(types, createType))

  return processedTypes
}
