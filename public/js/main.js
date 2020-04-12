var loggedInUser
var currentSelectedContact
var activeChatId

function signIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
}

function signOut() {
    firebase.auth().signOut();
    currentSelectedContact = undefined
    loggedInUser = undefined
    activeChatId = undefined
    var count = messageBoxElement.childElementCount
    for (let index = 0; index < count; index++) {
        messageBoxElement.removeChild(messageBoxElement.firstElementChild)
    }

    var count2 = chatBoxElement.childElementCount
    for (let index = 0; index < count2; index++) {
        chatBoxElement.removeChild(chatBoxElement.firstElementChild)
    }
}

function registerNewUser(userId, userName, profilePicUrl, _callback) {
    document.getElementById("dialog-form").removeAttribute("hidden")
    var role
    var dialog = $( "#dialog-form" ).dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            "Submit": function() {
                role = document.querySelector('input[name="role"]:checked').value;
                persistNewUser(userId, userName, profilePicUrl, role)
                dialog.dialog( "close" );
                _callback()
            }
        }
    });
    dialog.dialog( "open" );
    return role
}

function persistNewUser(userId, userName, profilePicUrl, role) {
    firebase.database().ref('/users/' + userId).set({
        "name" : userName,
        "profilePic" : profilePicUrl,
        "role" : role
    })
    if (role == "DOCTOR") {
        firebase.database().ref('/doctors/' + userId).set({
            "name" : userName,
            "profilePicUrl" : profilePicUrl,
            "created" : new Date().getTime()
        })
    }
    if (role == "PATIENT") {
        firebase.database().ref('/patients/' + userId).set({
            "name" : userName,
            "profilePicUrl" : profilePicUrl,
            "created" : new Date().getTime()
        })
    }
}

function initFirebaseAuth() {
    firebase.auth().onAuthStateChanged(authStateObserver);
}

function authStateObserver(user) {
    if (user) {
        var profilePicUrl = firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
        var userName = firebase.auth().currentUser.displayName;
        var uid = firebase.auth().currentUser.uid;
        
        userProPicElement.style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(profilePicUrl) + ')';
        userNameElement.textContent = userName;
  
        userNameElement.removeAttribute('hidden');
        userProPicElement.removeAttribute('hidden');
        mainContentElement.removeAttribute('hidden');
        logoutButtonElement.removeAttribute('hidden');
  
        loginButtonElement.setAttribute('hidden', 'true');
        loggedInUser = {
            "uid": uid,
            "userName": userName,
            "profilePicUrl": profilePicUrl
        }
        initUsers(uid, userName, profilePicUrl)
    } else {
        userNameElement.setAttribute('hidden', 'true');
        userProPicElement.setAttribute('hidden', 'true');
        logoutButtonElement.setAttribute('hidden', 'true');
        mainContentElement.setAttribute('hidden', 'true');
        loginButtonElement.removeAttribute('hidden');
    }
}

function initUsers(userId, userName, profilePicUrl) {
    firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
        if (snapshot.val() && snapshot.val().name) {
            var role = snapshot.val().role
            initContactBox(role)
        } else {
            registerNewUser(userId, userName, profilePicUrl, function() {
                firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
                    var role = snapshot.val().role
                    initContactBox(role)
                })
            })
        }
    });
}

function initContactBox(role) {
    if (role == "PATIENT") {
        contactHeadingElement.textContent = "Available Doctors"
        loadContacts("doctors")
    } else {
        contactHeadingElement.textContent = "Available Patients"
        loadContacts("patients")
    }
}

var silencedNotification
var contactBoxes = []

function loadContacts(contactType) {
    firebase.database().ref('/'+ contactType +'/').once('value').then(function(snapshot) {
        for (let [contactId, doctor] of Object.entries(snapshot.val())) {
            const container = document.createElement('div');
            container.innerHTML = CONTACT_TEMPLATE;

            container.getElementsByTagName("h6")[0].textContent = doctor.name
            container.getElementsByTagName("img")[0].setAttribute("src", doctor.profilePicUrl)
            var aElementId = "user-id-" + messageBoxElement.childElementCount
            container.getElementsByTagName("a")[0].setAttribute("id", aElementId)
            container.getElementsByTagName("a")[0].addEventListener('click', selectContact);

            var input = document.createElement("input");
            input.setAttribute("type", "hidden");
            input.setAttribute("name", "user-id");
            input.setAttribute("value", contactId);

            container.getElementsByTagName("a")[0].appendChild(input)
            messageBoxElement.appendChild(container)

            var chatId = getChatId(loggedInUser.uid, contactId)

            contactBoxes.push({
                "chatId" : chatId, 
                "elementId": aElementId 
            });
        }
        startListeningToMessages()
    });
}

