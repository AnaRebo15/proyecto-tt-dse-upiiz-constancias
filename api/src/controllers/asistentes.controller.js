const Asistente = require('../models/asistentes.model');
const AlumnoUpiiz = require('../models/alumnoUpiiz.model');
const AlumnoCecyt = require('../models/alumnoCecyt.model');
const Empleado = require('../models/empleado.model');
const Externo = require('../models/externo.model');
const jwt = require('jsonwebtoken');

//Obtener asistentes
exports.obtenerTodosAsistentes = async(req,res) => {
    try {
        const asistentes = await Asistente.findAll();
        if (asistentes.length > 0) {
            res.status(200).json({
                estado : 1,
                mensaje: "Asistentes encontrados",
                asistentes : asistentes
            });
        } else {
            res.status(404).json({
                estado: 0,
                mensaje: "No se encontraron asistentes",
                asistentes: []
            })
        }
    } catch (error) {
        res.status(500).json({
            estado : 0,
            mensaje: "Ocurrió un error desconocido",
            asistentes: []
        });
    }
}

//Obtener asistente por ID
exports.obtenerAsistentePorId = async (req, res) => {
    const { id } = req.params;
    try {
        // Buscar el asistente por ID
        const asistente = await Asistente.findByPk(id);
        if (!asistente) {
            return res.status(404).json({
                estado: 0,
                mensaje: "No se encontró asistente",
                asistentes: []
            });
        }

        // Buscar el tipo de asistente en todas las tablas correspondientes
        let tipoAsistente;
        let datosTipoAsistente;

        datosTipoAsistente = await AlumnoUpiiz.findOne({
            where: { asistente_id_asistente: asistente.id }
        });
        
        if (datosTipoAsistente) {
            tipoAsistente = 'alumnoUpiiz';
        } else {
            // Si no es AlumnoUpiiz, buscamos en AlumnoCecyt
            datosTipoAsistente = await AlumnoCecyt.findOne({
                where: { asistente_id_asistente: asistente.id }
            });
            
            if (datosTipoAsistente) {
                tipoAsistente = 'alumnoCecyt';
            } else {
                // Si no es AlumnoCecyt, buscamos en Empleado
                datosTipoAsistente = await Empleado.findOne({
                    where: { asistente_id_asistente: asistente.id }
                });
                
                if (datosTipoAsistente) {
                    tipoAsistente = 'empleado';
                } else {
                    // Si no es Empleado, buscamos en Externo
                    datosTipoAsistente = await Externo.findOne({
                        where: { asistente_id_asistente: asistente.id }
                    });
                    
                    if (datosTipoAsistente) {
                        tipoAsistente = 'externo';
                    }
                }
            }
        }

        // Crear un objeto para almacenar los datos específicos de cada tipo de usuario
        console.log(tipoAsistente)
        let datosEspecificos = {};

        // Agregar datos específicos según el tipo de asistente
        switch (tipoAsistente) {
            case 'alumnoUpiiz':
                datosEspecificos.boleta = datosTipoAsistente.boleta;
                datosEspecificos.programa_academico = datosTipoAsistente.programa_academico;
                break;
            case 'alumnoCecyt':
                datosEspecificos.boleta = datosTipoAsistente.boleta;
                break;
            case 'empleado':
                datosEspecificos.numero_empleado = datosTipoAsistente.numero_empleado;
                datosEspecificos.cargo = datosTipoAsistente.cargo;
                break;
            case 'externo':
                datosEspecificos.dependencia = datosTipoAsistente.dependencia;
                break;
        }

        // Combinar los datos del asistente principal con los datos del tipo de asistente
        const asistenteConTipo = {
            ...asistente.toJSON(),
            tipo: tipoAsistente,
            tipoAsistente: datosEspecificos
        };

        res.status(200).json({
            estado: 1,
            mensaje: "Asistente encontrado",
            asistentes: [asistenteConTipo]
        });
    } catch (error) {
        console.error('Error al obtener el asistente:', error);
        res.status(500).json({
            estado: 0,
            mensaje: "Ocurrió un error desconocido",
            asistentes: []
        });
    }
};

