$(document).ready(function () {
  var group = Cookies.get("group");
  if(!group) {
    return;
  }

  var railsbridgeRef = new Firebase("https://amber-inferno-5127.firebaseio.com/");
  var workshopRef = railsbridgeRef.child(location.host + "/" + group + "/");
  var pageRef = workshopRef.child(location.pathname);
  var user;

  var instructorEl = $("#instructor");
  if(instructorEl.length == 0) {
    setupDocPage();
  } else {
    setupInstructorPage();
  }

  function setupDocPage() {
    Q.fcall(authUser).
      then(setUser).
      then(reportPresence).
      then(loadCheckboxValues).
      then(populateCheckboxes).
      then(trackCheckboxChanges).
      done();
  }

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

  var templates = {
    presence: function(data) {
      with(data) {
        return h(count) + " " + h(student) + " online";
      }
    },
    topic: function(data) {
      with(data) {
        return "<h1>" + h(name) + "</h1>\n<ol>" + steps + "</ol>";
      }
    },
    step: function(data) {
      with(data) {
        return "<li>" + h(name) + ": " + h(count) + " " + h(student) + " done</li>";
      }
    }
  };

  // Encode HTML entitites
  function h(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function setupInstructorPage() {
    setupPresence();
    setupTopics();
  }

  function setupPresence() {
    var allPresenceRef = workshopRef.child("presence");
    allPresenceRef.on("value", function(allPresence) {
      renderPresence(allPresence.numChildren());
    });
  }

  function renderPresence(studentCount) {
    var presenceEl = instructorEl.find(".presence");
    presenceEl.html(templates.presence({
      count: studentCount,
      student: studentCount == 1 ? "student" : "students"
    }));
  }

  function setupTopics() {
    workshopRef.on("value", function(topics) {
      renderTopics(topics.val());
    });
  }

  function renderTopics(topics) {
    var topicsEl = instructorEl.find(".topics");
    topicsEl.html(renderTopicsRecursive("", topics));
  }

  function renderTopicsRecursive(currentTopic, topics) {
    var renderSteps = false;
    var html = "";
    for(var topic in topics) {
      if(topics.hasOwnProperty(topic) && topic != "presence") {
        var nextTopic = topics[topic];
        if(nextTopic.name) {
          renderSteps = true;
          html += renderStep(nextTopic);
        } else {
          html += renderTopicsRecursive(currentTopic + " " + topic, nextTopic);
        }
      }
    }

    if(renderSteps) {
      html = templates.topic({
        name: currentTopic,
        steps: html
      });
    }
    return html;
  }

  function renderStep(step) {
    var studentsDone = (step["students-done"] || {});
    var studentCount = 0;
    for(var student in studentsDone) {
      if(studentsDone.hasOwnProperty(student)) {
        studentCount++;
      }
    }
    return templates.step({
      name: step.name,
      count: studentCount,
      student: studentCount == 1 ? "student" : "students"
    });
  }
});
