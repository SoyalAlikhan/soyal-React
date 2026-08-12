import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

function MyApp(){
  return (
    <div>   
      <h1>Welcome to React</h1>
    </div>
  )
}

// const ReactElement = {
//     type: 'a',
//     props: {
//         href: 'https://www.google.com',
//         target: '_blank'
//     },
//     children: 'click me to go to google'
// }

const anotherReactElement = (
  <a href="https://www.google.com" target='_blank'> visit google </a>
)
    
const reactElement = React.createElement(
  'a',
  {
    href: 'https://www.google.com',
    target: '_blank'
  },
  'click me to go to google'
)

ReactDOM.createRoot(document.getElementById('root')).
render(
    //MyApp() 
    //  <MyApp />
    <App />
    //anotherReactElement
    //reactElement
)
