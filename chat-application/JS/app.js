import { db } from "./config.js"
import { ref, push, onChildAdded, remove, update, onChildChanged } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js"

document.addEventListener("DOMContentLoaded", () => {
    // GET ALL REQUIRED ELEMENTS 
    const messageInput = document.getElementById("message-input");
    const chatBox = document.getElementById("chat-container")
    const sendButton = document.getElementById("send-button");
    const logoutButton = document.getElementById("logout-button");
    const messageContainer = document.getElementById("messages");
    const name = document.getElementById("name-input");
    const nameBox = document.querySelector(".nameBox")
    const joinBtn = document.getElementById("joinBtn")

    // GET NAME FOR USING IN CHAT
    const savedName = localStorage.getItem("name")
    if (savedName) {
        nameBox.style.display = "none";
        chatBox.style.display = "block";
    }
    // JOIN CHAT BUTTON
    joinBtn.addEventListener("click", () => {
        if (!savedName) {
            nameBox.style.display = "flex";
            chatBox.style.display = "none";
            const newName = name.value.trim();
            if (newName) {
                localStorage.setItem("name", newName);
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Welcome to Group Chat Developed by MAIDA SYED',
                    showConfirmButton: false,
                    timer: 1500,
                });
                nameBox.style.display = "none";
                chatBox.style.display = "block";
                messageContainer.scrollTop = messageContainer.scrollHeight;
            } else {
                Swal.fire('Enter name to join chat')
            }
        }
    })


    // LOGOUT BUTTON
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("name")
        nameBox.style.display = "flex"
        chatBox.style.display = "none"
        window.location.reload()
    })

    // GET DATE 
    const currentDate = new Date();

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const monthIndex = currentDate.getMonth();
    const monthName = monthNames[monthIndex];

    const day = currentDate.getDate();

    const year = currentDate.getFullYear();

    const date = `${day}-${monthName}-${year}`;

    // GET TIME
    // Get the current date and time
    const currentDateForTime = new Date();

    // Get the current time with AM/PM
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    const currentTime = currentDateForTime.toLocaleString('en-US', options);

    // ADD MESSAGE ON DATABASE
    const sendMessage = () => {
        const name = localStorage.getItem("name");
        const message = messageInput.value.trim();

        if (name && message) {
            const messagesRef = ref(db, "messages")
            push(messagesRef, {
                name: name,
                message: message,
                timestamp: currentTime,
                date,
                time: new Date().getTime()
            })
            messageInput.value = ""
        }

    }
    // SEND BUTTON
    sendButton.addEventListener("click", sendMessage)
    // ON ENTER KEY PRESS ON INPUT
    messageInput.addEventListener("keypress", event => {
        if (event.key === "Enter") {
            sendMessage()
        }
    })

    // ADD MESSAGE ON DOCUMENT
    const addMessageToUI = (date, name, message, time, key) => {
        const messageDiv = document.createElement("div");
        messageDiv.className = `messageDiv ${localStorage.getItem("name") === name ? 'currentUser' : 'otherUser'}`;

        const iconsHtml = localStorage.getItem("name") === name ? `
            <div class="messageIcons">
                <span class="editIcon">✎</span>
                <span class="deleteIcon">X</span>
            </div>
        ` : '';
        // MESSAGE DIV
        messageDiv.innerHTML = `
            <div class="messageContent">
                <h4>${date}</h4>
                <h2><strong>${name}:</strong></h2>
                <h3 id="text">${message}</h3>
                <h5>${time}</h5>
                <h1 id="key">${key}</h1>
            </div>
             ${iconsHtml}
        `;
        // Append the messageDiv to the UI
        messageContainer.appendChild(messageDiv);
        messageContainer.scrollTop = messageContainer.scrollHeight;

        // DELETE AND EDIT ICONS AND BUTTONS
        const editIcon = messageDiv.querySelectorAll(".editIcon");
        const deleteIcon = messageDiv.querySelectorAll(".deleteIcon");
        const overlay = document.querySelector(".overlay");
        const deleteBox = document.querySelector(".content");
        const deleteBtn = document.getElementById("delete");
        const editBox = document.querySelector(".edit-content");
        const editBtn = document.getElementById("edit")

        // DELETE MESSAGES FUNCTION
        const deleteMessage = (messageKey) => {
            deleteBox.style.display = "block";
            overlay.style.display = "block";

            const deleteMessageFromUi = () => {
                console.log("Deleting message with key:", messageKey);
                const messageRefToRemove = ref(db, "messages/" + messageKey);
                remove(messageRefToRemove)
                    .then(() => {
                        console.log("Message deleted successfully!");
                        deleteBox.style.display = "none";
                        overlay.style.display = "none";
                        messageDiv.remove();
                        Swal.fire({
                            position: 'center',
                            icon: 'success',
                            title: 'Successfully message deleted',
                            showConfirmButton: false,
                            timer: 1500,
                        });
                    })
                    .catch(error => {
                        console.error("Error deleting message: ", error);
                    });
            };

            deleteBtn.addEventListener("click", deleteMessageFromUi);
        };

        // DELETE ICON
        deleteIcon.forEach(icon => {
            icon.addEventListener("click", () => {
                const messageDiv = icon.closest(".messageDiv"); // Find the parent message container
                const messageKey = messageDiv.querySelector("#key").innerHTML;
                console.log(messageKey);
                deleteMessage(messageKey);
            });
        });
        // CANCEL BOX
        const cancelBtn = document.getElementById("cancel");
        cancelBtn.addEventListener("click", () => {
            deleteBox.style.display = "none";
            overlay.style.display = "none";
        });

        // EDIT MESSAGES FUNCTION
        const editMessage = (key, message) => {
            const input = document.getElementById("edit-input");
            editBox.style.display = "block";
            overlay.style.display = "block";

            input.value = message;

            const editMessageInUi = () => {
                const messageRefToEdit = ref(db, "messages/" + key);

                update(messageRefToEdit, {
                    message: input.value
                })
                    .then(function () {
                        editBox.style.display = "none";
                        overlay.style.display = "none";
                        window.location.reload();
                    })
            }

            editBtn.addEventListener("click", editMessageInUi)
        }
        // EDIT ICON 
        editIcon.forEach(icon => {
            icon.addEventListener("click", () => {
                const messageDiv = icon.closest(".messageDiv"); // Find the parent message container
                const messageKey = messageDiv.querySelector("#key").innerHTML;
                const message = messageDiv.querySelector("#text").innerHTML
                console.log(messageKey);
                editMessage(messageKey, message);
            });
        });

        // CANCEL EDIT BOX 
        const cancel = document.getElementById("cancel-box");
        cancel.addEventListener("click", () => {
            editBox.style.display = "none";
            overlay.style.display = "none";
        })
    };

    // GET MESSAGE DATA FROM DATABASE
    const dbRef = ref(db, "messages");
    onChildAdded(dbRef, (newMessageSnapshot) => {
        const newMessageData = newMessageSnapshot.val();
        const newMessageKey = newMessageSnapshot.key;
        console.log(newMessageKey);
        addMessageToUI(newMessageData.date, newMessageData.name, newMessageData.message, newMessageData.timestamp, newMessageKey);
    });
})