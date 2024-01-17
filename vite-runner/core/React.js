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
  nextWorkOfUnit = {
    dom: container,
    props: {
      children: [el],
    },
  };
  root = nextWorkOfUnit;
}

let root = null;
let nextWorkOfUnit = null;
function workLoop(deadline) {
  let shoudYied = false;
  while (!shoudYied && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);

    shoudYied = deadline.timeRemaining() < 1;
  }

  if (!nextWorkOfUnit && root) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

function commitRoot() {
  commitWork(root.child);
  root = null;
}

function commitWork(fiber) {
  if (!fiber) return;

  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }

  if (fiber.dom) {
    fiberParent.dom.append(fiber.dom);
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

function updatedProps(dom, props) {
  //2.处理props
  Object.keys(props).forEach((key) => {
    if (key !== "children") {
      dom[key] = props[key];
    }
  });
}

function initChildren(fiber, children) {
  let preChild = null;
  //3.链表转换 设置好指针

  children.forEach((child, index) => {
    const newWork = {
      dom: null,
      type: child.type,
      props: child.props,
      child: null,
      parent: fiber,
      sibing: null,
    };

    if (index === 0) {
      fiber.child = newWork;
    } else {
      preChild.sibing = newWork;
    }
    preChild = newWork;
  });
}

function updateFunctionComponent(fiber) {
  const children = [fiber.type(fiber.props)];

  initChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type));
    updatedProps(dom, fiber.props);
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

  // if (!isFunctionComponent) {
  //   //1.创建dom
  //   if (!fiber.dom) {
  //     const dom = (fiber.dom = createDom(fiber.type));

  //     // fiber.parent.dom.append(dom);
  //     updatedProps(dom, fiber.props);
  //   }
  // }
  // const children = isFunctionComponent
  //   ? [fiber.type(fiber.props)]
  //   : fiber.props.children;
  // // console.log(111, children);
  // initChildren(fiber, children);

  //4.返回下一个要执行的任务
  if (fiber.child) {
    return fiber.child;
  }

  // if (fiber.sibing) {
  //   return fiber.sibing;
  // }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibing) return nextFiber.sibing;
    nextFiber = nextFiber.parent;
  }
  // return fiber.parent?.sibing;
}

requestIdleCallback(workLoop);

const React = {
  createElement,
  render,
};

export default React;
