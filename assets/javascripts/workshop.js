$(function() {
  var group;
  if(group = Cookies.get("group")) {
    var railsbridgeRef = new Firebase("https://amber-inferno-5127.firebaseio.com/");
    var workshopRef = railsbridgeRef.child(location.host + "/" + group + "/");
    var pageRef = workshopRef.child(location.pathname);
    var user;

    Q.fcall(authUser).
      then(setUser).
      then(reportPresence).
      then(loadCheckboxValues).
      then(populateCheckboxes).
      then(trackCheckboxChanges).
      done();

    function authUser() {
      var authData = workshopRef.getAuth();
      if(authData) {
        return authData;
      } else {
        // Promise-ify the call to workshopRef.authAnonymously(function(error, authData) { })
        return Q.ninvoke(workshopRef, "authAnonymously");
      }
    }

    function setUser(authData) {
      user = authData.uid;
    }

    function reportPresence() {
      var onlineRef = railsbridgeRef.child(".info/connected");
      var presenceRef = workshopRef.child("presence/" + user);

      onlineRef.on('value', function(isOnline) {
        if(isOnline.val()) {
          presenceRef.onDisconnect().remove();
          presenceRef.set(true);
        }
      });
    }

    function loadCheckboxValues() {
      return new Promise(function (fulfill) {
        pageRef.once("value", fulfill);
      });
    }

    function populateCheckboxes(steps) {
      return steps.forEach(populateCheckbox);
    }

    function populateCheckbox(step) {
      var id = step.key();
      var el = document.getElementById(id);
      if(!el) {
        return;
      }
      var done = step.child("students-done/" + user).val();
      el.checked = done;
    }

    function trackCheckboxChanges() {
      $(".big_checkbox").on("change", function() {
        var step = $(this).parent().text().trim();
        var done = this.checked;
        var stepRef = pageRef.child(this.id);
        stepRef.update({ name: step });
        stepRef.child("students-done/" + user).set(done ? true : null);
      });
    }
  }
});
