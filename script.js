
      let todoData = {
        title: "Design the onboarding flow",
        description: "Create wireframes and a clickable prototype for the new user onboarding experience.",
        priority: "Medium",  
        status: "In Progress", 
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      };

      // DOM elements
      const cardArticle = document.getElementById('todoCardArticle');
      const cardWrapper = document.getElementById('cardWrapper');
      const titleEl = document.getElementById('todo-title');
      const descPara = document.getElementById('todoDescriptionText');
      const priorityDotSpan = document.getElementById('priorityDot');
      const priorityTextSpan = document.getElementById('priorityTextBadge');
      const statusSelect = document.getElementById('statusSelect');
      const checkbox = document.getElementById('todo-complete');
      const timeRemainingSpan = document.getElementById('todo-time-remaining');
      const overdueIndicatorSpan = document.getElementById('overdueIndicator');
      const dueDateElem = document.getElementById('todo-due-date');
      const expandToggleBtn = document.getElementById('expandToggleBtn');
      const editFormDiv = document.getElementById('editFormContainer');
      const editButton = document.getElementById('editButton');
      const deleteButton = document.getElementById('deleteButton');
      const editTitle = document.getElementById('editTitleInput');
      const editDesc = document.getElementById('editDescInput');
      const editPriority = document.getElementById('editPrioritySelect');
      const editDueDate = document.getElementById('editDueDate');
      const saveBtn = document.querySelector('[data-testid="test-todo-save-button"]');
      const cancelBtn = document.querySelector('[data-testid="test-todo-cancel-button"]');

      let isExpanded = false;
      let fullDescriptionRaw = todoData.description;
      let editBackup = null;


      function truncateText(text, limit = 100) {
        if (text.length <= limit) return text;
        return text.substring(0, limit) + "…";
      }

      function updateDescriptionDisplay() {
        if (isExpanded) {
          descPara.innerText = fullDescriptionRaw;
          expandToggleBtn.setAttribute('aria-expanded', 'true');
          expandToggleBtn.querySelector('span:first-child').innerText = 'Collapse';
        } else {
          const short = truncateText(fullDescriptionRaw, 100);
          descPara.innerText = short;
          expandToggleBtn.setAttribute('aria-expanded', 'false');
          expandToggleBtn.querySelector('span:first-child').innerText = 'Expand';
        }
      }

      function updatePriorityUI() {
        const prio = todoData.priority;
        priorityTextSpan.innerText = prio;
        cardWrapper.setAttribute('data-priority', prio);
        let dotColor = '#ffb347';
        if (prio === 'Low') dotColor = '#5cbeff';
        if (prio === 'Medium') dotColor = '#ffb347';
        if (prio === 'High') dotColor = '#ff5c5c';
        priorityDotSpan.style.backgroundColor = dotColor;
      }

     
      function updateStatusUI() {
        const status = todoData.status;
        statusSelect.value = status;
        if (status === 'Done') {
          checkbox.checked = true;
          cardArticle.classList.add('done-card');
          cardArticle.classList.remove('inprogress-card');
        } else {
          checkbox.checked = false;
          cardArticle.classList.remove('done-card');
          if (status === 'In Progress') {
            cardArticle.classList.add('inprogress-card');
          } else {
            cardArticle.classList.remove('inprogress-card');
          }
        }
      }


      function computeTimeStatus(dueISO, status) {
        if (status === 'Done') return { display: "Completed", cls: "ok", isOverdue: false };
        const now = new Date();
        const due = new Date(dueISO);
        const diffMs = due - now;
        const isOverdue = diffMs < 0;
        if (isOverdue) {
          const overdueMs = -diffMs;
          const hours = Math.floor(overdueMs / (1000*3600));
          const minutes = Math.floor((overdueMs % (3600000)) / 60000);
          if (hours > 0) return { display: `Overdue by ${hours}h`, cls: "overdue", isOverdue: true };
          if (minutes > 0) return { display: `Overdue by ${minutes}m`, cls: "overdue", isOverdue: true };
          return { display: `Overdue now`, cls: "overdue", isOverdue: true };
        } else {
          const diffDays = diffMs / (86400000);
          const diffHours = diffMs / (3600000);
          const diffMinutes = diffMs / 60000;
          if (diffDays >= 1) return { display: `Due in ${Math.floor(diffDays)} day${Math.floor(diffDays) !== 1 ? 's' : ''}`, cls: "ok", isOverdue: false };
          if (diffHours >= 1) return { display: `Due in ${Math.floor(diffHours)} hour${Math.floor(diffHours) !== 1 ? 's' : ''}`, cls: "soon", isOverdue: false };
          if (diffMinutes >= 1) return { display: `Due in ${Math.floor(diffMinutes)} minute${Math.floor(diffMinutes) !== 1 ? 's' : ''}`, cls: "soon", isOverdue: false };
          return { display: "Due now!", cls: "overdue", isOverdue: true };
        }
      }

      function updateTimeAndOverdue() {
        const { display, cls, isOverdue } = computeTimeStatus(todoData.dueDate, todoData.status);
        timeRemainingSpan.textContent = display;
        timeRemainingSpan.className = cls;
        if (isOverdue && todoData.status !== 'Done') {
          overdueIndicatorSpan.style.display = 'inline-flex';
          cardWrapper.setAttribute('data-overdue', 'true');
        } else {
          overdueIndicatorSpan.style.display = 'none';
          cardWrapper.setAttribute('data-overdue', 'false');
        }
      }

      function refreshDueDateDisplay() {
        const dueObj = new Date(todoData.dueDate);
        if (!isNaN(dueObj)) {
          const formatted = dueObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          dueDateElem.textContent = `Due ${formatted}`;
          dueDateElem.setAttribute('datetime', dueObj.toISOString());
        }
      }

      function fullRefreshUI() {
        titleEl.innerText = todoData.title;
        fullDescriptionRaw = todoData.description;
        updateDescriptionDisplay();
        updatePriorityUI();
        updateStatusUI();
        refreshDueDateDisplay();
        updateTimeAndOverdue();
      }


      function setStatus(newStatus) {
        if (todoData.status === newStatus) return;
        todoData.status = newStatus;
        updateStatusUI();
        updateTimeAndOverdue();
        fullRefreshUI();
      }

      
      function onCheckboxChange(e) {
        if (e.target.checked) {
          setStatus("Done");
        } else {
          setStatus("Pending");
        }
      }

       
      function onStatusSelectChange(e) {
        setStatus(e.target.value);
      }

     
      function toggleExpand() {
        isExpanded = !isExpanded;
        updateDescriptionDisplay();
      }

      
      function openEditMode() {
        editBackup = {
          title: todoData.title,
          description: todoData.description,
          priority: todoData.priority,
          dueDate: todoData.dueDate
        };
        editTitle.value = todoData.title;
        editDesc.value = todoData.description;
        editPriority.value = todoData.priority;
        const dueLocal = new Date(todoData.dueDate);
        if (!isNaN(dueLocal)) {
          editDueDate.value = dueLocal.toISOString().slice(0, 16);
        } else {
          editDueDate.value = "";
        }
        editFormDiv.style.display = 'block';
        editButton.disabled = true;
        editTitle.focus();
      }

      function closeEditMode(restore = false) {
        if (restore && editBackup) {
          todoData.title = editBackup.title;
          todoData.description = editBackup.description;
          todoData.priority = editBackup.priority;
          todoData.dueDate = editBackup.dueDate;
          fullRefreshUI();
        }
        editFormDiv.style.display = 'none';
        editButton.disabled = false;
        editButton.focus();
        editBackup = null;
      }

      function saveChanges() {
        const newTitle = editTitle.value.trim();
        if (!newTitle) return;
        todoData.title = newTitle;
        todoData.description = editDesc.value;
        todoData.priority = editPriority.value;
        const rawDue = editDueDate.value;
        if (rawDue) {
          const parsed = new Date(rawDue);
          if (!isNaN(parsed)) todoData.dueDate = parsed.toISOString();
        }
        fullRefreshUI();
        closeEditMode(false);
      }

      function resetToDefault() {
        todoData = {
          title: "Design the onboarding flow",
          description: "Create wireframes and a clickable prototype for the new user onboarding experience. ",
          priority: "Medium",
          status: "In Progress",
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        };
        isExpanded = false;
        fullRefreshUI();
        if (editFormDiv.style.display === 'block') closeEditMode(false);
      }


      let timerInterval = setInterval(() => {
        if (todoData.status !== 'Done') {
          updateTimeAndOverdue();
        } else {
          timeRemainingSpan.textContent = "Completed";
          timeRemainingSpan.className = "ok";
        }
      }, 45000);

      
      checkbox.addEventListener('change', onCheckboxChange);
      statusSelect.addEventListener('change', onStatusSelectChange);
      expandToggleBtn.addEventListener('click', toggleExpand);
      editButton.addEventListener('click', openEditMode);
      deleteButton.addEventListener('click', resetToDefault);
      saveBtn.addEventListener('click', saveChanges);
      cancelBtn.addEventListener('click', () => closeEditMode(true));

      
      fullRefreshUI();
      timeRemainingSpan.setAttribute('aria-live', 'polite');
