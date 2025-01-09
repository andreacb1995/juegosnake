document.addEventListener('DOMContentLoaded', () => {

    const tablero = document.getElementById('juegoCanvas');
    const dibujo = tablero.getContext('2d');

    let puntuacion = 0; 
    
    const tamaño = 20;

    let serpiente = [{ x: 10 * tamaño, y: 10 * tamaño }];
    let direccion = 'DERECHA';
    let comida = {
        x: Math.floor(Math.random() * 20) * tamaño,
        y: Math.floor(Math.random() * 20) * tamaño
    };

    // Velocidad inicial
    let velocidad = 250; 
    let juego;

    let pantallaActual = "inicio"; // Estado actual: "inicio", "introducirNombre", "top5"
    let eventoReiniciarActivo = false; // Controla el evento de Enter

    // Estado inicial
    let juegoIniciado = false;
    
    // Declarar reiniciarConEnter como global
    const reiniciarConEnter = (evento) => {
        if (pantallaActual === 'top5' && evento.key === 'Enter') {
            console.log('Reiniciando juego desde pantalla: top5');
            evento.preventDefault();
            document.removeEventListener('keydown', reiniciarConEnter);
            eventoReiniciarActivo = false; // Actualiza el estado
            reiniciarJuego();
        }
    };
    /**
     * Inicia el juego y establece un intervalo para actualizar el tablero.
     */
    function iniciarJuego() {
        juegoIniciado = true;
        actualizarPuntuacion(); // Inicializar la puntuación
        juego = setInterval(dibujar, velocidad);    }

    /**
     * Dibuja el botón "Jugar" en el canvas.
     */
    function dibujarBoton() {
        // Dibujar el título
        dibujo.fillStyle = 'white';
        dibujo.font = '30px Arial';
        dibujo.textAlign = 'center';
        dibujo.fillText('Snake', tablero.width / 2, 100); // Título en la parte superior

        dibujo.fillStyle = 'lime';
        dibujo.fillRect(120, 180, 160, 40); // Botón
        dibujo.fillStyle = 'black';
        dibujo.font = '20px Arial';
        dibujo.textAlign = 'center';
        dibujo.fillText('JUGAR', 200, 205); // Texto del botón
    }

    /**
     * Detecta clics dentro del canvas y mira si se ha hecho clic en el botón.
     */
    tablero.addEventListener('click', (evento) => {
        const rect = tablero.getBoundingClientRect();
        const x = evento.clientX - rect.left;
        const y = evento.clientY - rect.top;

        // Verificar si el clic está dentro del botón
        if (!juegoIniciado && x >= 120 && x <= 280 && y >= 180 && y <= 220) {
            iniciarJuego();
        }
    });

    /**
     * Inicia el juego y establece un intervalo para actualizar el tablero.
     */
    function iniciarJuego() {
        juegoIniciado = true;
        juego = setInterval(dibujar, velocidad);
    }

    // Detectar teclas para cambiar la dirección
    document.addEventListener('keydown', cambiarDireccion);

    /**
     * Cambia la dirección de la serpiente dependiendo de la tecla que presionemos
     * y evita que la serpiente se mueva en la dirección opuesta a su movimiento actual.
     * 
     * @param {object} evento - Evento del teclado
     */

    function cambiarDireccion(evento) {
        const tecla = evento.keyCode;
        if (tecla === 37 && direccion !== 'DERECHA') direccion = 'IZQUIERDA';
        if (tecla === 38 && direccion !== 'ABAJO') direccion = 'ARRIBA';
        if (tecla === 39 && direccion !== 'IZQUIERDA') direccion = 'DERECHA';
        if (tecla === 40 && direccion !== 'ARRIBA') direccion = 'ABAJO';
    }

    /**
     * Dibuja el estado actual del juego.
     * Borra el tablero y vuelve a dibujar la serpiente, la comida y gestiona el movimiento.
     */
    function dibujar() {
        dibujo.clearRect(0, 0, tablero.width, tablero.height);

        // Lógica de movimiento
        let cabezaX = serpiente[0].x;
        let cabezaY = serpiente[0].y;

        if (direccion === 'IZQUIERDA') cabezaX -= tamaño;
        if (direccion === 'ARRIBA') cabezaY -= tamaño;
        if (direccion === 'DERECHA') cabezaX += tamaño;
        if (direccion === 'ABAJO') cabezaY += tamaño;

        const nuevaCabeza = { x: cabezaX, y: cabezaY };

        // Verificar si la serpiente come la comida
        if (cabezaX === comida.x && cabezaY === comida.y) {
            // La serpiente ha alcanzado la comida
            puntuacion++; // Incrementa la puntuación
            actualizarPuntuacion(); // Actualiza el marcador

            comida = {
                x: Math.floor(Math.random() * (tablero.width / tamaño)) * tamaño,
                y: Math.floor(Math.random() * (tablero.height / tamaño)) * tamaño
            };
            
            // Aumentar la velocidad
            aumentarVelocidad();
        } else {
            serpiente.pop();
        }

        serpiente.unshift(nuevaCabeza);

        // Dibujar la cuadrícula
        dibujo.strokeStyle = '#E0E0E0'; // Color de la cuadrícula
        dibujo.lineWidth = 1;
        
        for (let i = 0; i < tablero.width; i += tamaño) {
            dibujo.beginPath();
            dibujo.moveTo(i, 0);
            dibujo.lineTo(i, tablero.height);
            dibujo.stroke();
        }

        for (let j = 0; j < tablero.height; j += tamaño) {
            dibujo.beginPath();
            dibujo.moveTo(0, j);
            dibujo.lineTo(tablero.width, j);
            dibujo.stroke();
        }
        
        // Dibujar la comida
        dibujo.fillStyle = 'red';
        dibujo.fillRect(comida.x, comida.y, tamaño, tamaño);

        // Dibujar la serpiente con degradado
        const degradadoSerpiente = dibujo.createLinearGradient(0, 0, tablero.width, 0);
        degradadoSerpiente.addColorStop(0, 'lime'); // Verde claro
        degradadoSerpiente.addColorStop(1, 'green'); // Verde oscuro
        dibujo.fillStyle = degradadoSerpiente;      

        serpiente.forEach((segmento) => {
            dibujo.fillRect(segmento.x, segmento.y, tamaño, tamaño);
        });

        // Verificar colisión con los bordes o el cuerpo
        if (
            cabezaX < 0 || cabezaY < 0 ||
            cabezaX >= tablero.width || cabezaY >= tablero.height ||
            choque(nuevaCabeza, serpiente.slice(1))
        ) {
            clearInterval(juego);
            partidaPerdida();
        }

    }

    /**
     * Detecta si la cabeza de la serpiente choquea con alguna parte de su cuerpo.
     * 
     * @param {object} cabeza - Posición de la cabeza de la serpiente
     * @param {array} cuerpo - Segmentos del cuerpo de la serpiente
     * @returns {boolean} - True si hay colisión, de lo contrario False
     */
    function choque(cabeza, cuerpo) {
        return cuerpo.some(segmento => cabeza.x === segmento.x && cabeza.y === segmento.y);
    }

    /**
     * Aumenta la velocidad del juego cada vez que la serpiente come comida.
     * Reduce el intervalo de tiempo para hacer el juego más rápido.
     */
    function aumentarVelocidad() {
        clearInterval(juego);  
        if (velocidad > 100) {  
            velocidad -= 20;
        }
        juego = setInterval(dibujar, velocidad); 
    }

    /**
     * Muestra la pantalla de "Has perdido" y un formulario para introducir el nombre del jugador.
     */
    function partidaPerdida() {
        if (pantallaActual !== 'inicio') return; // Evita múltiples llamados
        pantallaActual = "introducirNombre"; // Actualiza el estado de la pantalla

        clearInterval(juego); // Detener el juego

        const pantalla = document.getElementById('pantallaNombre');
        let contenidoPantalla = document.getElementById('pantalla');

        if (!contenidoPantalla) {
            contenidoPantalla = document.createElement('div');
            contenidoPantalla.id = 'pantalla';
            contenidoPantalla.classList.add('pantalla');
            pantallaNombre.appendChild(contenidoPantalla);
        }
        
        // Limpiar el contenido antes de agregar algo nuevo
        contenidoPantalla.innerHTML = '';

        // Reemplazar el contenido de la ventana con el formulario
        contenidoPantalla.innerHTML = `
            <h2>¡Has Perdido!</h2>
            <p>Introduce tu nombre para guardar tu puntuación:</p>
            <input type="text" id="nombreJugador" placeholder="Nombre" />
            <button id="guardarNombre">Guardar</button>
        `;

        // Eliminar el evento de Enter para reiniciar si está activo
        if (eventoReiniciarActivo) {
            document.removeEventListener('keydown', reiniciarConEnter);
            eventoReiniciarActivo = false;
        }

        // Mostrar la ventana flotante
        pantalla.classList.add('mostrar');

        // Guardar el nombre al hacer clic en "Guardar"
        const botonGuardar = document.getElementById('guardarNombre');
        const inputNombre = document.getElementById('nombreJugador');

        // Usar un timeout breve para asegurar que el elemento esté renderizado y enfocado
        setTimeout(() => {
            if (inputNombre) {
                inputNombre.focus();
            }
        }, 50);

        // Asignar eventos a los nuevos elementos
        if (botonGuardar && inputNombre) {
            botonGuardar.addEventListener('click', () => nombreJugador(inputNombre));
            inputNombre.addEventListener('keydown', (evento) => {
                if (evento.key === 'Enter') {
                    evento.preventDefault(); // Evitar propagación a otros eventos
                    nombreJugador(inputNombre);
                }
            });
        } else {
            console.error("No se encontraron los elementos 'guardarNombre' o 'nombreJugador'.");
        }
    }

    /**
     * Maneja el nombre que introduce el usuario y muestra el Top 5.
     */
    function nombreJugador(inputNombre) {
        const jugador = inputNombre.value.trim();

        if (jugador && pantallaActual === "introducirNombre") {
            guardarPuntuacion(jugador, puntuacion);
        }
    }

    function obtenerTop5() {
        fetch('http://localhost/snake/php/puntuaciones.php')
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json(); 
            })
            .then((data) => {
                console.log('Puntuaciones recibidas:', data);
                mostrarTop5(data); // Llama a una función para renderizar el Top 5
            })
            .catch((error) => {
                console.error('Error al obtener el Top 5:', error);
            });
    }

    /**
     * Muestra el Top 5.
     */
    function mostrarTop5(puntuaciones) {
        if (pantallaActual !== 'introducirNombre') return; // Solo si venimos de introducir nombre
        pantallaActual = "top5"; // Actualiza el estado de la pantalla

        const pantalla = document.getElementById('pantallaNombre');
        let contenidoPantalla = document.getElementById('pantalla');
    
        if (!contenidoPantalla) {
            console.error("El elemento con id 'pantalla' no existe.");
            return;
        }
        
        // Limpiar el contenido antes de mostrar el Top 5
        contenidoPantalla.innerHTML = '';

        // Actualizar el contenido de la ventana
        contenidoPantalla.innerHTML = `
            <h2>Top 5 Puntuación</h2>
            <ul style="list-style: none; padding: 0;">
                ${puntuaciones
                    .map((jugador, index) => `<li>${index + 1}. ${jugador.nombre} - ${jugador.puntos} pts</li>`)
                    .join('')}
            </ul>
            <button id="reiniciarJuego">Reiniciar Juego</button>
        `;

        const botonReiniciar = document.getElementById('reiniciarJuego');
        botonReiniciar.addEventListener('click', reiniciarJuego);

        // Registrar el evento Enter para reiniciar con un breve retraso
        if (!eventoReiniciarActivo) {
            setTimeout(() => {
                document.addEventListener('keydown', reiniciarConEnter);
                eventoReiniciarActivo = true;
            }, 100); // Esperar 100 ms para asegurarse de que no se solape
        }
        
        // Mostrar la ventana flotante
        pantalla.classList.add('mostrar');
    }

    /**
     * Reinicia el juego después de mostrar el Top 5.
     */
    function reiniciarJuego() {
        pantallaActual = 'inicio'; // Volver al estado inicial

        const ventana = document.getElementById('pantallaNombre');
        ventana.classList.remove('mostrar'); // Ocultar ventana

        reiniciarVariablesJuego()
        iniciarJuego()
    }

    /**
     * Reiniciar variables del juego.
     */
    function reiniciarVariablesJuego() {
        puntuacion = 0;

        serpiente = [{ x: 10 * tamaño, y: 10 * tamaño }];
        direccion = 'DERECHA';
        comida = {
            x: Math.floor(Math.random() * 20) * tamaño,
            y: Math.floor(Math.random() * 20) * tamaño
        };
        velocidad = 300;
        juegoIniciado = false;
    }

    /**
     * Guarda la puntuacion del jugador en el ranking y ordena el Top 5.
     * 
     * @param {string} nombre - Nombre del jugador
     * @param {number} puntos - Puntos del jugador 
     */
    function guardarPuntuacion(nombre, puntos) {
        fetch('http://localhost/snake/php/puntuaciones.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nombre, puntos }),
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data.mensaje); // Mensaje de éxito
                obtenerTop5();
            })
            .catch((error) => {
                console.error('Error al guardar la puntuación:', error);
            });
    }

    function actualizarPuntuacion() {
        const marcador = document.getElementById('puntuacion');
        marcador.innerHTML = `
        <img src="imagenes/manzana.png" alt="Manzana" style="width: 50px; height: 50px; vertical-align: middle;">
        ${puntuacion}
        `;
    }

    // Dibuja el botón inicial al cargar la página
    dibujarBoton();
});
