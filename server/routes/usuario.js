const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');
const app = express();


app.get('/usuario', function(req, res) {
    
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    let activos = {
        estado: true
    };
    
    Usuario.find(activos, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec( (err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            
            Usuario.countDocuments(activos, (err, conteo) => {

                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });

            });


        });

});

app.post('/usuario', function(req, res) {

    let body = req.body;
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }


        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });
});

app.put('/usuario/:id', function(req, res) {

    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }        

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });


});

app.delete('/usuario/:id', function(req, res) {


    let id = req.params.id;

    let cambiaEstado = {
        estado: false
    }
    
    Usuario.findByIdAndUpdate(id, cambiaEstado, (err, usuarioBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!usuarioBorrado || !usuarioBorrado.estado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });                

    });


});

module.exports = app;