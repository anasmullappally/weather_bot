function startBOT() {
    $.ajax({
        url: '/start-bot',
        method: 'post',
        success: (response) => {
            Swal.fire({
                icon: 'success',
                title: response.message
            });

            // Change button text, color, and behavior
            const botButton = document.getElementById('botButton');
            botButton.innerText = 'STOP BOT';
            botButton.style.backgroundColor = 'red'; // Set the button color
            botButton.onclick = stopBOT;
        },
        error: (error) => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.responseJSON.message,
            });
        },
    });
}


function addAPIKeys(inputIds) {
    // Create an object to store the input values
    const inputValues = {};

    // Iterate through the inputIds and retrieve the input values
    inputIds.forEach(id => {
        const inputElement = document.getElementById(id);
        inputValues[id] = inputElement.value;
    });

    if (!inputValues?.botApi) {
        return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please add a valid API key for the bot.',
        });
    }

    if (!inputValues?.weatherApi) {
        return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please add a valid API key for the weather service.',
        });
    }

    if (!inputValues.frequency) {
        return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please specify the message frequency.',
        });
    }

    if (inputValues.frequency <= 0) {
        return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Message frequency must be greater than 0.',
        });
    }

    $.ajax({
        url: '/api',
        method: 'post',
        data: inputValues,
        success: (response) => {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: response.message,
            }).then((result) => {
                // Check if the user clicked the 'OK' button
                if (result.isConfirmed || result.isDismissed) {
                    // Reload the page
                    window.location.reload();
                }
            });
        },
        error: (error) => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.responseJSON.message,
            });
        },
    });

}


function stopBOT() {
    $.ajax({
        url: '/stop-bot',
        method: 'post',
        success: (response) => {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: response.message,
            });
            const botButton = document.getElementById('botButton');
            botButton.style.backgroundColor = 'green'
            botButton.innerText = 'START BOT';
            botButton.onclick = startBOT;
        },
        error: (error) => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.responseJSON.message,
            });
        },
    });
}

function redirectToApi() {
    window.location.href = '/api';
}

function redirectToHome() {
    window.location.href = '/';
}

function redirectToUsers() {
    window.location.href = '/users';
}

function toggleEdit(...inputIds) {
    // Create a variable to track the initial disabled state
    let initialDisabledState = false;

    const updatedValues = {};  // Object to store updated values

    inputIds.forEach(id => {
        const inputElement = document.getElementById(id);

        // Check the initial disabled state of the first input element
        if (id === inputIds[0]) {
            initialDisabledState = inputElement.disabled;
        }

        if (!inputElement.disabled) {
            // Save the updated value before toggling the disabled state
            updatedValues[id] = inputElement.value;
        }

        // Toggle the disabled state
        inputElement.disabled = !inputElement.disabled;
    });

    const editButton = document.querySelector('.btn-secondary');

    // Check if any input element is currently enabled
    const hasEnabledInput = inputIds.some(id => !document.getElementById(id).disabled);

    // Determine the button label based on the state change
    editButton.textContent = hasEnabledInput ? 'Update' : 'Edit';

    // You can now use the updatedValues object to access the edited values
    if (!hasEnabledInput) {
        // User clicked 'Update

        if (!updatedValues?.botApi) {
            return Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please add a valid API key for the bot.',
            });
        }
        if (!updatedValues?.weatherApi) {
            return Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please add a valid API key for the weather service.',
            });
        }

        if (!updatedValues.frequency) {
            return Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Please specify the message frequency.',
            });
        }

        if (updatedValues.frequency <= 0) {
            return Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Message frequency must be greater than 0.',
            });
        }

        $.ajax({
            url: '/api',
            method: 'put',
            data: updatedValues,
            success: (response) => {
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: response.message,
                }).then((result) => {
                    if (result.isConfirmed || result.isDismissed) {
                        window.location.reload();
                    }
                });
            },
            error: (error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.responseJSON.message,
                });
            },
        });

    }
}

function toggleBlock(userId, username) {
    const button = document.querySelector(`button[data-user-id='${userId}']`);
    const action = button?.innerText.toLowerCase()
    if (!action) {
        return console.log('No action');
    }
    Swal.fire({
        title: action,
        text: `Do you want to ${action} the user:${username}?`,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Yes',
        denyButtonText: `No`
    }).then((result) => {
        if (result.isConfirmed) {
            // 
            $.ajax({
                url: '/users/toggle-block',
                method: 'put',
                data: { userId, username, action },
                success: (response) => {
                    Swal.fire(response.message, '', 'success');
                    if (button) {
                        button.innerText = action === 'block' ? 'Unblock' : 'Block';
                        button.classList.remove(action === 'block' ? 'btn-danger' : 'btn-success');
                        button.classList.add(action === 'block' ? 'btn-success' : 'btn-danger');
                    }
                },
                error: (error) => {
                    Swal.fire(error.responseJSON.message, '', 'error');
                }
            })
        } else if (result.isDenied) {
            Swal.fire('Changes are not saved', '', 'info');
        }
    });
}