function startListeningToMessages() {
    contactBoxes.forEach((contactBox) => {
        var messageListener = firebase.database().ref('chats/' + contactBox.chatId)
        messageListener.on('child_added', function(snapshot) {
            if (activeChatId == contactBox.chatId) {
                var event = snapshot.val()
                if (event["sender-id"] == loggedInUser.uid) {
                    const container = document.createElement('div');
                    container.innerHTML = RECEIVER_MSG_TEMPLATE;

                    container.getElementsByTagName("p")[0].textContent = event.message
                    var date = new Date(event.timestamp)
                    var displayDate = date.getDate() + " " + getMonthString(date.getMonth()) + " | " + date.getHours() + ":" + date.getMinutes()
                    container.getElementsByTagName("p")[1].textContent = displayDate
                    chatBoxElement.appendChild(container)
                    chatBoxElement.scrollTop = chatBoxElement.scrollHeight
                } else {
                    const container = document.createElement('div');
                    container.innerHTML = SENDER_MSG_TEMPLATE;

                    container.getElementsByTagName("p")[0].textContent = event.message
                    var date = new Date(event.timestamp)
                    var displayDate = date.getDate() + " " + getMonthString(date.getMonth()) + " | " + date.getHours() + ":" + date.getMinutes()
                    container.getElementsByTagName("p")[1].textContent = displayDate
                    var imgSrc = currentSelectedContact.getElementsByTagName("img")[0].getAttribute("src")
                    container.getElementsByTagName("img")[0].setAttribute("src", imgSrc)
                    chatBoxElement.appendChild(container)
                    chatBoxElement.scrollTop = chatBoxElement.scrollHeight
                }
            } else {
                var cont = document.getElementById(contactBox.elementId)
                if (!cont.getElementsByTagName("i")[0] && !cont.getElementsByTagName("svg")[0]) {
                    cont.getElementsByTagName("h6")[0].parentNode.innerHTML += NOTIFICATION
                }
            }
        })
    })
}

function selectContact(event) {
    if (currentSelectedContact) {
        currentSelectedContact.classList.add("list-group-item-light")
        currentSelectedContact.classList.remove("active")
    }

    var parentAElement = getParentAnchorElement(event)
    parentAElement.classList.remove("list-group-item-light")
    parentAElement.classList.add("active")
    currentSelectedContact = parentAElement

    if (parentAElement.getElementsByTagName("svg")[0]) {
        parentAElement.getElementsByTagName("svg")[0].parentNode.removeChild(parentAElement.getElementsByTagName("svg")[0])
    }

    var count = chatBoxElement.childElementCount
    for (let index = 0; index < count; index++) {
        chatBoxElement.removeChild(chatBoxElement.firstElementChild)
    }

    var contactId = parentAElement.getElementsByTagName("INPUT")[0].value
    var userId = loggedInUser.uid

    var chatId = getChatId(userId, contactId)
    activeChatId = chatId

    firebase.database().ref('chats/' + chatId).once('value', function(snapshot) {
        if (snapshot.val()) {
            snapshot.forEach(function(childSnapshot) {
                var event = childSnapshot.val()
                if (event["sender-id"] == userId) {
                    const container = document.createElement('div');
                    container.innerHTML = RECEIVER_MSG_TEMPLATE;

                    container.getElementsByTagName("p")[0].textContent = event.message
                    var date = new Date(event.timestamp)
                    var displayDate = date.getDate() + " " + getMonthString(date.getMonth()) + " | " + date.getHours() + ":" + date.getMinutes()
                    container.getElementsByTagName("p")[1].textContent = displayDate
                    chatBoxElement.appendChild(container)
                    chatBoxElement.scrollTop = chatBoxElement.scrollHeight
                } else {
                    const container = document.createElement('div');
                    container.innerHTML = SENDER_MSG_TEMPLATE;

                    container.getElementsByTagName("p")[0].textContent = event.message
                    var date = new Date(event.timestamp)
                    var displayDate = date.getDate() + " " + getMonthString(date.getMonth()) + " | " + date.getHours() + ":" + date.getMinutes()
                    container.getElementsByTagName("p")[1].textContent = displayDate
                    var imgSrc = currentSelectedContact.getElementsByTagName("img")[0].getAttribute("src")
                    container.getElementsByTagName("img")[0].setAttribute("src", imgSrc)
                    chatBoxElement.appendChild(container)
                    chatBoxElement.scrollTop = chatBoxElement.scrollHeight
                }
            })
        }    
    });
}

function sendMessage(e) {
    e.preventDefault();
    var message = e.target.getElementsByTagName("input")[0].value
    if (!message) {
        alert("No Message To Send")
        return
    }
    if (!currentSelectedContact) {
        alert("No User Selected")
        return
    }

    if (!loggedInUser) {
        alert("No User Logged In")
        return
    }

    var contactId = currentSelectedContact.getElementsByTagName("INPUT")[0].value
    var userId = loggedInUser.uid

    var chatId = getChatId(userId, contactId)

    var chatMessage = {
        "receiver-id" : contactId,
        "sender-id" : userId,
        "message" : message,
        "timestamp" : new Date().getTime()
    };

    var newMessageId = firebase.database().ref().child('chats/' + chatId).push().key;

    var updates = {};
    updates['/chats/' + chatId + '/' + newMessageId] = chatMessage;

    firebase.database().ref().update(updates);

    e.target.getElementsByTagName("input")[0].value = ""  
}
