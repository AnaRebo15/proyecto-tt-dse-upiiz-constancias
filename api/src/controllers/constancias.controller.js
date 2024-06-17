const e = require('cors');
const Constancia = require('../models/constancias.model');
const EventoAsistente = require('../models/evento_asistente.model')
const Evento = require('../models/eventos.model')
const fs = require('fs');
const path = require('path');

//Constancia por ID
exports.obtenerConstanciaPorId = async(req,res) => {
    const {id} = req.params
    try {
        const constancia = await Constancia.findByPk(id)
        if (constancia == null) {
            res.status(404).json({
                estado: 0,
                mensaje: "No se encontró constancia",
                constancias : []
            })
        } else {
            res.status(200).json({
                estado : 1,
                mensaje: "Constancia encontrada",
                constancias : [constancia]
            })
        }
    } catch (error) {
        res.status(500).json({
            estado : 0,
            mensaje: "Ocurrió un error desconocido",
            constancias : []
        })
    }
}
//Crear constancia
exports.crearConstancia = async(req, res) => {
    const { folio, asistente_id_asistente, evento_id_evento } = req.body;

    try {
        if (folio === undefined || asistente_id_asistente === undefined || evento_id_evento === undefined) {
            res.status(400).json({
                estado: 0,
                mensaje: "Bad Request - Faltan parametros",
                constancias: []
            });
        } else {
            const fecha_creacion = new Date(); // Fecha y hora actual
            const constanciaC = await Constancia.create({
                folio: folio,
                fecha_creacion: fecha_creacion, //Misma fecha y hora para creación y actualización
                fecha_actualizacion: fecha_creacion,
                asistente_id_asistente: asistente_id_asistente, //Se obtiene de la sesión
                evento_id_evento: evento_id_evento
            });
            res.status(200).json({
                estado: 1,
                mensaje: "Constancia creada correctamente",
                constancias: [constanciaC]
            });
        }
    } catch (error) {
        res.status(500).json({
            estado: 0,
            mensaje: "Ocurrió un error desconocido",
            constancias: []
        });
    }
}
//Actualizar constancia
exports.actualizarConstancia = async(req,res) => {
    const {id} = req.params
    const { asistente_id_asistente, evento_id_evento } = req.body;

    try {
        const constanciaAct = await Constancia.findByPk(id)

        if (constanciaAct == null || asistente_id_asistente === undefined || evento_id_evento === undefined){
            res.status(404).json({
                estado: 0,
                mensaje: "Faltan parámetros",
                constancias : []
            })
        } else {
            const fecha_actualizacion = new Date();                 // Fecha y hora actual
            await constanciaAct.update({
                fecha_actualizacion: fecha_actualizacion,
                asistente_id_asistente: asistente_id_asistente,     //Se obtiene de la sesión
                evento_id_evento: evento_id_evento
            })
            res.status(200).json({
                estado : 1,
                mensaje: "Constancia actualizada",
                constancias: [constanciaAct]
            })
        }
    } catch (error) {
        res.status(500).json({
            estado : 0,
            mensaje: "Ocurrió un error desconocido",
            constancias : []
        })
    }
}
//Filtrar eventos por asistente
exports.filtrarEventosPorAsistente = async(req,res) => {
    const {id} = req.params;

    try {
        const relaciones = await EventoAsistente.findAll({
            attributes: ['evento_id_evento'],
            where: {
                asistente_id_asistente: id,
                constancia: 1
            }
        });

        // Obtener los IDs de los eventos de las relaciones encontradas
        const eventosIds = relaciones.map(relacion => relacion.evento_id_evento);

        if (eventosIds.length > 0) {
            // Obtener los eventos
            const eventos = await Evento.findAll({
                where: {
                    id_evento: eventosIds
                }
            });

            res.status(200).json({
                estado: 1,
                mensaje: "Eventos encontrados correctamente",
                eventos: eventos
            });
        } else {
            res.json({
                estado: 0,
                mensaje: "No se encontraron eventos asociados al asistente",
                eventos: []
            });
        }
    } catch (error) {
        res.status(500).json({
            estado: 0,
            mensaje: "Ocurrió un error desconocido",
            eventos: []
        });
    }
}
//Constancia por ID
exports.obtenerEventoAsistentePorId = async(req,res) => {
    const {id} = req.params
    try {
        const relacion = await EventoAsistente.findByPk(id)
        if (relacion == null) {
            res.status(404).json({
                estado: 0,
                mensaje: "No se encontró relacion",
                eventos : []
            })
        } else {
            res.status(200).json({
                estado : 1,
                mensaje: "Constancia encontrada",
                eventos : [relacion]
            })
        }
    } catch (error) {
        res.status(500).json({
            estado : 0,
            mensaje: "Ocurrió un error desconocido",
            eventos : []
        })
    }
}
//Función para obtener folio
exports.obtenerFolio = async (req, res) => {
    try {
      // Obtiene el año actual
      const yearActual = new Date().getFullYear();
  
      // Busca el último registro de la base de datos
      const ultimoRegistro = await Constancia.findOne({
        order: [['id', 'DESC']], // Ordena por el ID en orden descendente
        attributes: ['id', 'folio', 'fecha_creacion']
      });
  
      let folio;
  
      // Si no hay registros en la base de datos, devuelve 1
      if (!ultimoRegistro) {
        folio = 1;
      } else {
        const yearUltimoRegistro = new Date(ultimoRegistro.fecha_creacion).getFullYear();
  
        // Si el año del último registro es diferente al año actual, reinicia el folio
        if (yearUltimoRegistro !== yearActual) {
          folio = 1;
        } else {
          // Si es el mismo año, incrementa el folio del último registro en uno
          folio = ultimoRegistro.folio + 1;
        }
      }
  
      // Devuelve el objeto con el estado, mensaje y el siguiente folio
      res.status(200).json({
        estado: 1,
        mensaje: "Folio encontrado correctamente",
        constancias: folio
      });
    } catch (error) {
      // En caso de error, devuelve un estado y mensaje de error
      res.status(500).json({
        estado: 0,
        mensaje: "Ocurrió un error desconocido",
        constancias: ""
      });
    }
}
//Constancia por id_evento y id_asistente
exports.obtenerConstanciaPorEventoAsistente = async(req,res) => {
    const {evento_id_evento, asistente_id_asistente} = req.body
    try {
        const constancia = await Constancia.findAll({
            attributes: ['id', 'folio'],
            where: {
                asistente_id_asistente: asistente_id_asistente,
                evento_id_evento: evento_id_evento
            }
        });

        if (constancia == null) {
            res.status(404).json({
                estado: 0,
                mensaje: "No se encontró constancia",
                constancias : []
            })
        } else {
            res.status(200).json({
                estado : 1,
                mensaje: "Constancia encontrada",
                constancias : constancia
            })
        }
    } catch (error) {
        res.status(500).json({
            estado : 0,
            mensaje: "Ocurrió un error desconocido",
            constancias : []
        })
    }
}
  