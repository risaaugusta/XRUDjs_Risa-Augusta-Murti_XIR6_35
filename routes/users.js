const express = require('express')
const app = express()
const ObjectId = require('mongodb').ObjectId

app.get('/',function(req,res){
    // render to views/index.ejs template file
    res.render('./index', {title: 'XIR6'})
})

//Tampilkan data
app.get('/tampil',function(req, res, next){
    //mengambil data dari database secara descending
    req.db.collection('coba').find().sort({"_id:":-1}).toArray(function(err, result){

        if(err) {
            req.flash('error',err)
            res.render('user/list',{
                title: 'Daftar Buku',
                data: ''
            })
        } else {
            //menampilkan veiw list.ejs
            res.render('user/list',{
                title: 'Daftar Buku',
                data: result
            })
        }
    })
})

//tampilkan form input
app.get('/add',function(req,res,next){
    //tampilkan views add.ejs
    res.render('user/add',{
        title: 'TAMBAH DATA',
        judul:'',
        penulis: '',
        tahun: '',
        harga: '',
        no: ''
    })
})

// Proses input data
app.post('/add',function(req,res,next){
    req.assert('judul','judul is required').notEmpty()
    req.assert('penulis','penulis is required').notEmpty()
    req.assert('harga','A valid harga is required').isNumeric()
    req.assert('tahun','A valid tahun is required').isNumeric()
    req.assert('no','no telephone is nomeric').isNumeric()

    var errors = req.validationErrors()

    if(!errors) {
        var user = {
            judul: req.sanitize('judul').escape().trim(),
            penulis: req.sanitize('penulis').escape().trim(),
            tahun: req.sanitize('tahun').escape().trim(),
            harga: req.sanitize('harga').escape().trim(),
            no: req.sanitize('no').escape().trim(),

        }
        
        req.db.collection('coba').insert(user,function(err,result){
            if(err) {
                req.flash('error', err)

                //render to views/user/add.ejs
                res.render('user/add',{
                    title: 'TAMBAH DATA',
                    judul: user.judul,
                    penulis: user.penulis,
                    tahun: user.tahun,
                    harga: user.harga,
                    no: user.no
                })
            } else {
                req.flash('Berhasil','Data Berhasil ditambah!')

                // redirect to user list page
                res.redirect('/tampil')
            }
        })
    }
    else{ //Display errors to user
        var error_msg = ''
        errors.forEach(function(error){
            error_msg += error.msg + '<br>'
        })
        req.flash('error',error_msg)

        res.render('user/add',{
            title: 'TAMBAH DATA',
            judul: req.body.judul,
            penulis: req.body.penulis,
            tahun: req.body.tahun,
            harga: req.body.harga,
            no: req.body.no
        })
    }
})


//TAMPIL DETAIL 
app.get('/buku/detail/:id',function(req,res,next){
    var o_id = new ObjectId(req.params.id)
    req.db.collection('coba').find({"_id": o_id}).toArray(function(err, result){
        if(err) return console.log(err)

        //jika data tidak ada
        if(!result){
            req.flash('error','User not found with id = ' + req.params.id)
            res.redirect('/users')
        }
        else{//jika data ada}
            //tampilkan view/user/edit.ejs
            res.render('user/detail',{
                title: "EDIT DATA",
                //data: rows[0],
                id: result[0]._id,
                judul: result[0].judul,
                penulis: result[0].penulis,
                tahun: result[0].tahun,
                harga: result[0].harga,
                no: result[0].no
            })
    }
    })
})






//SHOW EDIT USER FORM
app.get('/user/edit/(:id)',function(req,res,next){
    var o_id = new ObjectId(req.params.id)
    req.db.collection('coba').find({"_id": o_id}).toArray(function(err, result){
        if(err) return console.log(err)

        //jika data tidak ada
        if(!result){
            req.flash('error','User not found with id = ' + req.params.id)
            res.redirect('/users')
        }
        else{//jika data ada}
            //tampilkan view/user/edit.ejs
            res.render('user/edit',{
                title: "EDIT DATA",
                //data: rows[0],
                id: result[0]._id,
                judul: result[0].judul,
                penulis: result[0].penulis,
                tahun: result[0].tahun,
                harga: result[0].harga,
                no: result[0].no
            })
    }
    })
})

// EDIT USER POST ACTION 
app.put('/edit/(:id)', function(req,res,next){
    req.assert('judul','judul is required').notEmpty() //form validation
    req.assert('penulis','penulis is required').notEmpty()
    req.assert('harga','A valid harga is required').isNumeric()
    req.assert('tahun','A valid tahun is required').isNumeric()
    req.assert('no','No telephoen is required').isNumeric()

    var errors = req.validationErrors()

    if(!errors){ //jika form validation benar
        var user = {
            judul: req.sanitize('judul').escape().trim(),
            penulis: req.sanitize('penulis').escape().trim(),
            tahun: req.sanitize('tahun').escape().trim(),
            harga: req.sanitize('harga').escape().trim(),
            no: req.sanitize('no').escape().trim()
        }

        var o_id = new ObjectId(req.params.id)
        req.db.collection('coba').update({"_id": o_id}, user, function(err, result) {
            if(err) {
                req.flash('error',err)

                //render to views/user/edit.ejs
                res.render('user/edit', {
                    title: 'EDIT DATA',
                    id: req.params.id,
                    judul: req.body.judul,
                    penulis: req.body.penulis,
                    tahun: req.body.tahun,
                    harga: req.body.harga,
                    no: req.body.no                    
                })
            } else{
                req.flash('Berhasil','Data berhasil diupdate')
                res.redirect('/tampil')
            }
        })
    }
else { //Diplay errors to user
    var error_msg = ''
    errors.forEach(function(error){
        error_msg += error.msg + '<br>'
    })
    req.flash('error',error_msg)


    res.render('user/edit/:id', {
        title: 'EDIT DATA',
        id: req.params.id,
        judul: req.body.judul,
        penulis: req.body.penulis,
        tahun: req.body.tahun,
        harga: req.body.harga,
        no: req.body.no  
    })
} 
})

// DELETE USER 
app.delete('/delete/:id', function(req,res,next){
    var o_id = new ObjectId(req.params.id)
    req.db.collection('coba').remove({"_id": o_id}, function(err,result){
        if(err){
            req.flash('error',err)
            //redirect Halaman tampil data
            res.redirect('/users')
        } else {
            req.flash('berhasil','Data berhasil dihapus')
            // redirect halaman tampil data
            res.redirect('/tampil')
        }
    })
})

module.exports = app