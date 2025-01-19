        document.addEventListener('DOMContentLoaded', () => {
            // Lienzo y contexto de dibujo
            const tablero = document.getElementById('juegoCanvas');
            const dibujo = tablero.getContext('2d');

            // Puntuación inicial y tamaño de las celdas
            let puntuacion = 0; 
            const tamaño = 35;

            // Ancho y alto del lienzo
            const canvasWidth = tamaño * Math.floor(tablero.width / tamaño); 
            const canvasHeight = tamaño * Math.floor(tablero.height / tamaño); 
            tablero.width = canvasWidth;
            tablero.height = canvasHeight;

            // Posición inicial de la comida
            let comida = {
                x: Math.floor(Math.random() * (canvasWidth / tamaño)) * tamaño,
                y: Math.floor(Math.random() * (canvasHeight / tamaño)) * tamaño
            };   

            // Dirección y serpiente inicial
            let direccion = null; 
            let serpiente = [
                { x: Math.floor(canvasWidth / 2 / tamaño) * tamaño, y: Math.floor(canvasHeight / 2 / tamaño) * tamaño }, // Cabeza
                { x: (Math.floor(canvasWidth / 2 / tamaño) - 1) * tamaño, y: Math.floor(canvasHeight / 2 / tamaño) * tamaño }, // Primer segmento del cuerpo
                { x: (Math.floor(canvasWidth / 2 / tamaño) - 2) * tamaño, y: Math.floor(canvasHeight / 2 / tamaño) * tamaño }  // Segundo segmento del cuerpo
            ];
            
            // Velocidad del juego
            let velocidad = 250; 
            let juego = null;

            // Estado del juego
            let pantallaActual = "inicio"; 
            let eventoReiniciarActivo = false; 
            let juegoIniciado = false;

            // Imágenes de la comida y cabeza de la serpiente
            let imagenComida = new Image();
            imagenComida.src = 'imagenes/manzana.png'; 
            const imagenCabeza = new Image();
            imagenCabeza.src = 'imagenes/cabeza.png'; 

            // Dimensiones y posición del botón de inicio
            const botonAncho = 160;
            const botonAlto = 40; 
            const botonX = (tablero.width - botonAncho) / 2;
            const botonY = tablero.height / 2;
            
            // Evento para reiniciar el juego con Enter en el Top 5
            const reiniciarConEnter = (evento) => {
                if (pantallaActual === 'top5' && evento.key === 'Enter') {
                    evento.preventDefault();
                    document.removeEventListener('keydown', reiniciarConEnter);
                    eventoReiniciarActivo = false; 
                    reiniciarJuego();
                }
            };

            /**
             * Dibuja el botón "Jugar" en el canvas, con el texto y el rectángulo.
             * Establece el color y la fuente para que se vea el título del juego y el botón de inicio.
             */
            function dibujarBoton() {
                dibujo.fillStyle = 'white';
                dibujo.font = '30px Arial';
                dibujo.textAlign = 'center';
                dibujo.fillText('Snake', tablero.width / 2, botonY - 50); 

                dibujo.fillStyle = 'lime';
                
                dibujo.fillRect(botonX, botonY, botonAncho, botonAlto); 
            
                dibujo.fillStyle = 'black';
                dibujo.font = '20px Arial';
                dibujo.textAlign = 'center';
                dibujo.fillText('JUGAR', tablero.width / 2, botonY + 25);
            }


            /**
             * Detecta si se hace clic dentro del área del botón "Jugar" y, si es así, inicia el juego.
             */
            tablero.addEventListener('click', (evento) => {
                const rect = tablero.getBoundingClientRect(); 
                const clickX = evento.clientX - rect.left;  
                const clickY = evento.clientY - rect.top;   

                if (clickX >= botonX && clickX <= botonX + botonAncho && clickY >= botonY && clickY <= botonY + botonAlto) {
                    iniciarJuego(); 
                }
            });

            /**
             * Inicia el juego, dibuja el tablero inicial y restablece la puntuación del juego.
             */
            function iniciarJuego() {
                dibujar(); 
                juegoIniciado = true;
                actualizarPuntuacion(); 
            }

            // Escucha los eventos de teclas presionadas y llama a la función para cambiar la dirección de la serpiente.
            document.addEventListener('keydown', cambiarDireccion);

            /**
             * Cambia la dirección de la serpiente según la tecla presionada, asegurando que
             * no pueda moverse en la dirección opuesta a la actual.
             * También inicia el juego si no ha comenzado aún, creando un intervalo para mover la serpiente.
             * @param {object} evento - El evento generado por la tecla presionada (keydown).
             */
            function cambiarDireccion(evento) {
                const tecla = evento.keyCode;
                if (tecla === 37 && direccion !== 'DERECHA') direccion = 'IZQUIERDA';
                if (tecla === 38 && direccion !== 'ABAJO') direccion = 'ARRIBA';
                if (tecla === 39 && direccion !== 'IZQUIERDA') direccion = 'DERECHA';
                if (tecla === 40 && direccion !== 'ARRIBA') direccion = 'ABAJO';

                if (direccion !== null && !juego) {
                    juego = setInterval(mover, velocidad);
                }
            }

            /**
             * Dibuja el tablero, la serpiente y la comida.
             * 1. Dibuja la cuadrícula del tablero, con líneas verticales y horizontales.
             * 2. Dibuja la comida en la posición correspondiente utilizando una imagen.
             * 3. Dibuja cada segmento de la serpiente.
             *    - La cabeza de la serpiente tiene una imagen.
             *    - Los segmentos del cuerpo de la serpiente se dibujan como rectángulos.
             */
            function dibujar() {
                dibujo.clearRect(0, 0, tablero.width, tablero.height);

                dibujo.strokeStyle = '#7a8a6e'; 
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
                
                dibujo.drawImage(imagenComida, comida.x, comida.y, tamaño, tamaño);
            
                serpiente.forEach((segmento, index) => {
                    if (index === 0) {
                        dibujo.save();

                        dibujo.translate(segmento.x + tamaño / 2, segmento.y + tamaño / 2);

                        if (direccion === 'IZQUIERDA') {
                            dibujo.rotate(Math.PI); 
                        } else if (direccion === 'ARRIBA') {
                            dibujo.rotate(-Math.PI / 2); 
                        } else if (direccion === 'DERECHA') {
                            dibujo.rotate(0); // 
                        } else if (direccion === 'ABAJO') {
                            dibujo.rotate(Math.PI / 2); 
                        }

                        dibujo.drawImage(imagenCabeza, -tamaño / 2, -tamaño / 2, tamaño, tamaño); 

                        dibujo.restore();
                    } 
                    
                    else {
                        dibujo.fillStyle = '#556B2F'; 
                        dibujo.fillRect(segmento.x, segmento.y, tamaño, tamaño);
                    }
                });
            }

            /**
             * Mueve la serpiente en la dirección indicada y controla las colisiones.
             * 1. Si la dirección está bien, mueve la cabeza de la serpiente y le añade un nuevo trozo en la misma dirección.
             * 2. Si la serpiente come la comida, genera una nueva posición para la comida y aumenta la puntuación.
             * 3. Si la serpiente se mueve fuera del área del tablero o choca contra su propio cuerpo, termina el juego.
             * 4. Actualiza la visualización del tablero después de cada movimiento.
             */
            function mover() {
                if (direccion === null) {
                    return; 
                }
            
                let nuevaCabeza;
                const cabeza = serpiente[0];
            
                if (direccion === 'IZQUIERDA') nuevaCabeza = { x: cabeza.x - tamaño, y: cabeza.y };
                if (direccion === 'DERECHA') nuevaCabeza = { x: cabeza.x + tamaño, y: cabeza.y };
                if (direccion === 'ARRIBA') nuevaCabeza = { x: cabeza.x, y: cabeza.y - tamaño };
                if (direccion === 'ABAJO') nuevaCabeza = { x: cabeza.x, y: cabeza.y + tamaño };
            
                serpiente.unshift(nuevaCabeza);
            
                if (nuevaCabeza.x === comida.x && nuevaCabeza.y === comida.y) {
                    let posicionValida = false;

                    while (!posicionValida) {
                        comida = {
                            x: Math.floor(Math.random() * canvasWidth / tamaño) * tamaño,
                            y: Math.floor(Math.random() * canvasHeight / tamaño) * tamaño
                        };
                
                        posicionValida = !serpiente.some(segmento => segmento.x === comida.x && segmento.y === comida.y);
                
                        if (comida.x >= canvasWidth) comida.x = canvasWidth - tamaño;
                        if (comida.y >= canvasHeight) comida.y = canvasHeight - tamaño;
                    }

                    puntuacion++; 
                    actualizarPuntuacion(); 
                    aumentarVelocidad();
                } else {
                    serpiente.pop();
                }

                if (
                    cabeza.x < 0 || cabeza.y < 0 ||
                    cabeza.x >= tablero.width || cabeza.y >= tablero.height ||
                    choque(nuevaCabeza, serpiente.slice(1))
                ) {
                    clearInterval(juego);
                    juego = null; 
                    partidaPerdida();
                }
                dibujar();
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
                if (velocidad > 150) {  
                    velocidad -= 10;  
                } else if (velocidad > 100) {
                    velocidad -= 5;   
                }
                juego = setInterval(mover, velocidad); 
            }

            /**
             * Muestra la pantalla de "Has perdido" y un formulario para introducir el nombre del jugador.
             */
            function partidaPerdida() {
                if (pantallaActual !== 'inicio') return; 
                pantallaActual = "introducirNombre"; 

                clearInterval(juego); 

                const pantalla = document.getElementById('pantallaNombre');
                let contenidoPantalla = document.getElementById('pantalla');

                if (!contenidoPantalla) {
                    contenidoPantalla = document.createElement('div');
                    contenidoPantalla.id = 'pantalla';
                    contenidoPantalla.classList.add('pantalla');
                    pantallaNombre.appendChild(contenidoPantalla);
                }
                
                contenidoPantalla.innerHTML = '';
                contenidoPantalla.innerHTML = `
                    <h2>¡Has Perdido!</h2>
                    <p>Introduce tu nombre para guardar tu puntuación:</p>
                    <input type="text" id="nombreJugador" placeholder="Nombre" />
                    <button id="guardarNombre">Guardar</button>
                    <button id="reiniciarPerdida">
                        <i class="fa fa-refresh" aria-hidden="true"></i>
                    </button>
                `;

                if (eventoReiniciarActivo) {
                    document.removeEventListener('keydown', reiniciarConEnter);
                    eventoReiniciarActivo = false;
                }

                pantalla.classList.add('mostrar');
                const botonGuardar = document.getElementById('guardarNombre');
                const inputNombre = document.getElementById('nombreJugador');

                setTimeout(() => {
                    if (inputNombre) {
                        inputNombre.focus();
                    }
                }, 50);

                if (botonGuardar && inputNombre) {
                    botonGuardar.addEventListener('click', () => nombreJugador(inputNombre));
                    inputNombre.addEventListener('keydown', (evento) => {
                        if (evento.key === 'Enter') {
                            evento.preventDefault(); 
                            nombreJugador(inputNombre);
                        }
                    });
                } 

                const botonReinicioPerdida = document.getElementById('reiniciarPerdida');
                botonReinicioPerdida.addEventListener('click', reiniciarJuego);

            }

            /**
             * Obtiene el nombre que ha introducido el jugador y muestra el Top 5.
             */
            function nombreJugador(inputNombre) {
                const jugador = inputNombre.value.trim();

                if (jugador && pantallaActual === "introducirNombre") {
                    guardarPuntuacion(jugador, puntuacion);
                }
            }

            /**
             * Obtiene las puntuaciones del Top 5 y muestra los resultados.
             */
            function obtenerTop5() {
                fetch('http://localhost/snake/php/puntuaciones.php')
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json(); 
                    })
                    .then((data) => {
                        mostrarTop5(data); 
                    })
                    .catch((error) => {
                        console.error('Error al obtener el Top 5:', error);
                    });
            }

            /**
             * Muestra el Top 5 de jugadores con sus puntuaciones.
             */
            function mostrarTop5(puntuaciones) {
                if (pantallaActual !== 'introducirNombre') return; 
                pantallaActual = "top5"; 

                const pantalla = document.getElementById('pantallaNombre');
                let contenidoPantalla = document.getElementById('pantalla');
            
                if (!contenidoPantalla) {
                    console.error("El elemento con id 'pantalla' no existe.");
                    return;
                }
                
                contenidoPantalla.innerHTML = '';

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

                if (!eventoReiniciarActivo) {
                    setTimeout(() => {
                        document.addEventListener('keydown', reiniciarConEnter);
                        eventoReiniciarActivo = true;
                    }, 100); 
                }
                
                pantalla.classList.add('mostrar');
            }

            /**
             * Reinicia el juego después de mostrar el Top 5.
             */
            function reiniciarJuego() {
                pantallaActual = 'inicio'; 
                const ventana = document.getElementById('pantallaNombre');
                ventana.classList.remove('mostrar'); 

                puntuacion = 0;
                actualizarPuntuacion()

                serpiente = [
                    { x: Math.floor(canvasWidth / 2 / tamaño) * tamaño, y: Math.floor(canvasHeight / 2 / tamaño) * tamaño }, // Cabeza
                    { x: (Math.floor(canvasWidth / 2 / tamaño) - 1) * tamaño, y: Math.floor(canvasHeight / 2 / tamaño) * tamaño }, // Primer segmento del cuerpo
                    { x: (Math.floor(canvasWidth / 2 / tamaño) - 2) * tamaño, y: Math.floor(canvasHeight / 2 / tamaño) * tamaño }  // Segundo segmento del cuerpo
                ];

                direccion = null; 
                comida = {
                    x: Math.floor(Math.random() * (tablero.width / tamaño)) * tamaño,
                    y: Math.floor(Math.random() * (tablero.height / tamaño)) * tamaño
                };
                velocidad = 300;
                juegoIniciado = false;
                clearInterval(juego); 
                juego = null
                iniciarJuego()
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
                        console.log(data.mensaje); 
                        obtenerTop5();
                    })
                    .catch((error) => {
                        console.error('Error al guardar la puntuación:', error);
                    });
            }

            /**
             * Actualiza la puntuación mostrada en la pantalla.
             */
            function actualizarPuntuacion() {
                const marcador = document.getElementById('puntuacion');
                marcador.innerHTML = `
                <img src="imagenes/manzana.png" alt="Manzana" style="width: 40px; height: 40px; vertical-align: middle;">
                ${puntuacion}
                `;

                marcador.classList.add('puntuacion-cambio');
                setTimeout(() => {
                    marcador.classList.remove('puntuacion-cambio');
                }, 300);
            }

            dibujarBoton();
        });
