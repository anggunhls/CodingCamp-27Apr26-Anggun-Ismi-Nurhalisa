  const form = document.getElementById("transactionForm");
    const itemName = document.getElementById("itemName");
    const amount = document.getElementById("amount");
    const category = document.getElementById("category");
    const customCategory = document.getElementById("customCategory");
    const limitInput = document.getElementById("limitInput");
    const transactionList = document.getElementById("transactionList");
    const totalBalance = document.getElementById("totalBalance");
    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");
    const monthFilter = document.getElementById("monthFilter");
    const themeToggle = document.getElementById("themeToggle");
    const themeIcon = document.getElementById("themeIcon");
    const brandLogo = document.getElementById("brandLogo");
    const welcomeName = document.getElementById("welcomeName");
    const profileNameInput = document.getElementById("profileNameInput");
    const saveProfileName = document.getElementById("saveProfileName");

    const foodTotal = document.getElementById("foodTotal");
    const transportTotal = document.getElementById("transportTotal");
    const funTotal = document.getElementById("funTotal");
    const monthTotal = document.getElementById("monthTotal");
    const highestTransaction = document.getElementById("highestTransaction");
    const budgetStatus = document.getElementById("budgetStatus");
    const gameArea = document.getElementById("gameArea");
    const gameTarget = document.getElementById("gameTarget");
    const bombTarget = document.getElementById("bombTarget");
    const gameOverlay = document.getElementById("gameOverlay");
    const gameScore = document.getElementById("gameScore");
    const bestScore = document.getElementById("bestScore");
    const gameTimer = document.getElementById("gameTimer");
    const gameDuration = document.getElementById("gameDuration");
    const playGameBtn = document.getElementById("playGameBtn");
    const gameResult = document.getElementById("gameResult");


    let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    let categories = JSON.parse(localStorage.getItem("categories")) || ["Food", "Transport", "Fun"];
    let spendingLimit = Number(localStorage.getItem("spendingLimit")) || 0;
    let userName = localStorage.getItem("userName") || "User";
    let chart;

    function rupiah(number) {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
      }).format(number || 0);
    }

    function saveData() {
      localStorage.setItem("transactions", JSON.stringify(transactions));
      localStorage.setItem("categories", JSON.stringify(categories));
      localStorage.setItem("spendingLimit", spendingLimit);
    }

    function applySavedTheme() {
      const theme = localStorage.getItem("theme") || "dark";
      document.body.classList.toggle("light", theme === "light");
      themeIcon.textContent = theme === "light" ? "light_mode" : "dark_mode";
    }

    function renderUserName() {
      const cleanName = userName.trim() || "User";
      welcomeName.textContent = cleanName;
      profileNameInput.value = cleanName === "User" ? "" : cleanName;
      brandLogo.textContent = cleanName.charAt(0).toUpperCase();
    }

    function saveUserName() {
      const value = profileNameInput.value.trim();
      userName = value || "User";
      localStorage.setItem("userName", userName);
      renderUserName();
    }

    function renderCategoryOptions() {
      category.innerHTML = "";
      categories.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        category.appendChild(option);
      });
    }

    function getIcon(categoryName) {
      const name = categoryName.toLowerCase();
      if (name.includes("food")) return "restaurant";
      if (name.includes("transport")) return "directions_car";
      if (name.includes("fun")) return "celebration";
      if (name.includes("shop")) return "shopping_bag";
      if (name.includes("school")) return "school";
      if (name.includes("health")) return "health_and_safety";
      return "category";
    }

    function monthKey(date) {
      const value = new Date(date);
      return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
    }

    function renderMonthOptions() {
      const selected = monthFilter.value || "all";
      const months = [...new Set(transactions.map((transaction) => monthKey(transaction.date)))];

      monthFilter.innerHTML = '<option value="all">All Months</option>';
      months.forEach((month) => {
        const option = document.createElement("option");
        option.value = month;
        option.textContent = month;
        monthFilter.appendChild(option);
      });

      monthFilter.value = months.includes(selected) ? selected : "all";
    }

    function getVisibleTransactions() {
      const keyword = searchInput.value.trim().toLowerCase();
      const selectedMonth = monthFilter.value;
      let visible = [...transactions];

      if (keyword) {
        visible = visible.filter((transaction) =>
          transaction.name.toLowerCase().includes(keyword) ||
          transaction.category.toLowerCase().includes(keyword)
        );
      }

      if (selectedMonth !== "all") {
        visible = visible.filter((transaction) => monthKey(transaction.date) === selectedMonth);
      }

      if (sortSelect.value === "amount") {
        visible.sort((a, b) => b.amount - a.amount);
      } else if (sortSelect.value === "category") {
        visible.sort((a, b) => a.category.localeCompare(b.category));
      } else {
        visible.sort((a, b) => new Date(b.date) - new Date(a.date));
      }

      return visible;
    }

    function renderTransactions() {
      const visible = getVisibleTransactions();

      if (visible.length === 0) {
        transactionList.innerHTML = '<div class="empty-state">No transaction yet</div>';
        return;
      }

      transactionList.innerHTML = "";

      visible.forEach((transaction) => {
        const item = document.createElement("div");
        item.className = "transaction-item";

        if (spendingLimit > 0 && transaction.amount > spendingLimit) {
          item.classList.add("over-limit");
        }

        item.innerHTML = `
      <div class="trans-icon"><span class="material-icons-round">${getIcon(transaction.category)}</span></div>
      <div class="trans-info">
        <h3>${transaction.name}</h3>
        <p>${transaction.category} • ${new Date(transaction.date).toLocaleDateString("id-ID")}</p>
      </div>
      <div class="trans-price">${rupiah(transaction.amount)}</div>
      <button class="delete-btn" type="button" aria-label="Delete transaction" data-id="${transaction.id}">
        <span class="material-icons-round">close</span>
      </button>
    `;

        transactionList.appendChild(item);
      });
    }

    function totalByCategory(categoryName) {
      return transactions
        .filter((transaction) => transaction.category.toLowerCase() === categoryName.toLowerCase())
        .reduce((sum, transaction) => sum + transaction.amount, 0);
    }

    function renderSummary() {
      const total = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const monthlyTransactions = transactions.filter((transaction) => monthKey(transaction.date) === currentMonth);
      const monthlyTotal = monthlyTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
      const highest = transactions.length ? Math.max(...transactions.map((transaction) => transaction.amount)) : 0;

      totalBalance.textContent = rupiah(total);
      foodTotal.textContent = rupiah(totalByCategory("Food"));
      transportTotal.textContent = rupiah(totalByCategory("Transport"));
      funTotal.textContent = rupiah(totalByCategory("Fun"));
      monthTotal.textContent = rupiah(monthlyTotal);
      highestTransaction.textContent = rupiah(highest);

      if (spendingLimit > 0 && monthlyTotal > spendingLimit) {
        budgetStatus.textContent = "Over Limit";
        budgetStatus.style.color = "var(--accent)";
      } else {
        budgetStatus.textContent = "Safe";
        budgetStatus.style.color = "";
      }
    }

    function renderChart() {
      const totals = {};
      categories.forEach((cat) => { totals[cat] = 0; });
      transactions.forEach((transaction) => {
        totals[transaction.category] = (totals[transaction.category] || 0) + transaction.amount;
      });

      const ctx = document.getElementById("expenseChart");
      if (chart) chart.destroy();

      chart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: Object.keys(totals),
          datasets: [{
            data: Object.values(totals),
            backgroundColor: ["#d4514a", "#fff6c8", "#7563ff", "#64d66d", "#ffb347", "#7bdff2", "#c084fc", "#fb7185"],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                padding: 30,
                color: getComputedStyle(document.body).getPropertyValue("--text"),
                font: { family: "Poppins", size: 12 }
              }
            }
          }
        }
      });
    }

    function updateView() {
      renderCategoryOptions();
      renderMonthOptions();
      renderTransactions();
      renderSummary();
      renderChart();
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const nameValue = itemName.value.trim();
      const amountValue = Number(amount.value);
      let categoryValue = category.value;
      const customValue = customCategory.value.trim();

      if (!nameValue || !amountValue || amountValue <= 0 || !categoryValue) {
        alert("Please fill all required fields with valid values.");
        return;
      }

      if (customValue) {
        categoryValue = customValue;
        const alreadyExists = categories.some((cat) => cat.toLowerCase() === customValue.toLowerCase());
        if (!alreadyExists) categories.push(customValue);
      }

      spendingLimit = Number(limitInput.value) || spendingLimit;

      transactions.push({
        id: Date.now(),
        name: nameValue,
        amount: amountValue,
        category: categoryValue,
        date: new Date().toISOString()
      });

      form.reset();
      limitInput.value = spendingLimit || "";
      saveData();
      updateView();
    });

    transactionList.addEventListener("click", (event) => {
      const deleteButton = event.target.closest(".delete-btn");
      if (!deleteButton) return;

      const id = Number(deleteButton.dataset.id);
      transactions = transactions.filter((transaction) => transaction.id !== id);
      saveData();
      updateView();
    });

    searchInput.addEventListener("input", renderTransactions);
    sortSelect.addEventListener("change", renderTransactions);
    monthFilter.addEventListener("change", renderTransactions);

    limitInput.addEventListener("input", () => {
      spendingLimit = Number(limitInput.value) || 0;
      saveData();
      updateView();
    });

    saveProfileName.addEventListener("click", saveUserName);

    profileNameInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        saveUserName();
      }
    });

    themeToggle.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("light") ? "dark" : "light";
      localStorage.setItem("theme", nextTheme);
      applySavedTheme();
      renderChart();
    });



    let reflexScore = 0;
    let reflexBestScore = Number(localStorage.getItem("reflexBestScore")) || 0;
    let reflexTimeLeft = Number(gameDuration.value) || 30;

    let reflexTimerId = null;
    let moveMoneyId = null;
    let moveBombId = null;
    let isGameRunning = false;
    let gameSpeed = 850;

    function formatTimer(seconds) {
      const minutes = Math.floor(seconds / 60);
      const rest = seconds % 60;
      return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
    }

    function renderGameScore() {
      gameScore.textContent = reflexScore;
      bestScore.textContent = reflexBestScore;
      gameTimer.textContent = formatTimer(reflexTimeLeft);
    }

    function moveElementRandom(element) {
      if (!gameArea || !element || !isGameRunning) return;

      const maxX = Math.max(gameArea.clientWidth - element.offsetWidth - 12, 0);
      const maxY = Math.max(gameArea.clientHeight - element.offsetHeight - 12, 0);
      const randomX = Math.floor(Math.random() * maxX) + 6;
      const randomY = Math.floor(Math.random() * maxY) + 6;

      element.style.left = randomX + "px";
      element.style.top = randomY + "px";
    }

    function animateTarget(element) {
      element.animate([
        { transform: "scale(1) rotate(0deg)" },
        { transform: "scale(1.28) rotate(10deg)" },
        { transform: "scale(1) rotate(0deg)" }
      ], {
        duration: 200,
        easing: "ease-out"
      });
    }

    function finishGame() {
      isGameRunning = false;

      clearInterval(reflexTimerId);
      clearInterval(moveMoneyId);
      clearInterval(moveBombId);

      gameTarget.style.display = "none";
      bombTarget.style.display = "none";
      gameOverlay.style.display = "grid";

      playGameBtn.disabled = false;
      playGameBtn.textContent = "Play Again";
      gameDuration.disabled = false;

      let message = "Nice try";
      if (reflexScore >= 35) message = "Keren banget";
      else if (reflexScore >= 20) message = "Lumayan jago";
      else if (reflexScore >= 10) message = "Bagus";

      if (reflexScore > reflexBestScore) {
        reflexBestScore = reflexScore;
        localStorage.setItem("reflexBestScore", reflexBestScore);
        gameResult.textContent = `${message}! Final Score: ${reflexScore}. New best score!`;
      } else {
        gameResult.textContent = `${message}! Final Score: ${reflexScore}. Best Score: ${reflexBestScore}.`;
      }

      gameOverlay.innerHTML = `
        <div>
          <h4>Game Finished</h4>
          <p>
            Final Score: <strong>${reflexScore}</strong><br>
            Best Score: <strong>${reflexBestScore}</strong>
          </p>
        </div>
      `;

      renderGameScore();
    }

    function startGame() {
      reflexScore = 0;
      reflexTimeLeft = Number(gameDuration.value) || 30;
      gameSpeed = 850;
      isGameRunning = true;

      clearInterval(reflexTimerId);
      clearInterval(moveMoneyId);
      clearInterval(moveBombId);

      gameOverlay.style.display = "none";
      gameTarget.style.display = "grid";
      bombTarget.style.display = "grid";

      playGameBtn.disabled = true;
      playGameBtn.textContent = "Playing...";
      gameDuration.disabled = true;
      gameResult.textContent = "Klik uang untuk +1. Hindari bom karena score -2.";

      renderGameScore();
      moveElementRandom(gameTarget);
      moveElementRandom(bombTarget);

      moveMoneyId = setInterval(() => moveElementRandom(gameTarget), gameSpeed);
      moveBombId = setInterval(() => moveElementRandom(bombTarget), gameSpeed + 180);

      reflexTimerId = setInterval(() => {
        reflexTimeLeft -= 1;

        if (reflexTimeLeft > 0 && reflexTimeLeft % 10 === 0 && gameSpeed > 420) {
          gameSpeed -= 90;
          clearInterval(moveMoneyId);
          clearInterval(moveBombId);
          moveMoneyId = setInterval(() => moveElementRandom(gameTarget), gameSpeed);
          moveBombId = setInterval(() => moveElementRandom(bombTarget), gameSpeed + 140);
        }

        renderGameScore();

        if (reflexTimeLeft <= 0) {
          finishGame();
        }
      }, 1000);
    }

    gameTarget.addEventListener("click", () => {
      if (!isGameRunning) return;

      reflexScore += 1;
      renderGameScore();
      animateTarget(gameTarget);
      moveElementRandom(gameTarget);
    });

    bombTarget.addEventListener("click", () => {
      if (!isGameRunning) return;

      reflexScore = Math.max(0, reflexScore - 2);
      renderGameScore();
      animateTarget(bombTarget);
      moveElementRandom(bombTarget);

      gameResult.textContent = "Oops, kamu kena bom. Score dikurangi 2.";
      setTimeout(() => {
        if (isGameRunning) {
          gameResult.textContent = "Klik uang untuk +1. Hindari bom karena score -2.";
        }
      }, 900);
    });

    playGameBtn.addEventListener("click", startGame);

    gameDuration.addEventListener("change", () => {
      if (isGameRunning) return;
      reflexTimeLeft = Number(gameDuration.value) || 30;
      renderGameScore();
      gameResult.textContent = "Pilih durasi lalu mulai game.";
    });

    limitInput.value = spendingLimit || "";
    applySavedTheme();
    renderUserName();
    updateView();
    renderGameScore();