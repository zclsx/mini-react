import { func } from "prop-types";

function createTextNode(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === "string" ? createTextNode(child) : child;
      }),
    },
  };
}

function render(el, container) {
  nextWorkOfUnit = {
    dom:container,
    props:{
      children:[el]
    }
  }
  // const dom =
  //   el.type === "TEXT_ELEMENT"
  //     ? document.createTextNode("")
  //     : document.createElement(el.type);

  // //id class
  // Object.keys(el.props).forEach((key) => {
  //   if (key !== "children") {
  //     dom[key] = el.props[key];
  //   }
  // });

  // const children = el.props.children;
  // children.forEach((child) => {
  //   render(child, dom);
  // });

  // container.append(dom);
}

let nextWorkOfUnit = null;
const taskId =1 
function workLoop(deadline){
  taskId++;

  let shoudYied = false;
  while(!shoudYied && nextWorkOfUnit){
          
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit)
         
          shoudYied = deadline.timeRemaining() < 1;
  }

  requestIdleCallback(workLoop)
}

function performWorkOfUnit(work){
 //1.创建dom  
 if(!work.dom){
  const dom =
  work.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(work.type);

      work.parent.dom.append(dom)
  //2.处理props
  Object.keys(work.props).forEach((key) => {
    if (key !== "children") {
      dom[key] = work.props[key];
    }
  });
}

  //3.链表转换 设置好指针
   const children = el.props.children;
  children.forEach((child,index) => {
    const newWork = {
      dom:null,
      type:child.type,
      props:child.props,
      child:null,
      parent:work,
      sibing:null,
    }

    if(index === 0){
        work.child = newWork
    }else {
      preChild.sibing = newWork
    }
    preChild = newWork
  });

  //4.返回下一个要执行的任务
  if(work.child){
    return work.child
  }

  if(work.sibing){
    return work.sibing
  }

  return work.parent?.sibing
}




requestIdleCallback(workLoop)

const React = {
  createElement,
  render,
};

export default React;
