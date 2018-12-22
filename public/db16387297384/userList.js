function hasClass(element, className) {
  return (' ' + element.className + ' ').indexOf(' ' + className+ ' ') > -1;
}
function removeElement(elementId) {
  // Removes an element from the document
  var element = document.getElementById(elementId);
  element.parentNode.removeChild(element);
}

// Initialize Firebase
var config = {
  apiKey: "AIzaSyBbyExXHZCfbWT6O_4nq9ahMlG8bsMpnwc",
  authDomain: "hurbanize-expo.firebaseapp.com",
  databaseURL: "https://hurbanize-expo.firebaseio.com",
  projectId: "hurbanize-expo",
  storageBucket: "hurbanize-expo.appspot.com",
};
firebase.initializeApp(config);
var database = firebase.database();
var databaseOutput = document.getElementById('database-output');
var usersRef = database.ref('/users/');

function userCheckListner(el) {
  el.addEventListener('click', function () {
    database.ref('users/'+el.id.replace('checkbox-','')).update({
      'checked': el.checked
    });
  });
}
function userDelListner(el) {
  el.addEventListener('click', function () {
    var id = el.id.replace('delete-','');
    
    swal({
      title: "Tem certeza?",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      console.log(willDelete);
      if (willDelete) {
        console.log('Deletado '+ 'users/'+id);
        database.ref('users/'+id).remove();
        removeElement(id);
      }
    });
  });
}

function initUserClickListners() {
  let checkboxes = document.getElementsByClassName('checkboxes');
  for (let i = 0; i < checkboxes.length; i++) {
    userCheckListner(checkboxes[i]);
  }
  let deletes = document.getElementsByClassName('delete');
  for (let i = 0; i < deletes.length; i++) {
    userDelListner(deletes[i]);
  }
}

function showUser(key, user, update) {
  let email = user.email;
  let img = user.img;
  let scenario = user.scenario;
  let checked = user.checked ? 'checked' : '';
  let date = user.timestamp ? user.timestamp.substr(0,25) : '';
  let editUser = document.getElementById(key);
  let html = `
    <div class="user ${checked}" id="${key}">
      <button class="delete" id="delete-${key}">x</button>
      <input type="checkbox" class="checkboxes" id="checkbox-${key}" ${checked} />
      <div class="email" >
        ${email}
      </div>
      <div class="date" >
        ${date}
      </div>
      <div class="imgs" >
        <img src="${scenario}">
        <img src="${img}">
      </div>
    </div>`;
  if (editUser) {
    editUser.outerHTML = html;
    userCheckListner(document.getElementById('checkbox-'+key));
    userDelListner(document.getElementById('delete-'+key));
  } else {
    databaseOutput.innerHTML = html + databaseOutput.innerHTML;
    initUserClickListners();
  }
  
}

usersRef.on('child_added', function(data) {
  showUser(data.key, data.val());
  document.getElementById('loading-spinner').style.display = 'none';
});
usersRef.on('child_changed', function(data) {
  showUser(data.key, data.val());
});
