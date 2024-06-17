const EventoAsistente = require('../models/evento_asistente.model');
const Asistente = require('../models/asistentes.model');
const Evento = require('../models/eventos.model');

//Consultar asistentes por evento
exports.filtrarAsistentesPorEvento = async(req,res) => {
    const {id} = req.params;

    try {
        const relaciones = await EventoAsistente.findAll({
            attributes: ['asistente_id_asistente'],
            where: {
                evento_id_evento: id
            }
        });

        // Obtener los IDs de los eventos de las relaciones encontradas
        const asistentesIds = relaciones.map(relacion => relacion.asistente_id_asistente);

        if (asistentesIds.length > 0) {
            // Obtener los eventos
            const asistentes = await Asistente.findAll({
                attributes: ['id', 'nombre_completo', 'edad', 'sexo'],
                where: {
                    id_asistente: asistentesIds
                }
            });

            res.status(200).json({
                estado: 1,
                mensaje: "Asitentes encontrados correctamente",
                asistentes: asistentes
            });
        } else {
            res.json({
                estado: 0,
                mensaje: "No se encontraron asistentes asociados al evento",
                asistentes: []
            });
        }
    } catch (error) {
        res.status(500).json({
            estado: 0,
            mensaje: "Ocurrió un error desconocido",
            asistentes: []
        });
    }
}

//Obtener registros por id_evento y id_asistente
exports.obtenerRegistroAsistencia = async (req, res) => {
    const { evento_id_evento, asistente_id_asistente } = req.body;

    // Verificar si faltan parámetros
    if (!evento_id_evento || !asistente_id_asistente) {
        return res.status(400).json({
            estado: 0,
            mensaje: "Faltan parámetros",
            asistencias: []
        });
    }

    try {
        const relaciones = await EventoAsistente.findAll({
            attributes: ['evento_id_evento', 'asistente_id_asistente', 'hora_entrada', 'hora_salida', 'constancia'],
            where: {
                evento_id_evento: evento_id_evento,
                asistente_id_asistente: asistente_id_asistente
            }
        });

        res.status(200).json({
            estado: 1,
            mensaje: "Asistentes encontrados correctamente",
            asistencias: relaciones
        });
    } catch (error) {
        res.status(500).json({
            estado: 0,
            mensaje: "Ocurrió un error desconocido",
            asistencias: []
        });
    }
}

//Registrar entrada
exports.registrarEntrada = async(req,res) => {
    const {evento_id_evento, asistente_id_asistente} = req.body;

    try {
        if(evento_id_evento == undefined || asistente_id_asistente == undefined){
            res.status(400).json({
                estado : 0,
                mensaje: "Bad Request - Faltan parametros",
                asistencias : []
            })
        } else {
            const fecha_creacion = new Date();
            const asistenciaC  = await EventoAsistente.create({
                evento_id_evento: evento_id_evento,
                asistente_id_asistente: asistente_id_asistente,
                hora_entrada: fecha_creacion,                       //Misma fecha y hora para creación y actualización
                hora_salida: fecha_creacion,
                constancia: 0
            }, { fields: ['evento_id_evento', 'asistente_id_asistente', 'hora_entrada', 'hora_salida', 'constancia'] });

            res.status(200).json({
                estado : 1,
                mensaje: "Entrada registrada",
                asistencias : [asistenciaC]
            })
        }
    } catch (error) {
        res.status(500).json({
            estado : 0,
            mensaje: "Ocurrió un error desconocido",
            asistencias : []
        })
    }
}

//Registrar salida
exports.registrarSalida = async (req, res) => {
    const { evento_id_evento, asistente_id_asistente, validacionConstancia } = req.body;

    try {
        if (evento_id_evento === undefined || asistente_id_asistente === undefined || validacionConstancia === undefined) {
            return res.status(400).json({
                estado: 0,
                mensaje: "Bad Request - Faltan parametros",
                asistencias: []
            });
        } 

        const fecha_salida = new Date();

        // Buscar la asistencia del asistente en el evento
        let asistenciaAct = await EventoAsistente.findOne({
            where: {
                evento_id_evento: evento_id_evento,
                asistente_id_asistente: asistente_id_asistente
            },
            attributes: ['evento_id_evento', 'asistente_id_asistente', 'hora_entrada', 'hora_salida', 'constancia'] // Seleccionar solo columnas existentes
        });

        if (!asistenciaAct) {
            return res.status(404).json({
                estado: 0,
                mensaje: "Registro no encontrado",
                asistencias: []
            });
        }

        // Actualizar la hora de salida y constancia
        asistenciaAct.hora_salida = fecha_salida;
        asistenciaAct.constancia = validacionConstancia;

        // Guardar los cambios en la base de datos
        await asistenciaAct.save();

        return res.status(200).json({
            estado: 1,
            mensaje: "Salida registrada",
            asistencias: [asistenciaAct]
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            estado: 0,
            mensaje: "Ocurrió un error desconocido",
            asistencias: []
        });
    }
};




