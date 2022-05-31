var editIcon = document.getElementsByClassName("fa-edit");



Array.from(editIcon).forEach(function(element) {
      element.addEventListener('click', function(){

        const noteId = this.parentNode.parentNode.parentNode.getAttribute('data-noteId')

        console.log('noteId' + noteId);

    deleteIt(noteId)

        
});

});
const completed = document.querySelectorAll('.completedButton')

completed.forEach((element)=>{
  element.addEventListener('click', ()=>{
    fetch('messages', {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        'completed': true,
      })
      .then(data=>{
        console.log(data);
  
      })
    })
      window.location.reload()
  })

})
function deleteIt(theNotesId){
  console.log(theNotesId);
        fetch('messages', {
          method: 'delete',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            '_id': theNotesId
          })
        }).then(function (response) {
          window.location.reload()
        })
};