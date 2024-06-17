const e = require('cors');
const Evento = require('../models/eventos.model');
const PonenteEvento = require('../models/ponente_evento.model')
const EventoAsistente = require('../models/evento_asistente.model')
const MiembroDep = require('../models/miembrosDep.model');
const moment = require('moment-timezone');
const logger = require('../config/logger');
const { Op } = require('sequelize');

//Todos los eventos
exports.obtenerTodosEventos = async (req, res) => {
    try {
        const fechaHoy = moment.tz('America/Mexico_City').format('YYYY-MM-DD');

        const eventos = await Evento.findAll({
            where: {
                fecha_evento: {
                    [Op.gte]: fechaHoy // Utiliza el operador >= (gte) para comparar fechas
                }
            }
        });

        if (eventos.length > 0) {
            res.status(200).json({
                estado: 1,
                mensaje: "Eventos encontrados",
                eventos: eventos
            });
        } else {
            res.status(404).json({
                estado: 0,
                mensaje: "No se encontraron eventos",
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
//Un evento por ID
exports.obtenerEventoPorId = async(req,res) => {
    const {id} = req.params
    try {
        const evento = await Evento.findByPk(id)
        if (evento == null) {
            res.status(404).json({
                estado: 0,
                mensaje: "No se encontró evento",
                eventos : [],
                ponente: null
            })
        } else {
            const ponenteEvento = await PonenteEvento.findAll({
                attributes: ['ponente_id_ponente', 'evento_id_evento'],
                where: {
                    evento_id_evento: id    // Filtrar por evento_id_evento
                }
            });

            const ponentes = ponenteEvento.map(ponente => ponente.ponente_id_ponente);

            res.status(200).json({
                estado : 1,
                mensaje: "Evento encontrado",
                eventos : [evento],
                ponente: ponentes              // Puede haber más de un ponente por evento
            })
        }
    } catch (error) {
        res.status(500).json({
            estado : 0,
            mensaje: "Ocurrió un error desconocido",
            eventos : [],
            ponente: null
        })
    }
}
//Crea un evento
exports.crearEvento = async(req,res) => {
    const {nombre_evento, fecha_evento, hora_inicio, hora_fin, duracion, lugar, area, miembroDep_num_empleado} = req.body;

    try {
        if(nombre_evento == undefined || fecha_evento == undefined || hora_inicio == undefined || hora_fin == undefined || duracion == undefined || lugar == undefined || area == undefined || miembroDep_num_empleado == undefined){
            res.status(400).json({
                estado : 0,
                mensaje: "Bad Request - Faltan parametros",
                eventos : []
            })
        } else {
            const fecha_creacion = new Date();                // Fecha y hora actual
            const eventoC = await Evento.create({
                nombre_evento: nombre_evento,
                fecha_evento: fecha_evento,
                hora_inicio: hora_inicio, 
                hora_fin: hora_fin, 
                duracion: duracion, 
                lugar: lugar, 
                area: area, 
                fecha_creacion: fecha_creacion,                     //Misma fecha y hora para creación y actualización
                fecha_actualizacion: fecha_creacion, 
                miembroDep_num_empleado: miembroDep_num_empleado    //Se obtiene de la sesión
            })
            res.status(200).json({
                estado : 1,
                mensaje: "Evento creado correctamente",
                eventos : [eventoC]
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
//Actualizar evento
exports.actualizarEvento = async (req, res) => {
    const { id } = req.params;
    const { nombre_evento, fecha_evento, hora_inicio, hora_fin, duracion, lugar, area, miembroDep_num_empleado } = req.body;

    const isNullOrEmpty = (value) => value === null || value === undefined || value === "";

    try {
        const eventoAct = await Evento.findByPk(id);
        const nombre_evento_aux = eventoAct.nombre_evento;    //El antiguo nombre_evento

        if (eventoAct == null ||
            isNullOrEmpty(nombre_evento) ||
            isNullOrEmpty(fecha_evento) ||
            isNullOrEmpty(hora_inicio) ||
            isNullOrEmpty(hora_fin) ||
            isNullOrEmpty(duracion) ||
            isNullOrEmpty(lugar) ||
            isNullOrEmpty(area) ||
            isNullOrEmpty(miembroDep_num_empleado)
        ) {
            res.status(404).json({
                estado: 0,
                mensaje: "Faltan parámetros",
                eventos: []
            });
        } else {
            const fecha_actualizacion = new Date();  // Fecha y hora actual
            await eventoAct.update({
                nombre_evento: nombre_evento,
                fecha_evento: fecha_evento,
                hora_inicio: hora_inicio,
                hora_fin: hora_fin,
                duracion: duracion,
                lugar: lugar,
                area: area,
                fecha_actualizacion: fecha_actualizacion,
                miembroDep_num_empleado: miembroDep_num_empleado
            });

            //Buscar nombre del empleado que lo actualizó
            const miembroDep = await MiembroDep.findOne({
                where: { id: miembroDep_num_empleado }
            });

            // Log the event update
            logger.info(`Evento: "${nombre_evento_aux}" actualizado por: "${miembroDep.nombre}". Datos actualizados: nombre_evento="${nombre_evento}", fecha_evento=${fecha_evento}, hora_inicio=${hora_inicio}, hora_fin=${hora_fin}, duracion=${duracion}, lugar="${lugar}", area="${area}"`);

            res.status(200).json({
                estado: 1,
                mensaje: "Evento actualizado",
                eventos: [eventoAct]
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

//Eliminar evento
exports.eliminarEvento = async(req,res) => {
    const {id} = req.params
    try {
        const evento = await Evento.findByPk(id)

        if (evento == null) {
            res.status(404).json({
                estado: 0,
                mensaje: "Evento no encontrado",
                eventos:[]
            })
        } else {
            await evento.destroy()
            res.status(200).json({
                estado : 1,
                mensaje: "Evento eliminado",
                eventos:[]
            })
        }
    } catch (error) {
        res.status(500).json({
            estado : 0,
            mensaje: "Ocurrió un error desconocido",
            eventos:[]
        })
    }
}
//Eliminar eventos cada primero de marzo
exports.eliminarEventos = async (req, res) => {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    try {
        // Buscar todos los eventos del año anterior
        const eventos = await Evento.findAll({
            where: {
                fecha_evento: {
                    [Op.between]: [`${previousYear}-01-01`, `${previousYear}-12-31`]
                }
            }
        });

        // Eliminar relaciones antes de eliminar los eventos
        for (const evento of eventos) {
            await PonenteEvento.destroy({
                where: { evento_id_evento: evento.id }
            });
            await EventoAsistente.destroy({
                where: { evento_id_evento: evento.id }
            });
            await evento.destroy();
        }

        res.status(200).json({
            estado: 1,
            mensaje: "Eventos del año anterior eliminados",
            eventos: []
        });
    } catch (error) {
        res.status(500).json({
            estado: 0,
            mensaje: "Ocurrió un error desconocido",
            eventos: []
        });
    }
};
//Filtrar eventos por ponente
exports.filtrarEventosPorPonente = async(req,res) => {
    const {id} = req.params;

    try {
        const relaciones = await PonenteEvento.findAll({
            attributes: ['evento_id_evento'],
            where: {
                ponente_id_ponente: id
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
                mensaje: "No se encontraron eventos asociados al ponente",
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
//Relacionar evento y ponente
exports.crearRelacionPonente = async(req,res) => {
    const {ponente_id_ponente, evento_id_evento} = req.body;

    try {
        if(ponente_id_ponente == undefined || evento_id_evento == undefined){
            res.status(400).json({
                estado : 0,
                mensaje: "Bad Request - Faltan parametros",
                eventos : []
            })
        } else {
            const nuevoPonenteEvento  = await PonenteEvento.create({
                ponente_id_ponente: ponente_id_ponente,
                evento_id_evento: evento_id_evento
            }, { fields: ['ponente_id_ponente', 'evento_id_evento'] });

            //console.log(nuevoPonenteEvento)
            res.status(200).json({
                estado : 1,
                mensaje: "Relación creada correctamente",
                eventos : [nuevoPonenteEvento]
            })
        }
    } catch (error) {
        //console.error('Error al crear la relación:', error);
        res.status(500).json({
            estado : 0,
            mensaje: "Ocurrió un error desconocido",
            eventos : []
        })
    }
}
//Filtrar eventos completados
exports.filtrarEventosPorCompletado = async (req, res) => {
    try {
        // Obtener la fecha de hoy en formato ISO (YYYY-MM-DD)
        const fechaHoy = new Date().toISOString().split('T')[0];

        // Consulta para encontrar eventos anteriores a la fecha de hoy
        const eventos = await Evento.findAll({
            attributes: ['id_evento', "nombre_evento", "fecha_evento", "area", "duracion"],
            where: {
                fecha_evento: {
                    [Op.lt]: fechaHoy // Utiliza el operador < (lt) para comparar fechas
                }
            }
        });

        res.status(200).json({
            estado: 1,
            mensaje: "Eventos completos encontrados correctamente",
            eventos: eventos
        });
    } catch (error) {
        console.error(error); // Imprime el error en la consola para depuración
        res.status(500).json({
            estado: 0,
            mensaje: "Ocurrió un error desconocido",
            eventos: []
        });
    }
};
//Eliminar relación evento y ponente
exports.eliminarRelacionPonente = async(req,res) => {
    const {id_evento} = req.params

    try {
        const eliminados = await PonenteEvento.destroy({
            attributes: ['ponente_id_ponente', 'evento_id_evento'],
            where: {
                evento_id_evento: id_evento
            }
        });

        res.status(200).json({
            estado: 1,
            mensaje: "Relaciones eliminadas correctamente",
            eventos: eliminados
        });
    } catch (error) {
        //console.error('Error al eliminar las relaciones:', error);
        res.status(500).json({
            estado: 0,
            mensaje: "Ocurrió un error desconocido al eliminar las relaciones",
            eventos: []
        });
    }
}