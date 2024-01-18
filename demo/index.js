let taskId = 1;
function workLoop(deadline) {
  taskId++;

  let shoudYied = false;
  if (!shoudYied) {
    //run task
    console.log(`tasskId:${taskId} run task`);

    //dom
    shoudYied = deadline.timeRemaining() < 1;
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);
