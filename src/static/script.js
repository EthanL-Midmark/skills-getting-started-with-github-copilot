// Load activities when the page loads
document.addEventListener('DOMContentLoaded', function() {
    loadActivities();
});

async function loadActivities() {
    try {
        const response = await fetch('/activities');
        const activities = await response.json();
        displayActivities(activities);
    } catch (error) {
        console.error('Error loading activities:', error);
    }
}

function displayActivities(activities) {
    const container = document.getElementById('activities-container');
    container.innerHTML = '';
    
    Object.entries(activities).forEach(([activityName, activityData]) => {
        const activityCard = createActivityCard(activityName, activityData);
        container.appendChild(activityCard);
    });
}

function createActivityCard(name, data) {
    const card = document.createElement('div');
    card.className = 'activity-card';
    
    card.innerHTML = `
        <h3>${name}</h3>
        <p class="description">${data.description}</p>
        <p class="schedule"><strong>Schedule:</strong> ${data.schedule}</p>
        <p class="capacity"><strong>Capacity:</strong> ${data.participants.length}/${data.max_participants}</p>
        
        <div class="participants-section">
            <h4 class="participants-title">
                <i class="fas fa-users"></i> Participants
                <span class="participant-count">${data.participants.length}/${data.max_participants}</span>
            </h4>
            <ul class="participants-list">
                ${data.participants.length === 0 ? 
                    '<div class="no-participants"><em>No participants yet. Be the first to sign up!</em></div>' :
                    data.participants.map(email => `<li>${email}</li>`).join('')
                }
            </ul>
        </div>
        
        <div class="signup-section">
            <input type="email" placeholder="Enter your email" class="email-input">
            <button onclick="signUpForActivity('${name}', this)" class="signup-btn">Sign Up</button>
        </div>
    `;
    
    return card;
}

async function signUpForActivity(activityName, button) {
    const card = button.closest('.activity-card');
    const emailInput = card.querySelector('.email-input');
    const email = emailInput.value.trim();
    
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    try {
        const response = await fetch(`/activities/${encodeURIComponent(activityName)}/signup?email=${encodeURIComponent(email)}`, {
            method: 'POST'
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(result.message);
            emailInput.value = '';
            loadActivities();
        } else {
            const error = await response.json();
            alert(error.detail);
        }
    } catch (error) {
        console.error('Error signing up:', error);
        alert('Error signing up. Please try again.');
    }
}