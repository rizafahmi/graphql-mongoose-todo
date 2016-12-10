const graphql = require('graphql')

const TODOs = [
  {
    id: 128671,
    title: 'Read emails',
    completed: false
  },
  {
    id: 21837,
    title: 'Procrastinate a bit',
    completed: true
  }
]

// --------- GRAPHQL Schema ---------------------
const TodoType = new graphql.GraphQLObjectType({
  name: 'todo',
  fields: () => {
    return {
      id: {
        type: graphql.GraphQLID
      },
      title: {
        type: graphql.GraphQLString
      },
      completed: {
        type: graphql.GraphQLBoolean
      }
    }
  }
})

const queryType = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: () => {
    return {
      todos: {
        type: new graphql.GraphQLList(TodoType),
        resolve: () => {
          return TODOs
        }
      }
    }
  }
})

module.exports = new graphql.GraphQLSchema({
  query: queryType
})
