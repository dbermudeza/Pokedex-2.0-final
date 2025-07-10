const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

exports.register = (req, res) => {
  const { id, correo, nombre, apellidos, password, genero, fecha_nacimiento } = req.body;

    // 1. Validar que los datos esenciales no estén vacíos
    if (!id || !correo || !password) {
        return res.status(400).json({ error: 'El usuario, correo y contraseña son requeridos.' });
    }

    try {
        // 2. Comprobar si el ID (username) o el correo ya existen
        const checkUserSql = 'SELECT id, correo FROM usuario WHERE id = ? OR correo = ?';
        const existingUser = db.prepare(checkUserSql).get(id, correo);

        if (existingUser) {
            if (existingUser.id === id) {
                return res.status(409).json({ error: 'El nombre de usuario ya está en uso.' }); // 409 Conflict
            }
            if (existingUser.correo === correo) {
                return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
            }
        }

        // 3. Si no existen, encriptar la contraseña
        const hashedPassword = bcrypt.hashSync(password, 10);

        // 4. Insertar el nuevo usuario en la base de datos
        const insertSql = `INSERT INTO usuario (id, correo, nombre, apellidos, contraseña_hash, genero, fecha_nacimiento)
                           VALUES (@id, @correo, @nombre, @apellidos, @contraseña_hash, @genero, @fecha_nacimiento)`;
        
        db.prepare(insertSql).run({
            id,
            correo,
            nombre,
            apellidos,
            contraseña_hash: hashedPassword,
            genero,
            fecha_nacimiento
        });

        // 5. Crear un Token (JWT) para iniciar sesión automáticamente
        const payload = { id: id, nombre: nombre };
        const token = jwt.sign(payload, 'TU_CLAVE_SECRETA_SUPER_DIFICIL', { expiresIn: '1h' });

        // 6. Enviar el token y los datos del nuevo usuario
        res.status(201).json({
            message: 'Registro exitoso',
            token: token,
            user: { id, nombre, correo }
        });

    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor: ' + err.message });
    }
};

exports.login = (req, res) => {
    // 1. Obtener el identificador (puede ser correo o id) y la contraseña
    const { identifier, password } = req.body;

    // 2. Modificar la consulta SQL para buscar en ambas columnas
    const sql = 'SELECT * FROM usuario WHERE id = ? OR correo = ?';
    
    try {
        // 3. Ejecutar la consulta pasando el identificador para ambos parámetros
        const user = db.prepare(sql).get(identifier, identifier);

        // 4. Si el usuario no existe, enviar un error
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // 5. Comparar la contraseña (el resto de la lógica no cambia)
        const isPasswordCorrect = bcrypt.compareSync(password, user.contraseña_hash);

        if (!isPasswordCorrect) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // 6. Crear y enviar el token si todo es correcto
        const payload = { id: user.id, nombre: user.nombre };
        const token = jwt.sign(payload, 'TU_CLAVE_SECRETA_SUPER_DIFICIL', { expiresIn: '1h' });

        res.json({
            message: 'Login exitoso',
            token: token,
            user: {
                id: user.id,
                nombre: user.nombre,
                correo: user.correo
            }
        });

    } catch (err) {
        res.status(500).json({ error: 'Error en el servidor: ' + err.message });
    }
};

