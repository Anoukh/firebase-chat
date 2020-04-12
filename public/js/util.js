var SENDER_MSG_TEMPLATE = 
'<div class="media w-50 mb-3">' +
    '<img src="" alt="user" width="50" class="rounded-circle">' +
    '<div class="media-body ml-3">' +
        '<div class="bg-light rounded py-2 px-3 mb-2">' +
            '<p class="text-small mb-0 text-muted"></p>' +
        '</div>' +
        '<p class="small text-muted"></p>' +
    '</div>' +
'</div>';

var RECEIVER_MSG_TEMPLATE =
'<div class="media w-50 ml-auto mb-3">' +
    '<div class="media-body">' +
        '<div class="bg-primary rounded py-2 px-3 mb-2">' +
            '<p class="text-small mb-0 text-white"></p>' +
        '</div>' +
        '<p class="small text-muted"></p>' +
    '</div>' +
'</div>'

var CONTACT_TEMPLATE = 
'<div class="list-group rounded-0">' +
    '<a class="list-group-item list-group-item-action list-group-item-light rounded-0">' +
        '<div class="media"><img src="" alt="user" width="50" class="rounded-circle">' +
            '<div class="media-body ml-4">' +
                '<div class="d-flex align-items-center justify-content-between mb-1">' +
                    '<h6 class="mb-0"></h6>' +
                    '<small class="small font-weight-bold"></small>' +
                '</div>' +
                '<p class="font-italic mb-0 text-small"></p>' +
            '</div>' +
        '</div>' +
    '</a>' +
'</div>'

var NOTIFICATION = 
'<span style="color: Dodgerblue;">' +
    '<i class="fas fa-circle"></i>' +   
'</span>'


function getMonthString(month) {
    switch (month) {
        case 0:
            return "Jan"
        case 1:
            return "Feb"
        case 2:
            return "Mar"   
        case 3:
            return "Apr"   
        case 4:
            return "May"   
        case 5:
            return "Jun"   
        case 6:
            return "July"   
        case 7:
            return "Aug"   
        case 8:
            return "Sep"   
        case 9:
            return "Oct"   
        case 10:
            return "Nov"   
        case 11:
            return "Dec"       
    }
}

function addSizeToGoogleProfilePic(url) {
    if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
      return url + '?sz=150';
    }
    return url;
}

function getChatId(userId, contactId) {
    var chatId
    if (contactId > userId) {
        chatId = contactId + ":" + userId
    } else {
        chatId = userId + ":" + contactId
    }
    return chatId
}

function getParentAnchorElement(event) {
    var parent = event.target
    while (parent && parent.tagName != "A") {
        parent = parent.parentNode;
    }
    return parent
}