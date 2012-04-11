$(document).ready(function () {
  var socket = io.connect().of("/pluginfw/installer");

  var doUpdate = false;

  function updateHandlers() {
    $("#progress.dialog .close").unbind('click').click(function () {
      $("#progress.dialog").hide();
    });

    $("#do-search").unbind('click').click(function () {
      if ($("#search-query")[0].value != "")
        socket.emit("search", $("#search-query")[0].value);
    });

    $(".do-install").unbind('click').click(function (e) {
      var row = $(e.target).closest("tr");
      doUpdate = true;
      socket.emit("install", row.find(".name").html());
    });

    $(".do-uninstall").unbind('click').click(function (e) {
      var row = $(e.target).closest("tr");
      doUpdate = true;
      socket.emit("uninstall", row.find(".name").html());
    });
  }

  updateHandlers();

  socket.on('progress', function (data) {
    $("#progress.dialog .close").hide();
    $("#progress.dialog").show();
    var message = "Unknown status";
    if (data.message) {
      message = "<span class='status'>" + data.message.toString() + "</span>";
    }
    if (data.error) {
      message = "<span class='error'>" + data.error.toString() + "<span>";            
    }
    $("#progress.dialog .message").html(message);
    $("#progress.dialog .history").append("<div>" + message + "</div>");

    if (data.progress >= 1) {
      if (data.error) {
        $("#progress.dialog .close").show();
      } else {
        if (doUpdate) {
          doUpdate = false;
          socket.emit("load");
        }
        $("#progress.dialog").hide();
      }
    }
  });

  socket.on('search-result', function (data) {
    $("#search-results *").remove();
    for (plugin_name in data.results) {
      var plugin = data.results[plugin_name];
      var row = $("#search-result-template").clone();

      for (attr in plugin) {
        row.find("." + attr).html(plugin[attr]);
      }
      $("#search-results").append(row);
    }
    updateHandlers();
  });

  socket.on('installed-results', function (data) {
    $("#installed-plugins *").remove();
    for (plugin_name in data.results) {
      var plugin = data.results[plugin_name];
      var row = $("#installed-plugin-template").clone();

      for (attr in plugin.package) {
        row.find("." + attr).html(plugin.package[attr]);
      }
      $("#installed-plugins").append(row);
    }
    updateHandlers();
  });

  socket.emit("load");

});
