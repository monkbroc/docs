$(function() {
  var group;
  if(group = Cookies.get("group")) {
    var workshopRef = new Firebase("https://amber-inferno-5127.firebaseio.com/" + location.host + "/" + group + "/");
    var pageRef = workshopRef.child(location.pathname);
    var user;

    authUser().
      then(setUser).
      then(loadCheckboxValues).
      then(populateCheckboxes).
      then(trackCheckboxChanges).
      done();

    function authUser() {
      // Promise-ify the call to workshopRef.authAnonymously(function(error, authData) { })
      return Q.ninvoke(workshopRef, "authAnonymously");
    }

    function setUser(authData) {
      user = authData.uid;
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
      var done = step.child("students/" + user).val() === "done";
      el.checked = done;
    }

    function trackCheckboxChanges() {
      $(".big_checkbox").on("change", function() {
        var step = $(this).parent().text().trim();
        var done = this.checked;
        var stepRef = pageRef.child(this.id);
        stepRef.update({ name: step });
        stepRef.child("students/" + user).set(done ? "done" : null);
      });
    }
  }
});
