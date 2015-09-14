$(function() {
  var group;
  if(group = Cookies.get("group")) {
    var workshopRef = new Firebase("https://amber-inferno-5127.firebaseio.com/" + location.host + "/" + group + "/");
    var lessonRef = workshopRef.child(location.pathname);
    var user = getUser();

    lessonRef.once("value", function(steps) {
      steps.forEach(populateCheckbox);
      trackCheckboxChanges();
    });

    function getUser() {
      var user = Cookies.get("user");
      if(!user) {
        var userRef = workshopRef.child('users').push();
        user = userRef.key();
        userRef.set("student");
        Cookies.set("user", user);
      }
      return user;
    }

    function populateCheckbox(step) {
      var id = step.key();
      var el = document.getElementById(id);
      if(!el) {
        return;
      }
      var done = step.child("users/" + user).val() === "done";
      el.checked = done;
    }

    function trackCheckboxChanges() {
      $(".big_checkbox").on("change", function() {
        var step = $(this).parent().text().trim();
        var done = this.checked;
        var stepRef = lessonRef.child(this.id);
        stepRef.update({ name: step });
        stepRef.child("users/" + user).set(done ? "done" : null);
      });
    }
  }
});
