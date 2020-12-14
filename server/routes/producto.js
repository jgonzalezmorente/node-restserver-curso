const express = require('express');
const { verificaToken } = require('../middlewares/autenticacion');
const { populate } = require('../models/categoria');
const categoria = require('../models/categoria');
const app = express();
const Producto = require('../models/producto');

// ============================
// Obtener productos
// ============================
app.get('/productos', verificaToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);    

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec( (err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            
            res.json({
                ok: true,
                productos
            });            
        });
});

// ============================
// Obtener producto por ID
// ============================
app.get('/productos/:id', verificaToken, (req, res) => {

    const id = req.params.id;

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
    
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'ID no existe'
                }
            });
        }
        
        res.json({
            ok: true,
            categoria: productoDB
        });        

    })
    .populate('usuario', 'nombre email')
    .populate('categoria', 'nombre');
});


// ============================
// Buscar productos
// ============================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {

    const termino = req.params.termino;
    const regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })        
        .populate('categoria', 'nombre')
        .exec( (err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                productos
            });

        });

       

});


// ============================
// Crear un nuevo producto
// ============================
app.post('/productos', verificaToken, (req, res) => {

    const body = req.body;

    const producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,        
        categoria: body.categoria,
        usuario: req.usuario._id
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });            
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            ok: true,
            producto: productoDB
        });
    }); 

});

// ============================
// Actualizar un producto
// ============================
app.put('/productos/:id', verificaToken, (req, res) => {

    const id = req.params.id;
    const body = req.body;

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });        
    });
});

// ============================
// Borrar un producto
// ============================
app.delete('/productos/:id', verificaToken, (req, res) => {    
    const id = req.params.id;    

    Producto.findByIdAndUpdate(id, { disponible: false }, { new: true, runValidators: true }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB,
            message: 'Producto borrado'
        });        
    });    
});


module.exports = app;