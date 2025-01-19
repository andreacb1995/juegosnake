<?php
// Configuración de CORS para permitir peticiones desde cualquier origen
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Methods: GET, POST, OPTIONS"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization"); 
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200); 
    exit();
}

// Cargar la librería de MongoDB
require __DIR__ . '/../vendor/autoload.php'; 


// Conexión a la base de datos MongoDB
$cliente = new MongoDB\Client("mongodb://localhost:27017");
$baseDatos = $cliente->juegosnake; // Base de datos "juegosnake"
$coleccion = $baseDatos->puntuaciones;  // Colección "puntuaciones"

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'POST') {
    //Gestión de solicitud POST para guardar puntuación
    $datos = json_decode(file_get_contents("php://input"), true);

    if (isset($datos['nombre']) && isset($datos['puntos'])) {
        // Crear el documento para insertar en la base de datos
        $documento = [
            'nombre' => $datos['nombre'],
            'puntos' => (int) $datos['puntos'],
            'fecha' => new MongoDB\BSON\UTCDateTime()
        ];

        // Insertar el documento en la colección
        $coleccion->insertOne($documento);

        echo json_encode(['mensaje' => 'Puntuación guardada correctamente']);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Faltan datos']);
    }
} elseif ($metodo === 'GET') {
    // Procesamiento de solicitud GET para obtener las 5 mejores puntuaciones
    $puntuaciones = $coleccion->find([], [
        'sort' => ['puntos' => -1], 
        'limit' => 5
    ]);

    // Crear un array para almacenar las puntuaciones obtenidas
    $resultado = [];
    foreach ($puntuaciones as $puntuacion) {
        $resultado[] = [
            'nombre' => $puntuacion['nombre'],
            'puntos' => $puntuacion['puntos']
        ];
    }
    
    // Enviar el resultado como JSON
    echo json_encode($resultado);

} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
}
?>
