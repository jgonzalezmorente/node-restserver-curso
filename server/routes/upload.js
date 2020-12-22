const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');

// default options
app.use(fileUpload());



app.put('/upload/:tipo/:id', function(req, res) {

    const tipo = req.params.tipo;
    const id = req.params.id;

  if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
          ok: false,
          err: {
              message: 'No se ha seleccionado ningún archivo'
            }
        });
    }
    
    // Tipos permitidos
    let tiposValidos = ['productos', 'usuarios'];
    if ( tiposValidos.indexOf( tipo ) < 0 ) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son ' + tiposValidos.join(', '),
                tipo                
            }
        });        
    }

    let archivo = req.files.archivo;

    // Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1]
    
    if ( extensionesValidas.indexOf( extension ) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                ext: extension
            }
        });
    }
    
    // Cambiar nombre al archivo
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if (err) {
          return res.status(500).json({
              ok: false,
              err
            });
        }

        tipo === 'usuarios' ? imagenUsuario(id, res, nombreArchivo) : imagenProducto(id, res, nombreArchivo);      

      });    

});


function imagenUsuario(id, res, nombreArchivo) {

    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err
            });
        }

        borraArchivo(usuarioDB.img, 'usuarios');

        usuarioDB.img = nombreArchivo;

        usuarioDB.save( (err, usuarioGuardado) => {

            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })

        });

    });


}


function borraArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen }`);
    if ( fs.existsSync(pathImagen) ) {
        fs.unlinkSync( pathImagen );
    }
}

function imagenProducto(id, res, nombreArchivo) {


    Producto.findById(id, (err, productoDB) => {

        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }
        
        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(400).json({
                ok: false,
                err
            });
        }

        borraArchivo(productoDB.img, 'productos');

        productoDB.img = nombreArchivo;


        productoDB.save( (err, productoGuardado) => {

            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            })

        });        



    });



}

module.exports = app;
