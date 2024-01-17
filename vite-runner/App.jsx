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

let count = 0;
let props = {id:"111111"}
function Counter() {
  //update
  function handleClick() {
    console.log("click");
    count++
    props:{}
    React.update()
  }
  return (
  <div {...props}>
    count:{count} 
    <button onClick={handleClick}>click</button>
  </div>
  
  )
}

function App(){
    return (
    <div>mini-react
        <Counter num={10}></Counter>

    </div> 
    ) 
}
// const App = <div>mini-react
//     <Counter></Counter>
// </div>

// console.log(AppOne);
export default App;
