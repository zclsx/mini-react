import React from "./core/React.js";
// const App = React.createElement(
//   "div",
//   {
//     id: "app",
//   },
//   "textEl", 
//   "111"
// );
// function AppOne(){
//     return  <div id="hah">mini-react <div>hah</div></div>
// }

let showBar = false 

function Counter() {
  // const foo = <div>foo</div>
  function Foo() {
    return <div>foo
       <div>child1</div>
       <div>child2</div>
    </div>
    
  }
  const bar = <p>bar</p>

  function handleShowBar() {
    showBar = !showBar
    React.update()
  }
  return (
  <div>
    Counter
    <div>{showBar ? bar : <Foo></Foo>}</div>
    <button onClick={handleShowBar}>showBar</button>
  </div>
  
  )
}

function App(){
    return (
    <div>mini-react
        <Counter></Counter>

    </div> 
    ) 
}
// const App = <div>mini-react
//     <Counter></Counter>
// </div>

// console.log(AppOne);
export default App;
