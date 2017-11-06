var noteContent = "" 
noteList.forEach(function(note){
  var html = "";
  var temp;
  if(note.recipient.username){temp = "to " + note.recipient.username} else {temp = "in " + note.thread}
  html = '<div class="ui raised segment"><h4 class="header">' + note.kind + ' from ' + note.author.username + ' ' + temp + '.</h4> <p>' + note.content + '</p><div class="pull-right">' + moment(note.date).fromNow() + '<div class="ui labeled button" tabindex="0" style="margin-left: 10px"><div class="ui red button"><i class="heart icon"></i></div><a class="ui basic red left pointing label">12</a></div></div></div>'
  noteContent += html;
});
$("#note-display").html(noteContent);
  
var count = 2;
$(window).scroll(function () {
  if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
   $.ajax({
     url: "/notes/paginate", 
     data: {page: count}, 
     dataType: "json"
   })
   .done(function(data){
      data.forEach(function(note){
        var html = "";
        var temp;
        if(note.recipient.username){temp = "to " + note.recipient.username} else {temp = "in " + note.thread}
        html = '<div class="ui raised segment"><h4 class="header">' + note.kind + ' from ' + note.author.username + ' ' + temp + '.</h4> <p>' + note.content + '</p><div class="pull-right">' + moment(note.date).fromNow() + '<div class="ui labeled button" tabindex="0" style="margin-left: 10px"><div class="ui red button"><i class="heart icon"></i></div><a class="ui basic red left pointing label">12</a></div></div></div>'
        noteContent += html;
        $("#note-display").html(noteContent);
      });
   });
  count ++;
  }
});