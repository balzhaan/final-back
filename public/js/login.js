const loginForm = document.getElementById('loginForm');
const errorMessageDiv = document.getElementById('error-message');

loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); 

    const formData = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
    };

    axios.post('/auth/login', formData)
        .then(response => {
            // Check if 2FA is required
            if (response.data.success === "2Fa") {
                window.location.href = `/verify-otp?username=${formData.username}`;
            } else if (response.data.success === "no2Fa"){
                window.location.href = `/home`;
            } 
    
        })
        .catch(error => {
            const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
            errorMessageDiv.textContent = errorMsg;
            errorMessageDiv.style.display = 'block';
        });
});