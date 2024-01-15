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

function commitRoot(root) {
  commitWork(root.child);
  root = null;
}

function commitWork(fiber) {
  if (!fiber.dom) return;
  fiber.parent.dom.append(fiber.dom);
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

function initChildren(work) {
  //3.链表转换 设置好指针
  const children = work.props.children;
  children.forEach((child, index) => {
    const newWork = {
      dom: null,
      type: child.type,
      props: child.props,
      child: null,
      parent: work,
      sibing: null,
    };

    if (index === 0) {
      work.child = newWork;
    } else {
      preChild.sibing = newWork;
    }
    preChild = newWork;
  });
}

function performWorkOfUnit(work) {
  //1.创建dom
  if (!work.dom) {
    const dom = (work.dom = createDom(work.type));

    work.parent.dom.append(dom);
    updatedProps(dom, work.props);
  }

  initChildren(work);

  //4.返回下一个要执行的任务
  if (work.child) {
    return work.child;
  }

  if (work.sibing) {
    return work.sibing;
  }

  return work.parent?.sibing;
}

requestIdleCallback(workLoop);

const React = {
  createElement,
  render,
};

export default React;
