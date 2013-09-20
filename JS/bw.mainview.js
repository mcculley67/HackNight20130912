function MainView() {

}

MainView.prototype.appendResult = function(result){
    $('#distance').html(result);
    $('#result').fadeIn('slow');
}

MainView.prototype.appendNewName = function(name){
    
    $('#friendName').html(name);
    $('#friend').fadeIn('slow');
 
}