const MiembroDep = require('../models/miembrosDep.model');
const jwt = require('jsonwebtoken');

//Obtener miembrosDep
exports.obtenerTodosMiembrosDep = async(req,res) => {
    try {
        const miembrosDep = await MiembroDep.findAll();
        if (miembrosDep.length > 0) {
            res.status(200).json({
                estado : 1,
                mensaje: "MiembrosDep encontrados",
                miembrosDep : [miembrosDep]
            });
        } else {
            res.status(404).json({
                estado: 0,
                mensaje: "No se encontraron miembrosDep",
                miembrosDep: []
            })
        }
    } catch (error) {
        res.status(500).json({
            estado : 0,
            mensaje: "Ocurrió un error desconocido",
            miembrosDep: []
        });
    }
}

//Login de miembroDep
exports.loginMiembroDep = async (req, res) => {
    const { id, clave } = req.body;

    if (!id || !clave) {
        return res.status(400).json({
            estado: 0,
            mensaje: "Favor de ingresar datos faltantes",
            token: null,
            id: null
        });
    }

    try {
        // Verificar si el id existe en la base de datos
        const miembroDep = await MiembroDep.findOne({
            where: { id: id }
        });

        if (!miembroDep) {
            return res.status(404).json({
                estado: 0,
                mensaje: "Datos incorrectos. Favor de volver a intentar",
                token: null,
                id: null
            });
        }

        // Verificar si la contraseña es correcta
        if (miembroDep.clave !== clave) {
            return res.status(401).json({
                estado: 0,
                mensaje: "Datos incorrectos. Favor de volver a intentar",
                token: null,
                id: null
            });
        }

        console.log(miembroDep.id)

        // Si el num_empleado (id) y la contraseña son correctas, puede generar un token de autenticación
        const token = generarToken(miembroDep.id);

        res.status(200).json({
            estado: 1,
            mensaje: "Inicio de sesión exitoso",
            token: token,
            id: miembroDep.id
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
    const secretKey = 'tt_constancias_APRS_UPIIZ_Departamento';
    const options = { expiresIn: '5h' }; // Opciones del token (por ejemplo, tiempo de expiración)
    const token = jwt.sign(payload, secretKey, options);
    return token;
}

function generarToken(idMiembroDep) {
    const token = generarTokenJWT({ id: idMiembroDep });
    return token;
}

function obtenerIdUsuarioDesdeToken(token) {
    const decodedToken = jwt.verify(token, 'tt_constancias_APRS_UPIIZ_Departamento'); // Verifica y decodifica el token
    const idUsuario = decodedToken.id; // Extrae el ID del usuario del token decodificado
    return idUsuario;
}