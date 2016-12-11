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
  description: 'TODO query type',
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

const MutationAdd = {
  type: TodoType,
  description: 'Add a TODO',
  args: {
    title: {
      type: new graphql.GraphQLNonNull(graphql.GraphQLString),
      name: 'Todo title'
    }
  },
  resolve: (root, args) => {
    let newTodo = new TODO({
      title: args.title,
      completed: false
    })
    newTodo.id = newTodo._id
    return new Promise((resolve, reject) => {
      newTodo.save((err) => {
        if (err) reject(err)
        else resolve(newTodo)
      })
    })
  }
}

const MutationType = new graphql.GraphQLObjectType({
  name: 'mutation',
  fields: {
    add: MutationAdd
  }
})

module.exports = new graphql.GraphQLSchema({
  query: queryType,
  mutation: MutationType
})
