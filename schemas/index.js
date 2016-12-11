const graphql = require('graphql')
const mongoose = require('mongoose')

let TODO = mongoose.model('Todo', {
  id: mongoose.Schema.Types.ObjectId,
  title: String,
  completed: Boolean
})

mongoose.connect('mongodb://localhost:27017/todo-graphql', (error) => {
  if (error) console.error(error)
  else console.log('mongo connected')
})

// --- SEEDING
TODO.count({}, (err, count) => {
  if (count < 1) {
    console.log('Seeding...')
    const TODOs = [
      {
        title: 'Read emails',
        completed: false
      },
      {
        title: 'Procrastinate a bit',
        completed: true
      }
    ]

    TODO.insertMany(TODOs, (err, docs) => {
      if (err) console.error(err)
      else console.log('Data seeded!', docs)
    })
  }
})

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
  fields: () => ({
    todos: {
      type: new graphql.GraphQLList(TodoType),
      resolve: () => {
        return new Promise((resolve, reject) => {
          TODO.find((err, todos) => {
            if (err) reject(err)
            else resolve(todos)
          })
        })
      }
    }
  })
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
