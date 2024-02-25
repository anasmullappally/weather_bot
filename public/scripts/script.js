function startBOT() {
    $.ajax({
        url: '/start-bot',
        method: 'post',
        success: (response) => {
            console.log("Success:", response);
            // Display success alert using SweetAlert
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
            console.error("Error:", error.responseJSON.message);
            // Display error alert using SweetAlert
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
            text: "Please Add boat API Key",
        });
    }
    if (!inputValues?.weatherApi) {
        return Swal.fire({
            icon: 'error',
            title: 'Error',
            text: "Please Add weather API Key",
        });
    }
    $.ajax({
        url: '/add-apis',
        method: 'post',
        data: inputValues,
        success: (response) => {
            // Display success alert using SweetAlert
            console.log(response);
            Swal.fire({
                icon: 'success',
                title: 'Bot started successfully',
                text: response.message,
            }).then((result) => {
                // Check if the user clicked the "OK" button
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
            console.log("Success:", response);
            // Display success alert using SweetAlert
            Swal.fire({
                icon: 'success',
                title: response.message,
            });

            // Change button text, color, and behavior
            const botButton = document.getElementById('botButton');
            botButton.style.backgroundColor = 'green'
            botButton.innerText = 'START BOT';
            botButton.onclick = startBOT;
        },
        error: (error) => {
            console.error("Error:", error.responseJSON.message);
            // Display error alert using SweetAlert
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
        // User clicked "Update"
        console.log('User clicked Update');
        console.log('Updated values:', updatedValues);

        if (!updatedValues?.botApi) {
            return Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "Please Add boat API Key",
            });
        }
        if (!updatedValues?.weatherApi) {
            return Swal.fire({
                icon: 'error',
                title: 'Error',
                text: "Please Add weather API Key",
            });
        }
        $.ajax({
            url: '/update-apis',
            method: 'post',
            data: updatedValues,
            success: (response) => {
                // Display success alert using SweetAlert
                console.log(response);
                Swal.fire({
                    icon: 'success',
                    title: 'Bot started successfully',
                    text: response.message,
                }).then((result) => {
                    // Check if the user clicked the "OK" button
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
}