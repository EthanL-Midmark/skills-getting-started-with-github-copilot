document.addEventListener("DOMContentLoaded", () => {
  const activitiesContainer = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Load activities when page loads
  loadActivities();

  async function loadActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      displayActivities(activities);
      populateActivitySelect(activities);
    } catch (error) {
      console.error("Error loading activities:", error);
      activitiesContainer.innerHTML = '<p class="error">Failed to load activities. Please try again later.</p>';
    }
  }

  function displayActivities(activities) {
    activitiesContainer.innerHTML = "";

    Object.entries(activities).forEach(([name, details]) => {
      const activityCard = createActivityCard(name, details);
      activitiesContainer.appendChild(activityCard);
    });
  }

  function createActivityCard(name, details) {
    const template = document.getElementById("activity-card-template");
    const cardElement = template.content.cloneNode(true);

    // Populate activity info
    cardElement.querySelector(".activity-name").textContent = name;
    cardElement.querySelector(".activity-description").textContent = details.description;
    cardElement.querySelector(".activity-schedule").textContent = details.schedule;

    // Populate participants section
    const participantCount = cardElement.querySelector(".participant-count");
    const participantsList = cardElement.querySelector(".participants-list");
    const noParticipants = cardElement.querySelector(".no-participants");

    participantCount.textContent = `(${details.participants.length}/${details.max_participants})`;

    if (details.participants.length > 0) {
      details.participants.forEach(email => {
        const listItem = document.createElement("li");
        listItem.textContent = email;
        participantsList.appendChild(listItem);
      });
      noParticipants.style.display = "none";
      participantsList.style.display = "block";
    } else {
      noParticipants.style.display = "block";
      participantsList.style.display = "none";
    }

    // Add signup button functionality
    const signupButton = cardElement.querySelector(".signup-button");
    signupButton.addEventListener("click", () => {
      const activitySelect = document.getElementById("activity");
      activitySelect.value = name;
      document.getElementById("signup-container").scrollIntoView({ behavior: "smooth" });
    });

    return cardElement;
  }

  function populateActivitySelect(activities) {
    // Clear existing options except the first one
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

    Object.keys(activities).forEach(activityName => {
      const option = document.createElement("option");
      option.value = activityName;
      option.textContent = activityName;
      activitySelect.appendChild(option);
    });
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    if (!email || !activity) {
      showMessage("Please fill in all fields.", "error");
      return;
    }

    try {
      const response = await fetch(`/activities/${encodeURIComponent(activity)}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `email=${encodeURIComponent(email)}`
      });

      if (response.ok) {
        const result = await response.json();
        showMessage(result.message, "success");
        signupForm.reset();
        // Reload activities to show updated participant list
        loadActivities();
      } else {
        const error = await response.json();
        showMessage(error.detail, "error");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      showMessage("Failed to sign up. Please try again later.", "error");
    }
  });

  function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = type;
    messageDiv.classList.remove("hidden");

    // Hide message after 5 seconds
    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }
});
