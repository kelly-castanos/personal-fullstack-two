const user = require('./models/user');

module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    //when we go to our profile page:

    app.get('/profile', isLoggedIn, function(req, res) {
          res.render('profile.ejs', {

            user : req.user
            
      })
    });
    

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// message board routes ===============================================================
//Generate messages to the notes page

    app.get('/notes', isLoggedIn, function(req, res) {
      console.log(req.body);
      db.collection('messages').find({email: req.user.local.email}).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('notes.ejs', {
          user : req.user,
          messages: result
        })
      })
    });

    app.post('/notes', isLoggedIn, 

    function(req, res) {
      db.collection('messages').find({email: req.user.local.email}).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('notes.ejs', {
          user : req.user,
          messages: result
      })
    })

    }  
  )

  app.post('/messages', (req, res) => {
    db.collection('messages').save(

      {name: req.body.name, 
      date: new Date(req.body.date), 
      title: req.body.noteTitle,  
      msg: req.body.msg,
      email: req.user.local.email
    }, 
      
      (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/notes')
    })
  })

  app.put('/messages', (req, res) => {
    db.collection('messages').findOneAndUpdate(

    {msg: req.body.msg},
    {$set: {completed:true}}), 
      
      (err, result) => {
      if (err) return console.log(err)
      console.log(' completed saved to database')
      res.redirect('/notes')
    }
  })

//Delete notes


    app.delete('/messages', (req, res) => {
      db.collection('messages').findOneAndDelete({_id: ObjectId(req.body._id)}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

//EDIT NOTE
  var ObjectId = require('mongodb').ObjectId; 

    app.get('/editNote', isLoggedIn, function(req, res) {
        // console.log(`Delete rqst for ${req.query.noteId}`)
        db.collection('messages').findOne({_id: ObjectId(req.query.noteId)}, (err, result) => {
          if (err) return res.send(500, err)
          console.log(`deletion result ${result}`)
          res.render('editNotes.ejs', {            
            user : req.user,
            message: result})
        })   
    })

//GET EDITED NOTE:

    app.get('/updateMessage', isLoggedIn, function(req, res) {
      db.collection('messages').find({email: req.user.local.email}).toArray((err, result) => {
        if (err) return console.log(err)
        res.render('notes.ejs', {
          user : req.user,
          messages: result
      })
    })

    }  
  )

  //SUBMIT EDITED NOTE:

    app.post('/updateMessage',(req, res) => {

      console.log('DATE' + req.body.date)

      db.collection('messages').update ({ _id: ObjectId(req.body.objectID) }, 

  
        {$set: {
        
        date: new Date(req.body.date),
        title: req.body.noteTitle, 
        noteCategory: req.body.cat, 
        msg: req.body.msg,

      }
      }, function (err, result) {
          if (err) {
          console.log(err);
        } else {
          console.log("Post Updated successfully");
          res.redirect('/updateMessage')
      }
    });

  });

 


// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });



   

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
