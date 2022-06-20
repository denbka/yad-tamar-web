const dates = [{ date: 12523089431, todos: [] }];
let progress = 70;
let tasks = [];

const createElement = (el, className, html) => {
  const newEl = document.createElement(el);
  newEl.classList.add(className);
  newEl.innerHTML = html;
  return newEl;
};

const getQueryParams = () => {
  const searchQuery = window.location.search;
  if (!searchQuery.length) {
    return;
  }
  return searchQuery
    .slice(1, searchQuery.length)
    .split("&")
    .reduce((state, current) => {
      const [key, value] = current.split("=");
      return {
        ...state,
        [key]: value,
      };
    }, {});
};

const setProgressTask = () => {
  if (!document.querySelector(".modal-progress-spinner")) return;
  document.querySelector(".modal-progress-spinner").style.background =
    "conic-gradient(#2daab2 " + progress + "%,#fff " + progress + "%)";

  document.querySelector(".modal-middle-circle").innerHTML =
    progress.toString() + "%";
};

const setProgressHeader = () => {
  document.querySelector(".header-progress-spinner").style.background =
    "conic-gradient(#F3C26A " + progress + "%,#4A6CB0 " + progress + "%)";

  document.querySelector(".header-middle-circle").innerHTML =
    progress.toString() + "%";
};

window.addEventListener("load", async () => {
  const modal = document.querySelector(".modal__content");
  const modalOverlay = document.querySelector(".modal");
  const list = document.querySelector(".task-list");

  const updateTask = async (index) => {
    try {
      await fetch(`https://tamar.project-babaev.ru/api/tasks/${family_id}`, {
        method: "put",
        body: JSON.stringify({
          ...tasks[index],
          was_completed: true,
        }),
        headers: {
          Authorization: token,
        },
      }).then((res) => res.json());
    } finally {
      modalOverlay.classList.toggle("hidden");
      modal.innerHTML = "";
    }
  };

  const toggleModal = (index) => {
    if (!index) {
      modalOverlay.classList.toggle("hidden");
      return;
    }
    const task = createElement("div", "modal__task");
    const title = createElement(
      "div",
      "modal__task__title",
      tasks[index].task_name
    );
    const date = createElement(
      "div",
      "modal__task__date",
      luxon.DateTime.fromSeconds(Number(tasks[index].date)).toLocaleString()
    );
    const divider = createElement("hr", "divider");
    const description = createElement(
      "div",
      "modal__task__description",
      tasks[index].comments
    );
    const updateButton = createElement("div", "task__title", "Take the task");
    updateButton.addEventListener("click", () => updateTask(index));

    task.append(title);
    task.append(date);
    task.append(divider);
    task.append(description);
    task.append(updateButton);
    modal.append(task);

    modalOverlay.classList.toggle("hidden");
  };

  modalOverlay.addEventListener("click", () => toggleModal());

  modal.addEventListener("click", (e) => e.stopPropagation());

  const { token, family_id, user_id } = getQueryParams();

  console.log(token, family_id);
  tasks = await fetch(
    `https://tamar.project-babaev.ru/api/tasks/tasks-for-family/${family_id}`,
    {
      headers: {
        Authorization: token,
      },
    }
  ).then((res) => res.json());

  tasks.map((item, index) => {
    const date = luxon.DateTime.fromSeconds(Number(item.date)).toLocaleString(
      luxon.DateTime.TIME_SIMPLE
    );

    addTaskToHTML({ ...item, date }, list, index);
  });

  document.querySelectorAll(".task").forEach((title) =>
    title.addEventListener("click", (e) => {
      toggleModal(e.target.attributes["data-id"].value);
    })
  );

  setProgressHeader();
  setProgressTask();
});

const addTaskToHTML = (item, list, index) => {
  list.innerHTML += `
    <div class="date">
                <div class="date__container">
                    <div class="date__title">
                        ${"Monday"}
                    </div>
                    <div class="date__icon">
                        <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
                            <path
                                d="M10.9907 20.9159C5.46772 20.9159 0.990723 16.4389 0.990723 10.9159C0.990723 5.39289 5.46772 0.915894 10.9907 0.915894C16.5137 0.915894 20.9907 5.39289 20.9907 10.9159C20.9907 16.4389 16.5137 20.9159 10.9907 20.9159ZM10.9907 18.9159C13.1125 18.9159 15.1473 18.073 16.6476 16.5727C18.1479 15.0725 18.9907 13.0376 18.9907 10.9159C18.9907 8.79416 18.1479 6.75933 16.6476 5.25904C15.1473 3.75875 13.1125 2.91589 10.9907 2.91589C8.86899 2.91589 6.83416 3.75875 5.33387 5.25904C3.83358 6.75933 2.99072 8.79416 2.99072 10.9159C2.99072 13.0376 3.83358 15.0725 5.33387 16.5727C6.83416 18.073 8.86899 18.9159 10.9907 18.9159ZM11.9907 10.9159H15.9907V12.9159H9.99072V5.91589H11.9907V10.9159Z"
                                fill="#FDB32C" />
                        </svg>
                    </div>
                </div>
                <div class="task" data-id="${index}">
                    <div class="task__title" data-id="${index}">
                        ${item.task_name}
                    </div>
                    <div class="task__time" data-id="${index}">${
    item.date
  }</div>
                </div>
                <hr class="divider" />
            </div>
    `;
};
