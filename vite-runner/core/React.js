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
        const isTextNode =
          typeof child === "string" || typeof child === "number";
        return isTextNode ? createTextNode(child) : child;
      }),
    },
  };
}

function render(el, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [el],
    },
  };
  nextWorkOfUnit = wipRoot;
}
//work in progress
let wipRoot = null;
let currentRoot = null;
let nextWorkOfUnit = null;
let deletions = [];
let WipFiber = null;
function workLoop(deadline) {
  let shoudYied = false;
  while (!shoudYied && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);

    if (wipRoot?.sibing?.type === nextWorkOfUnit?.type) {
      console.log("hit", wipRoot, nextWorkOfUnit);
      nextWorkOfUnit = undefined;
    }
    shoudYied = deadline.timeRemaining() < 1;
  }

  if (!nextWorkOfUnit && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

function commitRoot() {
  deletions.forEach(commitDeletion);
  commitWork(wipRoot.child);
  currentRoot = wipRoot; // 确保 currentRoot 指向最新的渲染根
  wipRoot = null;
  deletions = [];
}

function commitDeletion(fiber) {
  if (fiber.dom) {
    let fiberParent = fiber.parent;
    while (!fiberParent.dom) {
      fiberParent = fiberParent.parent;
    }
    fiberParent.dom.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child);
  }
}

function commitWork(fiber) {
  if (!fiber) return;

  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }

  if (fiber.effectTag === "update") {
    updatedProps(fiber.dom, fiber.props, fiber.alternate?.props);
  } else if (fiber.effectTag === "placement") {
    if (fiber.dom) {
      fiberParent.dom.append(fiber.dom);
    }
  }

  // fiberParent.dom.append(fiber.dom);
  commitWork(fiber.child);
  commitWork(fiber.sibing);
}

function createDom(type) {
  return type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(type);
}

function updatedProps(dom, nextProps, prevProps) {
  //重构 :
  //1.老的有 新的没 ：删除
  Object.keys(prevProps).forEach((key) => {
    if (key !== "children") {
      if (!(key in nextProps)) {
        dom.removeAttribute(key);
      }
    }
  });

  //2.新的有 老的没 ： 添加
  //3.新的有 老的有 ：修改
  Object.keys(nextProps).forEach((key) => {
    if (key !== "children") {
      if (nextProps[key] !== prevProps[key]) {
        if (key.startsWith("on")) {
          const eventType = key.slice(2).toLowerCase();
          dom.removeEventListener(eventType, prevProps[key]);
          dom.addEventListener(eventType, nextProps[key]);
        } else {
          dom[key] = nextProps[key];
        }
      }
    }
  });
}

function initChildren(fiber, children) {
  let oldFiber = fiber.alternate?.child;
  let preChild = null;
  //3.链表转换 设置好指针

  children.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child.type;
    let newFiber;
    if (isSameType) {
      //update
      newFiber = {
        dom: oldFiber.dom,
        type: child.type,
        props: child.props,
        child: null,
        parent: fiber,
        sibing: null,
        effectTag: "update",
        alternate: oldFiber,
      };
    } else {
      if (child) {
        newFiber = {
          dom: null,
          type: child.type,
          props: child.props,
          child: null,
          parent: fiber,
          sibing: null,
          effectTag: "placement",
        };
      }
      if (oldFiber) {
        deletions.push(oldFiber);
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibing;
    }

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      preChild.sibing = newFiber;
    }

    if (newFiber) {
      preChild = newFiber;
    }
  });
  while (oldFiber) {
    deletions.push(oldFiber);

    oldFiber = oldFiber.sibing;
  }
}

function updateFunctionComponent(fiber) {
  WipFiber = fiber;

  const children = [fiber.type(fiber.props)];

  initChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type));
    updatedProps(dom, fiber.props, {});
  }

  const children = fiber.props.children;
  initChildren(fiber, children);
}

function performWorkOfUnit(fiber) {
  const isFunctionComponent = typeof fiber.type === "function";
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  //4.返回下一个要执行的任务
  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibing) return nextFiber.sibing;
    nextFiber = nextFiber.parent;
  }
  // return fiber.parent?.sibing;
}

requestIdleCallback(workLoop);

function update() {
  let currentFiber = WipFiber;
  return () => {
    console.log(currentFiber);
    // nextWorkOfUnit = {
    //   dom: currentRoot.dom,
    //   props: currentRoot.props,
    //   alternate: currentRoot,
    // };
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };
    nextWorkOfUnit = wipRoot;
  };
}

const React = {
  update,
  createElement,
  render,
};

export default React;
