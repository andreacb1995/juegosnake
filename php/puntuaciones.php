<?php

// Configuración de CORS
header("Access-Control-Allow-Origin: *"); // Permitir todos los orígenes (puedes restringirlo a un dominio específico)
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); // Métodos permitidos
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Encabezados permitidos
header("Content-Type: application/json");

// Manejar solicitudes preflight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); // Respuesta OK para solicitudes preflight
    exit();
}

// Cargar la librería de MongoDB
require __DIR__ . '/../vendor/autoload.php'; // Ruta al autoloader de Composer


// Conectar con MongoDB
$cliente = new MongoDB\Client("mongodb://localhost:27017");
$baseDatos = $cliente->juegosnake; // Base de datos
$coleccion = $baseDatos->puntuaciones; // Colección

// Determinar el método de la solicitud
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'POST') {
    // Guardar puntuación
    $datos = json_decode(file_get_contents("php://input"), true);

    if (isset($datos['nombre']) && isset($datos['puntos'])) {
        $documento = [
            'nombre' => $datos['nombre'],
            'puntos' => (int) $datos['puntos'],
            'fecha' => new MongoDB\BSON\UTCDateTime()
        ];

        $coleccion->insertOne($documento);

        echo json_encode(['mensaje' => 'Puntuación guardada correctamente']);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Faltan datos']);
    }
} elseif ($metodo === 'GET') {
    // Obtener el Top 5 de puntuaciones
    $puntuaciones = $coleccion->find([], [
        'sort' => ['puntos' => -1], // Ordenar por puntos descendente
        'limit' => 5
    ]);

    $resultado = [];
    foreach ($puntuaciones as $puntuacion) {
        $resultado[] = [
            'nombre' => $puntuacion['nombre'],
            'puntos' => $puntuacion['puntos']
        ];
    }

    echo json_encode($resultado);

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
?>
