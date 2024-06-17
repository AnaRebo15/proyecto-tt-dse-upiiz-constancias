const Ponente = require('../models/ponentes.model');

//Todos los ponentes
exports.obtenerTodosPonentes = async(req,res) => {
    try {
        const ponentes = await Ponente.findAll();
        if (ponentes.length > 0) {
            res.status(200).json({
                estado : 1,
                mensaje: "Ponentes encontrados",
                ponentes : ponentes
            });
        } else {
            res.status(404).json({
                estado: 0,
                mensaje: "No se encontraron ponentes",
                ponentes: []
            })
        }
    } catch (error) {
        res.status(500).json({
            estado : 0,
            mensaje: "Ocurrió un error desconocido",
            ponentes: []
        });
    }
}
//Un ponente por ID
exports.obtenerPonentePorId = async(req,res) => {
    const {id} = req.params
    try {
        const ponente = await Ponente.findByPk(id)
        if (ponente == null) {
            res.status(404).json({
                estado: 0,
                mensaje: "No se encontró ponente",
                ponentes : []
            })
        } else {
            res.status(200).json({
                estado : 1,
                mensaje: "Ponente encontrado",
                ponentes : [ponente]
            })
        }
    } catch (error) {
        res.status(500).json({
            estado : 0,
            mensaje: "Ocurrió un error desconocido",
            ponentes : []
        })
    }
}
//Crear ponente
exports.crearPonente = async(req,res) => {
    const {nombre, dependencia} = req.body;

    try {
        if(nombre == undefined || dependencia == undefined){
            res.status(400).json({
                estado : 0,
                mensaje: "Bad Request - Faltan parametros",
                ponentes : []
            })
        } else {
            const ponenteC = await Ponente.create({
                nombre: nombre,
                dependencia: dependencia
            })
            res.status(200).json({
                estado : 1,
                mensaje: "Ponente creado correctamente",
                ponentes : [ponenteC]
            })
        }
    } catch (error) {
        res.status(500).json({
            estado : 0,
            mensaje: "Ocurrió un error desconocido",
            ponentes : []
        })
    }
}
//Actualizar ponente
exports.actualizarPonente = async(req,res) => {
    const {id} = req.params
    const {nombre, dependencia} = req.body;

    console.log("Datos recibidos:", req.body);

    try {
        const ponenteAct = await Ponente.findByPk(id)

        if (ponenteAct == null || nombre == undefined || dependencia == undefined){

            res.status(404).json({
                estado: 0,
                mensaje: "Faltan parámetros",
                ponentes : []
            })
        } else {
            await ponenteAct.update({
                nombre: nombre,
                dependencia: dependencia
            })
            res.status(200).json({
                estado : 1,
                mensaje: "Ponente actualizado",
                ponentes: [ponenteAct]
            })
        }
    } catch (error) {
        res.status(500).json({
            estado : 0,
            mensaje: "Ocurrió un error desconocido",
            ponentes : []
        })
    }
}

// Buscar un ponente por nombre
exports.obtenerPonentePorNombre = async(req, res) => {
    const { nombre } = req.params;
    try {
        const ponente = await Ponente.findOne({ where: { nombre: nombre } });
        if (ponente == null) {
            res.status(404).json({
                estado: 0,
                mensaje: "No se encontró ponente",
                ponentes: []
            });
        } else {
            res.status(200).json({
                estado: 1,
                mensaje: "Ponente encontrado",
                ponentes: [ponente]
            });
        }
    } catch (error) {
        res.status(500).json({
            estado: 0,
            mensaje: "Ocurrió un error desconocido",
            ponentes: []
        });
    }
};

