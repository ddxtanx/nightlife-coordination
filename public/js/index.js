Object.prototype.hasOwnProperty = function(property) {
    return typeof this[property] !== 'undefined';
};
function updateButton(button, inc){
    var past = button.attr('people-going');
    past = parseInt(past);
    var now = past+inc;
    button.attr('people-going', now);
    button.text(now+" People Going");
    if(inc==1){
        button.attr('doing', 'removing');
    }else{
        button.attr('doing', 'adding');
    }
}
function setPeopleGoing(){
    var bars = $(".bar");
    var name;
    for(var x = 0; x<bars.length; x++){
        name = $("#bar"+x).attr("for-bar");
        $.ajax({
            type:"POST",
            url:"/api/people",
            data:{
                name: name
            },
            success: function(data){
                var people = data.numPeopleGoing;
                var peopleGoing = data.peopleGoing;
                var buttonName = ".bar-button[for-bar='"+data.name+"']";
                $(buttonName).text(people+" People Going");
                $(buttonName).attr("people-going", people);
                if(peopleGoing.includes(username)){
                    $(buttonName).attr("doing", "removing");
                } else if(username==""){
                    $(buttonName).prop("disabled", true);
                }
            }
        })
    }
}
function createBar(name, inc){
    $.ajax({
        type: 'POST',
        url:"/api/go",
        data:{
            name: name,
            increment: inc
        },
        success: function(){
            var button = $(".bar-button[for-bar='"+name+"']")
            updateButton(button, inc);
        },
        error: function(){
            
        }
    })
}
function addToBar(name, inc){
    $.ajax({
        type: 'POST',
        url:"/api/go",
        data:{
            name: name,
            increment: inc
        },
        success: function(){
            var button = $(".bar-button[for-bar='"+name+"']")
            updateButton(button, inc);
        },
        error: function(){
            
        }
    })
}
$(document).ready(function(){
    $("#submit").click(function(){
        $("#bars").html("");
        var city = $("#location").val();
        if(city===""){
            return;
        }
        $.ajax({
            type: "POST",
            url:"/api/bars",
            data:{
              city: city
            }, 
          success: function(data){
              var prettyData = JSON.stringify(data);
              for (var x = 0; x<data.length; x++){
                  var bar = data[x];
                  var image = (bar.hasOwnProperty('image_url'))?bar.image_url:"/img/party.png";
                  var name = bar.name
                  var url = (bar.hasOwnProperty('url'))?bar.url:"#bars"
                  var tags = bar.categories;
                  var tagsText = "Tags: "
                  for(var y = 0; y<tags.length; y++){
                      tagsText = tagsText+tags[y].title+", ";
                  }
                  var htmlImage = "<img class='bar-image' src='"+image+"' height='100px' width='100px'></img>";
                  var htmlName = "<h4 class='bar-name'> <a href='"+url+"'>"+name+"</a></h4>";
                  var goButton = "<button type='button' doing='adding' for-bar='"+name+"' people-going='0' class='bar-button'> 0 People Going</button>";
                  var htmlTags = "<p class='bar-tags'>"+tagsText+"</p>"
                  var barDiv = "<div id='bar"+x+"' for-bar='"+name+"' class='bar'>"+htmlImage+htmlName+goButton+"<br/><br/>"+htmlTags+"</div>";
                  $("#bars").append(barDiv);
              }
                $(".bar-button").click(function(){
                    var name = $(this).attr("for-bar");
                    var peopleGoing = $(this).attr("people-going");
                    var doing = $(this).attr("doing");
                    var inc = (doing=="adding")?1:-1;
                    console.log("Ready to go?");
                    if(peopleGoing==0){
                        createBar(name, inc);
                    }else{
                        addToBar(name, inc);
                    }
                });
              setPeopleGoing();
          },
          error: function(data){
              var prettyData = JSON.stringify(data);
              console.log("error "+data);
          }
      });
    });
});