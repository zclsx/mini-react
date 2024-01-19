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

// let showBar = false 

// function Counter() {
  // const foo = <div>foo</div>
  // function Foo() {
  //   return <div>foo
  //      <div>child1</div>
  //      <div>child2</div>
  //   </div>
    
  // }
  // const bar = <p>bar</p>

//   function handleShowBar() {
//     showBar = !showBar
//     React.update()
//   }
//   return (
//   <div>
//     Counter
//     {/* <div>{showBar ? bar : <Foo></Foo>}</div> */}
//     <button onClick={handleShowBar}>showBar</button>
//     {showBar && bar}
//   </div>
  
//   )
// }


let countFoo =1
function Foo(){
  // console.log("Foo")
  const [count , setCount] = React.useState(10)
  const [bar , setBar] = React.useState("bar")
  // const update = React.update()
  function handleClick(){
    setCount((c) => c+1);
    // setBar((s)=>s+"bar")
    // setBar("barbar")
    setBar(() => "barbar")
  }
 
  return (
    <div>
      <h1>foo</h1>
      {count}
      
      <div>{bar}</div>
      <button onClick={handleClick}>click</button>
    </div>
  )
}

// let countBar = 1
// function Bar(){
//   console.log("Bar")
//   const update = React.update()
//   function handleClick(){
//     countBar++
//     update()
//   }

//   return (
//     <div>
//       <h1>bar</h1>
//       {countBar}
//       <button onClick={handleClick}>click</button>
//     </div>
//   )
// }

let countRoot = 1;
function App(){
  // console.log("App")
  
  //   function handleClick(){
  //       countRoot++
  //       React.update()
  //   }


    return (
    <div>mini-react
        {/* <Counter></Counter> */}
      {/* mini-react count: {countRoot} */}
      <button onClick={handleClick}>click</button>
      <Foo></Foo>
      {/* <Bar></Bar> */}
    </div> 
    ) 
}
// const App = <div>mini-react
//     <Counter></Counter>
// </div>

// console.log(AppOne);
export default App;