//Crea un asistente
exports.crearAsistente = async(req, res) => {
    const { tipo, correo, contrasena, nombre_completo, edad, sexo, boleta, programa_academico, numero_empleado, cargo, dependencia } = req.body;

    try {
        if (!tipo || !correo || !contrasena || !nombre_completo || !edad || !sexo) {
            return res.status(400).json({
                estado: 0,
                mensaje: "Bad Request - Faltan parámetros",
                asistentes: []
            });
        }

        // Verificar si el correo ya está registrado
        let correoExistente = await Asistente.findOne({
            where: {
                correo: correo
            }
        });
        if (correoExistente) {
            return res.status(400).json({
                estado: 0,
                mensaje: "Ya estás registrado, favor de iniciar sesión",
                asistentes: []
            });
        }

        // Verificar si la boleta ya está registrada (solo si es un alumno)
        if (tipo === 'alumnoUpiiz') {
            let boletaExistente = await AlumnoUpiiz.findOne({
                where: {
                    boleta: boleta
                }
            });
            if (boletaExistente) {
                return res.status(400).json({
                    estado: 0,
                    mensaje: "Ya estás registrado, favor de iniciar sesión",
                    asistentes: []
                });
            }
        } else if (tipo === 'alumnoCecyt') {
            let boletaExistente = await AlumnoCecyt.findOne({
                where: {
                    boleta: boleta
                }
            });
            if (boletaExistente) {
                return res.status(400).json({
                    estado: 0,
                    mensaje: "Ya estás registrado, favor de iniciar sesión",
                    asistentes: []
                });
            }
        } else if (tipo === 'empleado') {
            let numEmpleadoExistente = await Empleado.findOne({
                where: {
                    numero_empleado: numero_empleado
                }
            });
            if (numEmpleadoExistente) {
                return res.status(400).json({
                    estado: 0,
                    mensaje: "Ya estás registrado, favor de iniciar sesión",
                    asistentes: []
                });
            }
        }


        const codigo_qr = `${correo}:${nombre_completo}`;
        let asistenteC;

        switch (tipo) {
            case 'alumnoUpiiz':
                asistenteC = await AlumnoUpiiz.create({
                    boleta: boleta,
                    programa_academico: programa_academico,
                    asistente: {
                        correo: correo,
                        contrasena: contrasena,
                        nombre_completo: nombre_completo,
                        edad: edad,
                        sexo: sexo,
                        codigo_qr: codigo_qr
                    }
                }, { include: Asistente });
                break;
            case 'alumnoCecyt':
                asistenteC = await AlumnoCecyt.create({
                    boleta: boleta,
                    asistente: {
                        correo: correo,
                        contrasena: contrasena,
                        nombre_completo: nombre_completo,
                        edad: edad,
                        sexo: sexo,
                        codigo_qr: codigo_qr
                    }
                }, { include: Asistente });
                break;
            case 'empleado':
                asistenteC = await Empleado.create({
                    numero_empleado: numero_empleado,
                    cargo: cargo,
                    asistente: {
                        correo: correo,
                        contrasena: contrasena,
                        nombre_completo: nombre_completo,
                        edad: edad,
                        sexo: sexo,
                        codigo_qr: codigo_qr
                    }
                }, { include: Asistente });
                break;
            case 'externo':
                asistenteC = await Externo.create({
                    dependencia: dependencia,
                    asistente: {
                        correo: correo,
                        contrasena: contrasena,
                        nombre_completo: nombre_completo,
                        edad: edad,
                        sexo: sexo,
                        codigo_qr: codigo_qr
                    }
                }, { include: Asistente });
                break;
            default:
                return res.status(400).json({
                    estado: 0,
                    mensaje: "Tipo de asistente no válido",
                    asistentes: []
                });
        }

        res.status(200).json({
            estado: 1,
            mensaje: "Asistente creado correctamente",
            asistentes: [asistenteC]
        });
    } catch (error) {
        console.error('Error al crear el asistente:', error);
        res.status(500).json({
            estado: 0,
            mensaje: "Ocurrió un error desconocido",
            asistentes: []
        });
    }
};

//Actualizar asistente
exports.actualizarAsistente = async (req, res) => {
    const { id } = req.params;
    const { tipo, correo, contrasena, nombre_completo, edad, sexo, boleta, programa_academico, numero_empleado, cargo, dependencia } = req.body;

    try {
        // Buscar el asistente por ID
        const asistenteAct = await Asistente.findByPk(id);

        if (!tipo || !asistenteAct || !correo || !contrasena || !nombre_completo || !edad || !sexo) {
            return res.status(404).json({
                estado: 0,
                mensaje: "Faltan parámetros",
                asistentes: []
            });
        }

        const codigo_qr = `${correo}:${nombre_completo}`; // Generar el contenido del código QR

        let datosTipoAsistente;

        switch (tipo) {
            case 'alumnoUpiiz':
                await AlumnoUpiiz.update({
                    boleta: boleta,
                    programa_academico: programa_academico,
                }, {
                    where: { asistente_id_asistente: asistenteAct.id }
                });
                datosTipoAsistente = await AlumnoUpiiz.findOne({
                    where: { asistente_id_asistente: asistenteAct.id }
                });
                break;
            case 'alumnoCecyt':
                await AlumnoCecyt.update({
                    boleta: boleta
                }, {
                    where: { asistente_id_asistente: asistenteAct.id }
                });
                datosTipoAsistente = await AlumnoCecyt.findOne({
                    where: { asistente_id_asistente: asistenteAct.id }
                });
                break;
            case 'empleado':
                await Empleado.update({
                    numero_empleado: numero_empleado,
                    cargo: cargo
                }, {
                    where: { asistente_id_asistente: asistenteAct.id }
                });
                datosTipoAsistente = await Empleado.findOne({
                    where: { asistente_id_asistente: asistenteAct.id }
                });
                break;
            case 'externo':
                await Externo.update({
                    dependencia: dependencia
                }, {
                    where: { asistente_id_asistente: asistenteAct.id }
                });
                datosTipoAsistente = await Externo.findOne({
                    where: { asistente_id_asistente: asistenteAct.id }
                });
                break;
            default:
                return res.status(400).json({
                    estado: 0,
                    mensaje: "Tipo de asistente no válido",
                    asistentes: []
                });
        }

        // Actualizar los datos del asistente principal
        await asistenteAct.update({
            correo: correo,
            contrasena: contrasena,
            nombre_completo: nombre_completo,
            edad: edad,
            sexo: sexo,
            codigo_qr: codigo_qr
        });

        // Combinar los datos del asistente principal con los datos del tipo de asistente
        const asistenteActualizado = {
            ...asistenteAct.toJSON(),
            tipo: datosTipoAsistente ? datosTipoAsistente.toJSON() : null // Asegurarse de que datosTipoAsistente no sea nulo
        };

        res.status(200).json({
            estado: 1,
            mensaje: "Asistente actualizado",
            asistentes: [asistenteActualizado]
        });
    } catch (error) {
        console.error('Error al actualizar el asistente:', error);
        res.status(500).json({
            estado: 0,
            mensaje: "Ocurrió un error desconocido",
            asistentes: []
        });
    }
};

