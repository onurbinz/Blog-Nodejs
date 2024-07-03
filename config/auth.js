const localStrategy = require("passport-local").Strategy
const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")
const passport = require("passport")
require("../models/Usuario")
const Usuarios = mongoose.model("usuarios")


module.exports = function(passport){
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
        Usuarios.findOne({email: email}).lean().then((usuario) => {
            if(!usuario){
                return done(null, false, {message: "Essa conta não existe"})
            }

            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                if(batem){
                    return done(null, usuario)
                } else {
                    return done(null, false, {message: "Senha incorreta"})
                }
            })
        })
    }))

    passport.serializeUser((usuario, done) => {
        done(null, usuario)
    })

    passport.deserializeUser((id, done) => {
        Usuarios.findById(id).lean().then((usuario) => {
            done(null, usuario)
        }).catch((err)=>{
            done(null,false,{message: "Algo deu errado"})
        })
    })
}