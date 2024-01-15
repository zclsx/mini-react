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

function Counter({num}) {
  return <div>count: {num}</div>
}

// function CounterCountainer() {
//   return <Counter></Counter> 
// }

function App(){
    return (
    <div>mini-react
        <Counter num={10}></Counter>
        <Counter num={20}></Counter>
    </div> 
    ) 
}
// const App = <div>mini-react
//     <Counter></Counter>
// </div>

// console.log(AppOne);
export default App;
