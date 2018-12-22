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
var filterDayInput = document.getElementById('filter-day');
var loading = document.getElementById('loading-spinner');
var noResult = document.getElementById('no-result');

var filterDay
var day
var usersRef
var userRefStr;

function hasClass(element, className) {
  return (' ' + element.className + ' ').indexOf(' ' + className+ ' ') > -1;
}
function removeElement(elementId) {
  // Removes an element from the document
  var element = document.getElementById(elementId);
  element.parentNode.removeChild(element);
}
location.parseHash = function(){
   var hash = (this.hash ||'').replace(/^#/,'').split('&'),
       parsed = {};

   for(var i =0,el;i<hash.length; i++ ){
        el=hash[i].split('=')
        parsed[el[0]] = el[1];
   }
   return parsed;
};

function userCheckListner(el) {
  el.addEventListener('click', function () {
    database.ref(userRefStr+el.id.replace('checkbox-','')).update({
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
      if (willDelete) {
        database.ref(userRefStr+id).remove();
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

function init() {

  
  var today = new Date().toISOString().slice(0,10);
  filterDay = location.parseHash().day;
  day = filterDay ? filterDay : today;
  filterDayInput.value = day;
  userRefStr = '/users-'+ day +'/';
  usersRef = database.ref(userRefStr);

  loading.style.display = 'block';
  noResult.style.display = 'none';
  databaseOutput.innerHTML = '';
  filterDayInput.disabled = true;
  
  filterDayInput.addEventListener('change', function () {
    window.location.hash = 'day='+filterDayInput.value;
    init();
  });

  window.onhashchange = function () {
    init();
  };

  usersRef.off();

  usersRef.on('value', function(snapshot) {
    filterDayInput.removeAttribute('disabled');
    loading.style.display = 'none';
    var users = snapshot.val();
    if (users) {
      for (let i = 0; i < users.length; i++) {
        showUser(users[i].key, users[i]);
      }
    } else {
      noResult.style.display = 'block';
    }
  });

  usersRef.on('child_added', function(data) {
    showUser(data.key, data.val());
  });
  usersRef.on('child_changed', function(data) {
    showUser(data.key, data.val());
  });

}

init();