// Obtener asistente por correo
exports.obtenerAsistentePorCorreo = async (req, res) => {
    const { correo } = req.params;
    try {
        const asistente = await Asistente.findOne({ where: { correo } });
        if (!asistente) {
            res.status(404).json({
                estado: 0,
                mensaje: "No se encontró asistente",
                asistentes: []
            });
        } else {
            res.status(200).json({
                estado: 1,
                mensaje: "Asistente encontrado",
                asistentes: [asistente]
            });
        }
    } catch (error) {
        res.status(500).json({
            estado: 0,
            mensaje: "Ocurrió un error desconocido",
            asistentes: []
        });
    }
};

//Login de asistente
exports.loginAsistente = async (req, res) => {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
        return res.status(400).json({
            estado: 0,
            mensaje: "Favor de ingresar datos faltantes",
            token: null,
            id: null
        });
    }

    try {
        // Verificar si el correo existe en la base de datos de asistentes
        const asistente = await Asistente.findOne({
            where: { correo: correo }
        });

        if (!asistente) {
            return res.status(404).json({
                estado: 0,
                mensaje: "Datos incorrectos. Favor de volver a intentar",
                token: null,
                id: null
            });
        }

        // Verificar si la contraseña es correcta
        if (asistente.contrasena !== contrasena) {
            return res.status(401).json({
                estado: 0,
                mensaje: "Datos incorrectos. Favor de volver a intentar",
                token: null,
                id: null
            });
        }

        console.log(asistente.id)

        // Si el correo y la contraseña son correctas, puedes generar un token de autenticación
        const token = generarToken(asistente.id);

        res.status(200).json({
            estado: 1,
            mensaje: "Inicio de sesión exitoso",
            token: token,
            id: asistente.id
        });
    } catch (error) {
        console.error('Error al realizar inicio de sesión:', error);
        res.status(500).json({
            estado: 0,
            mensaje: "Ocurrió un error desconocido",
            token: null,
            id: null
        });
    }
};

function generarTokenJWT(payload) {
    // Aquí genera token utilizando JWT
    const secretKey = 'tt_constancias_APRS_UPIIZ';
    const options = { expiresIn: '5h' }; // Opciones del token (por ejemplo, tiempo de expiración)
    const token = jwt.sign(payload, secretKey, options);
    return token;
}

function generarToken(idAsistente) {
    const token = generarTokenJWT({ id: idAsistente });
    return token;
}

function obtenerIdUsuarioDesdeToken(token) {
    const decodedToken = jwt.verify(token, 'clave_secreta'); // Verifica y decodifica el token
    const idUsuario = decodedToken.id; // Extrae el ID del usuario del token decodificado
    return idUsuario;
}


//Obtener dependencias
exports.obtenerDependencias = async (req, res) => {
    try {
        const dependencias = await Externo.findAll({
            attributes: ['dependencia'],
            raw: true, // Devuelve solo los datos sin repetir del modelo
            group: ['dependencia']
        });

        // Mapear solo los valores de dependencia desde el resultado
        const dependenciasUnicas = dependencias.map(dependencia => dependencia.dependencia);

        res.status(200).json({
            estado: 1,
            mensaje: "Dependencias obtenidas correctamente",
            asistentes: [dependenciasUnicas]
        });
    } catch (error) {
        console.error('Error al obtener las dependencias:', error);
        res.status(500).json({
            estado: 0,
            mensaje: "Ocurrió un error al obtener las dependencias",
            asistentes: []
        });
    }
};
