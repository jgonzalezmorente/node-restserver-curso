
const express = require('express');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
const app = express();
const Categoria = require('../models/categoria');

// ============================
// Mostrar todas las categorías
// ============================
app.get('/categoria', verificaToken, (req, res) => {

    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec( (err, categorias) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            
            res.json({
                ok: true,
                categorias
            });
        });

});

// ============================
// Mostrar una categoría por ID
// ============================
app.get('/categoria/:id', verificaToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
    
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoría no encontrada'
                }
            });
        }
        
        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

});

// =====================
// Crear nueva categoría
// =====================
app.post('/categoria', verificaToken, (req, res) => { 
    
    let body = req.body;
    
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario:  req.usuario._id
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

// ======================================
// Actualizar descripción de la categoría
// ======================================
app.put('/categoria/:id', verificaToken, (req, res) => {
    
    let id = req.params.id;
    let body = req.body;

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
    
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        
        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });
    
});

// ====================
// Borrar una categoría
// ====================
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => { 

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
    
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            message: 'Categoría borrada'
        });
    });
    
});





module.exports = app;