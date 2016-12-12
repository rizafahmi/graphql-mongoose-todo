const graphql = require('graphql')
const mongoose = require('mongoose')

let CategorySchema = new mongoose.Schema({
  name: String
})

let TODO = mongoose.model('Todo', {
  id: mongoose.Schema.Types.ObjectId,
  title: String,
  completed: {
    type: Boolean,
    default: false
  },
  category: [CategorySchema]
})

mongoose.connect('mongodb://localhost:27017/todo-graphql', (error) => {
  if (error) console.error(error)
  else console.log('mongo connected')
})

// --- SEEDING
TODO.count({}, (err, count) => {
  if (count < 1) {
    console.log('Seeding...')

    let newTodo = new TODO({
      title: 'nothing to do',
      category: [
        {name: 'Work'}
      ]
    })

    newTodo.save()
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
      },
      category: {
        type: new graphql.GraphQLList(categoryType)
      }
    }
  }
})

const categoryType = new graphql.GraphQLObjectType({
  name: 'categoryQuery',
  fields: () => ({
    name: {
      type: graphql.GraphQLString
    }
  })
})

const queryType = new graphql.GraphQLObjectType({
  name: 'Query',
  description: 'TODO query type',
  fields: () => ({
    todos: {
      type: new graphql.GraphQLList(TodoType),
      resolve: () => {
        return new Promise((resolve, reject) => {
          TODO.find({})
            .select({ title: 1, 'category.name': 1 })
            .exec((error, todos) => {
              if (error) reject(error)
              else {
                resolve(todos)
              }
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
      type: graphql.GraphQLString
    },
    category: {
      type: new graphql.GraphQLList(graphql.GraphQLString)
    }
  },
  resolve: (root, args) => {
    let newTodo = new TODO({
      title: args.title,
      completed: false,
      category: [{name: args.category}]
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
