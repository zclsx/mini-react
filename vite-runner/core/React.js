// 创建文本节点的函数
function createTextNode(text) {
  return {
    type: "TEXT_ELEMENT", // 节点类型为文本元素
    props: {
      nodeValue: text, // 节点的值
      children: [], // 子节点数组
    },
  };
}

// 创建元素的函数
function createElement(type, props, ...children) {
  return {
    type, // 节点类型
    props: {
      ...props, // 展开传入的 props
      // 处理子节点：如果是字符串或数字，则创建文本节点，否则直接使用
      children: children.map((child) => {
        const isTextNode =
          typeof child === "string" || typeof child === "number";
        return isTextNode ? createTextNode(child) : child;
      }),
    },
  };
}

// 渲染函数
function render(el, container) {
  wipRoot = {
    // 正在处理的根节点
    dom: container, // 容器 DOM
    props: {
      // 属性
      children: [el], // 子节点，只有一个元素 el
    },
  };
  nextWorkOfUnit = wipRoot; // 将工作单元指向 wipRoot
}

// 工作进展节点
let wipRoot = null;
let currentRoot = null; // 当前渲染的根节点
let nextWorkOfUnit = null; // 下一个工作单元
let deletions = []; // 删除的节点数组
let WipFiber = null; // 正在处理的 fiber

// 工作循环函数
function workLoop(deadline) {
  let shoudYied = false;
  while (!shoudYied && nextWorkOfUnit) {
    nextWorkOfUnit = performWorkOfUnit(nextWorkOfUnit);

    // 检查是否命中相同类型的兄弟节点，如果是，结束当前单元的处理
    if (wipRoot?.sibing?.type === nextWorkOfUnit?.type) {
      console.log("hit", wipRoot, nextWorkOfUnit);
      nextWorkOfUnit = undefined;
    }
    shoudYied = deadline.timeRemaining() < 1;
  }

  // 当没有下一个工作单元且 wipRoot 存在时，提交根节点
  if (!nextWorkOfUnit && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

// 提交根节点的函数
function commitRoot() {
  deletions.forEach(commitDeletion); // 提交需要删除的节点
  commitWork(wipRoot.child); // 提交工作
  currentRoot = wipRoot; // 更新当前渲染根节点
  wipRoot = null; // 清空 wipRoot
  deletions = []; // 清空删除列表
}

// 提交删除的函数
function commitDeletion(fiber) {
  if (fiber.dom) {
    // 如果 fiber 有 DOM 节点，直接从父节点删除
    let fiberParent = fiber.parent;
    while (!fiberParent.dom) {
      fiberParent = fiberParent.parent;
    }
    fiberParent.dom.removeChild(fiber.dom);
  } else {
    // 否则递归删除子节点
    commitDeletion(fiber.child);
  }
}

// 提交工作的函数
function commitWork(fiber) {
  if (!fiber) return; // 如果没有 fiber，直接返回

  let fiberParent = fiber.parent; // 获取 fiber 的父节点
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent; // 向上查找直到有 DOM 的父节点
  }

  // 处理不同的 effectTag
  if (fiber.effectTag === "update") {
    updatedProps(fiber.dom, fiber.props, fiber.alternate?.props); // 更新 props
  } else if (fiber.effectTag === "placement") {
    if (fiber.dom) {
      fiberParent.dom.append(fiber.dom); // 插入 DOM
    }
  }

  // 递归处理子节点和兄弟节点
  commitWork(fiber.child);
  commitWork(fiber.sibing);
}

// 创建 DOM 元素的函数
function createDom(type) {
  return type === "TEXT_ELEMENT" // 根据 type 类型创建对应的 DOM
    ? document.createTextNode("")
    : document.createElement(type);
}

// 更新 DOM 属性的函数
function updatedProps(dom, nextProps, prevProps) {
  // 处理属性：删除、添加、更新
  Object.keys(prevProps).forEach((key) => {
    if (key !== "children") {
      if (!(key in nextProps)) {
        dom.removeAttribute(key); // 删除不在新 props 中的属性
      }
    }
  });

  Object.keys(nextProps).forEach((key) => {
    if (key !== "children") {
      if (nextProps[key] !== prevProps[key]) {
        if (key.startsWith("on")) {
          const eventType = key.slice(2).toLowerCase();
          dom.removeEventListener(eventType, prevProps[key]); // 移除旧事件监听
          dom.addEventListener(eventType, nextProps[key]); // 添加新事件监听
        } else {
          dom[key] = nextProps[key]; // 更新属性
        }
      }
    }
  });
}

// 初始化子节点的函数
function initChildren(fiber, children) {
  let oldFiber = fiber.alternate?.child; // 获取旧的 fiber 子节点
  let preChild = null;

  children.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child.type;
    let newFiber;
    if (isSameType) {
      newFiber = {
        dom: oldFiber.dom, // 使用旧 fiber 的 DOM
        type: child.type,
        props: child.props,
        child: null,
        parent: fiber,
        sibing: null,
        effectTag: "update", // 标记为更新
        alternate: oldFiber,
      };
    } else {
      if (child) {
        newFiber = {
          dom: null, // 新建 DOM
          type: child.type,
          props: child.props,
          child: null,
          parent: fiber,
          sibing: null,
          effectTag: "placement", // 标记为插入
        };
      }
      if (oldFiber) {
        deletions.push(oldFiber); // 将不需要的旧 fiber 添加到删除列表
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibing; // 移动到下一个旧 fiber
    }

    if (index === 0) {
      fiber.child = newFiber; // 设置第一个子节点
    } else {
      preChild.sibing = newFiber; // 设置兄弟节点
    }

    if (newFiber) {
      preChild = newFiber; // 更新 preChild 为当前新 fiber
    }
  });

  // 遍历剩余的旧 fiber 节点并添加到删除列表
  while (oldFiber) {
    deletions.push(oldFiber);
    oldFiber = oldFiber.sibing;
  }
}

