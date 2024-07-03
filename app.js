// carregando modulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const bodyParser = require('body-parser')
    const mongoose = require("mongoose")
    const admin = require("./routes/admin")
    const path = require("path")
    const session = require("express-session")
    const flash = require("connect-flash")
    const app = express()
    require("./models/Postagem")
    const Postagem = mongoose.model("postagens")
    require("./models/Categoria")
    const Categoria = mongoose.model("categorias")
    const usuarios = require("./routes/usuario")
    const passport = require('passport')
    require("./config/auth")(passport)


// configurações
    // sessão
        app.use(session({
            secret: "cursodenode",
            resave: true,
            saveUninitialized: true
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    // middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null
            next()
        })
    // body parser
        app.use(express.urlencoded({extended: true}))
        app.use(express.json())
    // handlebars
        app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')
    // public
        app.use(express.static(path.join(__dirname + "/public")))
    // mongoose
        mongoose.Promise = global.Promise
        mongoose.connect("mongodb://localhost/blogapp").then(() => {
            console.log("BD conectado...")
        }).catch((err) => {
            console.log("Erro ao se conectar com o BD: "+err)
        })

// rotas
    app.get("/", (req, res) => {
        Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens) => {
            res.render("index", {postagens: postagens})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/404")
        })
    })
    
    app.get("/postagem/:slug", (req, res) => {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            } else {
                req.flash("error_msg", "Essa postagem não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "houve um erro interno")
            res.redirect("/")
        })
    })
    
    app.get("/categorias", (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render("categorias/index", {categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao carregar as categorias")
            res.render("/")
        })
    })

    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao listar os posts")
                    res.redirect("/categorias")
                })
            } else {
                req.flash("error_msg", "Essa categoria não existe")
                res.redirect("/categorias")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao carregar a página dessa categoria")
            res.redirect("/categorias")
        })
    })

    app.get("/404", (req, res) => {
        res.send("Erro 404")
    })
    
    app.use('/admin', admin)
    app.use('/usuarios', usuarios)

const port = 8081
app.listen(port, ()=>{
    console.log("Servidor rodando...")
})