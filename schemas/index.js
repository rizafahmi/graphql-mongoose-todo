const graphql = require('graphql')
const mongoose = require('mongoose')

let TODO = mongoose.model('Todo', {
  id: mongoose.Schema.Types.ObjectId,
  title: String,
  completed: Boolean,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }
})

let Category = mongoose.model('Category', {
  id: mongoose.Schema.Types.ObjectId,
  name: String
})

mongoose.connect('mongodb://localhost:27017/todo-graphql', (error) => {
  if (error) console.error(error)
  else console.log('mongo connected')
})

// --- SEEDING
Category.count({}, (err, count) => {
  if (count < 1) {
    console.log('Category Seeding...')

    let categoryWork = new Category({
      name: 'Work'
    })

    categoryWork.save((err) => {
      if (err) console.error(err)
      else {
        let workTodo = new TODO({
          title: 'Doing some work',
          category: categoryWork._id
        })

        workTodo.save()

        let anotherWorkTodo = new TODO({
          title: 'Doing something else at work',
          category: categoryWork._id
        })

        anotherWorkTodo.save()
      }
    })

    let categoryPersonal = new Category({
      name: 'Personal'
    })

    categoryPersonal.save((err) => {
      if (err) console.error(err)
      else {
        let personalTodo = new TODO({
          title: 'Groceries',
          category: categoryPersonal._id
        })

        personalTodo.save()
      }
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