// 更新函数组件的函数
function updateFunctionComponent(fiber) {
  WipFiber = fiber; // 设置正在处理的 fiber
  const children = [fiber.type(fiber.props)]; // 执行函数组件获取子节点
  initChildren(fiber, children); // 初始化子节点
}

// 更新其他组件的函数（非函数组件）
function updateHostComponent(fiber) {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type)); // 创建 DOM
    updatedProps(dom, fiber.props, {}); // 更新属性
  }
  const children = fiber.props.children; // 获取子节点
  initChildren(fiber, children); // 初始化子节点
}

// 执行工作单元的函数
function performWorkOfUnit(fiber) {
  const isFunctionComponent = typeof fiber.type === "function"; // 判断是否为函数组件
  if (isFunctionComponent) {
    updateFunctionComponent(fiber); // 更新函数组件
  } else {
    updateHostComponent(fiber); // 更新其他组件
  }

  // 返回下一个要执行的任务
  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibing) return nextFiber.sibing; // 返回兄弟节点
    nextFiber = nextFiber.parent; // 向上遍历父节点
  }
}

// 请求空闲回调函数
requestIdleCallback(workLoop);
// 更新的函数
function update() {
  let currentFiber = WipFiber; // 获取当前正在处理的 fiber
  return () => {
    console.log(currentFiber); // 打印当前 fiber，用于调试
    // 创建一个新的工作单元
    wipRoot = {
      ...currentFiber, // 复制当前 fiber 的属性
      alternate: currentFiber, // 设置 alternate 为当前 fiber
    };
    nextWorkOfUnit = wipRoot; // 将下一个工作单元设置为新创建的 wipRoot
  };
}

// React 对象，包含 update, createElement, render 函数
const React = {
  update, // 更新函数
  createElement, // 创建元素函数
  render, // 渲染函数
};

export default React; // 导出 React 对象
